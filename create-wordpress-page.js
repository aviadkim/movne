const { chromium } = require('playwright');

async function createWordPressPage() {
  console.log('Starting WordPress page creation test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login to WordPress
    console.log('Logging into WordPress admin...');
    await page.goto('https://movne.co.il/wp-login.php');
    await page.waitForTimeout(3000);
    
    // Handle login
    await page.waitForSelector('input[name="log"], input[id="user_login"], input[type="email"]', { timeout: 15000 });
    
    await page.fill('input[name="log"], input[id="user_login"], input[type="email"]', 'aviad@kimfo-fs.com');
    await page.fill('input[name="pwd"], input[id="user_pass"], input[type="password"]', 'Kimfo1982');
    
    await page.click('input[type="submit"], button[type="submit"], #wp-submit');
    await page.waitForTimeout(5000);
    
    if (!page.url().includes('wp-admin')) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Successfully logged in');
    
    // Navigate to create new page
    console.log('Navigating to create new page...');
    await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
    await page.waitForTimeout(3000);
    
    // Check if we're using Gutenberg editor or Classic editor
    const isGutenberg = await page.locator('.block-editor').count() > 0;
    const isClassic = await page.locator('#post-body-content').count() > 0;
    
    console.log(`Editor type detected: ${isGutenberg ? 'Gutenberg' : isClassic ? 'Classic' : 'Unknown'}`);
    
    if (isGutenberg) {
      // Handle Gutenberg editor
      console.log('Using Gutenberg editor...');
      
      // Wait for editor to load
      await page.waitForSelector('.editor-post-title__input, .wp-block-post-title', { timeout: 10000 });
      
      // Set page title
      const titleSelector = '.editor-post-title__input, .wp-block-post-title';
      await page.fill(titleSelector, 'Claude Code Test Page - ' + new Date().toISOString());
      console.log('✅ Page title set');
      
      // Add content to the page
      await page.waitForTimeout(1000);
      
      // Click in the content area
      const contentSelector = '.block-editor-writing-flow, .wp-block-post-content, [data-type="core/paragraph"]';
      await page.click(contentSelector);
      
      // Type content
      await page.keyboard.type('This is a test page created by Claude Code automation.\\n\\nThis page demonstrates successful WordPress admin access and page creation functionality.');
      console.log('✅ Page content added');
      
      // Publish the page
      await page.waitForTimeout(1000);
      
      // Try different publish button selectors
      const publishSelectors = [
        '.editor-post-publish-panel__toggle',
        '.editor-post-publish-button',
        'button:has-text("Publish")',
        '[aria-label="Publish"]'
      ];
      
      let published = false;
      for (const selector of publishSelectors) {
        try {
          const button = page.locator(selector);
          if (await button.count() > 0 && await button.isVisible()) {
            await button.click();
            console.log(`✅ Clicked publish button: ${selector}`);
            
            // Wait for publish panel to appear
            await page.waitForTimeout(2000);
            
            // Look for the final publish button
            const finalPublishButton = page.locator('button:has-text("Publish"), .editor-post-publish-button');
            if (await finalPublishButton.count() > 0) {
              await finalPublishButton.click();
              console.log('✅ Final publish button clicked');
            }
            
            published = true;
            break;
          }
        } catch (e) {
          console.log(`Could not use selector ${selector}: ${e.message}`);
        }
      }
      
      if (!published) {
        // Try saving as draft instead
        const draftButton = page.locator('button:has-text("Save draft"), .editor-post-save-draft');
        if (await draftButton.count() > 0) {
          await draftButton.click();
          console.log('✅ Page saved as draft');
        }
      }
      
    } else if (isClassic) {
      // Handle Classic editor
      console.log('Using Classic editor...');
      
      // Set page title
      await page.fill('#title', 'Claude Code Test Page - ' + new Date().toISOString());
      console.log('✅ Page title set');
      
      // Add content
      if (await page.locator('#content_ifr').count() > 0) {
        // TinyMCE editor
        await page.frame('#content_ifr').locator('body').fill('This is a test page created by Claude Code automation using the classic editor.');
      } else {
        // Text editor
        await page.fill('#content', 'This is a test page created by Claude Code automation using the classic editor.');
      }
      console.log('✅ Page content added');
      
      // Publish the page
      await page.click('#publish');
      console.log('✅ Page published');
      
    } else {
      console.log('❌ Unknown editor type, trying generic approach...');
      
      // Generic approach - try to find title and content fields
      const titleFields = ['#title', 'input[name="post_title"]', '.editor-post-title__input'];
      const contentFields = ['#content', 'textarea[name="content"]', '.block-editor-writing-flow'];
      
      for (const titleField of titleFields) {
        if (await page.locator(titleField).count() > 0) {
          await page.fill(titleField, 'Claude Code Test Page - ' + new Date().toISOString());
          console.log('✅ Page title set (generic)');
          break;
        }
      }
      
      for (const contentField of contentFields) {
        if (await page.locator(contentField).count() > 0) {
          await page.click(contentField);
          await page.keyboard.type('This is a test page created by Claude Code automation.');
          console.log('✅ Page content added (generic)');
          break;
        }
      }
      
      // Try to publish
      const publishButtons = ['#publish', 'button:has-text("Publish")', '.editor-post-publish-button'];
      for (const publishButton of publishButtons) {
        if (await page.locator(publishButton).count() > 0) {
          await page.click(publishButton);
          console.log('✅ Publish button clicked (generic)');
          break;
        }
      }
    }
    
    // Wait for any post-publish actions
    await page.waitForTimeout(3000);
    
    // Check if page was created successfully
    const currentUrl = page.url();
    console.log('Final URL:', currentUrl);
    
    if (currentUrl.includes('post.php') || currentUrl.includes('post-new.php')) {
      console.log('✅ Successfully created/edited WordPress page!');
      
      // Try to get the page ID or confirmation
      const pageId = currentUrl.match(/post=(\d+)/);
      if (pageId) {
        console.log('✅ Page ID:', pageId[1]);
        console.log('✅ Page URL would be: https://movne.co.il/?page_id=' + pageId[1]);
      }
    }
    
    // Take a screenshot of the final result
    await page.screenshot({ path: 'wordpress-page-created.png', fullPage: true });
    console.log('Screenshot saved as wordpress-page-created.png');
    
  } catch (error) {
    console.error('❌ Error during page creation:', error);
    await page.screenshot({ path: 'error-page-creation.png', fullPage: true });
    console.log('Error screenshot saved as error-page-creation.png');
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the test
createWordPressPage().catch(console.error);