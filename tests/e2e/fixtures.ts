import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing test configuration: ${name}`);
  return value;
}
export const account = (number: 'ONE' | 'TWO') => ({
  email: required(`E2E_USER_${number}_EMAIL`),
  password: required(`E2E_USER_${number}_PASSWORD`),
});

export async function login(page: Page, number: 'ONE' | 'TWO' = 'ONE') {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Starter app', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open my todo list', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  const user = account(number);
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(/\/protected$/);
  await expect(page.getByRole('heading', { name: 'Todos', exact: true })).toBeVisible();
}

export async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name.replace(/[^a-zA-Z0-9.-]+/g, '-')}.png`);
  await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: 'image/png' });
}

// Cleanup uses the ordinary account's RLS-limited client and this test's UUID only.
export const test = base.extend<{ data: { prefix: string } }>({
  data: async ({}, provide) => {
    const prefix = `e2e-${randomUUID()}`;
    const client = createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
    try {
      await provide({ prefix });
    } finally {
      // The UI logout may revoke the earlier session; authenticate for teardown.
      const { data: identity, error } = await client.auth.signInWithPassword(account('ONE'));
      if (error || !identity.user) throw new Error('Unable to authenticate dedicated cleanup account');
      const tasks = await client.from('tasks').delete().like('title', `${prefix}%`);
      const listing = await client.storage.from('workspace-files').list(identity.user.id, { search: prefix });
      if (tasks.error || listing.error) throw new Error('Disposable test-data cleanup failed');
      const paths = (listing.data ?? []).filter(file => file.name.includes(prefix)).map(file => `${identity.user!.id}/${file.name}`);
      if (paths.length) {
        const removed = await client.storage.from('workspace-files').remove(paths);
        if (removed.error) throw new Error('Disposable file cleanup failed');
      }
      await client.auth.signOut({ scope: 'local' });
    }
  },
});
export { expect };
