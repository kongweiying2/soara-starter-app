import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = request.nextUrl.searchParams.get("next");
  const next = destination === "/auth/update-password" ? destination : "/onboarding";
  if (code) {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }
  redirect("/auth/error?error=Confirmation%20link%20expired%20or%20invalid.%20Please%20request%20a%20new%20email.");
}
