
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const GCP_CLIENT_ID = '882400805267-1vhj000jdls3g6p8lbk6coj7ii75poa7.apps.googleusercontent.com';
const GCP_CLIENT_SECRET = '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';
const GCP_REDIRECT_URI = 'https://jnnpxifvsrlzfpaisdhy.supabase.co/auth/v1/callback';

const RELEASES = [
    {
        version: "14.0",
        codeName: "Baltecz",
        releaseDate: "2026-02-10",
        size: "1.2 GB",
        summary: "Android 15.1.0 Simulation. Unlocks the ultimate customization experience.",
        changes: [
            "Modder App (Developer Only)",
            "System-wide Font Customization",
            "Status Bar Modding",
            "Launcher Switching Capability"
        ],
        rank: 5
    },
    {
        version: "13.0",
        codeName: "Jabaseion",
        releaseDate: "2025-12-01",
        size: "850 MB",
        summary: "Android 15 Simulation. Multi-language support and new native media apps.",
        changes: [
            "New Native Apps: Maps, Music, Gallery",
            "Language Support (EN/FR/ES)",
            "Improved Performance"
        ],
        rank: 4
    },
    {
        version: "12.5",
        codeName: "Haraise",
        releaseDate: "2025-06-15",
        size: "450 MB",
        summary: "Enhanced stability and the introduction of the Webly Store.",
        changes: [
            "Webly Store App",
            "UI Refinements"
        ],
        rank: 3
    },
    {
        version: "12.0.2",
        codeName: "Martin",
        releaseDate: "2025-01-20",
        size: "600 MB",
        summary: "The standard mobile experience with core applications.",
        changes: [
            "Initial Release",
            "Core Apps Only (No Store)"
        ],
        rank: 2
    },
    {
        version: "10 Quartz",
        codeName: "Legacy",
        releaseDate: "2024-08-10",
        size: "300 MB",
        summary: "The original operating system interface.",
        changes: [
            "Classic Grid UI",
            "Legacy Icon Set",
            "Basic Functionality"
        ],
        rank: 1
    }
];

