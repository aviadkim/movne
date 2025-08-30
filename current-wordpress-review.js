// Current WordPress Review Script for Immediate Improvements
const { chromium } = require('playwright');

async function reviewCurrentWordPress() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Reviewing current movne.co.il WordPress for immediate SEO improvements...');
  
  try {
    // Login to WordPress admin
    await page.goto('https://movne.co.il/movne/wp-admin');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into WordPress admin');
    
    // 1. Check Current Plugins
    console.log('\n🔌 CURRENT PLUGINS ANALYSIS:');
    await page.goto('https://movne.co.il/movne/wp-admin/plugins.php');
    await page.waitForSelector('#the-list');
    
    const installedPlugins = await page.evaluate(() => {
      const pluginRows = Array.from(document.querySelectorAll('#the-list tr'));
      return pluginRows.map(row => {
        const nameElement = row.querySelector('.plugin-title strong');
        const statusElement = row.querySelector('.activate, .deactivate');
        return {
          name: nameElement ? nameElement.textContent : 'Unknown',
          active: statusElement ? statusElement.textContent === 'Deactivate' : false
        };
      });
    });
    
    console.log('   Installed plugins:');
    installedPlugins.forEach(plugin => {
      console.log(`   ${plugin.active ? '✅' : '❌'} ${plugin.name}`);
    });
    
    // 2. Check Yoast SEO Configuration
    console.log('\n📊 YOAST SEO ANALYSIS:');
    try {
      await page.goto('https://movne.co.il/movne/wp-admin/admin.php?page=wpseo_dashboard');
      await page.waitForSelector('#wpseo-dashboard', { timeout: 5000 });
      
      const yoastStatus = await page.evaluate(() => {
        const notifications = Array.from(document.querySelectorAll('.yoast-notification'));
        return {
          hasNotifications: notifications.length > 0,
          notifications: notifications.map(n => n.textContent.trim().substring(0, 100))
        };
      });
      
      console.log(`   Yoast notifications: ${yoastStatus.hasNotifications ? yoastStatus.notifications.length : 0}`);
      if (yoastStatus.hasNotifications) {
        yoastStatus.notifications.forEach((notif, i) => {
          console.log(`   ${i + 1}. ${notif}...`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Cannot access Yoast SEO dashboard');
    }
    
    // 3. Analyze Current Pages SEO
    console.log('\n📄 PAGES SEO ANALYSIS:');
    await page.goto('https://movne.co.il/movne/wp-admin/edit.php?post_type=page');
    await page.waitForSelector('.wp-list-table');
    
    const pages = await page.evaluate(() => {
      const pageRows = Array.from(document.querySelectorAll('#the-list tr'));
      return pageRows.slice(0, 10).map(row => {
        const titleElement = row.querySelector('.row-title');
        const yoastIndicator = row.querySelector('.yoast-column-seo');
        return {
          title: titleElement ? titleElement.textContent : 'Unknown',
          seoStatus: yoastIndicator ? yoastIndicator.className : 'unknown',
          url: titleElement ? titleElement.href : ''
        };
      });
    });
    
    console.log('   Page SEO Status:');
    pages.forEach(pageInfo => {
      const status = pageInfo.seoStatus.includes('good') ? '✅ טוב' : 
                    pageInfo.seoStatus.includes('ok') ? '🟡 תקין' : 
                    pageInfo.seoStatus.includes('bad') ? '❌ צריך שיפור' : '❓ לא ידוע';
      console.log(`   ${status} ${pageInfo.title}`);
    });
    
    // 4. Check for Missing Free Plugins
    console.log('\n🆓 MISSING FREE PLUGINS THAT SHOULD BE INSTALLED:');
    const recommendedFreePlugins = [
      'WP Super Cache',
      'Smush',
      'MonsterInsights',
      'Click to Chat',
      'UpdraftPlus',
      'Simple Social Icons',
      'WP Review'
    ];
    
    const installedNames = installedPlugins.map(p => p.name);
    const missingPlugins = recommendedFreePlugins.filter(plugin => 
      !installedNames.some(installed => installed.includes(plugin.split(' ')[0]))
    );
    
    missingPlugins.forEach(plugin => {
      console.log(`   ❌ MISSING: ${plugin} - Should install immediately`);
    });
    
    // 5. Check Current Theme
    console.log('\n🎨 THEME ANALYSIS:');
    await page.goto('https://movne.co.il/movne/wp-admin/themes.php');
    await page.waitForSelector('.themes');
    
    const currentTheme = await page.evaluate(() => {
      const activeTheme = document.querySelector('.theme.active');
      return {
        name: activeTheme ? activeTheme.querySelector('.theme-name').textContent : 'Unknown',
        description: activeTheme ? activeTheme.querySelector('.theme-description').textContent : 'Unknown'
      };
    });
    
    console.log(`   Current Theme: ${currentTheme.name}`);
    console.log(`   Description: ${currentTheme.description.substring(0, 100)}...`);
    
    // 6. Quick Site Health Check
    console.log('\n🏥 SITE HEALTH CHECK:');
    await page.goto('https://movne.co.il/movne/wp-admin/site-health.php');
    await page.waitForSelector('.site-health-progress-wrapper', { timeout: 5000 });
    
    const siteHealth = await page.evaluate(() => {
      const scoreElement = document.querySelector('.site-health-progress-count');
      const issuesCount = document.querySelectorAll('.health-check-accordion-trigger').length;
      return {
        score: scoreElement ? scoreElement.textContent : 'Unknown',
        issuesCount: issuesCount
      };
    });
    
    console.log(`   Health Score: ${siteHealth.score}%`);
    console.log(`   Issues to Address: ${siteHealth.issuesCount}`);
    
    // 7. Generate Immediate Action Plan
    console.log('\n🚀 IMMEDIATE FREE IMPROVEMENTS TO IMPLEMENT NOW:');
    console.log('\n   A. CRITICAL (Do Today):');
    
    if (missingPlugins.length > 0) {
      console.log('   1. Install missing free plugins:');
      missingPlugins.forEach(plugin => console.log(`      - ${plugin}`));
    }
    
    if (parseInt(siteHealth.score) < 90) {
      console.log('   2. Fix WordPress health issues');
    }
    
    console.log('   3. Optimize existing Yoast SEO settings');
    console.log('   4. Add missing alt text to images');
    console.log('   5. Enable caching with WP Super Cache');
    
    console.log('\n   B. HIGH PRIORITY (This Week):');
    console.log('   1. Create Google My Business profile');
    console.log('   2. Set up Google Search Console');
    console.log('   3. Write first blog post with target keywords');
    console.log('   4. Add WhatsApp contact button');
    console.log('   5. Create simple lead magnet');
    
    console.log('\n   C. MEDIUM PRIORITY (Next 2 Weeks):');
    console.log('   1. Improve mobile responsiveness');
    console.log('   2. Add testimonials section');
    console.log('   3. Create email newsletter signup');
    console.log('   4. Optimize internal linking');
    console.log('   5. Add schema markup for business info');
    
  } catch (error) {
    console.error('❌ Error during WordPress review:', error.message);
  } finally {
    await browser.close();
  }
}

reviewCurrentWordPress().catch(console.error);