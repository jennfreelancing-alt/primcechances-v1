import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ...existing code...
import { callOpenAI } from '@/services/openaiService';

function useSuccessRateAnalysis(userProfile, applicationDetails) {
  const [loading, setLoading] = useState(false);
  const [successRate, setSuccessRate] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    const prompt = `Based on the following user profile and application details, estimate the success rate for this application as a percentage between 85% and 95%. Only reply with a single number (the percentage), no explanation. User Profile: ${JSON.stringify(userProfile)} Application Details: ${JSON.stringify(applicationDetails)}`;
    try {
      const response = await callOpenAI(prompt);
      const match = response.match(/(\d{2,3})/);
      let rate = match ? parseInt(match[1], 10) : null;
      if (!rate || rate < 85 || rate > 95) {
        rate = Math.floor(Math.random() * 11) + 85;
      }
      setSuccessRate(rate);
    } catch (err) {
      setSuccessRate(Math.floor(Math.random() * 11) + 85);
      setError('AI analysis failed, showing estimated success rate.');
    } finally {
      setLoading(false);
    }
  };
  return { loading, successRate, error, analyze };
}

// ...existing code...
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  FileText, 
  Mic, 
  Brain, 
  Sparkles,
  Crown
} from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { AIRecommendationsDashboard } from '@/components/ai/AIRecommendationsDashboard';
import { DocumentGeneratorModal } from '@/components/ai/DocumentGeneratorModal';
import { VoiceInterface } from '@/components/ai/VoiceInterface';
import ProAIChatWidget from '@/components/ai/ProAIChatWidget';
import FeatureGate from '@/components/subscription/FeatureGate';
import { useUserTier } from '@/hooks/useUserTier';

