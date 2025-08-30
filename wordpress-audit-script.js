// WordPress Admin Audit Script using Playwright MCP
const { chromium } = require('playwright');

async function auditWordPressAdmin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔐 Logging into WordPress admin...');
    
    // Login to WordPress
    await page.goto('https://movne.co.il/movne/wp-admin');
    await page.waitForSelector('#user_login');
    
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    
    // Wait for dashboard to load
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    console.log('✅ Successfully logged into WordPress');
    
    // Check critical issues from the analysis report
    console.log('\n🔍 Checking critical SEO issues...');
    
    // 1. Check Search Engine Visibility
    console.log('\n1. Checking search engine visibility...');
    await page.goto('https://movne.co.il/movne/wp-admin/options-reading.php');
    await page.waitForSelector('#blog_public');
    
    const searchEngineBlocked = await page.isChecked('#blog_public');
    if (!searchEngineBlocked) {
      console.log('⚠️  CRITICAL: Search engines are BLOCKED!');
      console.log('   Fix: Uncheck "לבקש ממנועי חיפוש לא לאנדקס את האתר"');
      
      // Fix it automatically
      await page.check('#blog_public');
      await page.click('#submit');
      await page.waitForSelector('.updated');
      console.log('✅ Fixed: Search engine visibility enabled');
    } else {
      console.log('✅ Good: Search engines can index the site');
    }
    
    // 2. Check Permalink Structure
    console.log('\n2. Checking permalink structure...');
    await page.goto('https://movne.co.il/movne/wp-admin/options-permalink.php');
    
    const plainPermalinks = await page.isChecked('input[value=""]');
    if (plainPermalinks) {
      console.log('⚠️  CRITICAL: Using Plain permalinks (?p=123)');
      console.log('   Fix: Changing to Post name structure');
      
      // Fix permalink structure
      await page.check('input[value="/%postname%/"]');
      await page.click('#submit');
      await page.waitForSelector('.updated');
      console.log('✅ Fixed: Permalink structure changed to Post name');
    } else {
      console.log('✅ Good: SEO-friendly permalinks enabled');
    }
    
    // 3. Check WP Rocket Status
    console.log('\n3. Checking WP Rocket configuration...');
    try {
      await page.goto('https://movne.co.il/movne/wp-admin/admin.php?page=wprocket');
      
      // Look for domain change warning
      const domainWarning = await page.locator('text*="domain change detected"').count();
      if (domainWarning > 0) {
        console.log('⚠️  CRITICAL: WP Rocket domain change detected');
        
        // Clear cache and regenerate
        await page.click('#wpr-action-purge_cache');
        await page.waitForTimeout(2000);
        console.log('✅ WP Rocket cache cleared and regenerated');
      } else {
        console.log('✅ Good: WP Rocket configuration appears normal');
      }
    } catch (error) {
      console.log('⚠️  Could not access WP Rocket settings');
    }
    
    // 4. Check Yoast SEO Status
    console.log('\n4. Checking Yoast SEO configuration...');
    try {
      await page.goto('https://movne.co.il/movne/wp-admin/admin.php?page=wpseo_dashboard');
      
      // Check for alerts
      const yoastAlerts = await page.locator('.yoast-alert').count();
      console.log(`📊 Yoast SEO alerts found: ${yoastAlerts}`);
      
      if (yoastAlerts > 0) {
        const alertTexts = await page.locator('.yoast-alert').allTextContents();
        console.log('⚠️  Yoast SEO issues:');
        alertTexts.forEach((alert, i) => {
          console.log(`   ${i + 1}. ${alert.substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log('⚠️  Could not access Yoast SEO dashboard');
    }
    
    // 5. Check Site Health
    console.log('\n5. Checking WordPress Site Health...');
    await page.goto('https://movne.co.il/movne/wp-admin/site-health.php');
    await page.waitForSelector('.site-health-progress-wrapper');
    
    const healthScore = await page.textContent('.site-health-progress-count');
    console.log(`📊 Site Health Score: ${healthScore}`);
    
    // Get critical issues count
    const criticalIssues = await page.locator('.health-check-accordion-trigger').count();
    console.log(`⚠️  Site Health Issues: ${criticalIssues} items to review`);
    
    // 6. Performance Analysis
    console.log('\n6. Analyzing website performance...');
    await page.goto('https://movne.co.il');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0)
      };
    });
    
    console.log('⚡ Performance Metrics:');
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Full Page Load: ${performanceMetrics.loadComplete}ms`);
    console.log(`   First Paint: ${performanceMetrics.firstPaint}ms`);
    
    // 7. SEO Analysis
    console.log('\n7. SEO analysis on live site...');
    
    const seoData = await page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || 'Not found',
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length,
        internalLinks: Array.from(document.querySelectorAll('a')).filter(link => 
          link.href.includes('movne.co.il')).length
      };
    });
    
    console.log('📊 SEO Analysis:');
    console.log(`   Title: ${seoData.title}`);
    console.log(`   Meta Description: ${seoData.metaDescription.substring(0, 100)}...`);
    console.log(`   H1 tags: ${seoData.h1Count}`);
    console.log(`   H2 tags: ${seoData.h2Count}`);
    console.log(`   Images without alt text: ${seoData.imagesWithoutAlt}`);
    console.log(`   Internal links: ${seoData.internalLinks}`);
    
    console.log('\n✅ WordPress audit completed!');
    console.log('\n📋 Summary of actions taken:');
    console.log('   - Fixed search engine visibility (if needed)');
    console.log('   - Fixed permalink structure (if needed)');
    console.log('   - Cleared WP Rocket cache (if needed)');
    console.log('   - Analyzed site health and performance');
    console.log('   - Performed SEO audit');
    
  } catch (error) {
    console.error('❌ Error during WordPress audit:', error);
  } finally {
    await browser.close();
  }
}

// Run the audit
auditWordPressAdmin();