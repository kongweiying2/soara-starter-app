import { HostingError } from "@/components/hosting-error";
import Link from "next/link";
import { Suspense } from "react";
import { hasEnvVars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-semibold">Soara</Link>
          {hasEnvVars ? <Suspense fallback={<span>Loading account…</span>}><AuthButton /></Suspense> : <Link href="/auth/login" className="text-sm underline underline-offset-4">Log in</Link>}
        </div>
      </nav>
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-4 text-sm text-muted-foreground">Your starter app</p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight">Starter app</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">Create an account, make your first todo list, and keep your files in one place.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/auth/sign-up">Get started</Link></Button>
          <Button variant="outline" asChild><Link href="/protected">Open my todo list</Link></Button>
        </div>
        <div className="mt-8"><Suspense fallback={null}><HostingError /></Suspense></div>
        <p className="mt-8 text-sm text-muted-foreground">Your app flow: create account → confirm email → welcome → add your first task. Returning users can log in to their saved list.</p>
      </section>
    </main>
  );
}
