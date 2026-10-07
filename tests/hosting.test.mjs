import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isVercelConfigured } from '../lib/hosting.mjs';

test('hosting setup recognizes Vercel environment and valid local project links', async () => {
  const projectDirectory = await mkdtemp(join(tmpdir(), 'soara-hosting-'));
  try {
    assert.equal(await isVercelConfigured({ env: {}, projectDirectory }), false);
    assert.equal(await isVercelConfigured({ env: { VERCEL: '1' }, projectDirectory }), true);
    assert.equal(await isVercelConfigured({ env: { VERCEL_PROJECT_ID: 'project', VERCEL_ORG_ID: 'org' }, projectDirectory }), true);
    assert.equal(await isVercelConfigured({ env: { VERCEL_PROJECT_ID: 'project' }, projectDirectory }), false);
    await mkdir(join(projectDirectory, '.vercel'));
    const path = join(projectDirectory, '.vercel/project.json');
    await writeFile(path, JSON.stringify({ projectId: 'project', orgId: 'org' }));
    assert.equal(await isVercelConfigured({ env: {}, projectDirectory }), true);
    await writeFile(path, '{broken');
    assert.equal(await isVercelConfigured({ env: {}, projectDirectory }), false);
    await writeFile(path, JSON.stringify({ projectId: '', orgId: 'org' }));
    assert.equal(await isVercelConfigured({ env: {}, projectDirectory }), false);
  } finally {
    await rm(projectDirectory, { recursive: true, force: true });
  }
});