// Helper to find or create a folder
const ensureFolder = async (accessToken: string, parentId: string | null, folderName: string): Promise<string> => {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, { 
        headers: { 'Authorization': `Bearer ${accessToken}` } 
    });
    
    if (!response.ok) throw { status: response.status, message: `Failed to search for folder ${folderName}: ${await response.text()}` };
    
    const data = await response.json();
    if (data.files && data.files.length > 0) {
        return data.files[0].id;
    }

    const createBody: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
        createBody.parents = [parentId];
    }

    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody)
    });
    
    if (!createResponse.ok) throw { status: createResponse.status, message: `Failed to create folder ${folderName}: ${await createResponse.text()}` };
    const createData = await createResponse.json();
    return createData.id;
};

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let resource, action, payload;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      resource = url.searchParams.get('resource');
      action = url.searchParams.get('action');
    } else {
      const body = await req.json().catch(() => ({}));
      ({ resource, action, payload } = body as any);
    }

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Public Endpoints ---
    if (resource === 'drive' && action === 'get-oauth-config') {
        const clientId = GCP_CLIENT_ID;
        const redirectUri = GCP_REDIRECT_URI;
        if (!clientId || !redirectUri) throw { status: 500, message: 'Google OAuth is not configured correctly on the server.' };
        return new Response(JSON.stringify({ clientId, redirectUri }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    if (resource === 'auth' && action === 'loginAndLinkDrive') {
        const { email, password, code } = payload;
        if (!email || !password || !code) throw { status: 400, message: 'Email, password, and authorization code are required.' };

        const authClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
        const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
        if (signInError) throw { status: 401, message: 'Authentication failed: Invalid credentials.' };
        const authUser = signInData.user;
        if (!authUser) throw { status: 401, message: 'Authentication failed.' };

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: GCP_CLIENT_ID,
                client_secret: GCP_CLIENT_SECRET,
                redirect_uri: GCP_REDIRECT_URI,
                grant_type: 'authorization_code',
            })
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.json();
            throw { status: 400, message: `Google token exchange failed: ${errorBody.error_description}` };
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokens;
        if (!refresh_token) throw { status: 400, message: 'No refresh token received from Google. Please ensure you are using "prompt=consent" in your auth URL.' };
        
        const { data: { user: userToUpdate }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(authUser.id);
        if (getUserError) throw getUserError;

        const expiry_time = Date.now() + (expires_in * 1000);
        const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { app_metadata: { ...userToUpdate.app_metadata, google_refresh_token: refresh_token, google_access_token: access_token, google_token_expiry: expiry_time } });
        if (updateUserError) throw updateUserError;

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    // Public broadcast get
    if (resource === 'broadcast' && action === 'get') {
        const { data: message, error: msgError } = await supabaseAdmin.from('system_broadcast').select('message, is_active').eq('is_active', true).order('created_at', { ascending: false }).limit(1).single();
        if (msgError && msgError.code !== 'PGRST116') throw msgError;
        return new Response(JSON.stringify({ message: message || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    
    // --- Authenticated Actions ---
    const userClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: req.headers.get('Authorization') } } });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    const authUser = authData?.user;
    if (authError || !authUser) {
      if (resource) {
        throw { message: 'User not authenticated', status: 401 };
      } else {
        return new Response(JSON.stringify({ error: 'Public request with empty/invalid body' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    // 1. Mobile System Updates
    if (resource === 'system' && action === 'check-update') {
        return new Response(JSON.stringify({ releases: RELEASES }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    // 2. User Specific Logic (Moved from individual functions)
    if (resource === 'user') {
        switch(action) {
            case 'get-profile': {
                const { data: profileData, error: profileError } = await supabaseAdmin.from('users').select('*').eq('auth_id', authUser.id).single();
                if (profileError) {
                    if (profileError.code === 'PGRST116') return new Response(JSON.stringify({ error: `Profile not found for user ${authUser.id}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });
                    throw profileError;
                }
                const combinedProfile = {
                    ...profileData,
                    installed_webly_apps: authUser.app_metadata?.installed_webly_apps || [],
                    system_version: authUser.app_metadata?.system_version || '12.0.2',
                };
                return new Response(JSON.stringify({ user: combinedProfile }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'resolve-identifier': {
                const { type, value } = payload;
                if (!value) throw { message: 'Value is required.', status: 400 };
                let query = supabaseAdmin.from('users').select('email');
                if (type === 'phone') query = query.eq('phone_number', value);
                else if (type === 'lynix_id') { if (!value.startsWith('047')) throw { message: 'Invalid Lynix ID format.', status: 400 }; query = query.eq('phone_number', value); } 
                else throw { message: 'Invalid identifier type.', status: 400 };
                const { data, error } = await query.single();
                if (error || !data) return new Response(JSON.stringify({ email: null, error: 'Identity not found.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                return new Response(JSON.stringify({ email: data.email }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'check-number': {
                const { phoneNumber } = payload;
                if (!phoneNumber) throw { status: 400, message: 'Phone number is required.' };
                if (!/^2901\d{6}$/.test(phoneNumber)) throw { status: 400, message: 'Invalid phone number format.' };
                const userId = parseInt(phoneNumber.slice(4), 10);
                const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
                if (error || !user) return new Response(JSON.stringify({ error: 'Error 76A : The Party is disconnected' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });
                if (user.status === 'busy' || user.call_status === 'active') return new Response(JSON.stringify({ error: 'Error 76B : The party is on another call right now.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 });
                return new Response(JSON.stringify({ active: true, username: user.username, id: user.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'update-installed-apps': {
                const { appIds } = payload;
                if (!Array.isArray(appIds)) throw { message: 'Payload must include an `appIds` array.', status: 400 };
                const currentAppIds = authUser.app_metadata?.installed_webly_apps || [];
                const newAppIdsSet = new Set(appIds);
                const currentAppIdsSet = new Set(currentAppIds);
                const toInstall = appIds.filter((id: string) => !currentAppIdsSet.has(id));
                const toUninstall = currentAppIds.filter((id: string) => !newAppIdsSet.has(id));
                const logs: any[] = [];
                toInstall.forEach((appId: string) => logs.push({ user_id: authUser.id, app_id: appId, action: 'install' }));
                toUninstall.forEach((appId: string) => logs.push({ user_id: authUser.id, app_id: appId, action: 'uninstall' }));
                if (logs.length > 0) await supabaseAdmin.from('app_activity_log').insert(logs); 
                const { data: updatedUserData, error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { app_metadata: { installed_webly_apps: appIds } });
                if (error) throw { message: `Auth metadata update failed: ${error.message}`, status: 500 };
                return new Response(JSON.stringify({ installed_webly_apps: updatedUserData.user?.app_metadata?.installed_webly_apps || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
        }
    }

    // 3. Broadcast Management (Admin Only)
    if (resource === 'broadcast' && (action === 'set' || action === 'deactivate')) {
        const { data: userProfile, error: profileError } = await supabaseAdmin.from('users').select('role').eq('auth_id', authUser.id).single();
        if (profileError || !userProfile) throw { message: 'User profile not found', status: 404 };
        if (userProfile.role !== 'Admin') throw { message: 'Permission denied: Admin role required.', status: 403 };

        if (action === 'set') {
            const { message } = payload;
            if (!message) throw { message: 'Message content is required', status: 400 };
            await supabaseAdmin.from('system_broadcast').update({ is_active: false }).eq('is_active', true);
            const { error: insertError } = await supabaseAdmin.from('system_broadcast').insert({ message: message, is_active: true });
            if (insertError) throw insertError;
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        } else if (action === 'deactivate') {
            const { error: updateError } = await supabaseAdmin.from('system_broadcast').update({ is_active: false }).eq('is_active', true);
            if (updateError) throw updateError;
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
    }

    // --- Google Drive Resource ---
    if (resource === 'drive') {
        const { data: { user: driveUser }, error: getDriveUserError } = await supabaseAdmin.auth.admin.getUserById(authUser.id);
        if(getDriveUserError) throw getDriveUserError;

        let accessToken = driveUser.app_metadata?.google_access_token;
        const tokenExpiry = driveUser.app_metadata?.google_token_expiry;
        const refreshToken = driveUser.app_metadata?.google_refresh_token;

        if (action !== 'check-status' && action !== 'unlink' && !refreshToken) {
            throw { status: 403, message: 'Google Drive is not linked. Please re-link your account.' };
        }

        if (action !== 'check-status' && action !== 'unlink' && (!accessToken || Date.now() > (tokenExpiry - 60000))) {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken, client_id: GCP_CLIENT_ID, client_secret: GCP_CLIENT_SECRET, grant_type: 'refresh_token' })
            });
            if (!tokenResponse.ok) {
                const errorBody = await tokenResponse.json();
                console.error('Failed to refresh Google token:', errorBody);
                throw { status: 401, message: 'Could not refresh Google token. Please re-link your Drive account.' };
            }
            const newTokens = await tokenResponse.json();
            accessToken = newTokens.access_token;
            const new_expiry_time = Date.now() + (newTokens.expires_in * 1000);
            const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { app_metadata: { ...driveUser.app_metadata, google_access_token: accessToken, google_token_expiry: new_expiry_time } });
            if (updateUserError) console.error("Failed to save new Google token", updateUserError);
        }

        switch(action) {
            case 'upload-photo': {
                const { name, content } = payload;
                const lynixId = await ensureFolder(accessToken, null, 'lynix');
                const photosId = await ensureFolder(accessToken, lynixId, 'photos');
                const metadata = { name: name, parents: [photosId], mimeType: 'image/jpeg' };
                const boundary = '-------314159265358979323846';
                const delimiter = "\r\n--" + boundary + "\r\n";
                const close_delim = "\r\n--" + boundary + "--";
                const contentType = 'image/jpeg';
                const multipartBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + content + close_delim;

                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipartBody });
                if (!response.ok) { const errText = await response.text(); throw { status: response.status, message: `Upload failed: ${errText}` }; }
                const fileData = await response.json();
                return new Response(JSON.stringify({ success: true, fileId: fileData.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'list-files': {
                const query = payload?.query || "trashed=false";
                const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                if (!response.ok) throw { status: response.status, message: await response.text() };
                const data = await response.json();
                return new Response(JSON.stringify({ files: data.files }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'create-file': {
                 const { name } = payload;
                 const response = await fetch('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: 'text/plain' }) });
                 if (!response.ok) throw { status: response.status, message: await response.text() };
                 const file = await response.json();
                 return new Response(JSON.stringify({ file }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'get-file-details': {
                const { fileId } = payload;
                const [metaResponse, contentResponse] = await Promise.all([
                    fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime,webViewLink,iconLink`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                    fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
                ]);
                if (!metaResponse.ok || !contentResponse.ok) throw { status: 500, message: "Failed to fetch file details or content." };
                const file = await metaResponse.json();
                file.content = await contentResponse.text();
                return new Response(JSON.stringify({ file }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'update-file': {
                const { fileId, name, content } = payload;
                if (name) await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                if (content !== undefined) await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'text/plain' }, body: content });
                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'delete-file': {
                const { fileId } = payload;
                await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } });
                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'check-status': {
                return new Response(JSON.stringify({ isLinked: !!refreshToken }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            case 'unlink': {
                const { app_metadata } = driveUser;
                delete app_metadata.google_access_token;
                delete app_metadata.google_refresh_token;
                delete app_metadata.google_token_expiry;
                const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { app_metadata });
                if (updateUserError) throw updateUserError;
                return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }
            default: throw { status: 400, message: 'Invalid drive action specified.' };
        }
    }

    const { data: userProfile, error: profileError } = await supabaseAdmin.from('users').select('*').eq('auth_id', authUser.id).single();
    if (profileError) throw { status: 403, message: 'User profile not found.' };

    // --- Admin-only endpoints ---
    if (userProfile.role === 'Admin') {
        if (resource === 'stats') {
            const { count: messages } = await supabaseAdmin.from('chat_messages').select('*', { count: 'exact', head: true });
            const { count: mails } = await supabaseAdmin.from('mails').select('*', { count: 'exact', head: true });
            const { count: contacts } = await supabaseAdmin.from('contacts').select('*', { count: 'exact', head: true });
            return new Response(JSON.stringify({ stats: { messages, mails, contacts } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
        if (resource === 'database_reset') {
            const { target } = payload;
            let error;
            if (target === 'chat') {
                ({ error } = await supabaseAdmin.from('chat_messages').delete().neq('id', 0));
            } else if (target === 'mail') {
                ({ error } = await supabaseAdmin.from('mails').delete().neq('id', 0));
            } else if (target === 'contacts') {
                ({ error } = await supabaseAdmin.from('contacts').delete().neq('id', 0));
            } else {
                throw { status: 400, message: 'Invalid reset target.' };
            }
            if (error) throw error;
            return new Response(JSON.stringify({ success: true, message: `${target} has been cleared.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
    }


    switch(resource) {
        case 'chatHistory': {
            const { currentUserId, otherUserId } = payload;
            const chatId = [currentUserId, otherUserId].sort().join('--');
            const { data, error } = await supabaseAdmin.from('chat_messages').select('*, sender:sender_id(*), receiver:receiver_id(*)').eq('chat_id', `chat--${chatId}`).order('timestamp');
            if (error) throw error;
            return new Response(JSON.stringify({ history: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
        case 'mails': {
            switch(action) {
                case 'get': {
                    const { data, error } = await supabaseAdmin.from('mails').select('*').or(`recipient.eq.${userProfile.username},sender.ilike.%${userProfile.username}%`).order('timestamp', { ascending: false });
                    if (error) throw error;
                    return new Response(JSON.stringify({ mails: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'send': {
                    const { data, error } = await supabaseAdmin.from('mails').insert(payload).select().single();
                    if (error) throw error;
                    return new Response(JSON.stringify({ mail: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'markAsRead': {
                    await supabaseAdmin.from('mails').update({ read: true }).eq('id', payload.id);
                    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'delete': {
                    await supabaseAdmin.from('mails').delete().eq('id', payload.id);
                    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
            }
            break;
        }
        case 'contacts': {
             switch(action) {
                case 'get': {
                    const { data, error } = await supabaseAdmin.from('contacts').select('*').eq('owner', userProfile.username).order('name');
                    if (error) throw error;
                    return new Response(JSON.stringify({ contacts: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'add': {
                    const { data, error } = await supabaseAdmin.from('contacts').insert({ ...payload, owner: userProfile.username }).select().single();
                    if (error) throw error;
                    return new Response(JSON.stringify({ contact: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'update': {
                    const { data, error } = await supabaseAdmin.from('contacts').update(payload).eq('id', payload.id).select().single();
                    if (error) throw error;
                    return new Response(JSON.stringify({ contact: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
                case 'delete': {
                    await supabaseAdmin.from('contacts').delete().eq('id', payload.id);
                    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                }
            }
            break;
        }
        default: {
          if (resource) {
            // Check if resource was handled above
            if (['drive', 'system', 'user', 'broadcast', 'stats', 'database_reset'].includes(resource)) {
                 // handled
            } else {
                 throw { status: 400, message: 'Invalid resource specified.' };
            }
          }
           return new Response(JSON.stringify({ message: "OK" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
    }

  } catch (error) {
    console.error("Error in app-service function:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: error.status || 500 });
  }
});
