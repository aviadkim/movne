// Check both staging and live sites to determine where changes are needed
const { chromium } = require('playwright');

async function compareSites() {
  const browser = await chromium.launch({ headless: false });
  
  const sites = {
    live: 'https://movne.co.il',
    staging: 'https://movne.co.il/movne/'
  };
  
  console.log('🔍 Comparing live site vs staging site...\n');
  
  for (const [name, url] of Object.entries(sites)) {
    console.log(`\n📊 Analyzing ${name.toUpperCase()} site: ${url}`);
    
    try {
      const page = await browser.newPage();
      
      if (name === 'staging') {
        // For staging, we might hit the WordPress admin login
        await page.goto(url, { timeout: 15000 });
        
        // Check if we hit a login page or the actual site
        const isLoginPage = await page.locator('#user_login').isVisible().catch(() => false);
        
        if (isLoginPage) {
          console.log('⚠️  Staging site requires login - checking WordPress admin instead');
          
          // Login to check WordPress settings
          await page.fill('#user_login', 'aviad@kimfo-fs.com');
          await page.fill('#user_pass', 'Kimfo1982');
          await page.click('#wp-submit');
          
          try {
            await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
            console.log('✅ Successfully logged into WordPress staging');
            
            // Check critical settings
            console.log('\n🔍 Checking WordPress settings...');
            
            // Check search engine visibility
            await page.goto(url + 'wp-admin/options-reading.php');
            await page.waitForSelector('#blog_public');
            
            const searchEnginesBlocked = !await page.isChecked('#blog_public');
            console.log(`   Search Engines: ${searchEnginesBlocked ? '❌ BLOCKED' : '✅ Allowed'}`);
            
            // Check permalinks
            await page.goto(url + 'wp-admin/options-permalink.php');
            const usingPlain = await page.isChecked('input[value=""]');
            console.log(`   Permalinks: ${usingPlain ? '❌ Plain (?p=123)' : '✅ SEO-friendly'}`);
            
            // Check if staging is ready to go live
            if (!searchEnginesBlocked && !usingPlain) {
              console.log('🚀 STAGING IS READY TO GO LIVE!');
            } else {
              console.log('⚠️  Staging needs fixes before going live');
            }
            
          } catch (error) {
            console.log('❌ Could not access WordPress dashboard');
          }
        } else {
          // Direct access to staging site content
          await analyzePublicSite(page, name, url);
        }
      } else {
        // Live site analysis
        await page.goto(url, { timeout: 15000 });
        await analyzePublicSite(page, name, url);
      }
      
      await page.close();
      
    } catch (error) {
      console.log(`❌ Error analyzing ${name} site: ${error.message}`);
    }
  }
  
  await browser.close();
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. If staging has issues → Fix on staging first, then push to live');
  console.log('2. If live site is working → Focus monitoring on live site');
  console.log('3. Use staging for testing new Playwright MCP features');
}

async function analyzePublicSite(page, siteName, url) {
  await page.waitForLoadState('networkidle');
  
  const analysis = await page.evaluate(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]')?.content;
    const isIndexable = !robotsMeta?.includes('noindex');
    
    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content,
      robotsMeta: robotsMeta || 'Not set',
      isIndexable,
      h1Count: document.querySelectorAll('h1').length,
      hasHebrewContent: document.body.innerText.match(/[\u0590-\u05FF]/) !== null,
      loadTime: performance.now()
    };
  });
  
  console.log(`\n📈 ${siteName.toUpperCase()} Site Analysis:`);
  console.log(`   Title: ${analysis.title}`);
  console.log(`   Indexable: ${analysis.isIndexable ? '✅ Yes' : '❌ No'}`);
  console.log(`   Hebrew Content: ${analysis.hasHebrewContent ? '✅ Yes' : '❌ No'}`);
  console.log(`   H1 Count: ${analysis.h1Count}`);
  console.log(`   Load Time: ${Math.round(analysis.loadTime)}ms`);
  console.log(`   Robots Meta: ${analysis.robotsMeta}`);
  
  // Check for Hebrew financial keywords
  const hebrewKeywords = ['מוצרים מובנים', 'יעוץ השקעות', 'השקעות מובנות'];
  const keywordCheck = await page.evaluate((keywords) => {
    const text = document.body.innerText;
    return keywords.map(kw => ({
      keyword: kw,
      found: text.includes(kw),
      count: (text.match(new RegExp(kw, 'g')) || []).length
    }));
  }, hebrewKeywords);
  
  console.log(`   Keywords Analysis:`);
  keywordCheck.forEach(kw => {
    console.log(`     ${kw.keyword}: ${kw.found ? `✅ Found (${kw.count}x)` : '❌ Missing'}`);
  });
}

// Run the comparison
compareSites().catch(console.error);