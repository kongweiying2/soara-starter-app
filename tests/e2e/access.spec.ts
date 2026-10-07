import { test, expect, capture } from './fixtures';

test('signed-out visitors cannot open private pages', async ({ page }, info) => {
  for (const route of ['/protected', '/protected/profile', '/onboarding']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByLabel('New task')).toHaveCount(0);
  }
  await capture(page, info, 'signed-out access redirects to login');
});

test('home leads to signup and mismatched passwords are rejected', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get started', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/sign-up$/);
  await page.getByLabel('Email', { exact: true }).fill('validation-only@example.test');
  await page.getByLabel('Password', { exact: true }).fill('ValidationOnly!123');
  await page.getByLabel('Repeat Password', { exact: true }).fill('DifferentValue!123');
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(page.getByText('Passwords do not match', { exact: true })).toBeVisible();
  await capture(page, info, 'signup validation');
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
});
