import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CSV = path.resolve(
  __dirname,
  "../../Plan/train_fusion.csv"
);

const DEFAULT_PER_LABEL = 100;
const DEFAULT_STAGE = "awaiting_inference";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key?.startsWith("--")) {
    args.set(key.replace(/^--/, ""), value ?? true);
  }
}

const csvPath = args.get("csv") ? path.resolve(String(args.get("csv"))) : DEFAULT_CSV;
const perLabel = Number(args.get("per-label") ?? DEFAULT_PER_LABEL);
const stage = String(args.get("stage") ?? DEFAULT_STAGE);
const dryRun = Boolean(args.get("dry-run"));

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_SECRET_KEY ??
  "";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase URL or service role key.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const labelToSeverity = {
  0: "low",
  1: "moderate",
  2: "high",
};

const pickRandom = (items, count) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const parseAuxText = (auxText) => {
  if (!auxText) return { physical: null, mobility: null };
  const parts = String(auxText).split(/\s*\[SEP\]\s*/);
  const physical = parts[0]?.trim() || null;
  const mobility = parts.slice(1).join(" [SEP] ").trim() || null;
  return { physical, mobility };
};

const randomDateWithinDays = (days) => {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
};

const main = async () => {
  const csvRaw = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const labelBuckets = { 0: [], 1: [], 2: [] };
  for (const row of rows) {
    const label = Number(row.label);
    if (label in labelBuckets) {
      labelBuckets[label].push(row);
    }
  }

  const selected = [
    ...pickRandom(labelBuckets[0], perLabel),
    ...pickRandom(labelBuckets[1], perLabel),
    ...pickRandom(labelBuckets[2], perLabel),
  ];

  const { data: authorProfile, error: authorError } = await supabase
    .from("users_profile")
    .select("id, barangay_id, role, status")
    .eq("email", process.env.SEED_AUTHOR_EMAIL ?? "")
    .maybeSingle();

  const { data: fallbackProfile, error: fallbackError } = authorProfile
    ? { data: authorProfile, error: null }
    : await supabase
        .from("users_profile")
        .select("id, barangay_id, role, status")
        .eq("role", "barangay_official")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

  if (authorError || fallbackError || !fallbackProfile?.id) {
    throw new Error("No active barangay_official profile found for seeding.");
  }

  let barangayId = fallbackProfile.barangay_id;
  if (!barangayId) {
    const { data: barangay } = await supabase
      .from("barangays")
      .select("id")
      .limit(1)
      .maybeSingle();
    barangayId = barangay?.id ?? null;
  }

  if (!barangayId) {
    throw new Error("No barangay found for seeding.");
  }

  const now = new Date();
  const rowsToInsert = selected.map((row) => {
    const { physical, mobility } = parseAuxText(row.aux_text);
    const createdAt = randomDateWithinDays(120);
    const severity = labelToSeverity[Number(row.label)];

    return {
      author_id: fallbackProfile.id,
      barangay_id: barangayId,
      post_content: row.main_text,
      physical_reference_text: physical,
      mobility_impact_text: mobility,
      flood_date: createdAt.toISOString().slice(0, 10),
      created_at: createdAt.toISOString(),
      updated_at: now.toISOString(),
      status: "submitted",
      stage,
      model_severity: stage === "awaiting_hitl" ? severity : null,
      model_version: stage === "awaiting_hitl" ? "seeded_label" : null,
    };
  });

  if (dryRun) {
    console.log(`Dry run: ${rowsToInsert.length} rows ready.`);
    return;
  }

  const batchSize = 200;
  for (let i = 0; i < rowsToInsert.length; i += batchSize) {
    const batch = rowsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from("flood_reports").insert(batch);
    if (error) {
      throw new Error(`Insert failed at batch ${i}: ${error.message}`);
    }
  }

  console.log(`Inserted ${rowsToInsert.length} flood reports.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
