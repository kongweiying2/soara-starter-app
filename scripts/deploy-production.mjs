import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';

const settings = parseEnv(readFileSync('.env.production.local', 'utf8'));
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
const unexpected = Object.keys(settings).filter(name => !required.includes(name));
if (unexpected.length || required.some(name => !settings[name]?.trim())) {
  throw new Error('.env.production.local must contain only the two required public Supabase settings.');
}
if (new URL(settings.NEXT_PUBLIC_SUPABASE_URL).protocol !== 'https:') {
  throw new Error('Production Supabase URL must use HTTPS.');
}
// Require an existing project link so this command never creates an unintended project.
const project = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
if (!project.projectId || !project.orgId) throw new Error('Link the intended Vercel project first.');

for (const name of required) {
  const result = spawnSync('vercel', ['env', 'add', name, 'production', '--force', '--yes'], {
    input: settings[name], encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) throw new Error(`Could not upload ${name}. Check Vercel authentication and project permissions.`);
  console.log(`${name}: uploaded to Vercel Production`);
}
const deployment = spawnSync('vercel', ['deploy', '--prod', '--yes'], { stdio: 'inherit' });
process.exitCode = deployment.status ?? 1;
