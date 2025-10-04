const { chromium } = require('playwright');

async function testWordPressAdmin() {
  console.log('Starting WordPress admin test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Set to true if you want to run headless
    slowMo: 1000 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to WordPress login page...');
    await page.goto('https://movne.co.il/wp-login.php');
    
    // Wait for page to load and handle any security verification
    await page.waitForTimeout(3000);
    
    console.log('Page loaded, checking for login fields...');
    
    // Try to find login fields after any security verification
    await page.waitForSelector('input[name="log"], input[id="user_login"], input[type="email"]', { timeout: 15000 });
    
    // Fill in username/email
    const emailField = await page.locator('input[name="log"], input[id="user_login"], input[type="email"]').first();
    await emailField.fill('aviad@kimfo-fs.com');
    console.log('Email field filled');
    
    // Fill in password
    const passwordField = await page.locator('input[name="pwd"], input[id="user_pass"], input[type="password"]').first();
    await passwordField.fill('Kimfo1982');
    console.log('Password field filled');
    
    // Submit the form
    const submitButton = await page.locator('input[type="submit"], button[type="submit"], #wp-submit').first();
    await submitButton.click();
    console.log('Login form submitted');
    
    // Wait for redirect and check if login was successful
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    if (currentUrl.includes('wp-admin')) {
      console.log('✅ Successfully logged into WordPress admin!');
      
      // Try to navigate to add new page
      await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
      await page.waitForTimeout(3000);
      
      console.log('Navigated to new page creation...');
      
      // Check if we can access the page editor
      const titleField = await page.locator('#title, .editor-post-title__input, input[name="post_title"]').first();
      if (await titleField.isVisible()) {
        await titleField.fill('Test Page Created by Claude Code');
        console.log('✅ Successfully created test page title');
        
        // Try to save as draft
        const saveDraftButton = await page.locator('#save-post, .editor-post-save-draft, button:has-text("Save draft")').first();
        if (await saveDraftButton.isVisible()) {
          await saveDraftButton.click();
          console.log('✅ Page saved as draft');
        }
      }
      
    } else {
      console.log('❌ Login failed or redirected to unexpected page');
      console.log('Page title:', await page.title());
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      console.log('Screenshot saved as login-failed.png');
    }
    
  } catch (error) {
    console.error('❌ Error during WordPress admin test:', error);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('Error screenshot saved as error-screenshot.png');
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the test
testWordPressAdmin().catch(console.error);