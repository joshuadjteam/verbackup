import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenAI, GenerateContentResponse } from 'npm:@google/genai';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, type } = body;
    if (!prompt || !type) {
      throw { status: 400, message: "Request must include 'prompt' and 'type' ('help' or 'chat')." };
    }

    let apiKey;
    let systemInstruction;

    if (type === 'help') {
      apiKey = Deno.env.get('GEMINI_HELP_API_KEY');
      systemInstruction = "You are a helpful and friendly customer support agent for a company called Lynix. Your goal is to assist users with their questions about the Lynix portal, its features (like Phone, Chat, Mail), billing, and account management. Keep your responses concise and to the point.";
    } else if (type === 'chat') {
      apiKey = Deno.env.get('GEMINI_CHAT_API_KEY');
      systemInstruction = "You are LynxAI, a helpful and friendly AI assistant for a company called Lynix. Your goal is to assist users with their questions about the Lynix portal, its features (like Phone, Chat, Mail), billing, and account management. Keep your responses concise and conversational.";
    } else {
      throw { status: 400, message: "Invalid type specified. Must be 'help' or 'chat'." };
    }

    if (!apiKey) {
      throw { status: 500, message: `API key for type '${type}' is not configured on the server.` };
    }

    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: { systemInstruction }
    });
    
    const aiTextResponse = response.text;
    
    return new Response(JSON.stringify({ text: aiTextResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in gemini-service function:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
});