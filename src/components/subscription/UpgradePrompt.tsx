import React from "react";
import { useProSubscriptionPrice } from "@/hooks/useProSubscriptionPrice";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Crown, X, Check, Zap, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradePrompt = ({ isOpen, onClose }: UpgradePromptProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/subscription");
    onClose();
  };

  const { price: proPrice, loading: priceLoading } =
    useProSubscriptionPrice(2500);

  const proFeatures = [
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
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
          <DialogContent
            className="max-w-md border-0 p-0 bg-transparent shadow-none max-h-[90vh] 
      overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}>
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/30 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>

                <CardHeader className="relative pb-4 pt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                      className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </motion.div>

                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                        Upgrade to Pro
                      </CardTitle>
                      <p className="text-gray-600 text-lg">
                        Unlock unlimited access to all opportunities
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 text-yellow-800 px-4 py-2 text-sm font-semibold">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Limited Time Offer
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-6">
                  <div className="space-y-6">
                    {/* Current Limitation */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-semibold text-red-800">
                          Current Limitation
                        </span>
                      </div>
                      <p className="text-red-700 text-sm">
                        Free users can only access 2 categories (Jobs &
                        Internships)
                      </p>
                    </div>

                    {/* Pro Features */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        What you'll get with Pro
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        {proFeatures.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.3 + index * 0.1,
                              duration: 0.3,
                            }}
                            className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-green-800 font-medium">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {priceLoading
                          ? "Loading..."
                          : `₦${proPrice.toLocaleString()}`}
                        <span className="text-lg font-normal text-gray-600">
                          /month
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Cancel anytime • 7-day free trial
                      </p>

                      <Button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Zap className="w-5 h-5 mr-2" />
                        Upgrade to Pro Now
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700">
                        Maybe later
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;
