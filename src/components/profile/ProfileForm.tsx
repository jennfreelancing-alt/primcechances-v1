
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  full_name?: string;
  bio?: string;
  country?: string;
  education_level?: string;
  field_of_study?: string;
  years_of_experience?: number;
  cookie_accepted?: boolean;
  avatar_url?: string | null;
  email_notifications?: boolean;
  onboarding_completed?: boolean;
  push_notifications?: boolean;
  subscription_tier?: 'free' | 'pro';
  updated_at?: string;
  created_at?: string;
}

const ProfileForm = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not found. Please sign in again.');
      return;
    }
    try {
      // Ensure all required fields are present for upsert
      const upsertData = {
        id: user.id,
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        country: profileData.country || '',
        education_level: profileData.education_level || '',
        field_of_study: profileData.field_of_study || '',
        years_of_experience: profileData.years_of_experience ?? null,
        avatar_url: profileData.avatar_url ?? null,
        email_notifications: profileData.email_notifications ?? true,
        onboarding_completed: profileData.onboarding_completed ?? false,
        push_notifications: profileData.push_notifications ?? true,
        subscription_tier: profileData.subscription_tier === 'pro' ? 'pro' : 'free',
        updated_at: new Date().toISOString(),
        created_at: profileData.created_at || new Date().toISOString(),
      } as {
        id: string;
        full_name: string;
        bio: string;
        country: string;
        education_level: string;
        field_of_study: string;
        years_of_experience: number | null;
        avatar_url: string | null;
        email_notifications: boolean;
        onboarding_completed: boolean;
        push_notifications: boolean;
        subscription_tier: 'free' | 'pro';
        updated_at: string;
        created_at: string;
      };
      const { error } = await supabase
        .from('user_profiles')
        .upsert(upsertData);
      if (error) throw error;
      toast.success('Profile updated successfully');
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileData.full_name || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profileData.country || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter your country"
              />
            </div>
          </div>

          {/* Cookie Preference Display */}
          <div className="flex items-center gap-2 mt-2">
            <Label>Cookie Preference:</Label>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${profileData.cookie_accepted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {profileData.cookie_accepted ? 'Accepted' : 'Rejected'}
            </span>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="education_level">Education Level</Label>
              <Select
                value={profileData.education_level || ''}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, education_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input
                id="field_of_study"
                value={profileData.field_of_study || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, field_of_study: e.target.value }))}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="years_of_experience">Years of Experience</Label>
            <Input
              id="years_of_experience"
              type="number"
              min="0"
              max="50"
              value={profileData.years_of_experience || 0}
              onChange={(e) => setProfileData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <button type="submit" className="w-full bg-[#008000] hover:bg-[#006400] text-white rounded-md py-2 px-4 font-semibold">
            Save Profile
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
