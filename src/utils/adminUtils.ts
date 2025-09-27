
import { supabase } from '@/integrations/supabase/client';

export const manuallyAssignAdminRole = async (userId: string) => {
  try {
    console.log('Manually assigning admin role to user:', userId);
    
    // First check if role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (existingRole) {
      console.log('User already has admin role');
      return { success: true, message: 'User already has admin role' };
    }

    // Insert admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (error) {
      console.error('Error assigning admin role:', error);
      return { success: false, error };
    }

    console.log('Admin role assigned successfully');
    return { success: true, message: 'Admin role assigned successfully' };
  } catch (error) {
    console.error('Error in manual admin assignment:', error);
    return { success: false, error };
  }
};

// You can call this function from the browser console:
// import { manuallyAssignAdminRole } from './src/utils/adminUtils';
// manuallyAssignAdminRole('your-user-id-here');
