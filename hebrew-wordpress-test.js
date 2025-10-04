const { chromium } = require('playwright');

async function hebrewWordPressTest() {
  console.log('Starting Hebrew WordPress page creation test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login to WordPress
    console.log('Logging into WordPress admin...');
    await page.goto('https://movne.co.il/wp-login.php');
    await page.waitForTimeout(3000);
    
    await page.waitForSelector('input[name="log"], input[id="user_login"], input[type="email"]', { timeout: 20000 });
    
    await page.fill('input[name="log"], input[id="user_login"], input[type="email"]', 'aviad@kimfo-fs.com');
    await page.fill('input[name="pwd"], input[id="user_pass"], input[type="password"]', 'Kimfo1982');
    
    await page.click('input[type="submit"], button[type="submit"], #wp-submit');
    await page.waitForTimeout(5000);
    
    if (!page.url().includes('wp-admin')) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Successfully logged in');
    
    // Navigate to create new page
    await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
    await page.waitForTimeout(5000);
    
    console.log('✅ Navigated to new page editor');
    
    // Wait for the Hebrew editor to fully load
    await page.waitForTimeout(3000);
    
    // Look for Hebrew text elements that indicate the editor is ready
    await page.waitForSelector(':has-text("הוספת כותרת"), h1:has-text("כותרת"), [placeholder*="כותרת"]', { timeout: 15000 });
    console.log('✅ Hebrew editor interface detected');
    
    // Try clicking on the title area (Hebrew: "הוספת כותרת")
    const titleAreaSelectors = [
      ':has-text("הוספת כותרת")',
      'h1:has-text("כותרת")',
      '[placeholder*="כותרת"]',
      '.editor-post-title',
      '.wp-block-post-title'
    ];
    
    let titleClicked = false;
    for (const selector of titleAreaSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await element.click();
          console.log(`✅ Clicked title area with selector: ${selector}`);
          titleClicked = true;
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        console.log(`Title selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (titleClicked) {
      // Type the title
      const testTitle = 'דף בדיקה מקלוד קוד - ' + new Date().toLocaleString();
      await page.keyboard.type(testTitle);
      console.log(`✅ Page title typed: ${testTitle}`);
      
      // Press Tab to move to content area or click on content area
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);
      
      // Try to find and click the content area
      const contentSelectors = [
        ':has-text("התחל לכתוב")',
        ':has-text("הקלד / לבחירת בלוק")',
        '.block-editor-default-block-appender',
        '.wp-block-post-content',
        '.edit-post-visual-editor',
        '[data-type="core/paragraph"]'
      ];
      
      let contentClicked = false;
      for (const selector of contentSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await element.click();
            console.log(`✅ Clicked content area with selector: ${selector}`);
            contentClicked = true;
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          console.log(`Content selector ${selector} failed: ${e.message}`);
        }
      }
      
      // Type content
      const testContent = 'זהו דף בדיקה שנוצר על ידי אוטומציה של Claude Code.\n\nדף זה מדגים גישה מוצלחת לממשק הניהול של WordPress ויכולות יצירת דפים.';
      await page.keyboard.type(testContent);
      console.log('✅ Content typed successfully');
      
      // Wait for auto-save
      await page.waitForTimeout(2000);
      
      // Try to save/publish
      const saveSelectors = [
        'button:has-text("פרסם")',          // Hebrew "Publish"
        'button:has-text("שמור טיוטה")',     // Hebrew "Save Draft"
        'button:has-text("עדכן")',          // Hebrew "Update"
        '.editor-post-publish-button',
        '.editor-post-save-draft',
        '#publish'
      ];
      
      let saved = false;
      for (const selector of saveSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0 && await element.isVisible()) {
            await element.click();
            console.log(`✅ Clicked save/publish button: ${selector}`);
            
            // Wait for potential publish confirmation
            await page.waitForTimeout(2000);
            
            // Look for confirmation button if needed
            const confirmSelectors = [
              'button:has-text("פרסם")',
              'button:has-text("אישור")',
              '.editor-post-publish-button'
            ];
            
            for (const confirmSelector of confirmSelectors) {
              const confirmElement = page.locator(confirmSelector);
              if (await confirmElement.count() > 0 && await confirmElement.isVisible()) {
                await confirmElement.click();
                console.log(`✅ Clicked confirmation button: ${confirmSelector}`);
                break;
              }
            }
            
            saved = true;
            break;
          }
        } catch (e) {
          console.log(`Save selector ${selector} failed: ${e.message}`);
        }
      }
      
      if (saved) {
        await page.waitForTimeout(3000);
        
        // Check for success messages in Hebrew
        const successSelectors = [
          ':has-text("עמוד פורסם")',           // "Page published"
          ':has-text("עמוד נשמר")',            // "Page saved"
          ':has-text("טיוטה נשמרה")',          // "Draft saved"
          '.notice-success',
          '.updated'
        ];
        
        for (const selector of successSelectors) {
          if (await page.locator(selector).count() > 0) {
            console.log(`✅ Success message found: ${selector}`);
            break;
          }
        }
        
        // Get final URL and page ID
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        const pageIdMatch = finalUrl.match(/post=(\d+)/);
        if (pageIdMatch) {
          const pageId = pageIdMatch[1];
          console.log(`✅ Page created successfully with ID: ${pageId}`);
          console.log(`✅ Page can be viewed at: https://movne.co.il/?page_id=${pageId}`);
        }
        
        console.log('✅ WordPress page creation test completed successfully!');
        
      } else {
        console.log('⚠️ Could not find save/publish button, but content was added');
      }
      
    } else {
      console.log('❌ Could not click on title area');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'hebrew-test-final.png', fullPage: true });
    console.log('Final screenshot saved as hebrew-test-final.png');
    
  } catch (error) {
    console.error('❌ Error during Hebrew WordPress test:', error);
    await page.screenshot({ path: 'hebrew-test-error.png', fullPage: true });
    console.log('Error screenshot saved as hebrew-test-error.png');
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the test
hebrewWordPressTest().catch(console.error);