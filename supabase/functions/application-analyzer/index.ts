
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
    const { userId, opportunityId, analysisType } = await req.json();
    console.log('Application analysis request:', { userId, opportunityId, analysisType });

    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get opportunity details
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (!userProfile || !opportunity) {
      throw new Error('User profile or opportunity not found');
    }

    let analysis;
    if (analysisType === 'steps') {
      analysis = await generateApplicationSteps(userProfile, opportunity);
    } else if (analysisType === 'chance') {
      analysis = await analyzeApplicationChance(userProfile, opportunity);
    } else {
      throw new Error('Invalid analysis type');
    }

    return new Response(JSON.stringify({ 
      analysis,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in application analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateApplicationSteps(userProfile: any, opportunity: any) {
  const prompt = `
    Analyze this opportunity and create a step-by-step application guide:
    
    OPPORTUNITY:
    - Title: ${opportunity.title}
    - Organization: ${opportunity.organization}
    - Description: ${opportunity.description}
    - Requirements: ${opportunity.requirements?.join(', ') || 'Not specified'}
    - Deadline: ${opportunity.application_deadline || 'Not specified'}
    
    USER PROFILE:
    - Name: ${userProfile.full_name}
    - Education: ${userProfile.education_level}
    - Experience: ${userProfile.years_of_experience || 0} years
    - Field: ${userProfile.field_of_study}
    - Country: ${userProfile.country}
    
    Create a detailed step-by-step application guide with:
    1. Document preparation steps
    2. Application requirements checklist
    3. Timeline recommendations
    4. Tips for success
    
    Format as JSON with this structure:
    {
      "steps": [
        {
          "step": 1,
          "title": "Step title",
          "description": "Detailed description",
          "documents": ["doc1", "doc2"],
          "timeEstimate": "1-2 days",
          "tips": ["tip1", "tip2"]
        }
      ],
      "timeline": "Overall timeline estimate",
      "checklist": ["item1", "item2"]
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert application advisor. Provide detailed, actionable guidance in JSON format.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback if JSON parsing fails
    return {
      steps: [
        {
          step: 1,
          title: "Review Requirements",
          description: "Carefully read through all application requirements",
          documents: ["Application form"],
          timeEstimate: "30 minutes",
          tips: ["Take notes of all requirements"]
        }
      ],
      timeline: "1-2 weeks",
      checklist: ["Review requirements", "Prepare documents", "Submit application"]
    };
  }
}

async function analyzeApplicationChance(userProfile: any, opportunity: any) {
  const prompt = `
    Analyze this user's application chances for the given opportunity:
    
    USER PROFILE:
    - Education: ${userProfile.education_level}
    - Experience: ${userProfile.years_of_experience || 0} years
    - Field: ${userProfile.field_of_study}
    - Country: ${userProfile.country}
    - Age: ${userProfile.age || 'Not specified'}
    
    OPPORTUNITY:
    - Title: ${opportunity.title}
    - Organization: ${opportunity.organization}
    - Requirements: ${opportunity.requirements?.join(', ') || 'Not specified'}
    - Description: ${opportunity.description}
    
    Provide analysis as JSON:
    {
      "score": 8.5,
      "percentage": 85,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "improvements": ["improvement1", "improvement2"],
      "recommendations": ["rec1", "rec2"],
      "similarOpportunities": ["similar1", "similar2"]
    }
    
    Score should be 1-10, percentage 1-100.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert application evaluator. Provide honest, constructive analysis in JSON format.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback if JSON parsing fails
    return {
      score: 7.0,
      percentage: 70,
      strengths: ["Good educational background"],
      weaknesses: ["Limited experience"],
      improvements: ["Gain more relevant experience"],
      recommendations: ["Consider similar opportunities"],
      similarOpportunities: ["Similar roles in your field"]
    };
  }
}
