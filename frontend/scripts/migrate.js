/**
 * Run Supabase migration via exec_sql RPC.
 * Usage: node scripts/migrate.js
 */
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://pslgosbrpvzrkxxjefmj.supabase.co";
const SERVICE_KEY  =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbGdvc2JycHZ6cmt4eGplZm1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI1NTUwMywiZXhwIjoyMDk0ODMxNTAzfQ.N48NdxGZipmM1daF-zn7NTmMoOjJaJjtJh89Zxb5_rA";

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const MIGRATIONS = [
  {
    name: "Add cloudinary_public_id column",
    sql:  "alter table public.photos add column if not exists cloudinary_public_id text",
  },
  {
    name: "Create increment_photo_count function",
    sql: `create or replace function public.increment_photo_count(
  p_event_id uuid,
  p_amount   integer default 1
)
returns void language plpgsql security definer as $$
begin
  update public.events
  set photo_count = photo_count + p_amount
  where id = p_event_id;
end;
$$`,
  },
];

async function main() {
  console.log("Running migrations...\n");
  for (const m of MIGRATIONS) {
    process.stdout.write(`  ${m.name}... `);
    const { error } = await sb.rpc("exec_sql", { sql: m.sql });
    if (error) {
      console.log("FAILED");
      console.error("  Error:", error.message);
      process.exit(1);
    }
    console.log("OK");
  }

  // Verify column exists
  console.log("\nVerifying...");
  const { error: verifyErr } = await sb
    .from("photos")
    .select("id, cloudinary_public_id")
    .limit(1);
  if (verifyErr) {
    console.error("Verification failed:", verifyErr.message);
    process.exit(1);
  }
  console.log("  photos.cloudinary_public_id column: OK");
  console.log("\nAll migrations complete!");
}

main().catch(e => { console.error(e); process.exit(1); });
