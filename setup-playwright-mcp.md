# Playwright MCP SEO Automation Setup

## 1. Install Playwright MCP Server

```bash
npm install -g @microsoft/playwright-mcp
# or
npx create-playwright-mcp@latest seo-automation
```

## 2. Configuration

Create `mcp-config.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@microsoft/playwright-mcp"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true"
      }
    }
  }
}
```

## 3. SEO Automation Capabilities

### Technical SEO Audits
- Meta tags validation
- Header structure analysis
- Image alt text checking
- Internal linking analysis
- Page speed insights
- Mobile responsiveness tests

### Content Optimization
- Keyword density analysis
- Content quality scoring
- Readability assessment
- Schema markup validation

### Competitive Analysis
- Competitor page structure analysis
- Keyword gap identification
- SERP position tracking

## 4. Integration with SEO Tools

- Keywords Everywhere API
- KeywordsPeopleUse.com
- Google Search Console automation
- Analytics data collection

## 5. Sample Automation Scripts

```javascript
// SEO audit automation
await page.goto('https://your-site.com');
const seoData = await page.evaluate(() => {
  return {
    title: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.content,
    h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent),
    images: Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt
    }))
  };
});
```