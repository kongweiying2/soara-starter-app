import { readFile } from 'node:fs/promises';
import { test, expect, login, capture } from './fixtures';

test('private file upload → reload → download → delete', async ({ page, data }, info) => {
  const name = `${data.prefix}.txt`;
  const content = `Private test file ${data.prefix}`;
  const row = page.getByRole('listitem').filter({ has: page.getByText(name, { exact: true }) });
  await login(page);
  await page.getByLabel('Upload a file', { exact: true }).setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(content) });
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(row).toBeVisible();
  await page.reload();
  await expect(row).toBeVisible();
  await capture(page, info, 'private file persists');
  const downloadPromise = page.waitForEvent('download');
  await row.getByRole('link', { name: 'Download', exact: true }).click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  if (!path) throw new Error('Downloaded file missing');
  expect(await readFile(path, 'utf8')).toBe(content);
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.reload();
  await expect(row).toHaveCount(0);
  await capture(page, info, 'file deleted');
});
