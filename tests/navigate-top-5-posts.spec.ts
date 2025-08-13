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

  // Step 2: Use explicit URLs for the top 5 blog posts based on MCP output
  const blogPostUrls = [
    'https://www.funkysi1701.com/posts/2025/kubernetes-and-letsencrypt/',
    'https://www.funkysi1701.com/posts/2025/stepping-outside-your-comfort-zone/',
    'https://www.funkysi1701.com/posts/2025/deploying-hugo-with-helm/',
    'https://www.funkysi1701.com/posts/2025/learning-kubernetes/',
    'https://www.funkysi1701.com/posts/2025/getting-started-with-opentelemetry/'
  ];

  for (let i = 0; i < blogPostUrls.length; i++) {
    errors.length = 0;
    await page.goto(blogPostUrls[i]);
    // Check for uncaught errors
    expect(errors.filter(e => e.includes('Uncaught'))).toHaveLength(0);
    // Optionally, check that the page loaded a blog post
    await expect(page).toHaveURL(blogPostUrls[i]);
    // Go back to homepage for next click
    if (i < blogPostUrls.length - 1) {
      await page.goto('https://www.funkysi1701.com');
    }
  }
});