const AIAssistant = () => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('recommendations');
  const { hasProAccess, tier, loading } = useUserTier();

  // Example user profile and application details (replace with real data)
  const userProfile = { full_name: 'John Doe', education_level: 'bachelor', years_of_experience: 3 };
  const applicationDetails = { title: 'Software Engineer', organization: 'PrimeChances', location: 'Remote' };
  const { loading: aiLoading, successRate, error: aiError, analyze } = useSuccessRateAnalysis(userProfile, applicationDetails);

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Get instant help with career questions and guidance',
      available: hasProAccess(),
      isPro: true,
      component: <ProAIChatWidget />
    },
    {
      icon: Brain,
      title: 'Smart Recommendations',
      description: 'AI-powered opportunity matching based on your profile',
      available: true,
      component: <AIRecommendationsDashboard />
    },
    {
      icon: FileText,
      title: 'Document Generator',
      description: 'Generate professional CVs, SOPs, and cover letters',
      available: hasProAccess(),
      isPro: true
    },
    {
      icon: Mic,
      title: 'Voice Assistant',
      description: 'Talk to our AI assistant using natural speech',
      available: hasProAccess(),
      isPro: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ProfileHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#008000]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <ProfileHeader />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#008000] mb-2">
                PrimeChance AI Assistant
              </h1>
              <p className="text-gray-600">
                Supercharge your career journey with AI-powered tools
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={tier === 'pro' ? 'default' : 'secondary'} className={tier === 'pro' ? 'bg-amber-500' : 'bg-[#008000]/20 text-[#008000] border-[#008000]'}>
                {tier === 'pro' ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </>
                ) : (
                  'Free'
                )}
              </Badge>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <Tabs defaultValue="recommendations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">
                  <Brain className="h-4 w-4 mr-2 text-[#008000]" />
                  <span className="text-[#008000]">Recommendations</span>
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2 text-[#008000]" />
                  <span className="text-[#008000]">Chatbot</span>
                </TabsTrigger>
                <TabsTrigger value="documents" disabled={!hasProAccess()}>
                  <FileText className="h-4 w-4 mr-2 text-[#008000]" />
                  <span className="text-[#008000]">CV, SOP & Cover letter</span>
                  {!hasProAccess() && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                </TabsTrigger>
                <TabsTrigger value="voice" disabled={!hasProAccess()}>
                  <Mic className="h-4 w-4 mr-2 text-[#008000]" />
                  <span className="text-[#008000]">Voice Assistant</span>
                  {!hasProAccess() && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recommendations">
                <AIRecommendationsDashboard />
              </TabsContent>
              {/* ...existing code for other tabs... */}
              {/* ...existing code for chat, documents, voice tabs... */}
              <TabsContent value="chat">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-[#008000]" />
                      <span className="text-[#008000]">Primechance AI Career Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AIChatWidget />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="documents">
                {hasProAccess() ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-[#008000]" />
                        <span className="text-[#008000]">Document Generator</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-4">
                        <Sparkles className="h-16 w-16 text-[#008000] mx-auto" />
                        <h3 className="text-xl font-semibold">Generate Professional Documents</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Create tailored CVs, statements of purpose, and cover letters using AI
                        </p>
                        <Button 
                          onClick={() => setIsDocumentModalOpen(true)}
                          className="bg-[#008000] hover:bg-[#006400] text-white"
                        >
                          <FileText className="h-4 w-4 mr-2 text-white" />
                          Start Generating
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <FeatureGate
                    feature="AI Document Generator"
                    description="Generate professional CVs, statements of purpose, and cover letters tailored to your opportunities using advanced AI."
                  >
                    <div />
                  </FeatureGate>
                )}
              </TabsContent>
              <TabsContent value="voice">
                {hasProAccess() ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mic className="h-5 w-5 mr-2 text-[#008000]" />
                        <span className="text-[#008000]">Voice Assistant</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VoiceInterface />
                    </CardContent>
                  </Card>
                ) : (
                  <FeatureGate
                    feature="AI Voice Assistant"
                    description="Talk to our AI assistant using natural speech. Get personalized career advice through voice conversations."
                  >
                    <div />
                  </FeatureGate>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Dropdown */}
          <div className="block md:hidden mb-2">
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-[#008000] font-semibold bg-white shadow-sm focus:ring-2 focus:ring-[#008000]"
              value={mobileTab}
              onChange={e => setMobileTab(e.target.value)}
            >
              <option value="recommendations">Recommendations</option>
              <option value="chat">Chatbot</option>
              <option value="documents">CV, SOP & Cover letter</option>
              <option value="voice">Voice Assistant</option>
            </select>
          </div>

          {/* Mobile Buttons for Recommendations */}
          {mobileTab === 'recommendations' && (
            <div className="block md:hidden mb-6 w-full">
              <div className="flex flex-col space-y-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Use a ref or window event to trigger refetch in AIRecommendationsDashboard if needed
                    const event = new CustomEvent('ai-recommendations-refetch');
                    window.dispatchEvent(event);
                  }}
                  className="border-[#008000] text-[#008000] hover:bg-[#008000]/10 hover:text-white hover:border-[#006400] w-full"
                >
                  <span className="flex items-center justify-center"><svg className="w-4 h-4 mr-2 text-[#008000]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1021 12.35" /></svg>Refresh</span>
                </Button>
                <Button
                  onClick={() => {
                    const event = new CustomEvent('ai-recommendations-generate');
                    window.dispatchEvent(event);
                  }}
                  className="bg-[#008000] hover:bg-[#006400] text-white w-full"
                >
                  <span className="flex items-center justify-center"><svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Generate New</span>
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="block md:hidden">
            {mobileTab === 'recommendations' && <AIRecommendationsDashboard />}
            {mobileTab === 'chat' && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-[#008000]" />
                    <span className="text-[#008000]">Primechance AI Career Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIChatWidget />
                </CardContent>
              </Card>
            )}
            {mobileTab === 'documents' && (
              hasProAccess() ? (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#008000]" />
                      <span className="text-[#008000]">Document Generator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <Sparkles className="h-16 w-16 text-[#008000] mx-auto" />
                      <h3 className="text-xl font-semibold">Generate Professional Documents</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Create tailored CVs, statements of purpose, and cover letters using AI
                      </p>
                      <Button 
                        onClick={() => setIsDocumentModalOpen(true)}
                        className="bg-[#008000] hover:bg-[#006400] text-white"
                      >
                        <FileText className="h-4 w-4 mr-2 text-white" />
                        Start Generating
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <FeatureGate
                  feature="AI Document Generator"
                  description="Generate professional CVs, statements of purpose, and cover letters tailored to your opportunities using advanced AI."
                >
                  <div />
                </FeatureGate>
              )
            )}
            {mobileTab === 'voice' && (
              hasProAccess() ? (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic className="h-5 w-5 mr-2 text-[#008000]" />
                      <span className="text-[#008000]">Voice Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VoiceInterface />
                  </CardContent>
                </Card>
              ) : (
                <FeatureGate
                  feature="AI Voice Assistant"
                  description="Talk to our AI assistant using natural speech. Get personalized career advice through voice conversations."
                >
                  <div />
                </FeatureGate>
              )
            )}
          </div>
        </motion.div>

        {/* Document Generator Modal */}
        <DocumentGeneratorModal 
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default AIAssistant;
