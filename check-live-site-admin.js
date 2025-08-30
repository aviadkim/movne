// Check Live Site WordPress Admin Access
const { chromium } = require('playwright');

async function checkLiveSiteAdmin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Checking WordPress admin access for LIVE site (movne.co.il)...');
  
  const possibleAdminURLs = [
    'https://movne.co.il/wp-admin',
    'https://movne.co.il/wp-admin/',
    'https://movne.co.il/wordpress/wp-admin',
    'https://movne.co.il/admin',
    'https://movne.co.il/wp-login.php'
  ];
  
  try {
    for (const adminURL of possibleAdminURLs) {
      console.log(`\n📊 Trying: ${adminURL}`);
      
      try {
        await page.goto(adminURL, { timeout: 15000 });
        
        // Check if we get a WordPress login page
        const isWordPressLogin = await page.locator('#user_login, #loginform, .login-form').isVisible().catch(() => false);
        
        if (isWordPressLogin) {
          console.log(`✅ FOUND: WordPress login at ${adminURL}`);
          
          // Try to login
          console.log('   🔐 Attempting login...');
          await page.fill('#user_login', 'aviad@kimfo-fs.com');
          await page.fill('#user_pass', 'Kimfo1982');
          await page.click('#wp-submit');
          
          await page.waitForTimeout(5000);
          
          // Check if login successful
          const isLoggedIn = await page.locator('#dashboard-widgets, .wp-admin-bar').isVisible().catch(() => false);
          
          if (isLoggedIn) {
            console.log('✅ SUCCESS: Logged into LIVE site WordPress admin!');
            console.log(`   Admin URL: ${adminURL}`);
            
            // Quick check of what's available
            const adminInfo = await page.evaluate(() => {
              return {
                currentURL: window.location.href,
                hasPluginMenu: document.querySelector('a[href*="plugins.php"]') !== null,
                hasPostsMenu: document.querySelector('a[href*="edit.php"]') !== null,
                hasPagesMenu: document.querySelector('a[href*="edit.php?post_type=page"]') !== null,
                hasYoastSEO: document.querySelector('a[href*="wpseo"]') !== null,
                adminLanguage: document.documentElement.lang || 'unknown'
              };
            });
            
            console.log('\n📊 LIVE SITE ADMIN CAPABILITIES:');
            console.log(`   ✓ Can manage plugins: ${adminInfo.hasPluginMenu ? 'Yes' : 'No'}`);
            console.log(`   ✓ Can edit pages: ${adminInfo.hasPagesMenu ? 'Yes' : 'No'}`);
            console.log(`   ✓ Has Yoast SEO: ${adminInfo.hasYoastSEO ? 'Yes' : 'No'}`);
            console.log(`   ✓ Admin language: ${adminInfo.adminLanguage}`);
            
            console.log('\n🎯 READY TO IMPLEMENT FREE SEO IMPROVEMENTS ON LIVE SITE!');
            break;
            
          } else {
            console.log(`❌ Login failed for ${adminURL}`);
          }
        } else {
          console.log(`❌ Not WordPress admin: ${adminURL}`);
        }
        
      } catch (error) {
        console.log(`❌ Cannot access: ${adminURL}`);
      }
    }
    
    // If no admin access found, check the actual live site structure
    console.log('\n🌐 Analyzing live site structure...');
    await page.goto('https://movne.co.il');
    await page.waitForLoadState('networkidle');
    
    const siteAnalysis = await page.evaluate(() => {
      return {
        title: document.title,
        hasWordPressIndicators: document.querySelector('meta[name="generator"]')?.content?.includes('WordPress'),
        wpThemeInfo: document.querySelector('link[href*="/wp-content/themes"]')?.href || 'Not found',
        wpPluginInfo: document.querySelectorAll('link[href*="/wp-content/plugins"], script[src*="/wp-content/plugins"]').length,
        adminBarVisible: document.querySelector('#wpadminbar') !== null,
        possibleCMS: document.body.innerHTML.includes('wp-content') ? 'WordPress' : 
                     document.body.innerHTML.includes('drupal') ? 'Drupal' :
                     document.body.innerHTML.includes('joomla') ? 'Joomla' : 'Unknown'
      };
    });
    
    console.log('\n📊 LIVE SITE ANALYSIS:');
    console.log(`   Site Title: ${siteAnalysis.title}`);
    console.log(`   CMS Type: ${siteAnalysis.possibleCMS}`);
    console.log(`   WordPress Theme: ${siteAnalysis.wpThemeInfo.includes('wp-content') ? 'Detected' : 'Not detected'}`);
    console.log(`   WP Plugins Active: ${siteAnalysis.wpPluginInfo}`);
    console.log(`   Admin Bar: ${siteAnalysis.adminBarVisible ? 'Visible (logged in)' : 'Not visible'}`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (siteAnalysis.possibleCMS === 'WordPress') {
      console.log('   ✅ Site is WordPress - we can implement WordPress SEO strategies');
      console.log('   📋 Need to find correct admin access method');
      console.log('   🎯 Can still implement many free SEO improvements');
    } else {
      console.log('   ⚠️  Site might not be WordPress - will need different approach');
    }
    
  } catch (error) {
    console.error('❌ Error checking live site admin:', error.message);
  } finally {
    await browser.close();
  }
}

checkLiveSiteAdmin().catch(console.error);