# Auto-Deletion System for Expired Opportunities

This system automatically deletes opportunities that have passed their application deadline.

## Components

### 1. Edge Functions

- **`auto-delete-expired-opportunities`**: Main function that performs the deletion
- **`cron-scheduler`**: Wrapper function for scheduled execution

### 2. Database Tables

- **`auto_deletion_logs`**: Dedicated table for tracking deleted opportunities
- **`admin_activity_logs`**: General admin activity logging (existing)
- **`feature_toggles`**: Controls whether auto-deletion is enabled

### 3. Admin Interface

- **`AutoDeletionManager`**: React component for managing auto-deletion settings
- **`autoDeletionService`**: Service layer for API calls

## Setup Instructions

### 1. Deploy Edge Functions

```bash
# Deploy the auto-deletion function
supabase functions deploy auto-delete-expired-opportunities

# Deploy the cron scheduler
supabase functions deploy cron-scheduler
```

### 2. Run Database Migration

```bash
# Apply the migration to create auto_deletion_logs table
supabase db push
```

### 3. Set Up Cron Job

You can set up a cron job to run the auto-deletion function periodically. Here are several options:

#### Option A: Using GitHub Actions (Recommended)

Create `.github/workflows/auto-deletion.yml`:

```yaml
name: Auto-Delete Expired Opportunities

on:
  schedule:
    # Run every day at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  auto-delete:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Deletion
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/cron-scheduler"
```

#### Option B: Using External Cron Service

Services like:
- **Cron-job.org**: Free cron service
- **EasyCron**: Reliable cron service
- **SetCronJob**: Simple cron service

Set up a cron job to call:
```
POST https://your-project.supabase.co/functions/v1/cron-scheduler
Authorization: Bearer YOUR_ANON_KEY
```

#### Option C: Using Supabase Cron Extension

If you have access to Supabase Pro, you can use the pg_cron extension:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auto-deletion to run daily at 2 AM
SELECT cron.schedule(
  'auto-delete-expired-opportunities',
  '0 2 * * *',
  'SELECT net.http_post(
    url:=''https://your-project.supabase.co/functions/v1/cron-scheduler'',
    headers:=''{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}''::jsonb
  );'
);
```

### 4. Configure Environment Variables

Make sure these environment variables are set in your Supabase project:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

## Usage

### Admin Interface

1. Navigate to Admin Dashboard
2. Click on "Auto-Deletion" tab
3. Toggle auto-deletion on/off
4. View expired opportunities preview
5. Manually trigger deletion if needed
6. View deletion logs and statistics

### Manual Trigger

You can manually trigger the auto-deletion by calling the function:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  "https://your-project.supabase.co/functions/v1/auto-delete-expired-opportunities"
```

## Features

### Auto-Deletion Logic

- Only deletes **published** opportunities
- Only deletes opportunities with **application_deadline** set
- Only deletes opportunities where **deadline has passed**
- Calculates days expired for logging purposes

### Logging

- Logs each deletion in `auto_deletion_logs` table
- Logs batch operations in `admin_activity_logs` table
- Provides detailed statistics and searchable logs

### Safety Features

- Feature toggle to enable/disable auto-deletion
- Preview mode to see what will be deleted
- Manual trigger option for admins
- Comprehensive logging for audit trail

## Monitoring

### Key Metrics to Monitor

1. **Expired Opportunities Count**: How many opportunities are currently expired
2. **Deletion Rate**: How many opportunities are deleted per day/week/month
3. **Average Days Expired**: How long opportunities stay expired before deletion
4. **Feature Toggle Status**: Whether auto-deletion is enabled

### Alerts

Consider setting up alerts for:
- High number of expired opportunities (> 100)
- Auto-deletion failures
- Feature toggle changes

## Troubleshooting

### Common Issues

1. **Function not running**: Check cron job configuration
2. **No deletions**: Verify feature toggle is enabled
3. **Permission errors**: Ensure service role key has proper permissions
4. **Database errors**: Check RLS policies and table permissions

### Debugging

1. Check function logs in Supabase dashboard
2. Review `admin_activity_logs` for errors
3. Verify `auto_deletion_logs` table is being populated
4. Test manual trigger to isolate issues

## Security Considerations

- Service role key should be kept secure
- Cron job endpoints should be protected
- Admin interface requires proper authentication
- All deletions are logged for audit purposes

## Performance

- Function processes opportunities in batches
- Database queries are optimized with proper indexes
- Logging is asynchronous to avoid blocking deletions
- Pagination is used for large result sets
