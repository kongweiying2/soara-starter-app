import { ConfigurationError } from "@/components/configuration-error";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

async function Profile() {
  if (!hasEnvVars) return <><h1 className="text-3xl font-semibold">Profile</h1><ConfigurationError title="Profile unavailable" description="Your account details and password settings need a connected authentication service." /></>;
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/auth/login");
  return <><h1 className="text-3xl font-semibold">Profile</h1><section className="space-y-5 rounded-xl border bg-background p-6"><div><h2 className="text-sm text-muted-foreground">Email</h2><p className="mt-1 break-all">{data.user.email}</p></div><div><h2 className="text-sm text-muted-foreground">Member since</h2><p className="mt-1">{new Date(data.user.created_at).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}</p></div><Link href="/auth/forgot-password" className="block text-sm underline">Reset password</Link><LogoutButton /></section></>;
}
export default function ProfilePage() {
  return <Suspense fallback={<p>Loading profile…</p>}><Profile /></Suspense>;
}
