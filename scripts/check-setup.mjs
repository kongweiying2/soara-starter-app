import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) loadEnvFile(".env.local");
let ready = true;
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) {
  const value = process.env[name];
  if (!value || value.startsWith("your-")) { console.error(`${name}: missing`); ready = false; }
  else console.log(`${name}: configured`);
}
if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("your-")) {
  try { const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL); if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") throw new Error(); }
  catch { console.error("Supabase URL must be HTTPS, or a localhost development URL."); ready = false; }
}
process.exitCode = ready ? 0 : 1;
