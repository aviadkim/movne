// Simplified Live Site Monitoring - Augment Style
const { chromium } = require('playwright');
const fs = require('fs');

async function monitorLiveSite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🚀 Starting live site monitoring for movne.co.il...');
  
  try {
    await page.goto('https://movne.co.il', { waitUntil: 'networkidle' });
    
    // 1. Performance Analysis
    console.log('⚡ Analyzing performance...');
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        transferSize: Math.round(navigation.transferSize / 1024), // KB
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
    
    // 2. SEO Technical Analysis
    console.log('🔍 Analyzing technical SEO...');
    const technical = await page.evaluate(() => {
      return {
        title: document.title,
        titleLength: document.title.length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2Tags: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src.substring(img.src.lastIndexOf('/') + 1),
          alt: img.alt || 'MISSING',
          loading: img.loading || 'default'
        })),
        internalLinks: Array.from(document.querySelectorAll('a'))
          .filter(link => link.href.includes('movne.co.il')).length,
        robotsMeta: document.querySelector('meta[name="robots"]')?.content || 'Not set'
      };
    });
    
    // 3. Hebrew Keywords Analysis
    console.log('🇮🇱 Analyzing Hebrew keywords...');
    const hebrewKeywords = [
      'מוצרים מובנים',
      'יעוץ השקעות', 
      'השקעות מובנות',
      'מוצרי השקעה',
      'ייעוץ פיננסי',
      'שירותי השקעה',
      'פורטפוליו השקעות',
      'משקיעים מתקדמים'
    ];
    
    const keywordAnalysis = await page.evaluate((keywords) => {
      const text = document.body.innerText.toLowerCase();
      const wordCount = text.split(/\s+/).length;
      
      const analysis = {};
      keywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
        analysis[keyword] = {
          count: matches,
          density: ((matches / wordCount) * 100).toFixed(2) + '%',
          inTitle: document.title.toLowerCase().includes(keyword.toLowerCase()),
          inMeta: (document.querySelector('meta[name="description"]')?.content || '').toLowerCase().includes(keyword.toLowerCase()),
          inH1: Array.from(document.querySelectorAll('h1')).some(h => h.textContent.toLowerCase().includes(keyword.toLowerCase()))
        };
      });
      
      return {
        keywords: analysis,
        totalWords: wordCount,
        hebrewRatio: ((text.match(/[\u0590-\u05FF]/g) || []).length / text.length * 100).toFixed(1) + '%'
      };
    }, hebrewKeywords);
    
    // 4. Content Quality Analysis
    console.log('📝 Analyzing content quality...');
    const content = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        wordCount: text.split(/\s+/).length,
        hasContactInfo: text.includes('@') || text.includes('טלפון'),
        hasCallToAction: text.includes('צרו קשר') || text.includes('התקשרו'),
        paragraphCount: document.querySelectorAll('p').length,
        listCount: document.querySelectorAll('ul, ol').length
      };
    });
    
    // 5. Generate Alerts
    const alerts = [];
    
    if (performance.loadComplete > 3000) {
      alerts.push({
        type: 'CRITICAL',
        message: `Page load time is ${performance.loadComplete}ms (should be <3000ms)`
      });
    }
    
    if (technical.titleLength < 30 || technical.titleLength > 60) {
      alerts.push({
        type: 'WARNING', 
        message: `Title length is ${technical.titleLength} chars (optimal: 30-60)`
      });
    }
    
    if (technical.metaDescLength < 120 || technical.metaDescLength > 160) {
      alerts.push({
        type: 'WARNING',
        message: `Meta description length is ${technical.metaDescLength} chars (optimal: 120-160)`
      });
    }
    
    const missingKeywords = Object.entries(keywordAnalysis.keywords)
      .filter(([key, data]) => data.count === 0)
      .map(([key]) => key);
      
    if (missingKeywords.length > 0) {
      alerts.push({
        type: 'SEO',
        message: `Missing keywords: ${missingKeywords.join(', ')}`
      });
    }
    
    const imagesWithoutAlt = technical.images.filter(img => img.alt === 'MISSING').length;
    if (imagesWithoutAlt > 0) {
      alerts.push({
        type: 'ACCESSIBILITY',
        message: `${imagesWithoutAlt} images missing alt text`
      });
    }
    
    // 6. Generate Report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://movne.co.il',
      performance,
      technical,
      keywordAnalysis,
      content,
      alerts,
      scores: {
        performance: performance.loadComplete < 2000 ? 100 : performance.loadComplete < 3000 ? 80 : 50,
        seo: (technical.titleLength >= 30 && technical.titleLength <= 60 ? 25 : 0) +
             (technical.metaDescLength >= 120 && technical.metaDescLength <= 160 ? 25 : 0) +
             (technical.h1Tags.length === 1 ? 25 : 0) +
             (imagesWithoutAlt === 0 ? 25 : 0),
        content: Math.min(100, content.wordCount > 300 ? 100 : content.wordCount * 0.33)
      }
    };
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(`monitoring-${timestamp}.json`, JSON.stringify(report, null, 2));
    
    // Generate readable report
    const readableReport = `
# SEO Monitoring Report - Movne.co.il
**Generated:** ${new Date().toLocaleString('he-IL')}

## 🎯 Overall Scores
- **Performance:** ${report.scores.performance}/100 ${report.scores.performance >= 80 ? '✅' : '⚠️'}
- **SEO:** ${report.scores.seo}/100 ${report.scores.seo >= 80 ? '✅' : '⚠️'}  
- **Content:** ${Math.round(report.scores.content)}/100 ${report.scores.content >= 80 ? '✅' : '⚠️'}

## ⚡ Performance Metrics
- **Page Load:** ${performance.loadComplete}ms ${performance.loadComplete < 3000 ? '✅' : '❌'}
- **DOM Content Loaded:** ${performance.domContentLoaded}ms
- **First Paint:** ${Math.round(performance.firstPaint)}ms
- **Page Size:** ${performance.transferSize}KB
- **Resources:** ${performance.resourceCount}

## 📊 SEO Analysis
- **Title:** "${technical.title}" (${technical.titleLength} chars)
- **Meta Description:** ${technical.metaDescLength} chars
- **H1 Tags:** ${technical.h1Tags.length} ${technical.h1Tags.map(h => `"${h}"`).join(', ')}
- **Internal Links:** ${technical.internalLinks}
- **Images:** ${technical.images.length} total, ${imagesWithoutAlt} missing alt text

## 🇮🇱 Hebrew Keywords Analysis
${Object.entries(keywordAnalysis.keywords).map(([keyword, data]) => 
  `- **${keyword}:** ${data.count}x (${data.density}) ${data.inTitle ? '📍Title' : ''} ${data.inMeta ? '📝Meta' : ''} ${data.inH1 ? '🏆H1' : ''}`
).join('\n')}

**Hebrew Content Ratio:** ${keywordAnalysis.hebrewRatio}

## 🚨 Alerts (${alerts.length})
${alerts.map(alert => `- **${alert.type}:** ${alert.message}`).join('\n')}

## 💡 Priority Recommendations
${alerts.length === 0 ? '✅ No critical issues found!' : 
  alerts.filter(a => a.type === 'CRITICAL').length > 0 ? 
  '1. **Fix Critical Performance Issues** - Page load time needs immediate attention' : 
  '1. **Optimize SEO Elements** - Focus on title/meta optimization'}

${Object.entries(keywordAnalysis.keywords).filter(([key, data]) => data.count === 0).length > 0 ?
  '2. **Add Missing Keywords** - Integrate missing Hebrew financial terms' : ''}

${imagesWithoutAlt > 0 ? '3. **Add Alt Text** - Improve accessibility and SEO' : ''}

---
*Monitoring powered by Playwright MCP - Similar to Augment AI*
`;

    fs.writeFileSync('movne-seo-report.md', readableReport);
    
    console.log('\n📊 MONITORING RESULTS:');
    console.log(`⚡ Performance Score: ${report.scores.performance}/100`);
    console.log(`🔍 SEO Score: ${report.scores.seo}/100`);
    console.log(`📝 Content Score: ${Math.round(report.scores.content)}/100`);
    console.log(`🚨 Alerts: ${alerts.length}`);
    
    console.log('\n🎯 KEY FINDINGS:');
    console.log(`   Load Time: ${performance.loadComplete}ms ${performance.loadComplete > 3000 ? '❌ TOO SLOW' : '✅'}`);
    console.log(`   Missing Keywords: ${missingKeywords.length} ${missingKeywords.length > 0 ? '⚠️' : '✅'}`);
    console.log(`   Alt Text Missing: ${imagesWithoutAlt} images ${imagesWithoutAlt > 0 ? '⚠️' : '✅'}`);
    
    console.log('\n✅ Full report saved to: movne-seo-report.md');
    
  } catch (error) {
    console.error('❌ Monitoring error:', error.message);
  } finally {
    await browser.close();
  }
}

monitorLiveSite().catch(console.error);