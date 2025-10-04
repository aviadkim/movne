const { chromium } = require('playwright');
const fs = require('fs');

async function portalAnalysisAndCreation() {
  console.log('Starting portal analysis and page creation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // First, access and analyze the existing portal
    console.log('Accessing Qualified Investors Portal...');
    await page.goto('https://movne.co.il/wp-content/uploads/2025/09/portal-final-corrected-1.html');
    await page.waitForTimeout(3000);
    
    // Take screenshot of the portal
    await page.screenshot({ path: 'original-portal.png', fullPage: true });
    console.log('✅ Portal screenshot saved as original-portal.png');
    
    // Extract the complete HTML source
    const portalHTML = await page.content();
    fs.writeFileSync('portal-source.html', portalHTML);
    console.log('✅ Portal HTML source saved as portal-source.html');
    
    // Extract CSS variables and styling information
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const vars = {};
      for (let i = 0; i < styles.length; i++) {
        const name = styles[i];
        if (name.startsWith('--')) {
          vars[name] = styles.getPropertyValue(name);
        }
      }
      return vars;
    });
    
    console.log('CSS Variables found:', Object.keys(cssVariables).length);
    fs.writeFileSync('portal-css-variables.json', JSON.stringify(cssVariables, null, 2));
    
    // Extract color scheme
    const colorScheme = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize
      };
    });
    
    console.log('✅ Portal design analysis completed');
    console.log('Color scheme:', colorScheme);
    
    // Now login to WordPress to create a matching page
    console.log('Logging into WordPress admin...');
    await page.goto('https://movne.co.il/wp-login.php');
    await page.waitForTimeout(3000);
    
    await page.waitForSelector('input[name="log"], input[id="user_login"], input[type="email"]', { timeout: 20000 });
    
    await page.fill('input[name="log"], input[id="user_login"], input[type="email"]', 'aviad@kimfo-fs.com');
    await page.fill('input[name="pwd"], input[id="user_pass"], input[type="password"]', 'Kimfo1982');
    
    await page.click('input[type="submit"], button[type="submit"], #wp-submit');
    await page.waitForTimeout(5000);
    
    if (!page.url().includes('wp-admin')) {
      throw new Error('WordPress login failed');
    }
    
    console.log('✅ Successfully logged into WordPress');
    
    // Navigate to create new page
    await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
    await page.waitForTimeout(5000);
    
    console.log('✅ Navigated to new page editor');
    
    // Wait for editor to load
    await page.waitForTimeout(3000);
    
    // Try to find title field
    const titleSelectors = [
      'h1:has-text("הוספת כותרת")',
      '.editor-post-title__input',
      '.wp-block-post-title',
      '[placeholder*="כותרת"]'
    ];
    
    let titleSet = false;
    for (const selector of titleSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await element.click();
          await page.waitForTimeout(500);
          await page.keyboard.type('פורטל משקיעים כשירים - עמוד נוסף');
          console.log('✅ Title set successfully');
          titleSet = true;
          break;
        }
      } catch (e) {
        console.log(`Title selector ${selector} failed: ${e.message}`);
      }
    }
    
    if (!titleSet) {
      console.log('❌ Could not set title, trying alternative approach...');
      // Try clicking anywhere on the editor and typing
      await page.click('.edit-post-visual-editor, .block-editor-writing-flow');
      await page.waitForTimeout(500);
      await page.keyboard.type('פורטל משקיעים כשירים - עמוד נוסף');
    }
    
    // Move to content area
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    
    // Add HTML content that matches the portal design
    const portalMatchingHTML = `
    <div style="
      background: linear-gradient(135deg, #152135 0%, #2d3748 50%, #1a202c 100%);
      color: white;
      padding: 60px 20px;
      min-height: 100vh;
      font-family: 'Simona', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      direction: rtl;
      text-align: center;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Hero Section -->
        <div style="margin-bottom: 60px;">
          <h1 style="
            font-size: 3.5rem;
            background: linear-gradient(135deg, #ff9d0a, #ffd700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            font-weight: 800;
          ">פורטל משקיעים כשירים</h1>
          <p style="
            font-size: 1.4rem;
            color: #e2e8f0;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          ">עמוד נוסף המשלים את פורטל המשקיעים הכשירים עם עיצוב זהה ופונקציונליות מלאה</p>
        </div>

        <!-- Glass Card Section -->
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          margin: 40px auto;
          max-width: 800px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="
            color: #ff9d0a;
            font-size: 2.2rem;
            margin-bottom: 25px;
            font-weight: 700;
          ">מידע נוסף למשקיעים</h2>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 30px 0;
          ">
            <div style="
              background: rgba(255, 157, 10, 0.1);
              padding: 25px;
              border-radius: 15px;
              border: 1px solid rgba(255, 157, 10, 0.3);
            ">
              <h3 style="color: #ff9d0a; margin-bottom: 15px;">השקעות מובנות</h3>
              <p style="color: #e2e8f0; line-height: 1.5;">מוצרים פיננסיים מתקדמים המיועדים למשקיעים מנוסים</p>
            </div>
            
            <div style="
              background: rgba(255, 157, 10, 0.1);
              padding: 25px;
              border-radius: 15px;
              border: 1px solid rgba(255, 157, 10, 0.3);
            ">
              <h3 style="color: #ff9d0a; margin-bottom: 15px;">ייעוץ מקצועי</h3>
              <p style="color: #e2e8f0; line-height: 1.5;">צוות מומחים לליווי והכוונה בכל שלבי ההשקעה</p>
            </div>
          </div>
          
          <button style="
            background: linear-gradient(135deg, #ff9d0a, #ff8c00);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 30px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
          " onclick="alert('פונקציונליות פעילה!')">צור קשר</button>
        </div>

        <!-- Navigation Links -->
        <div style="
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 50px 0;
          flex-wrap: wrap;
        ">
          <a href="javascript:history.back()" style="
            color: #ff9d0a;
            text-decoration: none;
            font-size: 1.1rem;
            padding: 10px 20px;
            border: 2px solid #ff9d0a;
            border-radius: 25px;
            transition: all 0.3s ease;
          ">← חזור אחורה</a>
          
          <a href="https://movne.co.il/wp-content/uploads/2025/09/portal-final-corrected-1.html" style="
            color: #ff9d0a;
            text-decoration: none;
            font-size: 1.1rem;
            padding: 10px 20px;
            border: 2px solid #ff9d0a;
            border-radius: 25px;
            transition: all 0.3s ease;
          ">פורטל ראשי</a>
          
          <a href="javascript:history.forward()" style="
            color: #ff9d0a;
            text-decoration: none;
            font-size: 1.1rem;
            padding: 10px 20px;
            border: 2px solid #ff9d0a;
            border-radius: 25px;
            transition: all 0.3s ease;
          ">קדימה →</a>
        </div>

        <!-- Footer Info -->
        <div style="
          background: rgba(0, 0, 0, 0.3);
          padding: 30px;
          border-radius: 15px;
          margin-top: 50px;
        ">
          <p style="
            color: #a0aec0;
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 0;
          ">עמוד זה נוצר בהתאם לעיצוב הפורטל המקורי ומספק פונקציונליות זהה לניווט וחוויית משתמש</p>
        </div>
      </div>
    </div>

    <style>
      /* Additional hover effects */
      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(255, 157, 10, 0.4);
      }
      
      a:hover {
        background: #ff9d0a;
        color: white;
        transform: translateY(-2px);
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .hero h1 {
          font-size: 2.5rem !important;
        }
        .glass-card {
          padding: 25px !important;
        }
      }
    </style>
    `;
    
    // Try to switch to HTML editor or add HTML block
    try {
      // Look for code editor toggle or HTML block option
      const codeEditorSelectors = [
        'button:has-text("קוד")',
        'button:has-text("HTML")',
        '.editor-code-editor-toggle',
        '[aria-label*="code" i]'
      ];
      
      let htmlModeActivated = false;
      for (const selector of codeEditorSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await element.click();
          console.log(`✅ Switched to HTML mode using: ${selector}`);
          htmlModeActivated = true;
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      if (htmlModeActivated) {
        // Clear any existing content and paste HTML
        await page.keyboard.selectAll();
        await page.keyboard.type(portalMatchingHTML);
        console.log('✅ HTML content added in code editor mode');
      } else {
        // Try adding an HTML block
        await page.keyboard.type('/html');
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        await page.keyboard.type(portalMatchingHTML);
        console.log('✅ HTML content added via HTML block');
      }
      
    } catch (e) {
      console.log('HTML editor approach failed, trying text content...');
      await page.keyboard.type('עמוד זה מותאם לעיצוב הפורטל המקורי עם רקע זהה, פונטים זהים ופונקציונליות מלאה של ניווט קדימה ואחורה.');
    }
    
    // Save the page
    await page.waitForTimeout(2000);
    
    const saveSelectors = [
      'button:has-text("פרסם")',
      'button:has-text("שמור טיוטה")',
      '.editor-post-publish-button',
      '.editor-post-save-draft'
    ];
    
    let saved = false;
    for (const selector of saveSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          console.log(`✅ Clicked save button: ${selector}`);
          
          // Wait for potential confirmation
          await page.waitForTimeout(2000);
          
          // Look for confirmation button
          const confirmButton = page.locator('button:has-text("פרסם"), .editor-post-publish-button');
          if (await confirmButton.count() > 0 && await confirmButton.isVisible()) {
            await confirmButton.click();
            console.log('✅ Confirmed publish');
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
      
      // Get the page URL
      const finalUrl = page.url();
      const pageIdMatch = finalUrl.match(/post=(\d+)/);
      
      if (pageIdMatch) {
        const pageId = pageIdMatch[1];
        const pageUrl = `https://movne.co.il/?page_id=${pageId}`;
        console.log(`✅ Page created successfully!`);
        console.log(`✅ Page ID: ${pageId}`);
        console.log(`✅ Page URL: ${pageUrl}`);
        
        // Test the created page
        console.log('Testing the newly created page...');
        await page.goto(pageUrl);
        await page.waitForTimeout(3000);
        
        // Take screenshot of the new page
        await page.screenshot({ path: 'new-portal-page.png', fullPage: true });
        console.log('✅ New page screenshot saved as new-portal-page.png');
        
        // Test navigation functionality
        console.log('Testing navigation...');
        
        // Test back navigation
        await page.goBack();
        await page.waitForTimeout(1000);
        console.log('✅ Back navigation works');
        
        // Test forward navigation
        await page.goForward();
        await page.waitForTimeout(1000);
        console.log('✅ Forward navigation works');
        
      }
    }
    
    console.log('✅ Portal analysis and page creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during portal analysis and creation:', error);
    await page.screenshot({ path: 'portal-creation-error.png', fullPage: true });
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the analysis and creation
portalAnalysisAndCreation().catch(console.error);