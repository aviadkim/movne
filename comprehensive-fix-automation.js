// COMPREHENSIVE FIX - Fix WhatsApp + Article Content + Run Multiple Tests
const { chromium } = require('playwright');
const config = require('./config');

async function comprehensiveFix() {
  console.log('🔧 COMPREHENSIVE FIX AUTOMATION - Fixing all issues...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // LOGIN TO WORDPRESS
    await page.goto(config.wordpress.adminUrl);
    await page.fill('#user_login', config.wordpress.username);
    await page.fill('#user_pass', config.wordpress.password);
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    console.log('✅ Logged into WordPress admin');
    
    // FIX 1: CONFIGURE WHATSAPP PLUGIN
    console.log('\n📱 FIX 1: Configuring WhatsApp Click to Chat...');
    await fixWhatsAppConfiguration(page);
    
    // FIX 2: GET ACTUAL ARTICLE TITLES AND UPDATE CONTENT
    console.log('\n📝 FIX 2: Finding and updating article content...');
    await fixArticleContentActualTitles(page);
    
    // FIX 3: OPTIMIZE SEO SETTINGS
    console.log('\n🚀 FIX 3: Optimizing SEO settings...');
    await optimizeSEOSettings(page);
    
    // FIX 4: CLEAR ALL CACHES
    console.log('\n🗑️ FIX 4: Clearing all caches...');
    await clearAllCaches(page);
    
    console.log('\n✅ COMPREHENSIVE FIX COMPLETE!');
    console.log('🎉 All issues should now be resolved');
    
  } catch (error) {
    console.error('❌ Comprehensive fix error:', error.message);
  } finally {
    await browser.close();
  }
}

async function fixWhatsAppConfiguration(page) {
  try {
    // Go to Click to Chat plugin settings
    await page.goto(`${config.wordpress.siteUrl}/wp-admin/admin.php?page=click-to-chat`);
    await page.waitForTimeout(3000);
    
    // Configure WhatsApp number
    const phoneInput = await page.locator('input[name*="number"], input[name*="phone"], #ht_ctc_chat_number');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('972544533709');
      console.log('   ✅ WhatsApp number configured: 972544533709');
    }
    
    // Enable the chat widget
    const enableCheckbox = await page.locator('input[type="checkbox"][name*="enable"], input[type="checkbox"][name*="display"]');
    if (await enableCheckbox.count() > 0) {
      await enableCheckbox.check();
      console.log('   ✅ WhatsApp chat widget enabled');
    }
    
    // Set display position
    const positionSelect = await page.locator('select[name*="position"], select[name*="side"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption('right');
      console.log('   ✅ WhatsApp position set to right side');
    }
    
    // Save settings
    const saveButton = await page.locator('input[type="submit"], button:has-text("Save"), button:has-text("שמירה")');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ WhatsApp settings saved');
    }
    
  } catch (error) {
    console.log('   ⚠️ WhatsApp configuration needs manual setup');
  }
}

