import { Suspense } from "react";
import { HostingError } from "@/components/hosting-error";
import Link from "next/link";
import { AppTabs } from "@/components/app-tabs";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-muted/20 pb-24">
    <header className="border-b bg-background"><div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4"><Link href="/" className="font-semibold">Starter app</Link><ThemeSwitcher /></div></header>
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-8"><Suspense fallback={null}><HostingError /></Suspense>{children}</div>
    <AppTabs />
  </main>;
}
