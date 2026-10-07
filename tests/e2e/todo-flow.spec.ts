import { test, expect, login, capture, account } from './fixtures';

test('home → login → persisted task lifecycle → profile → logout', async ({ page, data }, info) => {
  const title = `${data.prefix} task`;
  const row = page.getByRole('listitem').filter({ has: page.getByText(title, { exact: true }) });
  await test.step('Sign in from home', async () => {
    await login(page);
    await capture(page, info, 'Todos after login');
  });
  await test.step('Create, complete, reload and reopen a task', async () => {
    await page.getByLabel('New task').fill(title);
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(row).toBeVisible();
    await page.reload();
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Complete', exact: true }).click();
    await expect(row.getByRole('button', { name: 'Reopen', exact: true })).toBeVisible();
    await page.reload();
    await expect(row.getByRole('button', { name: 'Reopen', exact: true })).toBeVisible();
    await capture(page, info, 'completed task persists');
    await row.getByRole('button', { name: 'Reopen', exact: true }).click();
    await expect(row.getByRole('button', { name: 'Complete', exact: true })).toBeVisible();
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(row).toHaveCount(0);
    await page.reload();
    await expect(row).toHaveCount(0);
  });
  await test.step('Onboarding and bottom tabs', async () => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: 'Start with one small task.' })).toBeVisible();
    await capture(page, info, 'onboarding');
    await page.getByRole('link', { name: 'Go to my todo list' }).click();
    await expect(page).toHaveURL(/\/protected$/);
    await page.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expect(page.locator('section').filter({ has: page.getByRole('heading', { name: 'Email', exact: true }) }).getByText(account('ONE').email, { exact: true })).toBeVisible();
    await capture(page, info, 'Profile');
  });
  await test.step('Logout revokes browser access', async () => {
    await page.getByRole('button', { name: 'Logout', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await page.goto('/protected');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

test('another account cannot see the first user’s task', async ({ page, context, data }, info) => {
  const title = `${data.prefix} private task`;
  await login(page);
  await page.getByLabel('New task').fill(title);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  const otherContext = await context.browser()!.newContext({ baseURL: info.project.use.baseURL, viewport: info.project.use.viewport, isMobile: info.project.use.isMobile });
  try {
    const otherPage = await otherContext.newPage();
    await login(otherPage, 'TWO');
    await expect(otherPage.getByText(title, { exact: true })).toHaveCount(0);
    await capture(otherPage, info, 'second account has its own list');
  } finally {
    await otherContext.close();
  }
});
