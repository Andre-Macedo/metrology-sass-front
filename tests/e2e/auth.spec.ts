import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MetroLab/);
});

test('login flow', async ({ page }) => {
  await page.goto('/en/login');

  // Fill login form
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Expect to be redirected to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
});
