// Access Live Site WordPress with Same Credentials
const { chromium } = require('playwright');

async function accessLiveWordPress() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🌐 Accessing LIVE site WordPress admin with same credentials...');
  
  // Extended list of possible admin URLs for live site
  const adminURLs = [
    'https://movne.co.il/wp-admin',
    'https://movne.co.il/wp-admin/',
    'https://movne.co.il/wp-login.php',
    'https://movne.co.il/admin',
    'https://movne.co.il/administrator',
    'https://movne.co.il/login',
    'https://movne.co.il/cms',
    'https://movne.co.il/backend',
    'https://www.movne.co.il/wp-admin',
    'https://www.movne.co.il/wp-login.php'
  ];
  
  try {
    for (const adminURL of adminURLs) {
      console.log(`\n🔍 Trying: ${adminURL}`);
      
      try {
        await page.goto(adminURL, { 
          timeout: 20000,
          waitUntil: 'domcontentloaded' 
        });
        
        // Check for WordPress login form
        const hasLoginForm = await page.locator('#user_login, #loginform, input[name="log"]').isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasLoginForm) {
          console.log(`✅ WordPress login found at: ${adminURL}`);
          
          // Fill login form
          console.log('   🔐 Attempting login with provided credentials...');
          
          const usernameField = page.locator('#user_login, input[name="log"], input[type="text"]').first();
          const passwordField = page.locator('#user_pass, input[name="pwd"], input[type="password"]').first(); 
          const submitButton = page.locator('#wp-submit, input[type="submit"], button[type="submit"]').first();
          
          await usernameField.fill('aviad@kimfo-fs.com');
          await passwordField.fill('Kimfo1982');
          await submitButton.click();
          
          // Wait for login result
          await page.waitForTimeout(5000);
          
          // Check if successfully logged in
          const isLoggedIn = await page.locator('#dashboard-widgets, .wp-admin-bar, #adminmenu').isVisible({ timeout: 5000 }).catch(() => false);
          
          if (isLoggedIn) {
            console.log('🎉 SUCCESS: Logged into LIVE WordPress admin!');
            console.log(`   ✅ Admin URL: ${adminURL}`);
            
            // Get admin information
            const adminInfo = await page.evaluate(() => {
              return {
                currentURL: window.location.href,
                siteName: document.querySelector('#site-name a, .wp-admin-bar-site-name a')?.textContent || 'Unknown',
                hasYoastSEO: document.querySelector('a[href*="wpseo"], #toplevel_page_wpseo_dashboard') !== null,
                hasPluginsAccess: document.querySelector('a[href*="plugins.php"]') !== null,
                hasPagesAccess: document.querySelector('a[href*="edit.php?post_type=page"]') !== null,
                hasPostsAccess: document.querySelector('a[href*="edit.php"]') !== null,
                hasMediaAccess: document.querySelector('a[href*="upload.php"]') !== null,
                wordpressVersion: document.querySelector('#footer-thankyou')?.textContent || 'Unknown'
              };
            });
            
            console.log('\n📊 LIVE WORDPRESS ADMIN CAPABILITIES:');
            console.log(`   Site: ${adminInfo.siteName}`);
            console.log(`   ✓ Plugins: ${adminInfo.hasPluginsAccess ? 'Full Access' : 'Limited'}`);
            console.log(`   ✓ Pages: ${adminInfo.hasPagesAccess ? 'Can Edit' : 'Cannot Edit'}`);
            console.log(`   ✓ Posts/Blog: ${adminInfo.hasPostsAccess ? 'Can Create' : 'Cannot Create'}`);
            console.log(`   ✓ Media: ${adminInfo.hasMediaAccess ? 'Can Upload' : 'Cannot Upload'}`);
            console.log(`   ✓ Yoast SEO: ${adminInfo.hasYoastSEO ? 'Available' : 'Not Found'}`);
            
            // Check current plugins on live site
            if (adminInfo.hasPluginsAccess) {
              console.log('\n🔌 Checking installed plugins on LIVE site...');
              await page.goto(adminURL.replace('/wp-admin', '') + '/wp-admin/plugins.php');
              await page.waitForSelector('#the-list', { timeout: 5000 });
              
              const livePlugins = await page.evaluate(() => {
                const pluginRows = Array.from(document.querySelectorAll('#the-list tr'));
                return pluginRows.map(row => {
                  const nameElement = row.querySelector('.plugin-title strong');
                  const statusElement = row.querySelector('.activate, .deactivate');
                  return {
                    name: nameElement ? nameElement.textContent : 'Unknown',
                    active: statusElement ? statusElement.textContent.includes('Deactivate') : false
                  };
                });
              });
              
              console.log('   LIVE SITE PLUGINS:');
              livePlugins.forEach(plugin => {
                console.log(`   ${plugin.active ? '✅' : '❌'} ${plugin.name}`);
              });
              
              // Identify missing free plugins
              const recommendedFree = ['Smush', 'MonsterInsights', 'Click to Chat', 'UpdraftPlus'];
              const missing = recommendedFree.filter(plugin => 
                !livePlugins.some(installed => installed.name.includes(plugin))
              );
              
              if (missing.length > 0) {
                console.log('\n🆓 FREE PLUGINS TO INSTALL ON LIVE SITE:');
                missing.forEach(plugin => {
                  console.log(`   📦 ${plugin} - Should install for SEO boost`);
                });
              }
            }
            
            // Success - we have access to live site WordPress!
            console.log('\n🚀 READY TO IMPLEMENT FREE SEO ON LIVE SITE!');
            console.log('\n📋 IMMEDIATE ACTIONS AVAILABLE:');
            console.log('   1. Install missing free plugins');
            console.log('   2. Optimize Yoast SEO for all pages');
            console.log('   3. Add missing alt text to images');
            console.log('   4. Create blog posts with target keywords');
            console.log('   5. Set up conversion optimization');
            
            break; // Exit loop - we found working admin access
            
          } else {
            console.log(`❌ Login failed for ${adminURL}`);
            
            // Check if there's an error message
            const errorMessage = await page.locator('.login_error, .error, .message').textContent().catch(() => '');
            if (errorMessage) {
              console.log(`   Error: ${errorMessage}`);
            }
          }
        } else {
          // Check what type of page we got
          const pageTitle = await page.title();
          console.log(`   ❌ Not WordPress login: "${pageTitle}"`);
        }
        
      } catch (error) {
        console.log(`   ❌ Cannot access: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error accessing live WordPress:', error.message);
  } finally {
    await browser.close();
  }
}

accessLiveWordPress().catch(console.error);