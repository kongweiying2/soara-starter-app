import { mkdtemp, mkdir, cp, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const stage = await mkdtemp(join(tmpdir(), 'soara-template-'));
const target = join(stage, 'soara-app-template');
await mkdir(target);
const skipped = new Set(['.git', '.next', '.vercel', 'node_modules', 'screenshots', 'next-env.d.ts', 'tsconfig.tsbuildinfo']);
for (const entry of await readdir('.')) {
  if (skipped.has(entry) || (entry.startsWith('.env') && entry !== '.env.example')) continue;
  await cp(entry, join(target, entry), { recursive: true });
}
const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));
if (!manifest.private) throw new Error('Unexpected template package');
const archive = join(stage, 'soara-app-template.tar.gz');
const result = spawnSync('tar', ['-czf', archive, '-C', stage, 'soara-app-template'], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('Template export failed');
console.log(archive);
