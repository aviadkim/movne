// QUICK SITE CHECK - Simple verification of movne.co.il
const { chromium } = require('playwright');

async function quickSiteCheck() {
  console.log('🔍 QUICK CHECK: Testing movne.co.il accessibility...');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const page = await browser.newPage();
    
    // Set longer timeout
    page.setDefaultTimeout(30000);
    
    console.log('📡 Attempting to load movne.co.il...');
    
    try {
      const response = await page.goto('https://movne.co.il', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      console.log(`✅ Site response: ${response.status()}`);
      
      // Wait a bit for content to load
      await page.waitForTimeout(5000);
      
      // Basic check
      const basicInfo = await page.evaluate(() => {
        return {
          title: document.title || 'No title',
          hasContent: document.body ? document.body.textContent.length : 0,
          url: window.location.href,
          readyState: document.readyState
        };
      });
      
      console.log(`📄 Page title: ${basicInfo.title}`);
      console.log(`📝 Content length: ${basicInfo.hasContent} characters`);
      console.log(`🌐 Current URL: ${basicInfo.url}`);
      console.log(`⚡ Ready state: ${basicInfo.readyState}`);
      
      // Quick WhatsApp check
      const whatsappExists = await page.evaluate(() => {
        const whatsappElements = document.querySelectorAll('[href*="whatsapp"], [class*="whatsapp"], [id*="whatsapp"]');
        return whatsappElements.length > 0;
      });
      
      console.log(`📱 WhatsApp elements: ${whatsappExists ? 'Found' : 'Not found'}`);
      
      // Check for Hebrew content
      const hasHebrew = await page.evaluate(() => {
        return document.body.textContent.includes('ו') || 
               document.body.textContent.includes('ה') ||
               document.body.textContent.includes('מ');
      });
      
      console.log(`🇮🇱 Hebrew content: ${hasHebrew ? 'Yes' : 'No'}`);
      
      // Check main navigation
      const navCheck = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.slice(0, 10).map(link => ({
          text: link.textContent?.trim() || '',
          href: link.href || ''
        })).filter(link => link.text.length > 0);
      });
      
      console.log('\n🧭 Navigation links found:');
      navCheck.slice(0, 5).forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.text} → ${link.href}`);
      });
      
      console.log('\n✅ BASIC SITE CHECK COMPLETE');
      
    } catch (loadError) {
      console.log(`❌ Failed to load site: ${loadError.message}`);
      
      // Try alternative URLs
      const alternativeUrls = [
        'https://www.movne.co.il',
        'http://movne.co.il',
        'http://www.movne.co.il'
      ];
      
      console.log('\n🔄 Trying alternative URLs...');
      
      for (const url of alternativeUrls) {
        try {
          console.log(`   Testing: ${url}`);
          const response = await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
          });
          console.log(`   ✅ ${url} - Status: ${response.status()}`);
          
          const title = await page.evaluate(() => document.title);
          console.log(`   📄 Title: ${title}`);
          break;
          
        } catch (altError) {
          console.log(`   ❌ ${url} - Failed: ${altError.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Browser error:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute quick check
quickSiteCheck().catch(console.error);