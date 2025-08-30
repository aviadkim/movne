// Find Live WordPress Admin for movne.co.il
const { chromium } = require('playwright');

async function findLiveWordPressAdmin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Finding WordPress admin for LIVE site movne.co.il...');
  
  try {
    // First, analyze the live site to find WordPress indicators
    console.log('📊 Analyzing live site structure...');
    await page.goto('https://movne.co.il', { timeout: 20000 });
    
    const wpIndicators = await page.evaluate(() => {
      // Look for WordPress-specific elements in the source
      const html = document.documentElement.outerHTML;
      
      return {
        hasWpContent: html.includes('/wp-content/'),
        hasWpIncludes: html.includes('/wp-includes/'),
        hasWpAdmin: html.includes('/wp-admin/'),
        wpContentPaths: Array.from(document.querySelectorAll('link[href*="/wp-content/"], script[src*="/wp-content/"]'))
          .map(el => el.href || el.src)
          .slice(0, 3),
        generatorMeta: document.querySelector('meta[name="generator"]')?.content,
        adminBarLinks: Array.from(document.querySelectorAll('a[href*="/wp-admin/"]'))
          .map(a => a.href)
          .slice(0, 3),
        possibleAdminHints: {
          editLinks: Array.from(document.querySelectorAll('a'))
            .filter(a => a.href.includes('wp-admin') || a.href.includes('edit'))
            .map(a => a.href)
            .slice(0, 3)
        }
      };
    });
    
    console.log('\n🔍 WordPress Detection Results:');
    console.log(`   wp-content detected: ${wpIndicators.hasWpContent ? '✅' : '❌'}`);
    console.log(`   WordPress generator: ${wpIndicators.generatorMeta || 'Not found'}`);
    
    if (wpIndicators.wpContentPaths.length > 0) {
      console.log('   wp-content paths found:');
      wpIndicators.wpContentPaths.forEach(path => {
        console.log(`     ${path}`);
      });
    }
    
    // Try to extract the base WordPress path from wp-content URLs
    let possibleBasePath = '';
    if (wpIndicators.wpContentPaths.length > 0) {
      const firstPath = wpIndicators.wpContentPaths[0];
      const wpContentIndex = firstPath.indexOf('/wp-content/');
      if (wpContentIndex > 0) {
        possibleBasePath = firstPath.substring(0, wpContentIndex);
        console.log(`   Possible WordPress base: ${possibleBasePath}`);
      }
    }
    
    // Enhanced admin URL attempts
    const enhancedAdminURLs = [
      'https://movne.co.il/wp-admin',
      'https://movne.co.il/wp-admin/',
      'https://movne.co.il/wp-login.php',
      'https://www.movne.co.il/wp-admin',
      'https://www.movne.co.il/wp-admin/',
      'https://www.movne.co.il/wp-login.php'
    ];
    
    // If we found a base path, add it to our attempts
    if (possibleBasePath) {
      enhancedAdminURLs.push(possibleBasePath + '/wp-admin');
      enhancedAdminURLs.push(possibleBasePath + '/wp-login.php');
    }
    
    console.log('\n🚀 Attempting enhanced WordPress admin access...');
    
    for (const adminURL of enhancedAdminURLs) {
      console.log(`\n📡 Testing: ${adminURL}`);
      
      try {
        await page.goto(adminURL, { 
          timeout: 15000,
          waitUntil: 'domcontentloaded'
        });
        
        // Wait a moment for page to fully load
        await page.waitForTimeout(2000);
        
        // Check multiple login form selectors
        const loginSelectors = [
          '#user_login',
          'input[name="log"]',
          'input[type="email"][name*="user"]',
          '.login-username input',
          '#loginform input[type="text"]'
        ];
        
        let loginFieldFound = false;
        for (const selector of loginSelectors) {
          if (await page.locator(selector).isVisible().catch(() => false)) {
            console.log(`   ✅ Login form found with selector: ${selector}`);
            loginFieldFound = true;
            break;
          }
        }
        
        if (loginFieldFound) {
          console.log(`   🔐 WordPress login confirmed at: ${adminURL}`);
          console.log('   🚀 Attempting login...');
          
          // Try different username field selectors
          const usernameField = page.locator('#user_login, input[name="log"], input[type="text"]').first();
          const passwordField = page.locator('#user_pass, input[name="pwd"], input[type="password"]').first();
          
          await usernameField.fill('aviad@kimfo-fs.com');
          await passwordField.fill('Kimfo1982');
          
          // Click submit button
          const submitSelectors = ['#wp-submit', 'input[type="submit"]', 'button[type="submit"]', '.button-primary'];
          for (const submitSelector of submitSelectors) {
            if (await page.locator(submitSelector).isVisible().catch(() => false)) {
              await page.click(submitSelector);
              break;
            }
          }
          
          // Wait for login to process
          await page.waitForTimeout(8000);
          
          // Check for successful login indicators
          const loginSuccess = await page.evaluate(() => {
            return {
              hasDashboard: document.querySelector('#dashboard-widgets') !== null,
              hasAdminBar: document.querySelector('#wpadminbar, .wp-admin-bar') !== null,
              hasAdminMenu: document.querySelector('#adminmenu') !== null,
              currentURL: window.location.href,
              pageTitle: document.title
            };
          });
          
          if (loginSuccess.hasDashboard || loginSuccess.hasAdminBar || loginSuccess.hasAdminMenu) {
            console.log('🎉 SUCCESS: Logged into LIVE WordPress admin!');
            console.log(`   ✅ Working admin URL: ${adminURL}`);
            console.log(`   📊 Dashboard URL: ${loginSuccess.currentURL}`);
            
            // Now we can implement SEO improvements
            console.log('\n🎯 READY TO IMPLEMENT FREE SEO IMPROVEMENTS!');
            return { success: true, adminURL: adminURL };
            
          } else {
            console.log(`   ❌ Login appears to have failed`);
            console.log(`   Current URL: ${loginSuccess.currentURL}`);
            console.log(`   Page title: ${loginSuccess.pageTitle}`);
          }
        } else {
          console.log(`   ❌ No WordPress login form found`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error accessing ${adminURL}: ${error.message}`);
      }
    }
    
    console.log('\n🤔 WordPress admin not found with standard URLs');
    console.log('\n💡 ALTERNATIVE APPROACHES:');
    console.log('   1. Check with hosting provider for correct admin URL');
    console.log('   2. Look for custom admin path');
    console.log('   3. Verify if site uses different CMS');
    console.log('   4. Use external SEO strategies (still very effective)');
    
  } catch (error) {
    console.error('❌ Error finding WordPress admin:', error.message);
  } finally {
    await browser.close();
  }
}

findLiveWordPressAdmin().catch(console.error);