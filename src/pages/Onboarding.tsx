
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, User, Heart, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form data
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    country: '',
    education_level: '',
    field_of_study: '',
    years_of_experience: 0
  });
  
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: number}>({});
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    push_notifications: true
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    fetchCategories();
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data?.onboarding_completed) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategoryToggle = (categoryId: string, priority: number) => {
    setSelectedCategories(prev => {
      const newSelection = { ...prev };
      if (newSelection[categoryId]) {
        delete newSelection[categoryId];
      } else {
        newSelection[categoryId] = priority;
      }
      return newSelection;
    });
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          ...notificationPrefs,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Save user preferences
      const preferences = Object.entries(selectedCategories).map(([categoryId, priority]) => ({
        user_id: user.id,
        category_id: categoryId,
        priority_level: priority,
        is_interested: true
      }));

      if (preferences.length > 0) {
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .insert(preferences);

        if (prefsError) throw prefsError;
      }

      toast({
        title: "Welcome to PrimeChances!",
        description: "Your profile has been set up successfully.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={profileData.country}
                  onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  placeholder="Enter your country"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Education & Experience</h2>
              <p className="text-gray-600">Help us match you with relevant opportunities</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="education_level">Education Level</Label>
                <Select value={profileData.education_level} onValueChange={(value) => setProfileData({...profileData, education_level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input
                  id="field_of_study"
                  value={profileData.field_of_study}
                  onChange={(e) => setProfileData({...profileData, field_of_study: e.target.value})}
                  placeholder="e.g., Computer Science, Business, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Select value={profileData.years_of_experience.toString()} onValueChange={(value) => setProfileData({...profileData, years_of_experience: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Fresh Graduate</SelectItem>
                    <SelectItem value="1">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="11">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
              <p className="text-gray-600">Select categories and set your priority level</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all ${
                    selectedCategories[category.id] ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((priority) => (
                          <Button
                            key={priority}
                            size="sm"
                            variant={selectedCategories[category.id] === priority ? "default" : "outline"}
                            onClick={() => handleCategoryToggle(category.id, priority)}
                          >
                            {priority === 1 ? 'High' : priority === 2 ? 'Med' : 'Low'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
              <p className="text-gray-600">Choose how you'd like to stay updated</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_notifications"
                  checked={notificationPrefs.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotificationPrefs({...notificationPrefs, email_notifications: checked as boolean})
                  }
                />
                <Label htmlFor="email_notifications">Email notifications for new opportunities</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push_notifications"
                  checked={notificationPrefs.push_notifications}
                  onCheckedChange={(checked) => 
                    setNotificationPrefs({...notificationPrefs, push_notifications: checked as boolean})
                  }
                />
                <Label htmlFor="push_notifications">Push notifications for important updates</Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Getting Started</CardTitle>
              <Badge variant="outline">{currentStep} of {totalSteps}</Badge>
            </div>
            <Progress value={progress} className="mb-4" />
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
