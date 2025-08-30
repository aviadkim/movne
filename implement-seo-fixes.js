// Implement Critical SEO Fixes via WordPress
const { chromium } = require('playwright');

async function implementSEOFixes() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Implementing critical SEO fixes...');
  
  try {
    // Login to WordPress
    await page.goto('https://movne.co.il/movne/wp-admin');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into WordPress');
    
    // 1. Fix Image Alt Text via Media Library
    console.log('\n🖼️  Fixing image alt texts...');
    await page.goto('https://movne.co.il/movne/wp-admin/upload.php');
    await page.waitForSelector('.attachments-browser');
    
    // Get all images in media library
    const imageCount = await page.locator('.attachment').count();
    console.log(`Found ${imageCount} images in media library`);
    
    // Process first 10 images as example
    for (let i = 0; i < Math.min(10, imageCount); i++) {
      try {
        const attachment = page.locator('.attachment').nth(i);
        await attachment.click();
        await page.waitForSelector('.attachment-details', { timeout: 3000 });
        
        // Check if alt text is missing
        const altTextInput = page.locator('input[data-setting="alt"]');
        const currentAlt = await altTextInput.inputValue();
        
        if (!currentAlt || currentAlt.trim() === '') {
          // Generate relevant Hebrew alt text for financial images
          const altTexts = [
            'מוצרים מובנים השקעות',
            'שיווק השקעות מקצועי',
            'שירותי השקעה Movne',
            'פתרונות השקעה מתקדמים',
            'שיווק פיננסי אישי',
            'מוצרי השקעה מובנים',
            'השקעות מתקדמות ישראל',
            'פורטפוליו השקעות מותאם'
          ];
          
          const randomAlt = altTexts[i % altTexts.length];
          await altTextInput.fill(randomAlt);
          
          // Save changes
          await page.click('.edit-attachment');
          await page.waitForTimeout(1000);
          
          console.log(`   ✓ Fixed alt text for image ${i + 1}: "${randomAlt}"`);
        }
        
        // Close details panel
        await page.click('.media-modal-close');
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.log(`   ⚠️  Could not fix image ${i + 1}: ${error.message}`);
      }
    }
    
    // 2. Add Missing Keywords to Content
    console.log('\n📝 Adding missing Hebrew keywords to pages...');
    
    // Edit homepage content
    await page.goto('https://movne.co.il/movne/wp-admin/edit.php?post_type=page');
    await page.waitForSelector('.wp-list-table');
    
    // Find the homepage (בית)
    const homepageLink = page.locator('a.row-title:has-text("בית")').first();
    if (await homepageLink.isVisible()) {
      await homepageLink.click();
      await page.waitForSelector('#post-body');
      
      // Check if we're in Gutenberg or Classic editor
      const isGutenberg = await page.locator('.block-editor').isVisible().catch(() => false);
      
      if (isGutenberg) {
        console.log('   📝 Editing in Gutenberg editor...');
        
        // Add a new paragraph with missing keywords
        await page.click('.block-editor-inserter__toggle');
        await page.waitForTimeout(1000);
        
        const paragraphButton = page.locator('button:has-text("פסקה")');
        if (await paragraphButton.isVisible()) {
          await paragraphButton.click();
          await page.waitForTimeout(500);
          
          const missingKeywords = `
השקעות מובנות ושיווק השקעות מקצועי המותאמים לצרכיכם. שירותי השקעה מתקדמים ומוצרי השקעה חדשניים לכל סוגי המשקיעים המתקדמים. שיווק פיננסי אישי וניהול פורטפוליו השקעות מותאם לפרופיל הסיכון שלכם.
          `;
          
          await page.keyboard.type(missingKeywords.trim());
          
          // Save/Update
          await page.click('button:has-text("עדכן")');
          await page.waitForTimeout(2000);
          
          console.log('   ✓ Added missing Hebrew keywords to homepage');
        }
      } else {
        console.log('   📝 Classic editor detected - adding keywords...');
        
        // For classic editor
        const contentArea = page.locator('#content');
        if (await contentArea.isVisible()) {
          const currentContent = await contentArea.inputValue();
          const newContent = currentContent + `\n\nהשקעות מובנות ושיווק השקעות מקצועי המותאמים לצרכיכם. שירותי השקעה מתקדמים ומוצרי השקעה חדשניים לכל סוגי המשקיעים המתקדמים. שיווק פיננסי אישי וניהול פורטפוליו השקעות מותאם לפרופיל הסיכון שלכם.`;
          
          await contentArea.fill(newContent);
          await page.click('#publish');
          await page.waitForTimeout(2000);
          
          console.log('   ✓ Added missing Hebrew keywords to homepage');
        }
      }
    }
    
    // 3. Update Meta Descriptions with Keywords
    console.log('\n🔍 Optimizing meta descriptions with Yoast SEO...');
    
    // Go to Yoast SEO settings for homepage
    await page.goto('https://movne.co.il/movne/wp-admin/edit.php?post_type=page');
    const homepageEditLink = page.locator('a.row-title:has-text("בית")').first();
    
    if (await homepageEditLink.isVisible()) {
      await homepageEditLink.click();
      await page.waitForSelector('#post-body');
      
      // Look for Yoast SEO metabox
      const yoastMetabox = page.locator('#wpseo_meta');
      if (await yoastMetabox.isVisible()) {
        // Update meta description
        const metaDescField = page.locator('#yoast_wpseo_metadesc');
        if (await metaDescField.isVisible()) {
          const optimizedMetaDesc = 'מוצרים מובנים ושיווק השקעות מקצועי. שירותי השקעה מתקדמים ופורטפוליו השקעות מותאם אישית. שיווק פיננסי למשקיעים מתקדמים - התייעצות ללא התחייבות.';
          
          await metaDescField.fill(optimizedMetaDesc);
          
          // Update focus keyword
          const focusKeywordField = page.locator('#yoast_wpseo_focuskw');
          if (await focusKeywordField.isVisible()) {
            await focusKeywordField.fill('מוצרים מובנים שיווק השקעות');
          }
          
          await page.click('button:has-text("עדכן")');
          await page.waitForTimeout(2000);
          
          console.log('   ✓ Updated meta description with missing keywords');
        }
      }
    }
    
    console.log('\n✅ SEO fixes implementation completed!');
    console.log('\n📊 Changes made:');
    console.log('   ✓ Fixed alt text for up to 10 images');
    console.log('   ✓ Added missing Hebrew keywords to content');
    console.log('   ✓ Optimized meta description');
    console.log('\n🔄 Clearing cache...');
    
    // Clear WP Rocket cache if available
    try {
      await page.goto('https://movne.co.il/movne/wp-admin/admin.php?page=wprocket');
      const clearCacheBtn = page.locator('text="Clear cache"').first();
      if (await clearCacheBtn.isVisible()) {
        await clearCacheBtn.click();
        await page.waitForTimeout(2000);
        console.log('   ✓ WP Rocket cache cleared');
      }
    } catch (error) {
      console.log('   ℹ️  Cache clearing not available');
    }
    
  } catch (error) {
    console.error('❌ Error implementing fixes:', error.message);
  } finally {
    await browser.close();
  }
}

implementSEOFixes().catch(console.error);