import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, CreditCard } from "lucide-react";
import { useUserTier } from "@/hooks/useUserTier";
import { useFlutterwavePayment } from "@/hooks/useFlutterwavePayment";
import { toast } from "sonner";

const SubscriptionManager: React.FC = () => {
  const { tier, loading } = useUserTier();
  const { processPayment, isProcessing, proPrice, priceLoading } =
    useFlutterwavePayment();

  // Features from homepage pricing component
  const features = [
    { name: "Access to all opportunity categories", free: true, pro: true },
    { name: "Advanced search functionality", free: true, pro: true },
    { name: "Save unlimited opportunities", free: true, pro: true },
    { name: "Standard email notifications", free: true, pro: true },
    { name: "Profile customization", free: true, pro: true },
    { name: "Unlimited applications per month", free: true, pro: true },
    { name: "Community forum access", free: true, pro: true },
    // Pro-only features
    { name: "Advanced search filters", free: false, pro: true },
    { name: "24/7 AI Career Assistant", free: false, pro: true },
    { name: "AI Voice Chat Interface", free: false, pro: true },
    { name: "ATS-optimized CV generation", free: false, pro: true },
    { name: "AI-powered application guidance", free: false, pro: true },
    { name: "Success rate analysis", free: false, pro: true },
    { name: "Priority email support", free: false, pro: true },
    { name: "Application tracking & analytics", free: false, pro: true },
    { name: "Document templates", free: false, pro: true },
    { name: "Early access to new features", free: false, pro: true },
  ];

  const handleUpgrade = async () => {
    await processPayment("pro"); // Dynamic price for Pro plan
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h2 className="text-2xl font-bold">Subscription</h2>
        <Badge
          variant={tier === "pro" ? "default" : "secondary"}
          className={tier === "pro" ? "bg-amber-500" : ""}>
          {tier === "pro" ? (
            <>
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </>
          ) : (
            "Free"
          )}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={tier === "free" ? "border-2 border-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free Plan
              {tier === "free" && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600">
                  Current
                </Badge>
              )}
            </CardTitle>
            <p className="text-2xl font-bold">
              ₦0<span className="text-sm font-normal">/month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  {feature.free ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span
                    className={
                      feature.free ? "text-gray-900" : "text-gray-400"
                    }>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card
          className={
            tier === "pro"
              ? "border-2 border-amber-500"
              : "border-2 border-dashed border-amber-300"
          }>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-amber-500 mr-2" />
                Pro Plan
              </div>
              {tier === "pro" && (
                <Badge className="bg-amber-500">Current</Badge>
              )}
            </CardTitle>
            <p className="text-2xl font-bold">
              {priceLoading ? "Loading..." : `₦${proPrice.toLocaleString()}`}
              <span className="text-sm font-normal">/month</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-900">{feature.name}</span>
                </li>
              ))}
            </ul>

            {tier === "free" && (
              <Button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Pay with Flutterwave"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {tier === "pro" && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="font-semibold text-gray-900">You're on Pro!</h3>
                <p className="text-sm text-gray-600">
                  Enjoy unlimited access to all premium features including AI
                  document generation and voice assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;
