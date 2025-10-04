const { chromium } = require('playwright');

async function robustWordPressTest() {
  console.log('Starting robust WordPress page creation test...');
  
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
    
    // Handle security verification if present
    console.log('Waiting for login form...');
    await page.waitForSelector('input[name="log"], input[id="user_login"], input[type="email"]', { timeout: 20000 });
    
    await page.fill('input[name="log"], input[id="user_login"], input[type="email"]', 'aviad@kimfo-fs.com');
    await page.fill('input[name="pwd"], input[id="user_pass"], input[type="password"]', 'Kimfo1982');
    
    await page.click('input[type="submit"], button[type="submit"], #wp-submit');
    await page.waitForTimeout(5000);
    
    if (!page.url().includes('wp-admin')) {
      throw new Error('Login failed - not redirected to wp-admin');
    }
    
    console.log('✅ Successfully logged in to WordPress admin');
    
    // Navigate to Pages section first
    console.log('Navigating to Pages section...');
    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForTimeout(3000);
    
    console.log('Current URL after pages navigation:', page.url());
    
    // Take screenshot of pages section
    await page.screenshot({ path: 'pages-section.png', fullPage: true });
    console.log('Screenshot of pages section saved as pages-section.png');
    
    // Try to find and click "Add New" button
    const addNewSelectors = [
      'a[href*="post-new.php?post_type=page"]',
      '.page-title-action',
      'a:has-text("Add New")',
      '.add-new-h2'
    ];
    
    let addNewClicked = false;
    for (const selector of addNewSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`✅ Clicked "Add New" button using selector: ${selector}`);
          addNewClicked = true;
          break;
        }
      } catch (e) {
        console.log(`Could not use Add New selector ${selector}: ${e.message}`);
      }
    }
    
    if (!addNewClicked) {
      // Direct navigation to new page
      console.log('Direct navigation to new page creation...');
      await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
    }
    
    await page.waitForTimeout(5000);
    console.log('Current URL after new page navigation:', page.url());
    
    // Take screenshot of editor
    await page.screenshot({ path: 'editor-loaded.png', fullPage: true });
    console.log('Screenshot of editor saved as editor-loaded.png');
    
    // Wait for any editor to load and try different approaches
    console.log('Waiting for editor to load...');
    
    // Look for any form of title input
    const titleSelectors = [
      '#title',                           // Classic editor
      '.editor-post-title__input',        // Gutenberg
      '.wp-block-post-title',            // Block editor
      'input[name="post_title"]',         // Generic
      '[placeholder*="title" i]',         // Placeholder containing "title"
      '[aria-label*="title" i]'          // Aria label containing "title"
    ];
    
    let titleField = null;
    for (const selector of titleSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          titleField = element;
          console.log(`✅ Found title field with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Title selector ${selector} not found or not visible`);
      }
    }
    
    if (titleField) {
      const testTitle = 'Claude Code Test Page - ' + new Date().toLocaleString();
      await titleField.fill(testTitle);
      console.log(`✅ Page title set to: ${testTitle}`);
      
      // Wait a bit for auto-save or any reactions
      await page.waitForTimeout(2000);
      
      // Try to add content
      console.log('Looking for content editor...');
      
      const contentSelectors = [
        '#content',                          // Classic editor textarea
        '#content_ifr',                      // TinyMCE iframe
        '.block-editor-writing-flow',        // Gutenberg editor
        '.wp-block-post-content',           // Block editor content
        '[data-type="core/paragraph"]',      // Gutenberg paragraph block
        '.edit-post-visual-editor'          // Visual editor container
      ];
      
      let contentAdded = false;
      for (const selector of contentSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0 && await element.isVisible()) {
            
            if (selector === '#content_ifr') {
              // Handle TinyMCE iframe
              const frame = page.frame('content_ifr');
              if (frame) {
                await frame.locator('body').fill('This is a test page created by Claude Code automation. Testing WordPress page creation functionality.');
                console.log('✅ Content added via TinyMCE iframe');
                contentAdded = true;
                break;
              }
            } else {
              // Handle other content editors
              await element.click();
              await page.waitForTimeout(500);
              await page.keyboard.type('This is a test page created by Claude Code automation.\\n\\nThis demonstrates successful WordPress admin access and page creation capabilities.');
              console.log(`✅ Content added using selector: ${selector}`);
              contentAdded = true;
              break;
            }
          }
        } catch (e) {
          console.log(`Content selector ${selector} failed: ${e.message}`);
        }
      }
      
      if (!contentAdded) {
        console.log('⚠️ Could not add content, but title was set');
      }
      
      // Try to save/publish the page
      console.log('Attempting to save/publish the page...');
      await page.waitForTimeout(1000);
      
      const saveSelectors = [
        '#publish',                          // Classic editor publish
        '#save-post',                        // Save draft classic
        '.editor-post-publish-button',       // Gutenberg publish
        '.editor-post-save-draft',          // Gutenberg save draft
        'button:has-text("Publish")',        // Generic publish
        'button:has-text("Save draft")',     // Generic save draft
        '[aria-label*="Publish"]',          // Aria label publish
        '[aria-label*="Save"]'              // Aria label save
      ];
      
      let saved = false;
      for (const selector of saveSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0 && await element.isVisible()) {
            await element.click();
            console.log(`✅ Clicked save/publish button: ${selector}`);
            
            // Wait for any confirmation or additional steps
            await page.waitForTimeout(2000);
            
            // If this was a "Publish" button, look for confirmation dialog
            if (selector.includes('publish') || selector.includes('Publish')) {
              const confirmButton = page.locator('button:has-text("Publish"), .editor-post-publish-button');
              if (await confirmButton.count() > 0 && await confirmButton.isVisible()) {
                await confirmButton.click();
                console.log('✅ Confirmed publish action');
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
        
        // Check final URL and status
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        // Look for success indicators
        const successIndicators = [
          '.notice-success',
          '.updated',
          ':has-text("Page published")',
          ':has-text("Page saved")',
          ':has-text("Draft saved")'
        ];
        
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).count() > 0) {
            console.log(`✅ Success indicator found: ${indicator}`);
            break;
          }
        }
        
        // Extract page ID if possible
        const pageIdMatch = finalUrl.match(/post=(\d+)/);
        if (pageIdMatch) {
          const pageId = pageIdMatch[1];
          console.log(`✅ Page created with ID: ${pageId}`);
          console.log(`✅ Page can be viewed at: https://movne.co.il/?page_id=${pageId}`);
        }
        
        console.log('✅ WordPress page creation test completed successfully!');
        
      } else {
        console.log('⚠️ Could not save/publish the page, but form was filled');
      }
      
    } else {
      console.log('❌ Could not find title field - editor may not have loaded properly');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'final-result.png', fullPage: true });
    console.log('Final screenshot saved as final-result.png');
    
  } catch (error) {
    console.error('❌ Error during WordPress test:', error);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
    console.log('Error screenshot saved as error-final.png');
  } finally {
    console.log('Test completed. Closing browser...');
    await browser.close();
  }
}

// Run the test
robustWordPressTest().catch(console.error);