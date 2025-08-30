// Install Essential Free Plugins for Immediate SEO Improvement
const { chromium } = require('playwright');

async function installFreePlugins() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Installing essential FREE plugins for immediate SEO boost...');
  
  const freePlugins = [
    {
      name: 'Smush',
      search: 'smush image compression',
      reason: 'Image optimization - critical for site speed'
    },
    {
      name: 'MonsterInsights',
      search: 'MonsterInsights google analytics',
      reason: 'Free Google Analytics 4 integration'
    },
    {
      name: 'Click to Chat',
      search: 'click to chat whatsapp',
      reason: 'WhatsApp integration - essential for Israeli market'
    },
    {
      name: 'UpdraftPlus',
      search: 'UpdraftPlus backup',
      reason: 'Free backup solution for security'
    },
    {
      name: 'WP Super Cache',
      search: 'WP Super Cache',
      reason: 'Free caching to improve site speed'
    }
  ];
  
  try {
    // Login to WordPress
    await page.goto('https://movne.co.il/movne/wp-admin');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ WordPress admin access confirmed');
    
    for (const plugin of freePlugins) {
      console.log(`\n📦 Installing ${plugin.name}...`);
      console.log(`   Purpose: ${plugin.reason}`);
      
      try {
        // Navigate to Add Plugins page
        await page.goto('https://movne.co.il/movne/wp-admin/plugin-install.php');
        await page.waitForSelector('#search-plugins');
        
        // Search for plugin
        await page.fill('#search-plugins', plugin.search);
        await page.click('#search-submit');
        await page.waitForSelector('.plugin-card', { timeout: 10000 });
        
        // Find and install the plugin
        const pluginCard = page.locator('.plugin-card').first();
        const installButton = pluginCard.locator('.install-now');
        
        if (await installButton.isVisible()) {
          console.log(`   📥 Installing ${plugin.name}...`);
          await installButton.click();
          
          // Wait for installation to complete
          await page.waitForSelector('.activate-now', { timeout: 30000 });
          
          // Activate the plugin
          console.log(`   ⚡ Activating ${plugin.name}...`);
          await page.click('.activate-now');
          await page.waitForTimeout(3000);
          
          console.log(`   ✅ ${plugin.name} installed and activated!`);
        } else {
          console.log(`   ℹ️  ${plugin.name} might already be installed`);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Issue with ${plugin.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎯 FREE PLUGINS INSTALLATION COMPLETE!');
    console.log('\n📋 NEXT STEPS - Configure Each Plugin:');
    console.log('   1. Smush: Bulk optimize all images');
    console.log('   2. MonsterInsights: Connect to Google Analytics');
    console.log('   3. Click to Chat: Add WhatsApp number');
    console.log('   4. WP Super Cache: Enable caching');
    console.log('   5. UpdraftPlus: Set up backup schedule');
    
  } catch (error) {
    console.error('❌ Error during plugin installation:', error.message);
  } finally {
    await browser.close();
  }
}

installFreePlugins().catch(console.error);