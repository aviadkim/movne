// Check Current SEO Status on Live WordPress Site
const { chromium } = require('playwright');

async function checkLiveSEOStatus() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📊 Checking current SEO status in LIVE WordPress admin...');
  
  try {
    // Login to live WordPress
    await page.goto('https://www.movne.co.il/wp-admin/');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into LIVE WordPress admin');
    
    // 1. Check Yoast SEO Dashboard
    console.log('\n📊 Checking Yoast SEO Dashboard...');
    try {
      await page.goto('https://movne.co.il/wp-admin/admin.php?page=wpseo_dashboard');
      await page.waitForSelector('#wpseo-dashboard', { timeout: 5000 });
      
      const yoastOverview = await page.evaluate(() => {
        const notifications = Array.from(document.querySelectorAll('.yoast-notification, .notice'));
        const problems = Array.from(document.querySelectorAll('[class*="problem"], [class*="error"], [class*="warning"]'));
        
        return {
          hasNotifications: notifications.length > 0,
          notificationCount: notifications.length,
          notifications: notifications.map(n => n.textContent.trim().substring(0, 150)),
          problemCount: problems.length,
          problems: problems.map(p => p.textContent.trim().substring(0, 100))
        };
      });
      
      console.log(`   Yoast Notifications: ${yoastOverview.notificationCount}`);
      if (yoastOverview.hasNotifications) {
        yoastOverview.notifications.forEach((notif, i) => {
          console.log(`   ${i + 1}. ${notif}...`);
        });
      }
      
      console.log(`   Problems Found: ${yoastOverview.problemCount}`);
      if (yoastOverview.problemCount > 0) {
        yoastOverview.problems.forEach((problem, i) => {
          console.log(`   ⚠️  ${i + 1}. ${problem}...`);
        });
      }
      
    } catch (error) {
      console.log('   ⚠️  Could not access Yoast SEO dashboard');
    }
    
    // 2. Check All Pages SEO Status
    console.log('\n📄 Current Pages SEO Analysis...');
    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForSelector('.wp-list-table');
    
    const pagesAnalysis = await page.evaluate(() => {
      const pageRows = Array.from(document.querySelectorAll('#the-list tr[id*="post-"]'));
      
      return pageRows.map(row => {
        const titleElement = row.querySelector('.row-title');
        const yoastColumn = row.querySelector('.column-wpseo-score, .yoast-column');
        const statusElement = row.querySelector('.yoast-column-seo .yoast-column-seo-score');
        
        let seoStatus = 'unknown';
        if (yoastColumn) {
          const classList = yoastColumn.className;
          if (classList.includes('good') || classList.includes('green')) seoStatus = 'good';
          else if (classList.includes('ok') || classList.includes('orange')) seoStatus = 'ok';
          else if (classList.includes('bad') || classList.includes('red')) seoStatus = 'bad';
        }
        
        return {
          title: titleElement ? titleElement.textContent.trim() : 'Unknown',
          seoStatus: seoStatus,
          editUrl: titleElement ? titleElement.href : ''
        };
      });
    });
    
    console.log('\n📈 CURRENT SEO STATUS OF ALL PAGES:');
    pagesAnalysis.forEach(pageData => {
      const statusIcon = pageData.seoStatus === 'good' ? '✅ מצוין' :
                        pageData.seoStatus === 'ok' ? '🟡 תקין' :
                        pageData.seoStatus === 'bad' ? '❌ צריך שיפור' : '❓ לא מוגדר';
      console.log(`   ${statusIcon} ${pageData.title}`);
    });
    
    // Count pages needing improvement
    const needsImprovement = pagesAnalysis.filter(p => p.seoStatus === 'bad' || p.seoStatus === 'unknown').length;
    const okPages = pagesAnalysis.filter(p => p.seoStatus === 'ok').length;
    const goodPages = pagesAnalysis.filter(p => p.seoStatus === 'good').length;
    
    console.log('\n📊 SEO STATUS SUMMARY:');
    console.log(`   ✅ Good (מצוין): ${goodPages} pages`);
    console.log(`   🟡 OK (תקין): ${okPages} pages`);
    console.log(`   ❌ Needs Improvement: ${needsImprovement} pages`);
    
    // 3. Check installed plugins status
    console.log('\n🔌 Checking newly installed FREE plugins...');
    await page.goto('https://movne.co.il/wp-admin/plugins.php');
    await page.waitForSelector('#the-list');
    
    const pluginStatus = await page.evaluate(() => {
      const pluginRows = Array.from(document.querySelectorAll('#the-list tr'));
      return pluginRows.map(row => {
        const nameElement = row.querySelector('.plugin-title strong');
        const statusElement = row.querySelector('.activate, .deactivate');
        return {
          name: nameElement ? nameElement.textContent : 'Unknown',
          active: statusElement ? statusElement.textContent.includes('הפעלה') === false : false,
          version: row.querySelector('.plugin-version-author-uri')?.textContent || ''
        };
      }).filter(plugin => plugin.name !== 'Unknown');
    });
    
    console.log('\n📦 CURRENT PLUGIN STATUS:');
    pluginStatus.forEach(plugin => {
      console.log(`   ${plugin.active ? '✅' : '❌'} ${plugin.name}`);
    });
    
    // 4. Generate specific improvement recommendations
    console.log('\n💡 SPECIFIC SEO IMPROVEMENTS NEEDED:');
    
    if (needsImprovement > 0) {
      console.log(`   🎯 Priority: Fix ${needsImprovement} pages with poor SEO status`);
      console.log('   📝 Actions: Add focus keywords, meta descriptions, optimize titles');
    }
    
    // Check if Smush needs setup
    const hasSmush = pluginStatus.some(p => p.name.includes('Smush') && p.active);
    if (hasSmush) {
      console.log('   🖼️  Configure Smush: Bulk optimize all images');
    }
    
    // Check if MonsterInsights needs setup
    const hasMonsterInsights = pluginStatus.some(p => p.name.includes('MonsterInsights') && p.active);
    if (hasMonsterInsights) {
      console.log('   📊 Configure MonsterInsights: Connect to Google Analytics');
    }
    
    // Check if Click to Chat needs setup
    const hasClickToChat = pluginStatus.some(p => p.name.includes('Click') && p.active);
    if (hasClickToChat) {
      console.log('   📱 Configure Click to Chat: Add WhatsApp number');
    }
    
    console.log('\n🎯 READY FOR NEXT PHASE: FREE CONTENT CREATION & OPTIMIZATION');
    
  } catch (error) {
    console.error('❌ Error checking SEO status:', error.message);
  } finally {
    await browser.close();
  }
}

checkLiveSEOStatus().catch(console.error);