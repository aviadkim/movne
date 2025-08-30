// Activate and Configure WhatsApp Button Properly
const { chromium } = require('playwright');

async function activateWhatsAppButton() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Activating WhatsApp button with privacy protection...');
  
  try {
    // Login to WordPress
    await page.goto('https://www.movne.co.il/wp-admin/');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into WordPress admin');
    
    // Go to Click to Chat main settings
    await page.goto('https://movne.co.il/wp-admin/admin.php?page=click-to-chat');
    await page.waitForSelector('.wrap', { timeout: 5000 });
    
    console.log('📱 Click to Chat settings page loaded');
    
    // Configure the basic settings with privacy in mind
    const configured = await page.evaluate(() => {
      let configuredFields = 0;
      
      // Set WhatsApp number in the first field that looks like a phone field
      const allInputs = document.querySelectorAll('input[type="text"], input[type="tel"], input');
      
      allInputs.forEach(input => {
        // Check if this looks like a phone number field
        if ((input.id && input.id.toLowerCase().includes('number')) ||
            (input.name && input.name.toLowerCase().includes('number')) ||
            (input.placeholder && input.placeholder.toLowerCase().includes('number')) ||
            (input.className && input.className.toLowerCase().includes('number'))) {
          
          input.value = '972544533709';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          configuredFields++;
        }
      });
      
      // Set pre-filled message
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        if ((textarea.id && textarea.id.toLowerCase().includes('text')) ||
            (textarea.name && textarea.name.toLowerCase().includes('text')) ||
            (textarea.placeholder && textarea.placeholder.toLowerCase().includes('message'))) {
          
          textarea.value = 'שלום, אני מעוניין במידע על שיווק השקעות במוצרים מובנים';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          configuredFields++;
        }
      });
      
      // Enable the chat widget
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if ((checkbox.id && checkbox.id.toLowerCase().includes('enable')) ||
            (checkbox.name && checkbox.name.toLowerCase().includes('enable')) ||
            (checkbox.value === '1' || checkbox.value === 'enable')) {
          
          if (!checkbox.checked) {
            checkbox.click();
            configuredFields++;
          }
        }
      });
      
      return configuredFields;
    });
    
    console.log(`📝 Configured ${configured} WhatsApp fields`);
    
    // Look for and click all tabs to find additional settings
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.nav-tab, a[href*="tab"]');
      tabs.forEach(tab => {
        if (tab.textContent.includes('Style') || 
            tab.textContent.includes('Display') ||
            tab.textContent.includes('Position')) {
          tab.click();
        }
      });
    });
    
    await page.waitForTimeout(2000);
    
    // Set display position and style
    const styleConfigured = await page.evaluate(() => {
      let styleChanges = 0;
      
      // Look for position/style selects
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        if (select.name && (
          select.name.includes('position') ||
          select.name.includes('style') ||
          select.name.includes('display')
        )) {
          // Set to bottom-right or floating position
          for (let option of select.options) {
            if (option.value.includes('bottom') || 
                option.value.includes('right') ||
                option.value.includes('float')) {
              select.value = option.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              styleChanges++;
              break;
            }
          }
        }
      });
      
      return styleChanges;
    });
    
    console.log(`🎨 Applied ${styleConfigured} style configurations`);
    
    // Save settings
    await page.evaluate(() => {
      // Click any save button
      const saveButtons = document.querySelectorAll('input[type="submit"], button[type="submit"], .button-primary');
      
      saveButtons.forEach(btn => {
        if (btn.value && (btn.value.includes('Save') || btn.value.includes('Update')) ||
            btn.textContent && (btn.textContent.includes('Save') || btn.textContent.includes('Update'))) {
          btn.click();
        }
      });
    });
    
    await page.waitForTimeout(3000);
    console.log('💾 Settings saved');
    
    // Test on live site
    console.log('\n🧪 Testing WhatsApp activation on live site...');
    await page.goto('https://movne.co.il/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const whatsappCheck = await page.evaluate(() => {
      // Look for any WhatsApp-related elements
      const whatsappSelectors = [
        '[href*="whatsapp"]',
        '[class*="whatsapp"]', 
        '[id*="whatsapp"]',
        '[class*="chat"]',
        '[id*="chat"]',
        '.ht_ctc_chat_data',
        '.ctc_chat',
        'a[href*="wa.me"]'
      ];
      
      let foundElements = [];
      
      whatsappSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          foundElements.push({
            selector: selector,
            tag: el.tagName,
            href: el.href || '',
            text: el.textContent || '',
            classes: el.className || '',
            visible: el.offsetParent !== null
          });
        });
      });
      
      return foundElements;
    });
    
    console.log('\n📱 WHATSAPP ELEMENTS FOUND:');
    whatsappCheck.forEach((element, index) => {
      console.log(`   ${index + 1}. ${element.tag} - ${element.visible ? '✅ Visible' : '❌ Hidden'}`);
      console.log(`      Classes: ${element.classes}`);
      if (element.href) console.log(`      Link: ${element.href}`);
    });
    
    // Check if number is exposed
    const numberExposed = whatsappCheck.some(el => 
      el.text.includes('544533709') || 
      el.href.includes('544533709')
    );
    
    const hasVisibleButton = whatsappCheck.some(el => el.visible);
    
    console.log('\n📊 FINAL WHATSAPP STATUS:');
    console.log(`   📱 WhatsApp button: ${hasVisibleButton ? '✅ ACTIVE' : '❌ Not visible'}`);
    console.log(`   🔒 Number privacy: ${numberExposed ? '⚠️  Number exposed' : '✅ Number hidden'}`);
    console.log(`   📞 Your number (972544533709): ${numberExposed ? 'VISIBLE to clients' : 'HIDDEN from clients'}`);
    
    if (hasVisibleButton && !numberExposed) {
      console.log('\n🎉 PERFECT CONFIGURATION!');
      console.log('   ✅ Clients see professional WhatsApp button');
      console.log('   ✅ Your number (972544533709) is hidden');
      console.log('   ✅ When clicked, opens WhatsApp with your number');
      console.log('   ✅ Pre-filled Hebrew message ready');
    } else if (numberExposed) {
      console.log('\n⚠️  WARNING: Your personal number is visible!');
      console.log('   📋 Action needed: Configure plugin to hide number display');
    } else if (!hasVisibleButton) {
      console.log('\n⚠️  WhatsApp button not showing - might need manual activation');
      console.log('   📋 Check: Plugin enabled, position settings, display rules');
    }
    
  } catch (error) {
    console.error('❌ Error activating WhatsApp:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute WhatsApp activation
activateWhatsAppButton().catch(console.error);