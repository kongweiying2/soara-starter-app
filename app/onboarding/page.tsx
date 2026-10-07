import { ConfigurationError } from "@/components/configuration-error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";

export default function OnboardingPage() {
  return <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
    <Link href="/" className="text-sm text-muted-foreground">← Home</Link>
    <p className="text-sm text-muted-foreground">Welcome to Soara</p>
    <h1 className="text-4xl font-semibold tracking-tight">Start with one small task.</h1>
    <p className="text-muted-foreground">Your todo list is a place for the things you want to get done. Add a task, mark it complete, and pick up where you left off next time.</p>
    <ol className="list-decimal space-y-3 rounded-xl border p-6 pl-10 text-sm"><li>Add your first task.</li><li>Mark it complete when you finish.</li><li>Upload any files you want to keep handy.</li></ol>
    {hasEnvVars ? <Button asChild><Link href="/protected">Go to my todo list</Link></Button> : <><ConfigurationError title="Account setup unavailable" description="You can explore the app, but account creation and saving need a connected Supabase project." /><Button asChild><Link href="/protected">Explore the starter app</Link></Button></>}
  </main>;
}
