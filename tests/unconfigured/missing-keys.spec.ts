import { test, expect } from '@playwright/test';

test('landing page has no setup dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Starter app', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your setup status' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'AI setup reference' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Open my todo list' }).click();
  await expect(page).toHaveURL(/\/protected$/);
});

test('Todos, Files and Profile show local error cards', async ({ page, context }, info) => {
  await page.goto('/protected');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('heading', { name: 'Tasks unavailable' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Files unavailable' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Web hosting not available' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: /^(Tasks|Files|Profile|Login|Signup|Password recovery|Password update|Account setup) unavailable$/ }) })).toHaveCount(2);
  const hosting = page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'Web hosting not available' }) });
  await expect(hosting.getByText('Paste this into your AI agent', { exact: true })).toBeVisible();
  const prompt = await hosting.locator('pre').textContent();
  expect(prompt?.split('\n')).toHaveLength(2);
  expect(prompt).toContain('using the E2E tests');
  for (const text of await page.locator('pre').allTextContents()) expect(text).toContain('using the E2E tests');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await hosting.getByRole('button', { name: 'Copy prompt', exact: true }).click();
  await expect(hosting.getByRole('status')).toHaveText('Prompt copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
  await expect(page.getByLabel('New task')).toHaveCount(0);
  await expect(page.getByLabel('Upload a file')).toHaveCount(0);
  await info.attach('Todos with missing keys', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile unavailable' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
  await info.attach('Profile with missing keys', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});

test('authentication and onboarding show error cards instead of unusable forms', async ({ page }, info) => {
  for (const [route, title] of [
    ['/auth/login', 'Login unavailable'],
    ['/auth/sign-up', 'Signup unavailable'],
    ['/auth/forgot-password', 'Password recovery unavailable'],
    ['/auth/update-password', 'Password update unavailable'],
    ['/onboarding', 'Account setup unavailable'],
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: /^(Tasks|Files|Profile|Login|Signup|Password recovery|Password update|Account setup) unavailable$/ }) })).toHaveCount(1);
    await expect(page.getByLabel('Email', { exact: true })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await info.attach(title, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  }
});
