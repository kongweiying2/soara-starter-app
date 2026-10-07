import { test, expect, login, capture } from './fixtures';

// Cover narrow phones, tablets and wide desktops using the actual connected app.
test('pages fit phone, tablet and desktop widths', async ({ page }, info) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/auth/login', '/auth/sign-up', '/auth/forgot-password']) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
  await page.setViewportSize({ width: 320, height: 720 });
  await login(page);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, heading] of [['/protected', 'Todos'], ['/protected/profile', 'Profile'], ['/onboarding', 'Start with one small task.']]) {
      await page.goto(route);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await capture(page, info, `${heading} at ${width}px`);
    }
  }
});
