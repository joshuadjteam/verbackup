


// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, and type checking.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Default apps to seed into the store if they don't exist or just to append.
const DEFAULT_APPS = [
    // --- System Apps ---
    {
        id: 'app-browser',
        name: 'LynixBrowser',
        description: 'Surf the web with DozianOS privacy features.',
        url: 'internal://app-browser',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-phone',
        name: 'Phone',
        description: 'Make calls and use the AI assistant.',
        url: 'internal://app-phone',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-chat',
        name: 'Chat',
        description: 'Message friends and Lynx AI.',
        url: 'internal://app-chat',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-localmail',
        name: 'LocalMail',
        description: 'Internal email system.',
        url: 'internal://app-localmail',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-contacts',
        name: 'Contacts',
        description: 'Manage your address book.',
        url: 'internal://app-contacts',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-notepad',
        name: 'Notepad',
        description: 'Create and save text notes.',
        url: 'internal://app-notepad',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21H3v-3.5L15.232 5.232z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-calculator',
        name: 'Calculator',
        description: 'Perform basic calculations.',
        url: 'internal://app-calculator',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m-6 4h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-paint',
        name: 'Paint',
        description: 'Draw and sketch.',
        url: 'internal://app-paint',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5a2 2 0 002-2v-6.5a2 2 0 00-2-2H7" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-files',
        name: 'Files',
        description: 'Manage Google Drive files.',
        url: 'internal://app-files',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-editor',
        name: 'Editor',
        description: 'Code and text editor.',
        url: 'internal://app-editor',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-converter',
        name: 'Converter',
        description: 'Convert units.',
        url: 'internal://app-converter',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-calendar',
        name: 'Calendar',
        description: 'View dates and schedule.',
        url: 'internal://app-calendar',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
        load_in_console: true
    },
    {
        id: 'app-console-switch',
        name: 'Consoles',
        description: 'Switch desktop environments.',
        url: 'internal://app-console-switch',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
        load_in_console: true
    },
    // --- New PC App ---
    {
        id: 'app-mobilator',
        name: 'Mobilator',
        description: 'Emulate Lynix Mobile on your PC. Syncs state to Drive.',
        url: 'internal://app-mobilator',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>',
        load_in_console: true
    },
    // --- Social Web Apps ---
    {
        id: 'app-x',
        name: 'X',
        description: 'Surf the Web',
        url: 'https://x.com',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
        load_in_console: true 
    },
    {
        id: 'app-facebook',
        name: 'Facebook',
        description: 'Check anything',
        url: 'https://facebook.com',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        load_in_console: true
    },
    {
        id: 'app-instagram',
        name: 'Instagram',
        description: 'Check anything',
        url: 'https://instagram.com',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28-.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        load_in_console: true
    },
    {
        id: 'app-reddit',
        name: 'Reddit',
        description: 'Check anything',
        url: 'https://reddit.com',
        icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.249 1.248.688 0 1.249-.561 1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
        load_in_console: true
    }
];

/**
 * Creates a standardized error response.
 * Logs errors to the console for server-side debugging.
 * @param message The error message for the response body.
 * @param status The standard HTTP status code (e.g., 400, 401, 500).
 */
const createErrorResponse = (message: string, status: number) => {
    console.error(`Webly Service Error (Status ${status}):`, message);
    return new Response(JSON.stringify({ error: message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status,
    });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('This service only accepts POST requests.', 405);
  }

  try {
    const body = await req.json().catch(() => {
        throw { status: 400, message: 'Invalid JSON in request body.' };
    });

    const { action, payload } = body as any;

    if (!action) {
        return createErrorResponse('Request body must include an "action".', 400);
    }

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'get': {
        const { data, error } = await supabaseAdmin
            .from('webly_apps')
            .select('*')
            .order('name');

        let apps = data || [];

        // Check for 'undefined_table' error code (42P01) or general errors
        if (error && error.code === '42P01') {
            console.warn('Webly Store: `webly_apps` table does not exist. Returning default apps list.');
            apps = [];
        } else if (error) {
            return createErrorResponse(`Database Failure: Could not retrieve apps. Details: ${error.message}`, 500);
        }
        
        // Merge default apps with DB apps.
        // We filter defaults to ensure we don't duplicate if they are already in the DB (by URL or ID).
        const existingIds = new Set(apps.map((a: any) => a.id));
        const existingUrls = new Set(apps.map((a: any) => a.url));
        
        const defaultsToAdd = DEFAULT_APPS.filter(def => 
            !existingIds.has(def.id) && !existingUrls.has(def.url)
        );
        
        const finalApps = [...defaultsToAdd, ...apps];
        
        return new Response(JSON.stringify({ apps: finalApps }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
      }

      case 'add':
      case 'update':
      case 'delete': {
        // Admin-only actions below
        const userClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: req.headers.get('Authorization') } } });
        const { data: authData, error: authError } = await userClient.auth.getUser();
        if (authError || !authData.user) {
          return createErrorResponse('Authentication required.', 401);
        }

        const { data: userProfile, error: profileError } = await supabaseAdmin.from('users').select('role').eq('auth_id', authData.user.id).single();
        if (profileError) {
          return profileError.code === 'PGRST116'
             ? createErrorResponse('User profile not found for authenticated user.', 404)
             : createErrorResponse(`Database Failure: Could not fetch user profile. Details: ${profileError.message}`, 500);
        }
        if (userProfile.role !== 'Admin') {
          return createErrorResponse('Permission Denied: Admin role required.', 403);
        }
        
        // Process admin actions
        switch (action) {
            case 'add': {
                if (!payload || !payload.name || !payload.url) return createErrorResponse('Payload with name and url is required.', 400);
                const { name, description, url, icon_svg, load_in_console } = payload;
                const { data, error } = await supabaseAdmin.from('webly_apps').insert({ name, description, url, icon_svg, load_in_console }).select().single();
                if (error) {
                    if (error.code === '42P01') {
                        return createErrorResponse('Database setup incomplete: "webly_apps" table not found. Admin actions are disabled.', 500);
                    }
                    return createErrorResponse(`Database Failure: Could not add app. Details: ${error.message}`, 500);
                }
                return new Response(JSON.stringify({ app: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
            }
            case 'update': {
                if (!payload || !payload.id) return createErrorResponse('Payload with an ID is required.', 400);
                const { id, ...updates } = payload;
                const { data, error } = await supabaseAdmin.from('webly_apps').update(updates).eq('id', id).select().single();
                if (error) {
                    if (error.code === '42P01') {
                        return createErrorResponse('Database setup incomplete: "webly_apps" table not found. Admin actions are disabled.', 500);
                    }
                    return createErrorResponse(`Database Failure: Could not update app. Details: ${error.message}`, 500);
                }
                return new Response(JSON.stringify({ app: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'delete': {
                if (!payload || !payload.id) return createErrorResponse('Payload with an ID is required.', 400);
                const { id } = payload;
                const { error } = await supabaseAdmin.from('webly_apps').delete().eq('id', id);
                if (error) {
                    if (error.code === '42P01') {
                        return createErrorResponse('Database setup incomplete: "webly_apps" table not found. Admin actions are disabled.', 500);
                    }
                    return createErrorResponse(`Database Failure: Could not delete app. Details: ${error.message}`, 500);
                }
                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
        }
        break;
      }

      default: {
        return createErrorResponse('Invalid action specified.', 400);
      }
    }

  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'An unexpected error occurred.';
    return createErrorResponse(message, status);
  }
});
