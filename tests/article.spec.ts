import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: '+' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Test Article');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: 'Add block' }).click();
  await page.getByText('Paragraph').click();
  await page.getByRole('textbox').nth(1).fill('This is a test article.\n\n\n');
  await page.getByRole('checkbox', { name: 'Published' }).check();
  await page.getByRole('checkbox', { name: 'Sticky (Keep this article at' }).check();
  await page.getByRole('checkbox', { name: 'Featured (Highlight this' }).check();
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await page.getByRole('link', { name: 'Read more →' }).first().click();
  await page.getByRole('heading', { name: 'Test Article' }).first().click();
  await page.getByText('This is a test article.').click();
  await page.getByRole('link', { name: 'Edit Article' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Test Article Edit');
  await page.getByText('This is a test article.').click();
  await page.getByRole('button', { name: 'Add block' }).click();
  await page.getByText('The body of your document').click();
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await page.getByRole('heading', { name: 'Test Article Edit' }).first().click();
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept(); // clicks "OK"
  });
  await page.getByRole('button', { name: 'Delete Article' }).click();
  await expect(page.getByRole('heading', { name: 'Test Article Edit' })).toHaveCount(0);
});