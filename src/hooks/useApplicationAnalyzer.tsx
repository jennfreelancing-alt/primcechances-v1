import { useState } from "react";
import { callOpenAI } from "@/services/openaiService";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface ApplicationSteps {
  steps: Array<{
    step: number;
    title: string;
    description: string;
    documents: string[];
    timeEstimate: string;
    tips: string[];
  }>;
  timeline: string;
  checklist: string[];
}

interface ApplicationChance {
  score: number;
  percentage: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendations: string[];
  similarOpportunities: string[];
}

export const useApplicationAnalyzer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ApplicationSteps | null>(null);
  const [chanceAnalysis, setChanceAnalysis] =
    useState<ApplicationChance | null>(null);

  const generateApplicationSteps = async (opportunity: object) => {
    if (!user) return;

    setLoading(true);
    try {
      const openaiRes = await callOpenAI("chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert application analyzer for job seekers.",
          },
          {
            role: "user",
            content: `Generate application steps for USER PROFILE:
            ${JSON.stringify(user)} and opportunity ${JSON.stringify(
              opportunity
            )}.
            Return JSON in this format:
{
  "steps": [
    {
      "step": number,
      "title": string,
      "description": string,
      "documents": [string],
      "timeEstimate": string,
      "tips": [string]
    }
  ],
  "timeline": string,
  "checklist": [string]
}
Only return JSON.`,
          },
        ],
        user: user.id,
      });
      const analysis = openaiRes.choices?.[0]?.message?.content;
      let parsed = null;
      if (analysis) {
        try {
          parsed = JSON.parse(analysis);
        } catch (e) {
          toast({
            title: "AI Error",
            description:
              "AI returned an invalid response. Please try again or contact support.",
            variant: "destructive",
          });
        }
      }
      setSteps(parsed);
      toast({
        title: "Application Guide Generated",
        description: "Your personalized application steps are ready!",
      });
    } catch (error) {
      console.error("Error generating application steps:", error);
      toast({
        title: "Error",
        description: "Failed to generate application guide.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeApplicationChance = async (opportunity: object) => {
    if (!user) return;

    setLoading(true);
    try {
      const openaiRes = await callOpenAI("chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert application analyzer for job seekers.",
          },
          {
            role: "user",
            content: `
            Analyze application chance for the following user details:
            USER PROFILE:
            ${JSON.stringify(user)}
            Opportunity DETAILS:
            ${JSON.stringify(opportunity)}.
            Return JSON in this format:
{
  "score": 0-10,
  "percentage": 0-100,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "recommendations": ["..."],
  "similarOpportunities": ["..."]
}
Only return JSON.
            `,
          },
        ],
        user: user.id,
      });
      const analysis = openaiRes.choices?.[0]?.message?.content;
      let parsedChance = null;
      if (analysis) {
        try {
          parsedChance = JSON.parse(analysis);
        } catch (e) {
          toast({
            title: "AI Error",
            description:
              "AI returned an invalid response. Please try again or contact support.",
            variant: "destructive",
          });
        }
      }
      setChanceAnalysis(parsedChance);
      toast({
        title: "Application Analysis Complete",
        description: "Your success probability has been calculated!",
      });
    } catch (error) {
      console.error("Error analyzing application chance:", error);
      toast({
        title: "Error",
        description: "Failed to analyze application chance.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    steps,
    chanceAnalysis,
    generateApplicationSteps,
    analyzeApplicationChance,
    clearAnalysis: () => {
      setSteps(null);
      setChanceAnalysis(null);
    },
  };
};
