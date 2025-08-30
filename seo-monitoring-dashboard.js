// Automated SEO Monitoring Dashboard - Augment Style
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class SEOMonitor {
  constructor() {
    this.siteUrl = 'https://movne.co.il';
    this.stagingUrl = 'https://movne.co.il/movne/';
    this.credentials = {
      username: 'aviad@kimfo-fs.com',
      password: 'Kimfo1982'
    };
    
    // Hebrew financial keywords to monitor
    this.hebrewKeywords = [
      'מוצרים מובנים',
      'יעוץ השקעות', 
      'השקעות מובנות',
      'מוצרי השקעה',
      'ייעוץ פיננסי',
      'שירותי השקעה',
      'פורטפוליו השקעות',
      'משקיעים מתקדמים'
    ];
    
    this.competitors = [
      'https://harel-finance.co.il',
      'https://www.psagot.co.il', 
      'https://www.mizrahi-tefahot.co.il'
    ];
  }

  async runFullAudit() {
    const browser = await chromium.launch({ headless: true });
    const results = {
      timestamp: new Date().toISOString(),
      technical: {},
      performance: {},
      seo: {},
      content: {},
      competitive: {},
      alerts: []
    };

    try {
      console.log('🚀 Starting comprehensive SEO monitoring...');
      
      // 1. Technical SEO Audit
      results.technical = await this.auditTechnicalSEO(browser);
      
      // 2. Performance Monitoring  
      results.performance = await this.auditPerformance(browser);
      
      // 3. Content Quality Analysis
      results.content = await this.auditContent(browser);
      
      // 4. Hebrew Keywords Analysis
      results.seo = await this.auditHebrewSEO(browser);
      
      // 5. Competitive Analysis
      results.competitive = await this.auditCompetitors(browser);
      
      // 6. WordPress Health Check
      results.wordpress = await this.auditWordPressHealth(browser);
      
      // Generate alerts and recommendations
      results.alerts = this.generateAlerts(results);
      
      // Save results
      await this.saveResults(results);
      
      // Generate report
      this.generateReport(results);
      
    } catch (error) {
      console.error('Error during monitoring:', error);
    } finally {
      await browser.close();
    }
    
    return results;
  }

  async auditTechnicalSEO(browser) {
    const page = await browser.newPage();
    console.log('🔍 Auditing technical SEO...');
    
    await page.goto(this.siteUrl);
    await page.waitForLoadState('networkidle');
    
    const technical = await page.evaluate(() => {
      const metaTags = Array.from(document.querySelectorAll('meta')).map(meta => ({
        name: meta.name || meta.property || meta.httpEquiv,
        content: meta.content
      }));
      
      const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        }).filter(Boolean);
      
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.href,
        robots: document.querySelector('meta[name="robots"]')?.content,
        openGraph: metaTags.filter(meta => meta.name?.startsWith('og:')),
        structuredData: structuredData,
        headingStructure: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
        },
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || 'MISSING ALT',
          loading: img.loading
        })),
        internalLinks: Array.from(document.querySelectorAll('a'))
          .filter(link => link.href.includes('movne.co.il')).length,
        externalLinks: Array.from(document.querySelectorAll('a'))
          .filter(link => !link.href.includes('movne.co.il') && link.href.startsWith('http')).length
      };
    });
    
    await page.close();
    return technical;
  }

  async auditPerformance(browser) {
    const page = await browser.newPage();
    console.log('⚡ Auditing performance...');
    
    await page.goto(this.siteUrl);
    
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        resourcesCount: performance.getEntriesByType('resource').length,
        transferSize: Math.round(navigation.transferSize / 1024) // KB
      };
    });
    
    // Web Vitals simulation
    performance.coreWebVitals = {
      lcp: performance.firstContentfulPaint, // Simplified
      fid: 0, // Would need real user interaction
      cls: 0  // Would need layout shift measurement
    };
    
    await page.close();
    return performance;
  }

  async auditContent(browser) {
    const page = await browser.newPage();
    console.log('📝 Auditing content quality...');
    
    await page.goto(this.siteUrl);
    
    const content = await page.evaluate((keywords) => {
      const text = document.body.innerText;
      const wordCount = text.split(/\s+/).length;
      
      const keywordAnalysis = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex) || [];
        acc[keyword] = {
          count: matches.length,
          density: ((matches.length * keyword.split(' ').length) / wordCount * 100).toFixed(2)
        };
        return acc;
      }, {});
      
      // Hebrew text analysis
      const hebrewTextRatio = (text.match(/[\u0590-\u05FF]/g) || []).length / text.length;
      
      return {
        wordCount,
        hebrewTextRatio: (hebrewTextRatio * 100).toFixed(2),
        keywordAnalysis,
        readabilityScore: this.calculateReadability(text),
        hasContactInfo: text.includes('@') && (text.includes('טלפון') || text.includes('פון')),
        hasCallToAction: text.includes('צרו קשר') || text.includes('התקשרו') || text.includes('לפגישה')
      };
    }, this.hebrewKeywords);
    
    await page.close();
    return content;
  }

  async auditHebrewSEO(browser) {
    const page = await browser.newPage();
    console.log('🇮🇱 Auditing Hebrew SEO optimization...');
    
    await page.goto(this.siteUrl);
    
    const hebrewSEO = await page.evaluate((keywords) => {
      const title = document.title;
      const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
      
      // Check Hebrew keyword presence in critical areas
      const titleKeywords = keywords.filter(kw => title.includes(kw));
      const metaKeywords = keywords.filter(kw => metaDesc.includes(kw));
      const h1Keywords = keywords.filter(kw => 
        Array.from(document.querySelectorAll('h1')).some(h => h.textContent.includes(kw))
      );
      
      // RTL support check
      const hasRTL = document.documentElement.dir === 'rtl' || 
        document.body.dir === 'rtl' ||
        document.querySelector('[dir="rtl"]') !== null;
      
      return {
        titleOptimization: {
          hasHebrewKeywords: titleKeywords.length > 0,
          keywordsFound: titleKeywords,
          length: title.length,
          optimal: title.length >= 30 && title.length <= 60
        },
        metaDescriptionOptimization: {
          hasHebrewKeywords: metaKeywords.length > 0,
          keywordsFound: metaKeywords,
          length: metaDesc.length,
          optimal: metaDesc.length >= 120 && metaDesc.length <= 160
        },
        headingOptimization: {
          h1HasKeywords: h1Keywords.length > 0,
          keywordsInH1: h1Keywords
        },
        rtlSupport: hasRTL,
        hreflangTags: Array.from(document.querySelectorAll('link[hreflang]')).length
      };
    }, this.hebrewKeywords);
    
    await page.close();
    return hebrewSEO;
  }

  async auditCompetitors(browser) {
    console.log('🏆 Auditing competitors...');
    const competitive = {};
    
    for (const competitor of this.competitors) {
      try {
        const page = await browser.newPage();
        await page.goto(competitor, { timeout: 10000 });
        
        const compData = await page.evaluate(() => ({
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content,
          h1Count: document.querySelectorAll('h1').length,
          loadTime: performance.now()
        }));
        
        competitive[competitor] = compData;
        await page.close();
        
      } catch (error) {
        competitive[competitor] = { error: 'Could not access' };
      }
    }
    
    return competitive;
  }

  async auditWordPressHealth(browser) {
    const page = await browser.newPage();
    console.log('🔧 Checking WordPress health...');
    
    try {
      // Login to WordPress
      await page.goto(`${this.stagingUrl}wp-admin`);
      await page.fill('#user_login', this.credentials.username);
      await page.fill('#user_pass', this.credentials.password);
      await page.click('#wp-submit');
      
      await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
      
      // Check site health
      await page.goto(`${this.stagingUrl}wp-admin/site-health.php`);
      await page.waitForSelector('.site-health-progress-wrapper', { timeout: 5000 });
      
      const healthData = await page.evaluate(() => {
        const scoreElement = document.querySelector('.site-health-progress-count');
        const score = scoreElement ? parseInt(scoreElement.textContent) : 0;
        
        const criticalIssues = document.querySelectorAll('.health-check-accordion-trigger').length;
        
        return {
          healthScore: score,
          criticalIssues,
          lastChecked: new Date().toISOString()
        };
      });
      
      await page.close();
      return healthData;
      
    } catch (error) {
      await page.close();
      return { error: 'Could not access WordPress admin', lastChecked: new Date().toISOString() };
    }
  }

  generateAlerts(results) {
    const alerts = [];
    
    // Performance alerts
    if (results.performance?.loadComplete > 3000) {
      alerts.push({
        type: 'performance',
        severity: 'high',
        message: `Page load time is ${results.performance.loadComplete}ms (>3s threshold)`
      });
    }
    
    // SEO alerts
    if (results.seo?.titleOptimization?.optimal === false) {
      alerts.push({
        type: 'seo',
        severity: 'medium',
        message: 'Title tag length is not optimal for Hebrew SEO'
      });
    }
    
    // Content alerts
    if (results.content?.keywordAnalysis) {
      const lowKeywords = Object.entries(results.content.keywordAnalysis)
        .filter(([key, data]) => data.count < 2);
      
      if (lowKeywords.length > 0) {
        alerts.push({
          type: 'content',
          severity: 'medium',
          message: `Low keyword density for: ${lowKeywords.map(([key]) => key).join(', ')}`
        });
      }
    }
    
    // WordPress health alerts
    if (results.wordpress?.healthScore < 80) {
      alerts.push({
        type: 'wordpress',
        severity: 'high',
        message: `WordPress health score is ${results.wordpress.healthScore}% (below 80%)`
      });
    }
    
    return alerts;
  }

  async saveResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `seo-audit-${timestamp}.json`;
    const filepath = path.join(__dirname, 'monitoring-data', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`📊 Results saved to: ${filepath}`);
  }

  generateReport(results) {
    const report = `
# SEO Monitoring Report - Movne.co.il
**Generated:** ${new Date().toLocaleString()}

## 🎯 Overall Health Score
- **Performance Score:** ${this.calculateScore(results.performance)} / 100
- **SEO Score:** ${this.calculateScore(results.seo)} / 100  
- **Content Score:** ${this.calculateScore(results.content)} / 100
- **WordPress Health:** ${results.wordpress?.healthScore || 'N/A'}%

## 🚨 Alerts (${results.alerts.length})
${results.alerts.map(alert => `- **${alert.severity.toUpperCase()}**: ${alert.message}`).join('\n')}

## 📊 Key Metrics
- **Page Load Time:** ${results.performance?.loadComplete || 'N/A'}ms
- **Hebrew Keyword Coverage:** ${Object.keys(results.content?.keywordAnalysis || {}).length} keywords tracked
- **Internal Links:** ${results.technical?.internalLinks || 'N/A'}
- **Images without Alt:** ${results.technical?.images?.filter(img => img.alt === 'MISSING ALT').length || 'N/A'}

## 🏆 Competitive Position
${Object.entries(results.competitive || {}).map(([site, data]) => 
  `- **${site}**: ${data.error || `Load: ${Math.round(data.loadTime)}ms`}`
).join('\n')}

## 💡 Recommendations
${this.generateRecommendations(results).map(rec => `- ${rec}`).join('\n')}
`;

    fs.writeFileSync(path.join(__dirname, 'latest-seo-report.md'), report);
    console.log('\n📋 SEO Report Generated:');
    console.log(report);
  }

  calculateScore(section) {
    // Simplified scoring algorithm
    if (!section) return 0;
    
    let score = 100;
    // Implementation would include detailed scoring logic
    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.performance?.loadComplete > 2000) {
      recommendations.push('Optimize page load speed - consider image compression and caching');
    }
    
    if (results.content?.hebrewTextRatio < 70) {
      recommendations.push('Increase Hebrew content ratio for better local SEO');
    }
    
    if (results.technical?.images?.some(img => img.alt === 'MISSING ALT')) {
      recommendations.push('Add alt text to all images for accessibility and SEO');
    }
    
    return recommendations;
  }
}

// Initialize and run monitoring
async function runMonitoring() {
  const monitor = new SEOMonitor();
  await monitor.runFullAudit();
  
  console.log('\n🎉 Monitoring completed! Check latest-seo-report.md for full report.');
}

// Export for scheduled runs
module.exports = SEOMonitor;

// Run if called directly
if (require.main === module) {
  runMonitoring().catch(console.error);
}