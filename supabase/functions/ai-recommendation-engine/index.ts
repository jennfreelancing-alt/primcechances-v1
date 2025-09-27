
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
    const { userId, opportunityId, action } = await req.json();
    console.log('AI Recommendation Engine called for user:', userId);

    if (action === 'generate_recommendations') {
      return await generateRecommendations(userId);
    } else if (action === 'calculate_match_score') {
      return await calculateMatchScore(userId, opportunityId);
    } else if (action === 'get_recommendations') {
      return await getUserRecommendations(userId);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI recommendation engine:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateRecommendations(userId: string) {
  // Get user profile and preferences
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: userPreferences } = await supabase
    .from('user_preferences')
    .select('*, categories(*)')
    .eq('user_id', userId);

  // Get active opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('is_published', true)
    .eq('status', 'approved');

  if (!opportunities || opportunities.length === 0) {
    return new Response(JSON.stringify({ recommendations: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const recommendations = [];

  for (const opportunity of opportunities.slice(0, 10)) { // Limit to 10 for performance
    const matchScore = await calculateOpportunityMatch(userProfile, userPreferences, opportunity);
    
    if (matchScore > 0.5) { // Only recommend if match score > 50%
      const reasons = await generateMatchReasons(userProfile, userPreferences, opportunity, matchScore);
      
      recommendations.push({
        user_id: userId,
        opportunity_id: opportunity.id,
        recommendation_type: 'profile_match',
        match_score: matchScore,
        reasons: reasons,
        ai_model_used: 'gpt-4o-mini',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    }
  }

  // Store recommendations in database
  if (recommendations.length > 0) {
    const { error } = await supabase
      .from('ai_recommendations')
      .upsert(recommendations, { onConflict: 'user_id,opportunity_id,recommendation_type' });

    if (error) {
      console.error('Error storing recommendations:', error);
    }
  }

  return new Response(JSON.stringify({ 
    recommendations: recommendations.length,
    message: `Generated ${recommendations.length} recommendations`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function calculateMatchScore(userId: string, opportunityId: string) {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: userPreferences } = await supabase
    .from('user_preferences')
    .select('*, categories(*)')
    .eq('user_id', userId);

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (!userProfile || !opportunity) {
    return new Response(JSON.stringify({ error: 'User or opportunity not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const matchScore = await calculateOpportunityMatch(userProfile, userPreferences, opportunity);
  const reasons = await generateMatchReasons(userProfile, userPreferences, opportunity, matchScore);

  return new Response(JSON.stringify({ match_score: matchScore, reasons }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUserRecommendations(userId: string) {
  const { data: recommendations } = await supabase
    .from('ai_recommendations')
    .select(`
      *,
      opportunities (
        id, title, organization, description, location, 
        application_deadline, salary_range, is_remote
      )
    `)
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .order('match_score', { ascending: false })
    .limit(20);

  return new Response(JSON.stringify({ recommendations: recommendations || [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function calculateOpportunityMatch(userProfile: any, userPreferences: any[], opportunity: any) {
  // Create a prompt for AI to calculate match score
  const prompt = `
    Analyze the match between this user profile and job opportunity. Return only a decimal score between 0 and 1.

    USER PROFILE:
    - Experience: ${userProfile.years_of_experience || 0} years
    - Education: ${userProfile.education_level || 'Not specified'}
    - Field of Study: ${userProfile.field_of_study || 'Not specified'}
    - Location: ${userProfile.country || 'Not specified'}
    - Preferences: ${userPreferences?.map(p => p.categories?.name).join(', ') || 'None'}

    OPPORTUNITY:
    - Title: ${opportunity.title}
    - Organization: ${opportunity.organization}
    - Location: ${opportunity.location || 'Not specified'}
    - Remote: ${opportunity.is_remote ? 'Yes' : 'No'}
    - Requirements: ${opportunity.requirements?.join(', ') || 'Not specified'}
    - Description: ${opportunity.description.substring(0, 500)}

    Calculate match score (0.0 to 1.0) based on:
    - Skill/experience alignment
    - Location compatibility
    - Career level match
    - Interest/preference match
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI career matching expert. Respond only with a decimal score between 0 and 1.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const scoreText = data.choices[0].message.content.trim();
    const score = parseFloat(scoreText);
    
    return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0.5; // Default fallback score
  }
}

async function generateMatchReasons(userProfile: any, userPreferences: any[], opportunity: any, matchScore: number) {
  const prompt = `
    Explain why this opportunity matches the user profile. Return a JSON array of specific reasons.

    USER PROFILE:
    - Experience: ${userProfile.years_of_experience || 0} years
    - Education: ${userProfile.education_level || 'Not specified'}
    - Field: ${userProfile.field_of_study || 'Not specified'}
    - Location: ${userProfile.country || 'Not specified'}

    OPPORTUNITY:
    - Title: ${opportunity.title}
    - Organization: ${opportunity.organization}
    - Location: ${opportunity.location || 'Global'}
    - Remote: ${opportunity.is_remote ? 'Yes' : 'No'}

    Match Score: ${matchScore.toFixed(2)}

    Return JSON array of 2-4 specific reasons like:
    ["Experience level aligns with requirements", "Location matches preferences", "Skills match job description"]
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Return only a valid JSON array of match reasons.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const reasonsText = data.choices[0].message.content.trim();
    
    try {
      return JSON.parse(reasonsText);
    } catch {
      return ['Profile matches opportunity requirements', 'Good fit based on experience level'];
    }
  } catch (error) {
    console.error('Error generating match reasons:', error);
    return ['AI analysis indicates good compatibility'];
  }
}
