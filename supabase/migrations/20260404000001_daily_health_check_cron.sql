-- =============================================================================
-- Cron job: daily health check at 3 AM UTC (6 AM Jerusalem summer time)
-- =============================================================================
-- Prerequisites (run once in Supabase Dashboard → Database → Extensions):
--   1. Enable pg_cron
--   2. Enable pg_net
--
-- After running this migration, update the two placeholders:
--   YOUR_PROJECT_REF  → wdkzsnkrdqadoiqbjlqr
--   YOUR_CRON_SECRET  → same value as the CRON_SECRET env var on the Edge Function
--
-- To update an existing job after changing the URL/secret, run:
--   SELECT cron.unschedule('daily-health-check');
--   then re-run this file.
-- =============================================================================

-- Enable required extensions (safe to re-run).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previously scheduled version of this job (idempotent).
SELECT cron.unschedule('daily-health-check')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-health-check'
);

-- Schedule the daily health check at 03:00 UTC.
SELECT cron.schedule(
  'daily-health-check',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
      url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-health-check',
      headers := '{"Content-Type":"application/json","x-cron-secret":"YOUR_CRON_SECRET"}'::jsonb,
      body    := '{}'::jsonb
    ) AS request_id;
  $$
);
