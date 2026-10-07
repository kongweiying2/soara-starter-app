import { connection } from 'next/server';
import { isVercelConfigured } from '@/lib/hosting.mjs';
import { ConfigurationError } from '@/components/configuration-error';

export async function HostingError() {
  await connection();
  if (await isVercelConfigured()) return null;
  return <ConfigurationError title="Web hosting not available" description="No Vercel project is connected. You can use the app locally, but web hosting has not been set up." fixPrompt={"I don't have a Vercel account. Use the browser to help me sign up on the free plan; pause for passwords and verification.\nUse computer control to manually add the required settings from .env.production.local to Vercel Project Settings → Environment Variables, deploy this app, and verify it works at the shared URL using the E2E tests."} />;
}
