
import { supabase } from '../supabaseClient';
import { ChatMessage, User } from '../types';

const activeChannels = new Map<string, any>();

// Helper to map DB user to app User, assuming snake_case from DB
const mapDbUserToUser = (dbUser: any): User => {
    if (!dbUser) return {} as User;
    // FIX: Update mapping to include all properties of the User type.
    return {
        id: dbUser.id,
        auth_id: dbUser.auth_id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        plan_name: dbUser.plan_name,
        features: dbUser.features,
        installed_webly_apps: dbUser.installed_webly_apps || [],
    };
};

export const chatService = {
    /**
     * Creates a consistent, order-independent chat ID from two user IDs.
     */
    getChatId(userId1: number, userId2: number): string {
        return ['chat', ...[userId1, userId2].sort()].join('--');
    },

    /**
     * Retrieves the message history for a chat using the 'app-service' Supabase Edge Function.
     */
    async getChatHistory(userId1: number, userId2: number): Promise<ChatMessage[]> {
        const { data, error } = await supabase.functions.invoke('app-service', {
            body: {
                resource: 'chatHistory',
                payload: {
                    currentUserId: userId1,
                    otherUserId: userId2,
                }
            }
        });

        if (error || data.error) {
            console.error('Error fetching chat history:', error || data.error);
            return [];
        }

        // Map snake_case from DB to camelCase for the app
        return (data.history || []).map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            sender: mapDbUserToUser(msg.sender),
            receiver: mapDbUserToUser(msg.receiver),
        }));
    },
    
    /**
     * Sends a new message using Supabase.
     * Uses snake_case for column names in the insert payload.
     */
    async sendMessage(messageData: { senderId: number; receiverId: number; text: string }): Promise<void> {
        const chatId = this.getChatId(messageData.senderId, messageData.receiverId);
        
        const { error } = await supabase
            .from('chat_messages')
            .insert({
                chat_id: chatId,
                sender_id: messageData.senderId,
                receiver_id: messageData.receiverId,
                text: messageData.text,
            });
        
        if (error) {
            console.error('Error sending message:', error);
        }
    },
    
    /**
     * Subscribes to real-time messages for a chat from the 'chat_messages' table.
     * The payload received from Supabase will have snake_case keys.
     */
    subscribe(chatId: string, callback: (message: any) => void): void {
        if (activeChannels.has(chatId)) {
            return;
        }

        const channel = supabase.channel(chatId);

        channel
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Successfully subscribed to channel ${chatId}`);
                }
            });

        activeChannels.set(chatId, channel);
    },
    
    /**
     * Unsubscribes from a chat to prevent memory leaks.
     */
    unsubscribe(chatId: string): void {
        const channel = activeChannels.get(chatId);
        if (channel) {
            supabase.removeChannel(channel);
            activeChannels.delete(chatId);
        }
    },
};
