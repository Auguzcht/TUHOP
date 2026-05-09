# TUHOP — Flood Severity Classification Platform

Beneficiary: CDRRMO Davao City
Stack: React + Vite + TypeScript, shadcn/ui, Supabase, Zustand, Zod

## Quick Reference
- Full architecture: MASTERPLAN.md
- Per-folder build instructions: see each folder README.md
- Supabase schema: supabase/migrations/001_initial_schema.sql
- Seed data (186 barangays): supabase/seed.sql
- Design tokens: src/styles/index.css
- Generated types: src/types/supabase.ts (run `npx supabase gen types typescript`)

## Active Model
- Logistic Regression (TF-IDF Late Fusion), endpoint: tuhop-logreg-serverless-v2
- Input: { main_text, aux_text } -> Output: { body: { predictions: [0|1|2] } }

## MVP Scope (Build Order)
1. Auth (login, register, pending approval)
2. Layout shell (sidebar, topbar, route guards)
3. HITL validation (queue + detail review)
4. User management (approve/reject, directory)
5. Dashboard analytics (stat cards, charts)
6. Model audit (performance metrics, verification log)

## Conventions
- Zod-first: parse every API response before it touches state
- Zustand for client-only state; hooks for server data
- Feature-based folders (pages/hooks/components co-located)
- All Edge Functions in supabase/functions/ (Deno)
- Images in Firebase Storage; everything else in Supabase