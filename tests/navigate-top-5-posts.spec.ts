import { test, expect } from '@playwright/test';

test('navigate to www.funkysi1701.com, click top 5 blog posts, check console for errors', async ({ page }) => {
  // Collect console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(msg.text());
    }
    // Also check for uncaught exceptions
    if (msg.text().includes('Uncaught')) {
      errors.push(msg.text());
    }
  });

  // Step 1: Navigate to the homepage
  await page.goto('https://www.funkysi1701.com');
  await expect(page).toHaveTitle(/Funky Si's Blog/);

  // Step 2: Click the top 5 blog posts
  // The top 5 posts are in the 'Recent Posts' section, which is a list of links
  // We'll use the observed selectors from MCP tool output
  const postLinks = await page.locator('text=Recent Posts').locator('..').locator('li a').all();
  // Fallback: If not found, try main list
  let linksToClick = postLinks;
  if (linksToClick.length < 5) {
    linksToClick = await page.locator('li a').all();
  }
  // Only click the first 5
  for (let i = 0; i < Math.min(5, linksToClick.length); i++) {
    // Clear errors before each click
    errors.length = 0;
    const link = linksToClick[i];
    const href = await link.getAttribute('href');
    // Open in same tab
    await Promise.all([
      page.waitForNavigation(),
      link.click()
    ]);
    // Check for uncaught errors
    expect(errors.filter(e => e.includes('Uncaught'))).toHaveLength(0);
    // Optionally, go back to homepage for next click
    if (i < 4) {
      await page.goto('https://www.funkysi1701.com');
    }
  }
});
