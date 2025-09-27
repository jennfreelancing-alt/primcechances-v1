-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run auto-deletion every hour
-- This will call the cron-scheduler function which checks if auto-deletion is enabled
SELECT cron.schedule(
  'auto-delete-expired-opportunities',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1 FROM feature_toggles 
        WHERE feature_key = 'auto_delete_expired_opportunities' 
        AND is_enabled = true
      ) THEN
        -- Call the cron-scheduler function via HTTP
        -- Note: This requires the Supabase Edge Function to be deployed
        -- For now, we'll just log that the job would run
        RAISE LOG 'Auto-deletion cron job triggered - would call cron-scheduler function'
      ELSE
        RAISE LOG 'Auto-deletion cron job triggered - feature disabled, skipping'
    END;
  $$
);

-- Create a function to manually trigger the cron job for testing
CREATE OR REPLACE FUNCTION trigger_auto_deletion_cron()
RETURNS TEXT AS $$
BEGIN
  -- This would normally call the Supabase Edge Function
  -- For now, we'll just return a success message
  RETURN 'Auto-deletion cron job would be triggered (requires Edge Function deployment)';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION trigger_auto_deletion_cron() TO authenticated;

-- Add a comment explaining the setup
COMMENT ON EXTENSION pg_cron IS 'Enables scheduled execution of database functions';
COMMENT ON FUNCTION trigger_auto_deletion_cron() IS 'Manual trigger for auto-deletion cron job (requires Edge Function deployment)';
