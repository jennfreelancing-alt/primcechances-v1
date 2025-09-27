import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { callOpenAI } from '@/services/openaiService';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  opportunity_id: string;
  recommendation_type: string;
  match_score: number;
  reasons: string[];
  created_at: string;
  is_viewed: boolean;
  opportunities: {
    id: string;
    title: string;
    organization: string;
    description: string;
    location?: string;
    application_deadline?: string;
    salary_range?: string;
    is_remote?: boolean;
  };
}

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get user profile for matching
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError) {
        console.error('Profile error:', profileError);
      }
      // Get opportunities
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          organization,
          location,
          application_deadline,
          salary_range,
          is_remote,
          requirements,
          benefits,
          tags,
          created_at,
          category:categories(name, color)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);
      if (oppError) {
        console.error('Error fetching opportunities:', oppError);
        setRecommendations([]);
        setLoading(false);
        return;
      }
      if (!opportunities || opportunities.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      // Try OpenAI recommendations
      let generatedRecommendations: AIRecommendation[] = [];
      let aiContent: string | undefined = undefined;
      try {
        const openaiRes = await callOpenAI('chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an AI career assistant. Given a user profile and a list of opportunities, recommend the best matches as a JSON array. Respond ONLY with valid JSON.' },
            { role: 'user', content: `User profile: ${JSON.stringify(userProfile)}\nOpportunities: ${JSON.stringify(opportunities)}` }
          ],
          user: user.id
        });
        aiContent = openaiRes.choices?.[0]?.message?.content;
        if (aiContent) {
          try {
            generatedRecommendations = JSON.parse(aiContent);
          } catch (e) {
            console.warn('Failed to parse OpenAI recommendations, falling back to local logic.');
          }
        }
      } catch (err) {
        console.error('OpenAI recommendation error:', err);
        // Removed failed notification for AI recommendations
      }
      // If OpenAI failed or returned nothing, use local logic
      if (!generatedRecommendations || generatedRecommendations.length === 0) {
        // Check profile completeness
        const hasCompleteProfile = !!userProfile && (
          !!userProfile.field_of_study ||
          userProfile.years_of_experience !== undefined ||
          !!userProfile.education_level
        );
        if (hasCompleteProfile) {
          generatedRecommendations = opportunities.map((opportunity: any, index: number) => {
            const matchScore = calculateMatchScore(userProfile, opportunity);
            const reasons = generateMatchReasons(userProfile, opportunity, matchScore);
            return {
              id: `rec_${opportunity.id}_${index}`,
              opportunity_id: opportunity.id,
              recommendation_type: 'job_match',
              match_score: matchScore,
              reasons,
              created_at: new Date().toISOString(),
              is_viewed: false,
              opportunities: {
                id: opportunity.id,
                title: opportunity.title,
                organization: opportunity.organization,
                description: opportunity.description,
                location: opportunity.location,
                application_deadline: opportunity.application_deadline,
                salary_range: opportunity.salary_range,
                is_remote: opportunity.is_remote
              }
            };
          })
          .filter(rec => rec.match_score > 0.2)
          .slice(0, 12);
        } else {
          // Show featured/trending opportunities for incomplete profiles
          generatedRecommendations = opportunities.slice(0, 6).map((opportunity: any, index: number) => {
            const matchScore = 0.5 + (Math.random() * 0.3);
            const reasons = [
              'Featured opportunity in our database',
              'Recently posted and actively hiring',
              'Great company with competitive benefits',
              'Opportunity for career growth and development'
            ];
            return {
              id: `rec_${opportunity.id}_${index}`,
              opportunity_id: opportunity.id,
              recommendation_type: 'featured',
              match_score: matchScore,
              reasons,
              created_at: new Date().toISOString(),
              is_viewed: false,
              opportunities: {
                id: opportunity.id,
                title: opportunity.title,
                organization: opportunity.organization,
                description: opportunity.description,
                location: opportunity.location,
                application_deadline: opportunity.application_deadline,
                salary_range: opportunity.salary_range,
                is_remote: opportunity.is_remote
              }
            };
          });
        }
        // Fallback: if no recommendations after filtering, show at least 3 opportunities
        if (!generatedRecommendations || generatedRecommendations.length === 0) {
          generatedRecommendations = opportunities.slice(0, 3).map((opportunity: any, index: number) => {
            const matchScore = 0.4 + (Math.random() * 0.2);
            const reasons = [
              'Featured opportunity in our database',
              'Recently posted and actively hiring',
              'Great company with competitive benefits'
            ];
            return {
              id: `rec_fallback_${opportunity.id}_${index}`,
              opportunity_id: opportunity.id,
              recommendation_type: 'fallback',
              match_score: matchScore,
              reasons,
              created_at: new Date().toISOString(),
              is_viewed: false,
              opportunities: {
                id: opportunity.id,
                title: opportunity.title,
                organization: opportunity.organization,
                description: opportunity.description,
                location: opportunity.location,
                application_deadline: opportunity.application_deadline,
                salary_range: opportunity.salary_range,
                is_remote: opportunity.is_remote
              }
            };
          });
        }
      }
      // Sort by match score (highest first)
      generatedRecommendations.sort((a, b) => b.match_score - a.match_score);
      setRecommendations(generatedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (userProfile: any, opportunity: any): number => {
    let score = 0.3; // Base score
    
    console.log(`Calculating score for: ${opportunity.title}`);
    console.log('User profile:', { 
      field_of_study: userProfile?.field_of_study,
      years_of_experience: userProfile?.years_of_experience,
      education_level: userProfile?.education_level,
      country: userProfile?.country
    });
    
    // Field of study match (30% weight)
    if (userProfile?.field_of_study && opportunity.description) {
      const fieldKeywords = userProfile.field_of_study.toLowerCase().split(' ');
      const descLower = opportunity.description.toLowerCase();
      const fieldMatches = fieldKeywords.filter(keyword => descLower.includes(keyword)).length;
      const fieldScore = (fieldMatches / fieldKeywords.length) * 0.3;
      score += fieldScore;
      console.log(`Field match: ${fieldMatches}/${fieldKeywords.length} keywords - Score: ${fieldScore}`);
    }

    // Experience level match (25% weight)
    const userExp = userProfile?.years_of_experience || 0;
    if (opportunity.requirements) {
      const reqText = Array.isArray(opportunity.requirements) 
        ? opportunity.requirements.join(' ').toLowerCase()
        : opportunity.requirements.toLowerCase();
      
      let expScore = 0;
      if (userExp >= 5 && reqText.includes('senior')) expScore = 0.25;
      else if (userExp >= 3 && reqText.includes('mid')) expScore = 0.25;
      else if (userExp >= 1 && reqText.includes('junior')) expScore = 0.25;
      else if (userExp < 2 && (reqText.includes('entry') || reqText.includes('graduate'))) expScore = 0.25;
      else if (userExp < 1) expScore = 0.15; // Entry level for new graduates
      
      score += expScore;
      console.log(`Experience match: ${userExp} years - Score: ${expScore}`);
    }

    // Location preference (15% weight)
    if (userProfile?.country && opportunity.location) {
      if (opportunity.location.toLowerCase().includes(userProfile.country.toLowerCase())) {
        score += 0.15;
        console.log('Location match: +0.15');
      }
    }

    // Remote work preference (10% weight)
    if (opportunity.is_remote) {
      score += 0.1;
      console.log('Remote work: +0.1');
    }

    // Education level match (10% weight)
    if (userProfile?.education_level && opportunity.description) {
      const eduLevel = userProfile.education_level.toLowerCase();
      const descLower = opportunity.description.toLowerCase();
      
      let eduScore = 0;
      if (eduLevel.includes('phd') && descLower.includes('phd')) eduScore = 0.1;
      else if (eduLevel.includes('master') && descLower.includes('master')) eduScore = 0.1;
      else if (eduLevel.includes('bachelor') && descLower.includes('bachelor')) eduScore = 0.1;
      else if (eduLevel.includes('diploma') && descLower.includes('diploma')) eduScore = 0.1;
      
      score += eduScore;
      console.log(`Education match: ${eduLevel} - Score: ${eduScore}`);
    }

    // Tags and keywords match (10% weight)
    if (opportunity.tags && Array.isArray(opportunity.tags)) {
      const tagMatches = opportunity.tags.filter(tag => 
        userProfile?.field_of_study?.toLowerCase().includes(tag.toLowerCase()) ||
        userProfile?.bio?.toLowerCase().includes(tag.toLowerCase())
      ).length;
      const tagScore = (tagMatches / opportunity.tags.length) * 0.1;
      score += tagScore;
      console.log(`Tag match: ${tagMatches}/${opportunity.tags.length} tags - Score: ${tagScore}`);
    }

    // Recent opportunities bonus (5% weight)
    const daysSinceCreated = (Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      score += 0.05;
      console.log('Recent opportunity bonus: +0.05');
    }

    const finalScore = Math.min(1, Math.max(0, score));
    console.log(`Final score for ${opportunity.title}: ${finalScore}`);
    
    return finalScore;
  };

  const generateMatchReasons = (userProfile: any, opportunity: any, matchScore: number): string[] => {
    const reasons = [];
    
    // High match score reasons
    if (matchScore > 0.8) {
      reasons.push('Excellent match for your profile and experience level');
    } else if (matchScore > 0.6) {
      reasons.push('Strong alignment with your background and skills');
    } else if (matchScore > 0.4) {
      reasons.push('Good potential match based on your profile');
    }
    
    // Field of study match
    if (userProfile?.field_of_study && opportunity.description?.toLowerCase().includes(userProfile.field_of_study.toLowerCase())) {
      reasons.push(`Perfect alignment with your ${userProfile.field_of_study} background`);
    }
    
    // Experience level match
    const userExp = userProfile?.years_of_experience || 0;
    if (opportunity.requirements) {
      const reqText = Array.isArray(opportunity.requirements) 
        ? opportunity.requirements.join(' ').toLowerCase()
        : opportunity.requirements.toLowerCase();
      
      if (userExp >= 5 && reqText.includes('senior')) {
        reasons.push('Senior-level role matches your extensive experience');
      } else if (userExp >= 3 && reqText.includes('mid')) {
        reasons.push('Mid-level position aligns with your experience');
      } else if (userExp >= 1 && reqText.includes('junior')) {
        reasons.push('Junior role suitable for your experience level');
      } else if (userExp < 2 && (reqText.includes('entry') || reqText.includes('graduate'))) {
        reasons.push('Entry-level position perfect for your background');
      }
    }
    
    // Location match
    if (userProfile?.country && opportunity.location?.toLowerCase().includes(userProfile.country.toLowerCase())) {
      reasons.push('Location matches your preferred country/region');
    }
    
    // Remote work
    if (opportunity.is_remote) {
      reasons.push('Remote work opportunity available');
    }
    
    // Education level match
    if (userProfile?.education_level && opportunity.description) {
      const eduLevel = userProfile.education_level.toLowerCase();
      const descLower = opportunity.description.toLowerCase();
      
      if (eduLevel.includes('phd') && descLower.includes('phd')) {
        reasons.push('PhD-level position matches your education');
      } else if (eduLevel.includes('master') && descLower.includes('master')) {
        reasons.push('Master\'s level role aligns with your education');
      } else if (eduLevel.includes('bachelor') && descLower.includes('bachelor')) {
        reasons.push('Bachelor\'s level position suitable for your education');
      }
    }
    
    // Salary information
    if (opportunity.salary_range) {
      reasons.push('Competitive compensation package offered');
    }
    
    // Recent opportunity
    const daysSinceCreated = (Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      reasons.push('Recently posted opportunity - apply early');
    }
    
    // Organization reputation (if available)
    if (opportunity.organization && opportunity.organization.length > 0) {
      reasons.push(`Great opportunity at ${opportunity.organization}`);
    }
    
    // Tags match
    if (opportunity.tags && Array.isArray(opportunity.tags) && opportunity.tags.length > 0) {
      const matchingTags = opportunity.tags.filter(tag => 
        userProfile?.field_of_study?.toLowerCase().includes(tag.toLowerCase()) ||
        userProfile?.bio?.toLowerCase().includes(tag.toLowerCase())
      );
      if (matchingTags.length > 0) {
        reasons.push(`Matches your interests in: ${matchingTags.slice(0, 2).join(', ')}`);
      }
    }

    // Fallback reason if no specific reasons found
    if (reasons.length === 0) {
      reasons.push('AI analysis indicates good compatibility with your profile');
    }

    return reasons.slice(0, 4); // Limit to 4 most relevant reasons
  };

  const generateRecommendations = async () => {
    toast.success('Generating new recommendations...');
    await fetchRecommendations();
  };

  const markAsViewed = async (recommendationId: string) => {
    try {
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendationId ? { ...rec, is_viewed: true } : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
    }
  };

  return {
    recommendations,
    loading,
    generateRecommendations,
    markAsViewed,
    refetch: fetchRecommendations
  };
};
