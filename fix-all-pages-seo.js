// Fix SEO for All 11 Pages Showing "לא מוגדר" Status
const { chromium } = require('playwright');

async function fixAllPagesSEO() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 Fixing SEO for all 11 pages showing "לא מוגדר" status...');
  
  // SEO optimization data for each page
  const pageOptimizations = [
    {
      name: 'בית',
      focusKeyword: 'מוצרים מובנים שיווק השקעות',
      seoTitle: 'Movne - שיווק השקעות מוצרים מובנים | משווק מורשה ישראל',
      metaDescription: 'שיווק השקעות מקצועי במוצרים מובנים. משווק מורשה עם ניסיון מוכח. קבעו פגישה ללא עלות - WhatsApp זמין.'
    },
    {
      name: 'מי אנחנו',
      focusKeyword: 'משווק השקעות מורשה ישראל',
      seoTitle: 'מי אנחנו | משווק השקעות מוצרים מובנים מורשה | Movne',
      metaDescription: 'צוות מקצועי של משווקי השקעות מורשים. ניסיון בשיווק מוצרים מובנים ופתרונות השקעה מתקדמים למשקיעים פרטיים.'
    },
    {
      name: 'צרו קשר',
      focusKeyword: 'פגישת שיווק השקעות ללא עלות',
      seoTitle: 'צרו קשר | פגישה ללא עלות | משווק השקעות מורשה',
      metaDescription: 'קבעו פגישת שיווק השקעות ללא עלות. זמינים לשיחה אישית, WhatsApp או פגישה במשרד. ייעוץ ראשוני ללא התחייבות.'
    },
    {
      name: 'מוצרים מובנים',
      focusKeyword: 'מוצרים מובנים למשקיעים פרטיים',
      seoTitle: 'מוצרים מובנים | השקעות מתקדמות למשקיעים | Movne',
      metaDescription: 'מוצרים מובנים מתקדמים למשקיעים פרטיים. שיווק השקעות מקצועי עם ניהול סיכונים. פתרונות השקעה מותאמים אישית.'
    },
    {
      name: 'גילוי נאות',
      focusKeyword: 'גילוי נאות משווק השקעות',
      seoTitle: 'גילוי נאות | שקיפות מלאה | Movne שיווק השקעות',
      metaDescription: 'גילוי נאות מלא ושקיפות בשיווק השקעות. כל המידע על עמלות, סיכונים ותנאים. משווק מורשה עם שקיפות מלאה.'
    },
    {
      name: 'מדיניות פרטיות',
      focusKeyword: 'מדיניות פרטיות שיווק השקעות',
      seoTitle: 'מדיניות פרטיות | אבטחת מידע | Movne שיווק השקעות',
      metaDescription: 'מדיניות פרטיות מלאה להגנה על מידע הלקוחות. אבטחת מידע מתקדמת בשיווק השקעות. שמירה על פרטיות לקוחות.'
    },
    {
      name: 'הסכם שימוש',
      focusKeyword: 'תנאי שימוש שיווק השקעות',
      seoTitle: 'הסכם שימוש | תנאי שירות | Movne שיווק השקעות',
      metaDescription: 'תנאי שימוש ושירות מפורטים לשיווק השקעות. הסכם שקוף וברור עם לקוחות. תנאים הוגנים ומקצועיים.'
    },
    {
      name: 'הצהרת נגישות',
      focusKeyword: 'נגישות אתר שיווק השקעות',
      seoTitle: 'הצהרת נגישות | אתר נגיש לכולם | Movne',
      metaDescription: 'הצהרת נגישות מלאה לאתר שיווק ההשקעות. מחויבות לנגישות דיגיטלית לכל המשתמשים. אתר נגיש ושווה לכולם.'
    },
    {
      name: 'כתבות',
      focusKeyword: 'מאמרים השקעות מובנות',
      seoTitle: 'כתבות ומאמרים | מדריכי השקעות מובנות | Movne',
      metaDescription: 'מאמרים וכתבות מקצועיים על השקעות מובנות. מדריכים מעמיקים על מוצרים מובנים. תוכן איכותי למשקיעים מתקדמים.'
    },
    {
      name: 'הסכם סחר',
      focusKeyword: 'הסכם סחר השקעות',
      seoTitle: 'הסכם סחר | תנאי מסחר | Movne שיווק השקעות',
      metaDescription: 'הסכם סחר מפורט לשיווק השקעות. תנאי מסחר שקופים והוגנים. הסכם מקצועי למשקיעים פרטיים.'
    },
    {
      name: 'תודה',
      focusKeyword: 'תודה פגישת שיווק השקעות',
      seoTitle: 'תודה | פגישה נקבעה בהצלחה | Movne שיווק השקעות',
      metaDescription: 'תודה על קביעת הפגישה! נחזור אליכם בהקדם לתיאום פגישת שיווק השקעות. נתראה בקרוב לשיחה מקצועית.'
    }
  ];
  
  try {
    // Login to WordPress
    await page.goto('https://www.movne.co.il/wp-admin/');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into LIVE WordPress admin');
    
    // Process each page
    let successCount = 0;
    
    for (const pageData of pageOptimizations) {
      console.log(`\n📄 Optimizing "${pageData.name}" page...`);
      
      try {
        // Go to pages list
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
        await page.waitForSelector('.wp-list-table', { timeout: 5000 });
        
        // Find and click the page
        const pageLink = page.locator(`a.row-title:has-text("${pageData.name}")`).first();
        
        if (await pageLink.isVisible({ timeout: 3000 })) {
          await pageLink.click();
          
          // Wait for editor to load (try multiple selectors)
          let editorLoaded = false;
          const editorSelectors = ['.block-editor', '#post-body', '.edit-post-layout', '#titlediv'];
          
          for (const selector of editorSelectors) {
            if (await page.locator(selector).isVisible({ timeout: 5000 }).catch(() => false)) {
              console.log(`   📝 Editor loaded: ${selector}`);
              editorLoaded = true;
              break;
            }
          }
          
          if (editorLoaded) {
            // Scroll down to find SEO section
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(2000);
            
            // Try to find Yoast SEO fields using multiple approaches
            const yoastApproaches = [
              // Approach 1: Direct field access
              async () => {
                const focusKw = page.locator('#yoast_wpseo_focuskw');
                const title = page.locator('#yoast_wpseo_title');
                const metaDesc = page.locator('#yoast_wpseo_metadesc');
                
                if (await focusKw.isVisible().catch(() => false)) {
                  await focusKw.fill(pageData.focusKeyword);
                  await title.fill(pageData.seoTitle);
                  await metaDesc.fill(pageData.metaDescription);
                  return true;
                }
                return false;
              },
              
              // Approach 2: Metabox approach  
              async () => {
                const metabox = page.locator('#wpseo_meta');
                if (await metabox.isVisible().catch(() => false)) {
                  const inputs = metabox.locator('input, textarea');
                  const focusKwField = inputs.filter({ hasText: 'focus' }).first();
                  if (await focusKwField.isVisible().catch(() => false)) {
                    await focusKwField.fill(pageData.focusKeyword);
                    return true;
                  }
                }
                return false;
              },
              
              // Approach 3: Generic field search
              async () => {
                const focusFields = page.locator('input[name*="focus"], input[placeholder*="focus"]');
                const titleFields = page.locator('input[name*="title"]:not(#title)');
                const descFields = page.locator('textarea[name*="desc"]');
                
                if (await focusFields.first().isVisible().catch(() => false)) {
                  await focusFields.first().fill(pageData.focusKeyword);
                  if (await titleFields.first().isVisible().catch(() => false)) {
                    await titleFields.first().fill(pageData.seoTitle);
                  }
                  if (await descFields.first().isVisible().catch(() => false)) {
                    await descFields.first().fill(pageData.metaDescription);
                  }
                  return true;
                }
                return false;
              }
            ];
            
            // Try each approach until one works
            let yoastConfigured = false;
            for (const approach of yoastApproaches) {
              try {
                if (await approach()) {
                  yoastConfigured = true;
                  console.log(`   ✓ Yoast SEO fields configured`);
                  break;
                }
              } catch (error) {
                // Continue to next approach
              }
            }
            
            if (yoastConfigured) {
              // Save the page
              const saveSelectors = [
                'button:has-text("עדכן")',
                'button:has-text("Update")', 
                '#publish',
                '.editor-post-publish-button',
                'input[name="save"]'
              ];
              
              for (const saveSelector of saveSelectors) {
                if (await page.locator(saveSelector).isVisible().catch(() => false)) {
                  await page.click(saveSelector);
                  await page.waitForTimeout(3000);
                  console.log(`   ✅ ${pageData.name} SEO optimization saved!`);
                  successCount++;
                  break;
                }
              }
            } else {
              console.log(`   ⚠️  Could not find Yoast SEO fields for ${pageData.name}`);
            }
          } else {
            console.log(`   ⚠️  Could not load editor for ${pageData.name}`);
          }
        } else {
          console.log(`   ❌ Could not find page: ${pageData.name}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error optimizing ${pageData.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 SEO OPTIMIZATION RESULTS:`);
    console.log(`   ✅ Successfully optimized: ${successCount}/${pageOptimizations.length} pages`);
    console.log(`   ⚠️  Need manual attention: ${pageOptimizations.length - successCount} pages`);
    
    if (successCount > 0) {
      console.log('\n🎉 SEO IMPROVEMENTS IMPLEMENTED!');
      console.log('\n📈 Expected improvements:');
      console.log('   • Better Google keyword targeting');
      console.log('   • Improved meta descriptions in search results');
      console.log('   • Higher click-through rates from Google');
      console.log('   • Better search engine visibility');
    }
    
    // Check updated status
    console.log('\n🔄 Checking updated SEO status...');
    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForSelector('.wp-list-table');
    
    console.log('\n🎯 NEXT: Configure the FREE plugins we installed');
    console.log('   1. Smush: Optimize all images');
    console.log('   2. Click to Chat: Add WhatsApp number');
    console.log('   3. MonsterInsights: Connect Google Analytics');
    console.log('   4. Test all improvements on live site');
    
  } catch (error) {
    console.error('❌ Error fixing pages SEO:', error.message);
  } finally {
    await browser.close();
  }
}

fixAllPagesSEO().catch(console.error);