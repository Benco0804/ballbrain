-- =============================================================================
-- Cron job: generate daily puzzles at midnight UTC
-- =============================================================================
-- Prerequisites (run once in Supabase Dashboard → Database → Extensions):
--   1. Enable pg_cron
--   2. Enable pg_net
--
-- After running this migration, update the two placeholders:
--   YOUR_PROJECT_REF  → your Supabase project reference ID
--   YOUR_CRON_SECRET  → same value as the CRON_SECRET env var on the Edge Function
--
-- To update an existing job after changing the URL/secret, run:
--   SELECT cron.unschedule('generate-daily-puzzles');
--   then re-run this file.
-- =============================================================================

-- Enable required extensions (safe to re-run).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previously scheduled version of this job (idempotent).
SELECT cron.unschedule('generate-daily-puzzles')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-daily-puzzles'
);

-- Schedule the daily puzzle generation at 00:00 UTC.
SELECT cron.schedule(
  'generate-daily-puzzles',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-puzzles',
      headers := '{"Content-Type":"application/json","x-cron-secret":"YOUR_CRON_SECRET"}'::jsonb,
      body    := '{}'::jsonb
    ) AS request_id;
  $$
);
