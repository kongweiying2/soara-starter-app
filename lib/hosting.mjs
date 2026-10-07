import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// A project link indicates setup, not a successful deployment or uptime.
export async function isVercelConfigured({ env = process.env, projectDirectory = process.cwd() } = {}) {
  if (env.VERCEL === '1' || (env.VERCEL_PROJECT_ID?.trim() && env.VERCEL_ORG_ID?.trim())) return true;
  try {
    /** @type {unknown} */
    const value = JSON.parse(await readFile(join(projectDirectory, '.vercel/project.json'), 'utf8'));
    return Boolean(value && typeof value === 'object' && 'projectId' in value && 'orgId' in value && typeof value.projectId === 'string' && value.projectId.trim() && typeof value.orgId === 'string' && value.orgId.trim());
  } catch {
    return false;
  }
}
