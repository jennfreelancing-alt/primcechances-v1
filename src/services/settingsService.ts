import { supabase } from '@/integrations/supabase/client';

export async function getProSubscriptionPrice(defaultValue = 3500) {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('setting_value')
    .eq('setting_key', 'pro_subscription_price')
    .single();

  // If row is missing, create it with default value
  if (!data || data.setting_value === undefined || data.setting_value === null) {
    await supabase
      .from('admin_settings')
      .upsert([{ setting_key: 'pro_subscription_price', setting_value: defaultValue }]);
    return defaultValue;
  }

  if (error && error.code !== 'PGRST116') throw error;
  return data.setting_value;
}

export async function updateProSubscriptionPrice(price: number) {
  const { error } = await supabase
    .from('admin_settings')
    .update({ setting_value: price })
    .eq('setting_key', 'pro_subscription_price');
  if (error) throw error;
}
