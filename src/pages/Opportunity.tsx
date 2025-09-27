import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOpportunityData } from '@/hooks/useOpportunityData';
import { useOpportunityActions } from '@/hooks/useOpportunityActions';
import OpportunityHeader from '@/components/opportunity/OpportunityHeader';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';
import OpportunitySidebar from '@/components/opportunity/OpportunitySidebar';
import { ExpandableChatDemo } from '@/components/ui/expandable-chat-demo';

const Opportunity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { opportunity, loading } = useOpportunityData(id);
  const {
    isBookmarked,
    hasApplied,
    actionLoading,
    handleBookmark,
    handleApply,
    handleShare
  } = useOpportunityActions(id);

  const handleBack = () => {
    console.log('handleBack called in Opportunity page');
    navigate(-1);
  };

  const handleShareOpportunity = () => {
    console.log('handleShareOpportunity called in Opportunity page', { opportunity });
    if (opportunity) {
      handleShare(opportunity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/20 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#17cfcf]/20 border-t-[#17cfcf] rounded-full"
        />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/20 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-[#e6f5ec]/30 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-[#384040] mb-4">Opportunity Not Found</h1>
                  <p className="text-gray-600 text-lg mb-8">
                    The opportunity you're looking for doesn't exist or is no longer available.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#17cfcf] hover:bg-[#17cfcf]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e6f5ec]/20 to-white">
      {/* Header with glassmorphism effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e6f5ec]/30"
      >
        <OpportunityHeader
          onBack={handleBack}
          onShare={handleShareOpportunity}
          onBookmark={handleBookmark}
          isBookmarked={isBookmarked}
          actionLoading={actionLoading}
          user={user}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main content area */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#17cfcf]/10 to-[#e6f5ec]/10 rounded-3xl blur-xl"></div>
              <div className="relative">
                <OpportunityDetails opportunity={opportunity} />
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#e6f5ec]/10 to-[#17cfcf]/10 rounded-3xl blur-xl"></div>
              <div className="relative">
                <OpportunitySidebar
                  opportunity={opportunity}
                  user={user}
                  hasApplied={hasApplied}
                  actionLoading={actionLoading}
                  onApply={() => handleApply(opportunity)}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced AI Chat Widget */}
      <ExpandableChatDemo />
    </div>
  );
};

export default Opportunity;
