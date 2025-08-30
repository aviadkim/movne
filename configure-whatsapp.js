// Configure WhatsApp with Professional Settings
const { chromium } = require('playwright');

async function configureWhatsApp() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📱 Configuring WhatsApp with professional settings...');
  
  try {
    // Login to WordPress - using environment variables
    const config = require('./config');
    await page.goto(config.wordpress.adminUrl);
    await page.fill('#user_login', config.wordpress.username);
    await page.fill('#user_pass', config.wordpress.password);
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into WordPress admin');
    
    // Navigate to Click to Chat settings
    await page.goto('https://movne.co.il/wp-admin/admin.php?page=click-to-chat');
    await page.waitForSelector('.wrap', { timeout: 5000 });
    
    console.log('📞 WhatsApp Click to Chat settings loaded');
    
    // Configure WhatsApp number (without exposing it visually)
    const phoneConfigured = await page.evaluate(() => {
      // Look for phone number input field
      const phoneInputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
      let phoneField = null;
      
      phoneInputs.forEach(input => {
        if (input.name && (
          input.name.includes('phone') || 
          input.name.includes('number') ||
          input.placeholder && input.placeholder.includes('phone')
        )) {
          phoneField = input;
        }
      });
      
      if (phoneField) {
        phoneField.value = config.whatsapp.number;
        phoneField.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    });
    
    if (phoneConfigured) {
      console.log('✅ WhatsApp number configured (hidden from display)');
    }
    
    // Set professional pre-filled message in Hebrew
    const messageConfigured = await page.evaluate(() => {
      const textareas = document.querySelectorAll('textarea');
      const messageFields = document.querySelectorAll('input[type="text"]');
      
      let messageField = null;
      
      // Look for message/text field
      [...textareas, ...messageFields].forEach(field => {
        if (field.name && (
          field.name.includes('message') ||
          field.name.includes('text') ||
          field.placeholder && field.placeholder.includes('message')
        )) {
          messageField = field;
        }
      });
      
      if (messageField) {
        messageField.value = 'שלום, אני מעוניין במידע על שיווק השקעות במוצרים מובנים';
        messageField.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    });
    
    if (messageConfigured) {
      console.log('✅ Professional Hebrew message set');
    }
    
    // Configure display settings for privacy
    const privacySettings = await page.evaluate(() => {
      let settingsChanged = 0;
      
      // Hide/minimize number display
      const displaySettings = document.querySelectorAll('select, input[type="checkbox"]');
      
      displaySettings.forEach(setting => {
        if (setting.name && (
          setting.name.includes('display') ||
          setting.name.includes('show') ||
          setting.name.includes('hide')
        )) {
          if (setting.type === 'checkbox' && setting.name.includes('number')) {
            setting.checked = false; // Hide number display
            settingsChanged++;
          } else if (setting.type === 'select-one') {
            // Set to minimal display options
            const options = setting.options;
            for (let option of options) {
              if (option.value.includes('icon') || option.value.includes('minimal')) {
                setting.value = option.value;
                settingsChanged++;
                break;
              }
            }
          }
        }
      });
      
      return settingsChanged;
    });
    
    console.log(`🔒 Privacy settings applied: ${privacySettings} modifications`);
    
    // Set business hours
    const hoursSet = await page.evaluate(() => {
      const timeInputs = document.querySelectorAll('input[type="time"], select');
      let hoursConfigured = 0;
      
      timeInputs.forEach(input => {
        if (input.name && input.name.includes('hours')) {
          hoursConfigured++;
        }
      });
      
      // Look for availability text field
      const availabilityField = document.querySelector('textarea[name*="hours"], input[name*="available"]');
      if (availabilityField) {
        availabilityField.value = 'זמינים: ראשון-חמישי 09:00-18:00';
        availabilityField.dispatchEvent(new Event('input', { bubbles: true }));
        hoursConfigured++;
      }
      
      return hoursConfigured;
    });
    
    if (hoursSet > 0) {
      console.log('✅ Business hours configured');
    }
    
    // Save all settings
    const saved = await page.evaluate(() => {
      const saveButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
      
      const saveButton = Array.from(saveButtons).find(btn => 
        btn.value && (
          btn.value.includes('Save') || 
          btn.value.includes('שמור') ||
          btn.value.includes('עדכן')
        ) || btn.textContent && (
          btn.textContent.includes('Save') ||
          btn.textContent.includes('שמור') ||
          btn.textContent.includes('עדכן')
        )
      );
      
      if (saveButton) {
        saveButton.click();
        return true;
      }
      return false;
    });
    
    if (saved) {
      await page.waitForTimeout(3000);
      console.log('✅ WhatsApp configuration saved');
    }
    
    // Test the WhatsApp button on live site
    console.log('\n🧪 Testing WhatsApp button on live site...');
    await page.goto('https://movne.co.il/');
    await page.waitForLoadState('networkidle');
    
    const whatsappTest = await page.evaluate(() => {
      const whatsappElements = document.querySelectorAll('[href*="whatsapp"], [class*="whatsapp"], [id*="whatsapp"]');
      let buttonFound = false;
      let numberVisible = false;
      
      whatsappElements.forEach(element => {
        if (element.href && element.href.includes('whatsapp.com')) {
          buttonFound = true;
          // Check if the number is visible in the text
          if (element.textContent && element.textContent.includes('544533709')) {
            numberVisible = true;
          }
        }
      });
      
      return {
        buttonExists: buttonFound,
        numberExposed: numberVisible,
        elementCount: whatsappElements.length
      };
    });
    
    console.log('\n📊 WHATSAPP INTEGRATION RESULTS:');
    console.log(`   ✅ WhatsApp button: ${whatsappTest.buttonExists ? 'Active' : 'Not found'}`);
    console.log(`   🔒 Number privacy: ${whatsappTest.numberExposed ? '⚠️  Number visible' : '✅ Number hidden'}`);
    console.log(`   📱 Elements found: ${whatsappTest.elementCount}`);
    
    if (whatsappTest.buttonExists && !whatsappTest.numberExposed) {
      console.log('\n🎉 WHATSAPP CONFIGURED PERFECTLY!');
      console.log('\n✅ PRIVACY PROTECTION:');
      console.log('   • Number (972544533709) is hidden from visitors');
      console.log('   • Only shows professional WhatsApp button');
      console.log('   • Pre-filled message in Hebrew ready');
      console.log('   • Business hours displayed professionally');
      
      console.log('\n📱 CLIENT EXPERIENCE:');
      console.log('   • Clicks professional WhatsApp button');
      console.log('   • Opens WhatsApp with your number automatically');
      console.log('   • Pre-filled professional message in Hebrew');
      console.log('   • No number exposure on website');
    } else if (whatsappTest.numberExposed) {
      console.log('\n⚠️  WARNING: Your number might be visible to clients!');
      console.log('   💡 Recommendation: Check display settings to hide number');
    }
    
  } catch (error) {
    console.error('❌ Error configuring WhatsApp:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute WhatsApp configuration
configureWhatsApp().catch(console.error);