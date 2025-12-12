import { supabase } from '../supabaseClient';

export const geminiService = {
    getHelpResponse: async (prompt: string): Promise<string> => {
        try {
            const { data, error } = await supabase.functions.invoke('gemini-service', {
                body: { type: 'help', prompt }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);
            
            return data.text;
        } catch (error: any) {
            console.error("Error calling Gemini service for Help:", error);
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) {
                    // Ignore JSON parsing error
                }
            }
            console.error("Detailed Gemini Help Error:", errorMessage);
            return `Sorry, I couldn't connect to the help service at the moment. Please try again later.`;
        }
    },

    getChatAIResponse: async (prompt: string): Promise<string> => {
        try {
            const { data, error } = await supabase.functions.invoke('gemini-service', {
                body: { type: 'chat', prompt }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            return data.text;
        } catch (error: any) {
            console.error("Error calling Gemini service for Chat:", error);
            let errorMessage = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    errorMessage = body.error || errorMessage;
                } catch (e) {
                    // Ignore JSON parsing error
                }
            }
            console.error("Detailed Gemini Chat Error:", errorMessage);
            return `I'm sorry, I'm having trouble connecting right now.`;
        }
    },
};