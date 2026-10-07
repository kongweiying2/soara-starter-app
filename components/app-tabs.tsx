"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, UserRound } from "lucide-react";

const tabs = [
  { href: "/protected", label: "Todos", icon: ListTodo },
  { href: "/protected/profile", label: "Profile", icon: UserRound },
];
export function AppTabs() {
  const pathname = usePathname();
  return <nav aria-label="App tabs" className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <div className="mx-auto grid max-w-xl grid-cols-2">{tabs.map(tab => {
      const active = pathname === tab.href;
      return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center gap-1 px-6 py-3 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}><tab.icon className="h-5 w-5" /><span>{tab.label}</span></Link>;
    })}</div>
  </nav>;
}
