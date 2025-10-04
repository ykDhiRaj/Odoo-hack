import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON environment variable");
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON);

export default supabase;