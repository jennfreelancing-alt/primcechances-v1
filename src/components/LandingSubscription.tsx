import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Zap,
  Brain,
  Target,
  FileText,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PricingCard } from "@/components/ui/pricing";
import { useUserTier } from "@/hooks/useUserTier";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";

const LandingSubscription = () => {
  const { tier, loading } = useUserTier();
  const { processPayment, isProcessing, proPrice, priceLoading } =
    useFlutterwavePayment();

  const proFeatures = [
    {
      icon: Brain,
      title: "Opportunities Analysis",
      description:
        "AI-powered analysis of opportunities to find the best matches for your profile",
    },
    {
      icon: Target,
      title: "Opportunities Matching & Recommendations",
      description:
        "Get personalized recommendations based on your skills, experience, and preferences",
    },
    {
      icon: BookOpen,
      title: "Step-by-Step Applications Support",
      description:
        "AI-guided application process with detailed instructions and best practices",
    },
    {
      icon: MessageSquare,
      title: "AI Career Tips",
      description:
        "Receive personalized career advice and tips to improve your applications",
    },
    {
      icon: Sparkles,
      title: "AI Career Counselling",
      description:
        "Get professional career guidance and strategic advice for your career path",
    },
    {
      icon: FileText,
      title: "Unlimited Documents",
      description:
        "Generate unlimited CVs, cover letters, SOPs, and other application documents",
    },
    {
      icon: Shield,
      title: "ATS-Optimized CV",
      description:
        "Get your CV optimized for Applicant Tracking Systems with AI assistance",
    },
    {
      icon: TrendingUp,
      title: "Cover Letters, SOPs & Reviews",
      description:
        "Professional document generation for all stages of your application process",
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-[#e6f5ec]/10 via-white to-[#e6f5ec]/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#90EE90] rounded-full blur-3xl opacity-5 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#e6f5ec] rounded-full blur-3xl opacity-5 animate-pulse"
          style={{ animationDelay: "1s" }}></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#90EE90] to-[#32CD32] rounded-full blur-3xl opacity-3 animate-pulse"
          style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20">
          <Badge className="bg-gradient-to-r from-[#90EE90] to-[#32CD32] text-white px-6 py-3 rounded-full font-bold mb-8 shadow-lg shadow-[#90EE90]/20 border border-[#90EE90]/20">
            <Star className="w-5 h-5 mr-2" />
            Choose Your Plan
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-[#384040] mb-8 leading-tight">
            Plans made for every
            <span className="block bg-gradient-to-r from-[#90EE90] via-[#32CD32] to-[#228B22] bg-clip-text text-transparent">
              opportunity seeker
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            Start for free and upgrade when you're ready to unlock the full
            potential of your opportunity search
          </p>
        </motion.div>

        {/* New Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto">
          <div className="rounded-xl flex flex-col justify-between border p-1 bg-white/80 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row">
              <PricingCard
                title="Free"
                price="₦0 / mo"
                description="Perfect for getting started with opportunity discovery"
                buttonVariant="outline"
                features={[
                  "Access to all opportunity categories",
                  "Advanced search functionality",
                  "Save unlimited opportunities",
                  "Standard email notifications",
                  "Profile customization",
                  "Unlimited applications per month",
                  "Community forum access",
                  "Standard support only",
                ]}
              />

              <PricingCard
                title="Pro"
                price={`₦${proPrice.toLocaleString()}  / mo`}
                description="For serious opportunity seekers and professionals"
                buttonVariant="default"
                highlight
                features={[
                  "Everything in Free plan",
                  "Unlimited applications",
                  "AI-powered application guidance",
                  "Success rate analysis",
                  "Advanced search filters",
                  "Priority email support",
                  "Application tracking & analytics",
                  "Document templates",
                  "Early access to new features",
                  "24/7 AI Career Assistant",
                  "ATS-optimized CV generation",
                ]}
              />
            </div>
          </div>

          {/* <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                No credit card required
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#90EE90] rounded-full mr-2"></div>
                7-day free trial
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#32CD32] rounded-full mr-2"></div>
                Cancel anytime
              </div>
            </div>
          </div> */}
        </motion.div>

        {/* Enhanced Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <motion.div
              className="text-center"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#90EE90]/20 to-[#32CD32]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-[#90EE90]" />
              </div>
              <h3 className="text-xl font-bold text-[#384040] mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 text-base font-medium">
                Your data is protected with enterprise-grade security and
                encryption
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#90EE90]/20 to-[#32CD32]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-10 h-10 text-[#90EE90]" />
              </div>
              <h3 className="text-xl font-bold text-[#384040] mb-3">
                Proven Results
              </h3>
              <p className="text-gray-600 text-base font-medium">
                95% success rate for users with Pro features and AI guidance
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#90EE90]/20 to-[#32CD32]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="w-10 h-10 text-[#90EE90]" />
              </div>
              <h3 className="text-xl font-bold text-[#384040] mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600 text-base font-medium">
                Get help whenever you need it with priority customer support
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingSubscription;
