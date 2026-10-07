import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { randomUUID, createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
if (existsSync('.env.e2e.local')) loadEnvFile('.env.e2e.local');
if (existsSync('.env.local')) loadEnvFile('.env.local');
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'E2E_USER_ONE_EMAIL', 'E2E_USER_ONE_PASSWORD', 'E2E_USER_TWO_EMAIL', 'E2E_USER_TWO_PASSWORD'];
if (process.env.ALLOW_TEST_DATA_WRITES !== '1' || required.some(name => !process.env[name])) {
  console.error('Configure two dedicated test accounts and set ALLOW_TEST_DATA_WRITES=1. See docs/verification.md.');
  process.exit(1);
}
function check(result) { if (result.error) throw new Error(result.error.message); return result.data; }
function client() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
const alice = client(); const bob = client();
const one = check(await alice.auth.signInWithPassword({ email: process.env.E2E_USER_ONE_EMAIL, password: process.env.E2E_USER_ONE_PASSWORD })).user;
const two = check(await bob.auth.signInWithPassword({ email: process.env.E2E_USER_TWO_EMAIL, password: process.env.E2E_USER_TWO_PASSWORD })).user;
assert(one && two && one.id !== two.id, 'Test accounts must be distinct');
const id = randomUUID(); const path = `${one.id}/${id}-integration.txt`; const content = `Disposable test ${id}`;
try {
  check(await alice.from('tasks').insert({ id, title: content, user_id: one.id }));
  assert.equal(check(await alice.from('tasks').select('id').eq('id', id)).length, 1);
  assert.equal(check(await bob.from('tasks').select('id').eq('id', id)).length, 0);
  assert.equal(check(await bob.from('tasks').update({ completed: true }).eq('id', id).select('id')).length, 0);
  check(await alice.from('tasks').update({ completed: true }).eq('id', id));
  assert.equal(check(await alice.from('tasks').select('completed').eq('id', id).single()).completed, true);
  check(await alice.storage.from('workspace-files').upload(path, new Blob([content], { type: 'text/plain' }), { contentType: 'text/plain' }));
  assert.equal(await check(await alice.storage.from('workspace-files').download(path)).text(), content);
  assert((await bob.storage.from('workspace-files').download(path)).error, 'Another user must not download this file');
  assert((await bob.storage.from('workspace-files').createSignedUrl(path, 60)).error, 'Another user must not create a download link');
  assert(check(await alice.storage.from('workspace-files').createSignedUrl(path, 60)).signedUrl);
  mkdirSync('.setup', { recursive: true });
  writeFileSync('.setup/integration.json', JSON.stringify({ projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, checkedAt: new Date().toISOString(), migrationHash: createHash('sha256').update(readFileSync('supabase/migrations/202610070001_workspace.sql')).digest('hex'), passed: true }) + '\n');
  console.log('Real Supabase checks passed: task persistence/completion, private upload/download, and two-user isolation.');
} finally {
  const cleanup = await Promise.all([alice.from('tasks').delete().eq('id', id), alice.storage.from('workspace-files').remove([path])]);
  for (const result of cleanup) if (result.error) console.error('Test-data cleanup failed; remove the disposable integration records from the test workspace.');
  await Promise.all([alice.auth.signOut({ scope: 'local' }), bob.auth.signOut({ scope: 'local' })]);
}
