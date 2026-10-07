import { ErrorFixPrompt } from "@/components/error-fix-prompt";
import { AlertCircle } from 'lucide-react';

export function ConfigurationError({ title, description, fixPrompt = "I don't have a Supabase account. Use the browser to help me sign up on the free plan; pause for passwords and verification.\nCreate and connect a project, set up Auth, Todos and private storage, save the settings, and verify this app works using the E2E tests." }: { title: string; description: string; fixPrompt?: string }) {
  return (
    <section role="alert" className="min-w-0 break-words space-y-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
      <div className="flex items-center gap-2">
        <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="text-sm leading-6">{description}</p>
      <ErrorFixPrompt prompt={fixPrompt} />
    </section>
  );
}
