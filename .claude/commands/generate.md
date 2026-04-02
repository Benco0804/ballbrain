Run this command to generate puzzles for a given date. Replace the date value as needed:

```bash
curl -X POST https://ballbrain-kappa.vercel.app/api/admin/generate-puzzles -H "x-admin-secret: ballbrain_admin_2026" -H "Content-Type: application/json" -d '{"date": "2026-04-03"}'
```
