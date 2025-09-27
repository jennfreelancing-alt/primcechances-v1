
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminSetup = () => {
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const checkAndAssignAdminRole = async (userId: string, email: string) => {
    setIsCheckingAdmin(true);
    
    try {
      console.log('Checking admin role for user:', email);
      
      const { data, error } = await supabase.functions.invoke('assign-admin-roles', {
        body: {
          user_id: userId,
          email: email
        }
      });

      if (error) {
        console.error('Error checking admin role:', error);
      } else {
        console.log('Admin check result:', data);
      }
    } catch (error) {
      console.error('Error in admin setup:', error);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  return {
    isCheckingAdmin,
    checkAndAssignAdminRole
  };
};
