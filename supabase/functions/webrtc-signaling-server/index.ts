// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, and type checking.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

const connectedClients = new Map<string, WebSocket>();
console.log(`[${new Date().toISOString()}] WEBRTC-SIGNALING-SERVER SCRIPT LOADED`);

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Invoked with URL: ${req.url}`);
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    console.error(`[${new Date().toISOString()}] Authentication error: Missing token.`);
    return new Response('Missing authentication token', { status: 401 });
  }

  try {
    // 1. Authenticate user and get profile BEFORE upgrading connection
    console.log(`[${new Date().toISOString()}] Attempting to get user for token...`);
    const supabaseUserClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) {
        console.error(`[${new Date().toISOString()}] Authentication error: Invalid token.`, authError?.message);
        return new Response('Invalid token', { status: 401 });
    }
    
    console.log(`[${new Date().toISOString()}] User authenticated with ID: ${user.id}. Fetching profile...`);
    
    // Use the admin client to fetch profile, bypassing RLS.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('username')
        .eq('auth_id', user.id)
        .single();
    
    if (profileError || !userProfile) {
        console.error(`[${new Date().toISOString()}] Profile error for user ${user.id}:`, profileError?.message || 'User profile not found');
        return new Response(profileError ? `Profile error: ${profileError.message}` : 'User profile not found', { status: 404 });
    }
    
    const username = userProfile.username;
    console.log(`[${new Date().toISOString()}] Profile found for user: ${username}. Upgrading to WebSocket.`);

    // 2. Upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);

    // 3. Handle connection logic inside event listeners
    socket.onopen = () => {
        if (connectedClients.has(username)) {
            console.log(`[${new Date().toISOString()}] Closing existing connection for ${username}`);
            connectedClients.get(username)?.close(1000, "New connection established");
        }
        connectedClients.set(username, socket);
        console.log(`[${new Date().toISOString()}] Client connected: ${username}. Total clients: ${connectedClients.size}`);
    };

    socket.onmessage = (event) => {
      console.log(`[${new Date().toISOString()}] Message from ${username}:`, event.data);
      try {
        const message = JSON.parse(event.data);
        const { target, type, payload } = message;
        const recipientSocket = connectedClients.get(target);
        
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(JSON.stringify({
            from: username,
            type: type,
            payload: payload
          }));
           console.log(`[${new Date().toISOString()}] Relayed message from ${username} to ${target}`);
        } else {
          console.log(`[${new Date().toISOString()}] Recipient ${target} not found or not connected.`);
          if (type === 'incoming-call') {
              socket.send(JSON.stringify({
                  from: 'server',
                  type: 'user-unavailable',
                  payload: { username: target }
              }));
          }
        }
      } catch (e) {
        console.error(`[${new Date().toISOString()}] Failed to parse or relay message for ${username}:`, e);
      }
    };

    socket.onclose = (event) => {
      if (connectedClients.get(username) === socket) {
        connectedClients.delete(username);
        console.log(`[${new Date().toISOString()}] Client disconnected: ${username}. Code: ${event.code}, Reason: ${event.reason}. Total clients: ${connectedClients.size}`);
      } else {
        console.log(`[${new Date().toISOString()}] Stale connection closed for ${username}.`);
      }
    };

    socket.onerror = (e) => {
      console.error(`[${new Date().toISOString()}] WebSocket error for user ${username}:`, e instanceof Error ? e.message : e);
    };

    return response;

  } catch(e) {
      console.error(`[${new Date().toISOString()}] CRITICAL ERROR during connection setup:`, e);
      return new Response('Server error during connection setup', { status: 500 });
  }
});