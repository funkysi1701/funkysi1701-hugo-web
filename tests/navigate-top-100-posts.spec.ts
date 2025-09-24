import { test, expect } from '@playwright/test';

test('navigate to www.funkysi1701.com, check top 100 blog posts for broken links and images', async ({ page }) => {
  // Step 1: Navigate to the homepage
  await page.goto('https://www.funkysi1701.com');
  await expect(page).toHaveTitle(/Funky Si's Blog/);

  // Step 2: Find top 100 blog post URLs (assume links under /posts/)
  const blogPostUrls = await page.$$eval('a[href^="/posts/"]', (as) => {
    const seen = new Set();
    const urls = [];
    for (const a of as) {
      let href = a.getAttribute('href');
      if (href && !seen.has(href)) {
        seen.add(href);
        // Make absolute URL
        if (href.startsWith('/')) {
          href = 'https://www.funkysi1701.com' + href;
        }
        urls.push(href);
        if (urls.length >= 100) break;
      }
    }
    return urls;
  });

  for (const url of blogPostUrls) {
    await page.goto(url);
    await expect(page).toHaveURL(url);

    // Check for broken images
    const brokenImages = await page.$$eval('img', imgs =>
      imgs.filter(img => !(img.complete && img.naturalWidth > 0)).map(img => img.src)
    );
    expect(brokenImages, `Broken images on ${url}: ${brokenImages.join(', ')}`).toEqual([]);

    // Check for broken links (status not 200 or 301/302 for external)
    const links = await page.$$eval('a[href]', as => as.map(a => a.href));
    for (const link of links) {
      // Only check http(s) links, skip mailto, tel, etc.
      if (/^https?:\/\//.test(link)) {
        const response = await page.request.get(link);
        expect(response.status(), `Broken link: ${link} on ${url}`).toBeLessThan(400);
      }
    }
  }
});