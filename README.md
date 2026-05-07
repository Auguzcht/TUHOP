TUHOP — Flood Severity Classification Platform
Beneficiary: CDRRMO Davao City | Stack: React+Vite+TS, shadcn/ui, Supabase, Zustand, Zod
Quick Reference

Full architecture → MASTERPLAN.md
Per-folder build instructions → each folder has a README.md
Supabase schema → supabase/migrations/001_initial_schema.sql
Seed data (186 barangays) → supabase/seed.sql
Design tokens → src/styles/index.css
Generated types → src/types/supabase.ts (run npx supabase gen types typescript)

Active Model
Logistic Regression (TF-IDF Late Fusion), endpoint: tuhop-logreg-serverless-v2
Input: { main_text, aux_text } → Output: { body: { predictions: [0|1|2] } }
MVP Scope (in build order)

Auth (login, register, pending approval)
Layout shell (sidebar, topbar, route guards)
HITL Validation (queue + detail review page)
User Management (approve/reject, directory)
Dashboard Analytics (stat cards, charts)
Model Audit (performance metrics, verification log)

Conventions

Zod-first: parse every API response before it touches state
Zustand for client-only state, hooks for server data
Feature-based folders, not type-based (pages/hooks/components co-located)
All Edge Functions in supabase/functions/, all Deno
Images → Firebase Storage; everything else → Supabase