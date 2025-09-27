
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
    const { userId, opportunityId, documentType, additionalInfo } = await req.json();
    console.log('Document generation request:', { userId, opportunityId, documentType });

    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get opportunity details if provided
    let opportunity = null;
    if (opportunityId) {
      const { data: opp } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();
      opportunity = opp;
    }

    const document = await generateDocument(userProfile, opportunity, documentType, additionalInfo);

    // Store generated document
    const { data: savedDoc } = await supabase
      .from('application_assistance')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        document_type: documentType,
        title: document.title,
        content: document.content,
        ai_model_used: 'gpt-4o-mini',
        generation_prompt: document.prompt,
        is_ats_optimized: true,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ 
      document: savedDoc,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in document generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDocument(userProfile: any, opportunity: any, documentType: string, additionalInfo: any) {
  let prompt = '';
  let title = '';

  switch (documentType) {
    case 'cover_letter':
      title = `Cover Letter - ${opportunity?.title || 'General Application'}`;
      prompt = `
        Write a professional cover letter for:
        
        APPLICANT:
        - Name: ${userProfile.full_name}
        - Experience: ${userProfile.years_of_experience || 0} years
        - Education: ${userProfile.education_level}
        - Field: ${userProfile.field_of_study}
        - Bio: ${userProfile.bio || 'Passionate professional'}
        
        ${opportunity ? `
        OPPORTUNITY:
        - Position: ${opportunity.title}
        - Organization: ${opportunity.organization}
        - Requirements: ${opportunity.requirements?.join(', ') || 'Not specified'}
        - Description: ${opportunity.description}
        ` : ''}
        
        Additional Info: ${additionalInfo || 'None'}
        
        Make it ATS-friendly, professional, and compelling. Include specific examples and achievements.
      `;
      break;

    case 'cv':
      title = `CV - ${userProfile.full_name}`;
      prompt = `
        Create a professional ATS-optimized CV for:
        
        PERSONAL INFO:
        - Name: ${userProfile.full_name}
        - Experience: ${userProfile.years_of_experience || 0} years
        - Education: ${userProfile.education_level}
        - Field: ${userProfile.field_of_study}
        - Country: ${userProfile.country}
        - Bio: ${userProfile.bio}
        
        Additional Details: ${additionalInfo || 'Include standard sections'}
        
        Format as a clean, professional CV with:
        - Contact Information
        - Professional Summary
        - Work Experience
        - Education
        - Skills
        - Achievements
        
        Use bullet points and quantify achievements where possible.
      `;
      break;

    case 'sop':
      title = `Statement of Purpose - ${opportunity?.title || 'Application'}`;
      prompt = `
        Write a compelling Statement of Purpose for:
        
        APPLICANT:
        - Name: ${userProfile.full_name}
        - Background: ${userProfile.field_of_study}
        - Experience: ${userProfile.years_of_experience || 0} years
        - Bio: ${userProfile.bio}
        
        ${opportunity ? `
        TARGET OPPORTUNITY:
        - Program/Position: ${opportunity.title}
        - Organization: ${opportunity.organization}
        - Description: ${opportunity.description}
        ` : ''}
        
        Additional Info: ${additionalInfo || 'Focus on career goals and motivation'}
        
        Make it personal, compelling, and well-structured. Show passion and clear career goals.
      `;
      break;

    default:
      throw new Error('Invalid document type');
  }

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
          content: 'You are a professional career document writer. Create high-quality, ATS-optimized documents that help candidates stand out.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  return {
    title,
    content,
    prompt: prompt.substring(0, 500) // Store truncated prompt for reference
  };
}