async function fixArticleContentActualTitles(page) {
  try {
    // Go to posts list to see actual titles
    await page.goto(`${config.wordpress.siteUrl}/wp-admin/edit.php`);
    await page.waitForTimeout(3000);
    
    // Get all post titles
    const postTitles = await page.evaluate(() => {
      const titleElements = document.querySelectorAll('.row-title, .title a, strong a');
      return Array.from(titleElements).map(el => ({
        title: el.textContent.trim(),
        href: el.href || el.closest('a')?.href || ''
      })).filter(post => post.title.length > 10); // Filter meaningful titles
    });
    
    console.log(`   📝 Found ${postTitles.length} posts:`);
    postTitles.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
    });
    
    // Hebrew article content to add
    const HEBREW_CONTENT = `
<h2>מה זה מוצרים מובנים?</h2>

<p><strong>מוצרים מובנים</strong> הם מוצרי השקעה מתקדמים המשלבים בין מספר נכסי יסוד ליצירת פרופיל השקעה מותאם אישית. בישראל, שוק המוצרים המובנים צומח בקצב מרשים.</p>

<h3>יתרונות עיקריים:</h3>
<ul>
<li><strong>גמישות וגיוון</strong>: אפשרות להתאים את המוצר לצרכים המשקיע</li>
<li><strong>פוטנציאל תשואה</strong>: אפשרות לתשואות גבוהות</li>
<li><strong>הגנת קרן</strong>: אפשרות להגן על ההשקעה</li>
<li><strong>יעילות מסוית</strong>: יתרונות מסויים מובנים</li>
</ul>

<h2>סוגי מוצרים מובנים בישראל</h2>

<h3>1. תעודות שקיפות</h3>
<p>מוצרים המבוססים על בדיקת השקיפות ומסחר בבורסה.</p>

<h3>2. מוצרים קשורי-מדד</h3>
<p>מוצרים הקשורים למדדים שונים כמו ת"א 25, ת"א 100.</p>

<h3>3. מוצרים שקליים</h3>
<p>מוצרים המתבססים על שער השקל או זוגות מטבעות.</p>

<h2>למי מתאימים מוצרים מובנים?</h2>

<ul>
<li><strong>משקיעים מקצועיים</strong>: בעלי הבנה בשוק ההון</li>
<li><strong>מחפשי תשואה גבוהה</strong>: מי שמוכן לקחת סיכונים</li>
<li><strong>משקיעים מאוזנים</strong>: המחפשים לגוון בתיק</li>
</ul>

<h2>איך לבחור משווק מוצרים מובנים?</h2>

<p>בחירת <strong>שיווק השקעות</strong> מורשה ומנוסה חיונית להצלחה. ב-<strong>Movne</strong>, אנו מתמחים ביצירת פתרונות השקעה מותאמים אישית.</p>

<div style="background-color: #e3f2fd; padding: 20px; border-right: 4px solid #2196F3; margin: 20px 0;">
<h3>📞 רוצים להתחיל?</h3>
<p>צרו איתנו קשר עוד היום לייעוץ אישי ללא התחייבות!</p>
<p><strong>טלפון:</strong> 054-453-3709</p>
<p><strong>WhatsApp:</strong> לחצו על הכפתור הירוק לשיחה מיידית!</p>
</div>

<h2>מדוע לבחור ב-Movne?</h2>

<ul>
<li>✅ <strong>רישיון משווק</strong> מרשות השוק הישראלית</li>
<li>✅ <strong>מוצרים מתאימים</strong> לכל סוג משקיע</li>
<li>✅ <strong>יעוץ אישי</strong> ללא עלות נוספות</li>
<li>✅ <strong>שקיפות מלאה</strong> ותמיכה מקצועית</li>
</ul>
    `;
    
    // Update articles that contain Hebrew keywords
    const hebrewKeywords = ['מוצרים מובנים', 'שיווק השקעות', 'סוגי מוצרים'];
    
    for (const post of postTitles) {
      const isHebrewArticle = hebrewKeywords.some(keyword => post.title.includes(keyword.split(' ')[0]));
      
      if (isHebrewArticle && post.href) {
        console.log(`\n   📝 Updating Hebrew article: ${post.title}`);
        
        try {
          await page.goto(post.href);
          await page.waitForTimeout(3000);
          
          // Try different content editor selectors
          const contentSelectors = [
            '#content',
            '.wp-editor-area', 
            'textarea[name="content"]',
            '#content_ifr', // TinyMCE iframe
            '.editor-post-text-editor textarea' // Gutenberg
          ];
          
          let contentUpdated = false;
          
          for (const selector of contentSelectors) {
            const contentArea = page.locator(selector);
            if (await contentArea.count() > 0 && await contentArea.isVisible()) {
              
              // Switch to HTML/Text mode if needed
              const htmlTab = page.locator('button:has-text("HTML"), .switch-html, button:has-text("Text")');
              if (await htmlTab.count() > 0) {
                await htmlTab.click();
                await page.waitForTimeout(1000);
              }
              
              await contentArea.fill(HEBREW_CONTENT);
              contentUpdated = true;
              break;
            }
          }
          
          if (contentUpdated) {
            // Save/Update the post
            const updateButtons = [
              '#publish',
              'input[value="Update"]',
              'button:has-text("עדכון")',
              '.editor-post-publish-button'
            ];
            
            for (const buttonSelector of updateButtons) {
              const updateButton = page.locator(buttonSelector);
              if (await updateButton.count() > 0 && await updateButton.isVisible()) {
                await updateButton.click();
                await page.waitForTimeout(3000);
                console.log(`     ✅ Content updated for: ${post.title}`);
                break;
              }
            }
          } else {
            console.log(`     ⚠️ Could not find content editor for: ${post.title}`);
          }
          
        } catch (error) {
          console.log(`     ❌ Error updating ${post.title}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log('   ⚠️ Article content update encountered issues');
  }
}

async function optimizeSEOSettings(page) {
  try {
    // Configure Rank Math or Yoast SEO
    const seoPlugins = [
      { url: 'admin.php?page=rank-math', name: 'Rank Math' },
      { url: 'admin.php?page=wpseo_dashboard', name: 'Yoast SEO' }
    ];
    
    for (const plugin of seoPlugins) {
      try {
        await page.goto(`${config.wordpress.siteUrl}/wp-admin/${plugin.url}`);
        await page.waitForTimeout(3000);
        
        if (await page.locator('h1, h2').count() > 0) {
          console.log(`   ✅ ${plugin.name} accessible - configuring...`);
          
          // Basic SEO configuration
          await page.evaluate(() => {
            // Enable Hebrew support
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              if (checkbox.name && (
                checkbox.name.includes('hebrew') ||
                checkbox.name.includes('rtl') ||
                checkbox.name.includes('social') ||
                checkbox.name.includes('schema')
              )) {
                checkbox.checked = true;
              }
            });
            
            // Set business type to financial if available
            const selects = document.querySelectorAll('select');
            selects.forEach(select => {
              if (select.name && select.name.includes('business')) {
                const options = Array.from(select.options);
                const financialOption = options.find(opt => 
                  opt.text.includes('Financial') || opt.text.includes('Investment')
                );
                if (financialOption) {
                  select.value = financialOption.value;
                }
              }
            });
          });
          
          // Save settings if save button exists
          const saveButton = page.locator('input[type="submit"], button:has-text("Save")');
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await page.waitForTimeout(2000);
          }
          
          break; // Use first available plugin
        }
      } catch (error) {
        continue; // Try next plugin
      }
    }
    
  } catch (error) {
    console.log('   ⚠️ SEO optimization needs manual configuration');
  }
}

async function clearAllCaches(page) {
  try {
    // Clear WP Rocket cache
    const cachePlugins = [
      { url: 'admin.php?page=wprocket', name: 'WP Rocket' },
      { url: 'admin.php?page=wp-fastest-cache', name: 'WP Fastest Cache' },
      { url: 'options-general.php?page=autoptimize', name: 'Autoptimize' }
    ];
    
    for (const plugin of cachePlugins) {
      try {
        await page.goto(`${config.wordpress.siteUrl}/wp-admin/${plugin.url}`);
        await page.waitForTimeout(3000);
        
        // Look for clear cache buttons
        const clearButtons = await page.locator(
          'button:has-text("Clear"), ' +
          'input[value*="Clear"], ' +
          'button:has-text("ניקוי"), ' +
          'a:has-text("Clear Cache")'
        );
        
        if (await clearButtons.count() > 0) {
          await clearButtons.first().click();
          await page.waitForTimeout(3000);
          console.log(`   ✅ ${plugin.name} cache cleared`);
        }
        
      } catch (error) {
        continue; // Try next plugin
      }
    }
    
  } catch (error) {
    console.log('   ⚠️ Manual cache clearing may be needed');
  }
}

// Execute comprehensive fix
comprehensiveFix().catch(console.error);
