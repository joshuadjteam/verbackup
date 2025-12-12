
import { supabase } from '../supabaseClient';
import { User, UserRole, Mail, Contact, Note, MailAccount, DriveFile, WeblyApp } from '../types';

// Helper to map DB user to app User
const mapDbUserToUser = (dbUser: any): User => {
    if (!dbUser) return null as unknown as User;
    // Generate Phone Number: 2901 + 6 digit padded ID (e.g. ID 5 -> 2901000005)
    // Note: If the DB has a real phone number stored, use that, otherwise fallback to generation
    const phoneNumber = dbUser.phone_number || `2901${dbUser.id.toString().padStart(6, '0')}`;

    return {
        id: dbUser.id,
        auth_id: dbUser.auth_id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        plan_name: dbUser.plan_name,
        phone_number: phoneNumber,
        system_version: dbUser.system_version || '12.0.2', // Map system_version, default to 12.0.2
        features: dbUser.features,
        installed_webly_apps: dbUser.installed_webly_apps || [],
    };
};

export const database = {
    // --- Auth & User Functions (using Supabase Edge Functions) ---
    getGuestUser: (): Promise<User> => {
        return Promise.resolve({
            id: 0,
            username: 'Guest User',
            email: 'guest@lynixity.x10.bz',
            role: UserRole.Trial,
            plan_name: 'Trial',
            phone_number: '2901000000',
            system_version: '12.0.2',
            features: { chat: false, ai: true, mail: false }
        });
    },
    
    getUserProfile: async (auth_id: string): Promise<{ profile: User | null, error: string | null }> => {
        // CONSOLIDATED: Now uses 'app-service'
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'user', action: 'get-profile' }
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) {
                    // Parsing error, stick with original message
                }
            }
            console.error('Error from app-service (getProfile):', errorMessage, { error, data });
            return { profile: null, error: errorMessage };
        }
        if (data?.error) {
            console.error('Error from app-service (getProfile):', data.error, { error, data });
            return { profile: null, error: data.error };
        }
        if (!data.user) {
            return { profile: null, error: 'User profile not found.' };
        }
        return { profile: mapDbUserToUser(data.user), error: null };
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { action: 'getUsers' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (getUsers):', errorMessage, { error, data });
            return [];
        }
        if (data?.error) {
            console.error('Error from manage-users function (getUsers):', data.error, { error, data });
            return [];
        }
        return (data.users || []).map(mapDbUserToUser);
    },

    getUserDirectory: async (): Promise<User[]> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { action: 'getDirectory' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (getDirectory):', errorMessage, { error, data });
            return [];
        }
        if (data?.error) {
            console.error('Error from manage-users function (getDirectory):', data.error, { error, data });
            return [];
        }
        return (data.users || []).map(mapDbUserToUser);
    },
    
    // Used for 10101010 Feature (Method 2 & 4)
    resolveUserIdentifier: async (type: 'phone' | 'lynix_id', value: string): Promise<{ email: string | null, error: string | null }> => {
        // CONSOLIDATED: Now uses 'app-service'
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { 
                resource: 'user',
                action: 'resolve-identifier',
                payload: { type, value }
            }
        });

        if (error) {
            return { email: null, error: error.message };
        }
        if (data?.error) {
            return { email: null, error: data.error };
        }
        
        return { email: data.email, error: null };
    },

    addUser: async (userData: Partial<User> & { password?: string }): Promise<{ user: User | null; error: string | null }> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: {
                action: 'createUser',
                ...userData
            }
        });
        
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (addUser):', errorMessage, { error, data });
            return { user: null, error: errorMessage };
        }
        if (data?.error) {
            console.error('Error from manage-users function (addUser):', data.error, { error, data });
            return { user: null, error: data.error };
        }
        return { user: mapDbUserToUser(data.user), error: null };
    },

    updateUser: async (userData: Partial<User>): Promise<User | null> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { 
                action: 'updateUser',
                ...userData // system_version is passed here
            }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (updateUser):', errorMessage, { error, data });
            return null;
        }
        if (data?.error) {
            console.error('Error from manage-users function (updateUser):', data.error, { error, data });
            return null;
        }
        return mapDbUserToUser(data.user);
    },
    
    updateUserPassword: async (currentPassword: string, newPassword: string): Promise<{ error: string | null }> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: {
                action: 'updatePassword',
                currentPassword,
                newPassword,
            },
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (updatePassword):', errorMessage, { error, data });
            return { error: errorMessage };
        }
        if (data?.error) {
            console.error('Error from manage-users function (updatePassword):', data.error, { error, data });
            return { error: data.error };
        }
        return { error: null };
    },
    
    deleteUser: async (userToDelete: User): Promise<{ error: string | null }> => {
        if (!userToDelete.auth_id) {
            const err = 'Cannot delete user without an authentication ID.';
            console.error(err);
            return { error: err };
        }
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { action: 'deleteUser', auth_id: userToDelete.auth_id }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from manage-users function (deleteUser):', errorMessage, { error, data });
            return { error: errorMessage };
        }
        if (data?.error) {
            console.error('Error from manage-users function (deleteUser):', data.error, { error, data });
            return { error: data.error };
        }
        return { error: null };
    },

    getUserByUsername: async (username: string): Promise<User | null> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { action: 'getUserByUsername', username: username }
        });
        if (error) {
            console.log(`User ${username} not found.`);
            return null;
        }
        if (data?.error) {
            console.error('Error from manage-users function (getUserByUsername):', data.error, { error, data });
            return null;
        }
        return mapDbUserToUser(data.user);
    },

    getUserByEmail: async (email: string): Promise<User | null> => {
        const { data, error } = await supabase.functions.invoke('manage-users', {
            body: { action: 'getUserByEmail', email }
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error invoking manage-users (getUserByEmail):', errorMessage);
            throw new Error("Database connection error during user validation.");
        }

        if (data?.error) {
            console.error('Error from manage-users function (getUserByEmail):', data.error);
            throw new Error("Database query error during user validation.");
        }

        if (!data.user) {
            return null;
        }

        return mapDbUserToUser(data.user);
    },

    getUserByPhoneNumber: async (phoneNumber: string): Promise<User | null> => {
        if (!/^2901\d{6}$/.test(phoneNumber)) return null;
        const allUsers = await database.getUserDirectory();
        const id = parseInt(phoneNumber.slice(4), 10);
        return allUsers.find(u => u.id === id) || null;
    },

    checkPhoneNumberStatus: async (phoneNumber: string): Promise<{ active: boolean; username?: string; error?: string }> => {
        // CONSOLIDATED: Now uses 'app-service'
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { 
                resource: 'user',
                action: 'check-number', 
                payload: { phoneNumber } 
            }
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            return { active: false, error: errorMessage };
        }

        if (data?.error) {
            return { active: false, error: data.error };
        }

        return { active: true, username: data.username };
    },
    
    getAdminStats: async (): Promise<{ messages: number, mails: number, contacts: number }> => {
        const fallbackStats = { messages: 0, mails: 0, contacts: 0 };
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'stats' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error fetching admin stats:', errorMessage, { error, data });
            return fallbackStats;
        }
        if (data?.error) {
            console.error('Error fetching admin stats:', data.error, { error, data });
            return fallbackStats;
        }
        return data.stats || fallbackStats;
    },
    
    // --- Google Drive Service ---
    getDriveOAuthConfig: async (): Promise<{ clientId: string; redirectUri: string } | null> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'get-oauth-config' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error fetching Google Drive OAuth config:', errorMessage, { error, data });
            return null;
        }
        if (data?.error) {
            console.error('Error fetching Google Drive OAuth config:', data.error, { error, data });
            return null;
        }
        return data;
    },
    
    loginAndLinkDrive: async (email: string, password: string, code: string): Promise<{ success: boolean; error?: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { 
                resource: 'auth', 
                action: 'loginAndLinkDrive', 
                payload: { email, password, code } 
            }
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error from loginAndLinkDrive function:', errorMessage, { error, data });
            return { success: false, error: errorMessage };
        }
        if (data?.error) {
            console.error('Error from loginAndLinkDrive function:', data.error, { error, data });
            return { success: false, error: data.error };
        }
        return { success: true };
    },

    getDriveFiles: async (query?: string): Promise<{ files?: DriveFile[], error?: string, reauth?: boolean }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'list-files', payload: { query } }
        });
        let errorMessage = data?.error;
        if (error) {
            errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
        }
        if(errorMessage) {
            console.error('Error from drive/list-files function:', errorMessage, { error, data });
            const reauth = errorMessage.includes('re-link');
            return { error: errorMessage, reauth };
        }

        return { files: data.files || [] };
    },

    findDriveFileByName: async (name: string): Promise<DriveFile | null> => {
        const { files } = await database.getDriveFiles(`name = '${name}' and trashed = false`);
        if (files && files.length > 0) {
            return files[0];
        }
        return null;
    },

    createDriveFile: async (name: string): Promise<{ file?: DriveFile, error?: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'create-file', payload: { name } }
        });
        if (error || data?.error) {
            const errorMessage = (error?.message || data?.error) as string;
            console.error('Error creating drive file:', errorMessage);
            return { error: errorMessage };
        }
        return { file: data.file };
    },

    uploadPhotoToDrive: async (base64Data: string): Promise<{ success: boolean, error?: string }> => {
        const filename = `Photo_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
        const content = base64Data.replace(/^data:image\/\w+;base64,/, "");
        
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'upload-photo', payload: { name: filename, content } }
        });

        if (error || data?.error) {
            const errorMessage = (error?.message || data?.error) as string;
            console.error('Error uploading photo:', errorMessage);
            return { success: false, error: errorMessage };
        }
        return { success: true };
    },

    getDriveFileDetails: async (fileId: string): Promise<{ file?: DriveFile & { content: string }, error?: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'get-file-details', payload: { fileId } }
        });
        if (error || data?.error) {
            const errorMessage = (error?.message || data?.error) as string;
            console.error('Error getting drive file details:', errorMessage);
            return { error: errorMessage };
        }
        return { file: data.file };
    },

    updateDriveFile: async (fileId: string, updates: { name?: string, content?: string }): Promise<{ success: boolean, error?: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'update-file', payload: { fileId, ...updates } }
        });
        if (error || data?.error) {
            const errorMessage = (error?.message || data?.error) as string;
            console.error('Error updating drive file:', errorMessage);
            return { success: false, error: errorMessage };
        }
        return { success: data.success };
    },
    
    deleteDriveFile: async (fileId: string): Promise<{ success: boolean, error?: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'delete-file', payload: { fileId } }
        });
        if (error || data?.error) {
            const errorMessage = (error?.message || data?.error) as string;
            console.error('Error deleting drive file:', errorMessage);
            return { success: true };
        }
        return { success: data.success };
    },

    isDriveLinked: async (): Promise<boolean> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'check-status' }
        });
        if (error) {
            return false;
        }
        return data.isLinked;
    },

    unlinkDrive: async (): Promise<{ success: boolean }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'drive', action: 'unlink' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error unlinking Drive:', errorMessage, { error, data });
            return { success: false };
        }
        if (data?.error) {
            console.error('Error unlinking Drive:', data.error, { error, data });
            return { success: false };
        }
        return { success: data.success };
    },

    getVoiceResponse: async (text: string): Promise<{ audioDataUrl: string, transcription: string }> => {
        const { data, error } = await supabase.functions.invoke('voice-service', {
            body: { text }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try { const body = await error.context.json(); errorMessage = body.error || errorMessage; } catch (e) {}
            }
            console.error('Error invoking voice-service:', errorMessage);
            throw new Error(errorMessage);
        }
        if (data?.error) {
            console.error('Error invoking voice-service:', data.error);
            throw new Error(data.error);
        }
        return data;
    },

    // --- Proxy Service ---
    fetchProxyContent: async (url: string, options?: { method?: string, headers?: any, body?: string }): Promise<{ content: string; contentType: string; headers?: Record<string, string>; strippedHeaders?: string[]; error?: string }> => {
        const { data, error } = await supabase.functions.invoke('proxy-service', {
            body: { 
                url,
                method: options?.method || 'GET',
                headers: options?.headers,
                body: options?.body 
            }
        });
        
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    if (body && body.error) errorMessage = body.error;
                } catch (e) {}
            }
            console.error('Error fetching proxy content (invoke failed):', errorMessage);
            return { content: '', contentType: '', error: errorMessage };
        }

        if (data?.error) {
             console.error('Error in proxy content response:', data.error);
             return { content: '', contentType: '', error: data.error };
        }

        return { content: data.content, contentType: data.contentType, headers: data.headers, strippedHeaders: data.strippedHeaders };
    },

    getMailsForUser: async (username: string): Promise<{ inbox: Mail[], sent: Mail[] }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mails', action: 'get' }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try { const body = await error.context.json(); errorMessage = body.error || errorMessage; } catch (e) {}
            }
            console.error("Error fetching mails:", errorMessage);
            return { inbox: [], sent: [] };
        }
        if (data?.error) {
            console.error("Error fetching mails:", data.error);
            return { inbox: [], sent: [] };
        }
        const mails = data.mails || [];
        const inbox = mails.filter((m: Mail) => m.recipient === username);
        const sent = mails.filter((m: Mail) => m.sender.includes(username));
        return { inbox, sent };
    },

    sendMail: async (mailData: { recipient: string; subject: string; body: string; sender: string; }): Promise<Mail | null> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mails', action: 'send', payload: mailData }
        });
        if (error || data?.error) {
            console.error('Error sending mail:', error || data.error);
            return null;
        }
        return data.mail;
    },
    
    markMailAsRead: async (mailId: number): Promise<boolean> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mails', action: 'markAsRead', payload: { id: mailId } }
        });
        if (error || data?.error) {
            console.error('Error marking mail as read:', error || data.error);
            return false;
        }
        return true;
    },

    deleteMail: async (mailId: number): Promise<boolean> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mails', action: 'delete', payload: { id: mailId } }
        });
        if (error || data?.error) {
            console.error('Error deleting mail:', error || data.error);
            return false;
        }
        return true;
    },

    getMailAccounts: async (): Promise<MailAccount[]> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mail_accounts', action: 'get' }
        });
        if (error || data?.error) {
            console.error("Error fetching mail accounts:", error || data.error);
            return [];
        }
        return data.accounts || [];
    },

    addMailAccount: async (accountData: Omit<MailAccount, 'id' | 'user_id'>): Promise<MailAccount | null> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mail_accounts', action: 'add', payload: accountData }
        });
        if (error || data?.error) {
            console.error('Error adding mail account:', error || data.error);
            return null;
        }
        return data.account;
    },

    syncMailAccount: async (accountId: number): Promise<{ success: boolean, message: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'mails', action: 'sync', payload: { accountId } }
        });
        if (error || data?.error) {
            const errorMessage = error?.message || data?.error;
            console.error('Error syncing mail account:', errorMessage);
            return { success: false, message: errorMessage };
        }
        return { success: true, message: data.message || 'Sync complete.' };
    },

    getContactsForUser: async (username: string): Promise<Contact[]> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'contacts', action: 'get' }
        });
        if (error || data?.error) {
            console.error('Error fetching contacts:', error || data.error);
            return [];
        }
        return data.contacts || [];
    },

    addContact: async (contactData: Omit<Contact, 'id' | 'owner'>): Promise<Contact | null> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'contacts', action: 'add', payload: contactData }
        });
        if (error || data?.error) {
            console.error('Error adding contact:', error || data.error);
            return null;
        }
        return data.contact;
    },

    updateContact: async (contactData: Contact): Promise<Contact | null> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'contacts', action: 'update', payload: contactData }
        });
        if (error || data?.error) {
            console.error('Error updating contact:', error || data.error);
            return null;
        }
        return data.contact;
    },
    
    deleteContact: async (contactId: number): Promise<boolean> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'contacts', action: 'delete', payload: { id: contactId } }
        });
        if (error || data?.error) {
            console.error('Error deleting contact:', error || data.error);
            return false;
        }
        return data.success;
    },

    // --- Webly Store ---
    getWeblyApps: async (): Promise<WeblyApp[]> => {
        const { data, error } = await supabase.functions.invoke('webly-service', {
            body: { action: 'get' }
        });

        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) { /* Parsing error, ignore */ }
            }
            console.error('Error fetching webly apps:', errorMessage);
            return [];
        }

        if (data?.error) {
            console.error('Error fetching webly apps:', data.error);
            return [];
        }
        
        return data.apps || [];
    },
    addWeblyApp: async (appData: Omit<WeblyApp, 'id' | 'created_at'>): Promise<WeblyApp | null> => {
        const { data, error } = await supabase.functions.invoke('webly-service', {
            body: { action: 'add', payload: appData }
        });
        if (error || data?.error) {
            console.error('Error adding webly app:', error || data?.error);
            return null;
        }
        return data.app;
    },
    updateWeblyApp: async (appData: Partial<WeblyApp> & { id: string }): Promise<WeblyApp | null> => {
        const { data, error } = await supabase.functions.invoke('webly-service', {
            body: { action: 'update', payload: appData }
        });
        if (error || data?.error) {
            console.error('Error updating webly app:', error || data?.error);
            return null;
        }
        return data.app;
    },
    deleteWeblyApp: async (id: string): Promise<boolean> => {
        const { data, error } = await supabase.functions.invoke('webly-service', {
            body: { action: 'delete', payload: { id } }
        });
        if (error || data?.error) {
            console.error('Error deleting webly app:', error || data?.error);
            return false;
        }
        return data.success;
    },
    updateUserInstalledApps: async (appIds: string[]): Promise<string[] | null> => {
        // CONSOLIDATED: Now uses 'app-service'
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { 
                resource: 'user', 
                action: 'update-installed-apps', 
                payload: { appIds } 
            }
        });
        if (error) {
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) {
                    // Ignore JSON parsing error
                }
            }
            console.error("Error invoking app-service (updateInstalledApps):", errorMessage, { originalError: error });
            return null;
        }
        if (data?.error) {
            console.error('Error from app-service (updateInstalledApps):', data.error);
            return null;
        }
        return data.installed_webly_apps;
    },
    resetDatabaseTable: async (target: 'chat' | 'mail' | 'contacts'): Promise<{ success: boolean; message: string }> => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'database_reset', payload: { target } }
        });
        if (error || data?.error) {
            const errorMessage = error?.message || data?.error || 'Failed to reset table.';
            console.error(`Error resetting ${target}:`, errorMessage);
            return { success: false, message: errorMessage };
        }
        return { success: data.success, message: data.message };
    },

    // --- Browser Cloud Sync (Simulated via User Metadata) ---
    getBrowserData: async (userId: number): Promise<{ history: string[], bookmarks: { title: string, url: string }[] }> => {
        const saved = localStorage.getItem(`lynix_browser_data_${userId}`);
        return saved ? JSON.parse(saved) : { history: [], bookmarks: [] };
    },

    saveBrowserData: async (userId: number, data: { history?: string[], bookmarks?: { title: string, url: string }[] }) => {
        const current = JSON.parse(localStorage.getItem(`lynix_browser_data_${userId}`) || '{"history":[], "bookmarks":[]}');
        const newData = { ...current, ...data };
        localStorage.setItem(`lynix_browser_data_${userId}`, JSON.stringify(newData));
    },

    // --- NEW: Software Update Check ---
    // CONSOLIDATED: This now points to 'app-service'
    checkSoftwareUpdate: async (currentVersion: string) => {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: { resource: 'system', action: 'check-update', payload: { currentVersion } }
        });
        if (error || data?.error) {
            console.error("Update check failed:", error || data?.error);
            return null;
        }
        return data;
    }
};
