
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI } from 'npm:@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-proxy-cookie',
};

const PROXY_BYPASS_API_KEY = 'AIzaSyDlYwTByP5X9LzybRoVk8rhQSTIHxitkBM';

// Raw Stealth JS logic: Prevents redirects and hides bot signals
const RAW_STEALTH_JS = `
(function() {
    try {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        const noop = () => console.log('Blocked navigation attempt');
        try {
            window.location.replace = noop;
            window.location.assign = noop;
            window.onbeforeunload = function() { return false; };
        } catch(e) {}
        if (!window.chrome) window.chrome = { runtime: {} };
        if (window.navigator.permissions) {
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );
        }
        try {
            if (window.top !== window.self) {
                Object.defineProperties(window, {
                    'top': { get: function() { return window.self; }, configurable: true },
                    'parent': { get: function() { return window.self; }, configurable: true }
                });
            }
        } catch(e) {}
    } catch(err) {}
})();
`;

const STEALTH_SCRIPTS_HTML = `<script>${RAW_STEALTH_JS}</script>`;

serve(async (req) => {
  try {
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
      }

      const body = await req.json().catch(() => null);
      if (!body) {
         return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
      let { url, method, headers, body: requestBody } = body;

      if (!url) {
        return new Response(JSON.stringify({ error: 'URL is required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      // Force old reddit
      if (url.includes('www.reddit.com') || url.includes('reddit.com')) {
          url = url.replace('www.reddit.com', 'old.reddit.com').replace('reddit.com', 'old.reddit.com');
          if (!url.includes('old.reddit.com')) url = url.replace('//reddit.com', '//old.reddit.com');
      }

      let targetOrigin = '';
      try { targetOrigin = new URL(url).origin; } catch (e) { targetOrigin = 'https://www.google.com'; }

      const requestProfiles = [
          {
              ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
              secChUa: '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
              platform: '"Windows"',
              mobile: '?0'
          },
          {
              ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
              platform: '"macOS"',
              mobile: '?0'
          },
          {
              ua: 'Lynx/2.8.9rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/3.7.1', // Text browser fallback
              platform: '"Linux"',
              mobile: '?0'
          }
      ];

      if (url.includes('twitter.com') || url.includes('x.com') || url.includes('reddit.com')) {
          requestProfiles.length = 0; 
          requestProfiles.push({
              ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
              platform: '"Linux"',
              mobile: '?1'
          });
      }

      let response: Response | null = null;
      let responseBodyBuffer: ArrayBuffer | null = null;
      let responseBodyText = '';
      let usedContentType = '';
      let status = 0;
      let accumulatedCookies: string[] = [];
      let lastResponse: Response | null = null;

      for (const profile of requestProfiles) {
          const fetchHeaders: Record<string, string> = {
              'User-Agent': profile.ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Upgrade-Insecure-Requests': '1',
              'Referer': targetOrigin + '/',
              'Origin': targetOrigin
          };

          if (profile.secChUa) {
              fetchHeaders['Sec-Ch-Ua'] = profile.secChUa;
              fetchHeaders['Sec-Ch-Ua-Mobile'] = profile.mobile;
              fetchHeaders['Sec-Ch-Ua-Platform'] = profile.platform;
          }

          if (headers && headers['x-proxy-cookie']) {
              fetchHeaders['Cookie'] = headers['x-proxy-cookie'];
          }

          try {
              const fetchOptions: any = {
                  method: (method || 'GET').toUpperCase(),
                  headers: fetchHeaders,
                  redirect: 'follow'
              };

              if (requestBody && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
                  fetchOptions.body = requestBody;
              }

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000); 
              fetchOptions.signal = controller.signal;

              const res = await fetch(url, fetchOptions);
              clearTimeout(timeoutId);

              lastResponse = res;
              status = res.status;
              
              const setCookie = res.headers.get('set-cookie');
              if (setCookie) accumulatedCookies.push(setCookie);

              if (status === 403 || status === 429 || status === 406) {
                  continue; 
              }

              const contentType = res.headers.get('content-type') || '';
              usedContentType = contentType;

              const isText = contentType.includes('text/') || 
                             contentType.includes('json') || 
                             contentType.includes('xml') || 
                             contentType.includes('javascript') || 
                             contentType.includes('ecmascript') ||
                             contentType.includes('css');

              if (!isText) {
                  response = res;
                  responseBodyBuffer = await res.arrayBuffer();
                  break;
              }

              const text = await res.text();
              // Basic block detection
              const lowerText = text.toLowerCase();
              if (lowerText.includes('captcha') || lowerText.includes('access denied') || lowerText.includes('security check')) {
                  responseBodyText = text; // Save it just in case we need to show it
                  continue;
              }

              response = res;
              responseBodyText = text;
              break;

          } catch (e) {
              console.error("Fetch attempt failed:", e);
          }
      }

      // --- Fallback Strategies ---
      if ((!response && lastResponse) || (response && (status === 403 || status === 429 || status === 500))) {
          
          // 1. Google Cache
          if (url.includes('reddit.com') || url.includes('twitter.com') || url.includes('quora.com') || status === 403) {
               try {
                   const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`;
                   const controller = new AbortController();
                   const id = setTimeout(() => controller.abort(), 5000);
                   const cacheRes = await fetch(cacheUrl, {
                       headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
                       signal: controller.signal
                   });
                   clearTimeout(id);
                   
                   if (cacheRes.ok) {
                       const cacheText = await cacheRes.text();
                       if (!cacheText.includes('404. That’s an error')) {
                           response = cacheRes;
                           usedContentType = 'text/html';
                           responseBodyText = cacheText;
                           status = 200;
                       }
                   }
               } catch(e) {}
          }

          // 2. Archive.org (Wayback Machine)
          if ((!response || status !== 200) && (url.includes('reddit.com') || status === 403)) {
              try {
                  const archiveApi = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
                  const apiRes = await fetch(archiveApi);
                  const apiJson = await apiRes.json();
                  if (apiJson.archived_snapshots && apiJson.archived_snapshots.closest) {
                      const archiveUrl = apiJson.archived_snapshots.closest.url;
                      const archiveFetch = await fetch(archiveUrl);
                      if (archiveFetch.ok) {
                          response = archiveFetch;
                          responseBodyText = await archiveFetch.text();
                          // Remove archive.org toolbar script injections if possible
                          responseBodyText = responseBodyText.replace(/<script[^>]*wayback[^>]*>.*?<\/script>/gs, '');
                          usedContentType = 'text/html';
                          status = 200;
                      }
                  }
              } catch(e) {}
          }

          // 3. Last Resort: Use the blocked response content
          if (!response && lastResponse) {
              response = lastResponse;
              if (!responseBodyText && !responseBodyBuffer) {
                   try {
                      const ct = response.headers.get('content-type') || '';
                      usedContentType = ct;
                      const isText = ct.includes('text/') || ct.includes('json');
                      if (!isText) responseBodyBuffer = await response.arrayBuffer();
                      else responseBodyText = await response.text();
                   } catch(e) {}
              }
          }
      }

      if (!response) {
          return new Response(JSON.stringify({ error: "Unable to connect to website. Access denied by target server or connection timed out." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      // --- Binary Response Handling ---
      if (responseBodyBuffer) {
          const bytes = new Uint8Array(responseBodyBuffer);
          let binary = '';
          const len = bytes.byteLength;
          const CHUNK_SIZE = 0x8000; 
          for (let i = 0; i < len; i += CHUNK_SIZE) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK_SIZE, len)) as any);
          }
          const base64 = btoa(binary);
          const content = `data:${usedContentType};base64,${base64}`;
          return new Response(JSON.stringify({ content, contentType: usedContentType, isMedia: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      // --- Text Content Processing ---
      let content = responseBodyText;

      // Regex Cleanup
      content = content.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
      content = content.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy-Report-Only["']?[^>]*>/gi, '');
      content = content.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
      content = content.replace(/<meta[^>]*http-equiv=["']?X-Security-Options["']?[^>]*>/gi, '');
      content = content.replace(/integrity="[^"]*"/gi, '');
      content = content.replace(/nonce="[^"]*"/gi, '');

      const isHtml = usedContentType.includes('html');
      const isJs = usedContentType.includes('javascript') || usedContentType.includes('ecmascript');

      if (isHtml && !content.includes('<base')) {
          const baseTag = `<base href="${targetOrigin}/" target="_self">`;
          content = content.replace(/<head[^>]*>/i, (match) => `${match}${baseTag}`);
      }

      // Gemini Analysis
      if (content.length > 50 && content.length < 100000 && (isHtml || isJs)) {
          try {
              const processWithGemini = async () => {
                  const ai = new GoogleGenAI({ apiKey: PROXY_BYPASS_API_KEY });
                  const chunkLimit = 15000;
                  const snippet = content.substring(0, chunkLimit); 
                  const prompt = `Sanitize this code (${isHtml ? 'HTML' : 'JS'}) to remove X-Frame-Options, Frame Busters, and Integrity Checks. Return ONLY code or "NO_CHANGE". Code: ${snippet}`;
                  const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                  return result.text;
              };
              const timeout = new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), 3500));
              const text = await Promise.race([processWithGemini(), timeout]);

              if (text && text !== "TIMEOUT" && !text.includes("NO_CHANGE") && text.length > 10) {
                  let cleanText = (text as string).replace(/```(html|javascript|js|css)?/g, '').replace(/```/g, '');
                  content = (content.length <= 15000) ? cleanText : cleanText + content.substring(15000);
              }
          } catch (e) {}
      }

      // Inject Stealth
      if (isHtml) {
          if (content.match(/<body[^>]*>/i)) {
              content = content.replace(/<body[^>]*>/i, (match) => `${match}${STEALTH_SCRIPTS_HTML}`);
          } else {
              content = `${STEALTH_SCRIPTS_HTML}${content}`;
          }
      } else if (isJs) {
          content = RAW_STEALTH_JS + '\n' + content;
      }

      content = content.replace(/if\s*\(top\s*!==\s*self\)/gi, 'if(false)');
      content = content.replace(/top\.location/gi, 'self.location');

      return new Response(JSON.stringify({ 
          content, 
          contentType: usedContentType, 
          status, 
          setCookies: accumulatedCookies 
      }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
      });

  } catch (error) {
    console.error("Proxy Service Error:", error);
    return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown internal error.' 
    }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
    });
  }
});
