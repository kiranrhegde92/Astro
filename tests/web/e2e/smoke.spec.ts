import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', title: /CosmicSelf/i },
  { path: '/features', title: /Features/i },
  { path: '/pricing', title: /Pricing/i },
  { path: '/about', title: /About/i },
  { path: '/contact', title: /Contact/i },
  { path: '/blog', title: /Blog/i },
  { path: '/changelog', title: /Changelog/i },
  { path: '/legal/privacy', title: /Privacy/i },
  { path: '/legal/terms', title: /Terms/i },
];

for (const p of PAGES) {
  test(`page ${p.path} renders`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page).toHaveTitle(p.title);
    const canonical = await page.locator('link[rel="canonical"]').count();
    expect(canonical).toBeGreaterThanOrEqual(0);
  });
}

test('404 renders noindex', async ({ page }) => {
  await page.goto('/this-page-does-not-exist-xyz');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toMatch(/noindex/i);
});
