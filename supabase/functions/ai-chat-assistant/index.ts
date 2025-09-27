
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, contextData } = await req.json();
    console.log('AI Chat request for user:', userId);

    // Store user message
    await supabase.from('user_ai_interactions').insert({
      user_id: userId,
      session_id: sessionId,
      message_type: 'user',
      content: message,
      context_data: contextData,
    });

    // Get conversation history
    const { data: history } = await supabase
      .from('user_ai_interactions')
      .select('message_type, content')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at')
      .limit(10);

    // Get user context for personalized responses
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const messages = [
      {
        role: 'system',
        content: `You are an AI career assistant helping users with opportunities and career guidance. 
        User Profile: ${userProfile?.full_name || 'User'} with ${userProfile?.years_of_experience || 0} years experience in ${userProfile?.field_of_study || 'their field'}.
        
        You can help with:
        - Finding and explaining opportunities
        - Career advice and guidance
        - Application tips and strategies
        - Document review and feedback
        - Interview preparation
        
        Be helpful, professional, and encouraging. Keep responses concise but informative.`
      }
    ];

    // Add conversation history
    if (history) {
      history.forEach(msg => {
        messages.push({
          role: msg.message_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store AI response
    await supabase.from('user_ai_interactions').insert({
      user_id: userId,
      session_id: sessionId,
      message_type: 'assistant',
      content: aiResponse,
      ai_model_used: 'gpt-4o-mini',
      tokens_used: data.usage?.total_tokens || 0,
      context_data: contextData,
    });

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI chat assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
