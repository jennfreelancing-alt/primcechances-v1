
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₦0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Access to all opportunity categories',
        'Basic search and filtering',
        'Bookmark up to 10 opportunities',
        'Email notifications',
        'Basic profile creation'
      ],
      limitations: [
        'Limited to 5 applications per month',
        'Basic support only'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: '₦2,500',
      period: 'per month',
      description: 'For serious opportunity seekers',
      features: [
        'Everything in Free plan',
        'Unlimited applications',
        'AI-powered application guidance',
        'Success rate analysis',
        'Unlimited bookmarks',
        'Advanced search filters',
        'Priority email support',
        'Application tracking & analytics',
        'Document templates',
        'Early access to new features'
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      popular: true
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#e6f5ec]/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#384040] mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start for free and upgrade when you're ready to unlock the full potential of your opportunity search
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#17cfcf] text-white px-4 py-1 rounded-full font-semibold">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular ? 'border-[#17cfcf] scale-105' : 'border-gray-200 hover:border-[#17cfcf]/50'
              }`}>
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mb-4">
                    {plan.popular ? (
                      <div className="w-16 h-16 bg-gradient-to-r from-[#17cfcf] to-[#17cfcf]/80 rounded-2xl flex items-center justify-center mx-auto">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Star className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-[#384040] mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-[#384040]">{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start gap-3 opacity-60">
                        <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                          <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-600 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/auth" className="block">
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-[#17cfcf] hover:bg-[#17cfcf]/90 text-white shadow-lg hover:shadow-[#17cfcf]/30'
                          : 'border-2 border-[#17cfcf] text-[#17cfcf] hover:bg-[#17cfcf] hover:text-white'
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            All plans include access to our core opportunity discovery features. 
            <br />
            Upgrade anytime to unlock advanced AI-powered tools and unlimited access.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionPricing;
