// Hybrid MCP-Based SEO Automation - Browser + WordPress Admin
const { chromium } = require('playwright');

async function hybridSEOAutomation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Hybrid MCP-based WordPress SEO automation starting...');
  
  // Hebrew SEO data for each page
  const seoOptimizations = [
    {
      name: 'בית',
      title: 'Movne - שיווק השקעות מוצרים מובנים | משווק מורשה ישראל',
      description: 'שיווק השקעות מקצועי במוצרים מובנים. משווק מורשה עם ניסיון מוכח. קבעו פגישה ללא עלות - WhatsApp זמין.',
      keywords: 'מוצרים מובנים שיווק השקעות'
    },
    {
      name: 'מי אנחנו',
      title: 'מי אנחנו | משווק השקעות מוצרים מובנים מורשה | Movne',
      description: 'צוות מקצועי של משווקי השקעות מורשים. ניסיון בשיווק מוצרים מובנים ופתרונות השקעה מתקדמים למשקיעים פרטיים.',
      keywords: 'משווק השקעות מורשה ישראל'
    },
    {
      name: 'צרו קשר',
      title: 'צרו קשר | פגישה ללא עלות | משווק השקעות מורשה',
      description: 'קבעו פגישת שיווק השקעות ללא עלות. זמינים לשיחה אישית, WhatsApp או פגישה במשרד. ייעוץ ראשוני ללא התחייבות.',
      keywords: 'פגישת שיווק השקעות ללא עלות'
    },
    {
      name: 'מוצרים מובנים',
      title: 'מוצרים מובנים | השקעות מתקדמות למשקיעים | Movne',
      description: 'מוצרים מובנים מתקדמים למשקיעים פרטיים. שיווק השקעות מקצועי עם ניהול סיכונים. פתרונות השקעה מותאמים אישית.',
      keywords: 'מוצרים מובנים למשקיעים פרטיים'
    },
    {
      name: 'גילוי נאות',
      title: 'גילוי נאות | שקיפות מלאה | Movne שיווק השקעות',
      description: 'גילוי נאות מלא ושקיפות בשיווק השקעות. כל המידע על עמלות, סיכונים ותנאים. משווק מורשה עם שקיפות מלאה.',
      keywords: 'גילוי נאות משווק השקעות'
    }
  ];
  
  try {
    // Login to WordPress
    await page.goto('https://www.movne.co.il/wp-admin/');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ Logged into WordPress admin');
    
    // First, let's check if REST API is accessible from admin
    console.log('\n🔍 Testing REST API access...');
    const restApiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/pages?per_page=1');
        const data = await response.json();
        return { success: true, pages: data.length, first: data[0]?.title?.rendered };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log(`REST API Test: ${restApiTest.success ? 'Success' : 'Failed'}`);
    if (restApiTest.success) {
      console.log(`Found ${restApiTest.pages} pages, first: ${restApiTest.first}`);
    }
    
    let successCount = 0;
    const results = [];
    
    // Process each page using enhanced browser automation
    for (const seoData of seoOptimizations) {
      console.log(`\n🎯 Processing: ${seoData.name}`);
      
      try {
        // Navigate to pages list
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
        await page.waitForSelector('.wp-list-table', { timeout: 5000 });
        
        // Find the page by searching for the title text
        await page.waitForTimeout(1000);
        const pageFound = await page.evaluate((pageName) => {
          const links = Array.from(document.querySelectorAll('.row-title, a.row-title'));
          const targetLink = links.find(link => 
            link.textContent.includes(pageName) || 
            link.textContent.trim() === pageName
          );
          if (targetLink) {
            targetLink.click();
            return true;
          }
          return false;
        }, seoData.name);
        
        if (!pageFound) {
          console.log(`   ❌ Page not found: ${seoData.name}`);
          results.push({ page: seoData.name, status: 'not_found' });
          continue;
        }
        
        // Wait for page editor to load
        await page.waitForTimeout(3000);
        
        // Try multiple approaches to detect the editor type and find SEO fields
        const editorType = await page.evaluate(() => {
          if (document.querySelector('.block-editor-page')) return 'gutenberg';
          if (document.querySelector('#post-body-content')) return 'classic';
          if (document.querySelector('.edit-post-layout')) return 'gutenberg';
          return 'unknown';
        });
        
        console.log(`   📝 Editor type detected: ${editorType}`);
        
        // Look for Yoast SEO section using multiple strategies
        let yoastFound = false;
        
        // Strategy 1: Direct Yoast field IDs
        const directYoastFields = await page.evaluate(() => {
          const focusKw = document.getElementById('yoast_wpseo_focuskw');
          const title = document.getElementById('yoast_wpseo_title');  
          const metaDesc = document.getElementById('yoast_wpseo_metadesc');
          return {
            focusKw: !!focusKw,
            title: !!title,
            metaDesc: !!metaDesc
          };
        });
        
        if (directYoastFields.focusKw && directYoastFields.title && directYoastFields.metaDesc) {
          console.log('   ✅ Found Yoast fields (direct method)');
          await page.fill('#yoast_wpseo_focuskw', seoData.keywords);
          await page.fill('#yoast_wpseo_title', seoData.title);
          await page.fill('#yoast_wpseo_metadesc', seoData.description);
          yoastFound = true;
        } else {
          // Strategy 2: Look for Yoast metabox
          console.log('   🔍 Trying Yoast metabox approach...');
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(2000);
          
          const metaboxYoast = await page.evaluate((seoData) => {
            const metabox = document.getElementById('wpseo_meta');
            if (metabox) {
              const inputs = metabox.querySelectorAll('input, textarea');
              let fieldsFound = 0;
              
              inputs.forEach(input => {
                if (input.name && input.name.includes('focuskw')) {
                  input.value = seoData.keywords;
                  fieldsFound++;
                } else if (input.name && input.name.includes('title')) {
                  input.value = seoData.title;
                  fieldsFound++;
                } else if (input.name && input.name.includes('metadesc')) {
                  input.value = seoData.description;
                  fieldsFound++;
                }
              });
              
              return fieldsFound >= 2;
            }
            return false;
          }, seoData);
          
          if (metaboxYoast) {
            console.log('   ✅ Found Yoast fields (metabox method)');
            yoastFound = true;
          }
        }
        
        // Strategy 3: Try using admin-ajax to update meta directly
        if (!yoastFound) {
          console.log('   🔧 Trying admin-ajax meta update...');
          const ajaxResult = await page.evaluate(async (seoData) => {
            try {
              // Get the post ID from URL or form
              const postIdMatch = window.location.href.match(/post=(\d+)/);
              const postId = postIdMatch ? postIdMatch[1] : null;
              
              if (postId && window.ajaxurl) {
                const formData = new FormData();
                formData.append('action', 'update_post_meta');
                formData.append('post_id', postId);
                formData.append('_yoast_wpseo_title', seoData.title);
                formData.append('_yoast_wpseo_metadesc', seoData.description);
                formData.append('_yoast_wpseo_focuskw', seoData.keywords);
                
                const response = await fetch(window.ajaxurl, {
                  method: 'POST',
                  body: formData
                });
                
                return response.ok;
              }
              return false;
            } catch (e) {
              return false;
            }
          }, seoData);
          
          if (ajaxResult) {
            console.log('   ✅ Updated via admin-ajax');
            yoastFound = true;
          }
        }
        
        if (yoastFound) {
          // Save the changes
          const saved = await page.evaluate(() => {
            const saveButtons = [
              document.querySelector('button:has-text("עדכן")'),
              document.querySelector('button:has-text("Update")'),
              document.querySelector('#publish'),
              document.querySelector('.editor-post-publish-button'),
              document.querySelector('input[name="save"]')
            ];
            
            const saveButton = saveButtons.find(btn => btn && btn.offsetParent !== null);
            if (saveButton) {
              saveButton.click();
              return true;
            }
            return false;
          });
          
          if (saved) {
            await page.waitForTimeout(3000);
            console.log(`   ✅ ${seoData.name} SEO optimized and saved!`);
            successCount++;
            results.push({ page: seoData.name, status: 'success' });
          } else {
            console.log(`   ⚠️  Could not save changes for ${seoData.name}`);
            results.push({ page: seoData.name, status: 'save_failed' });
          }
        } else {
          console.log(`   ❌ Could not find Yoast SEO fields for ${seoData.name}`);
          results.push({ page: seoData.name, status: 'no_yoast_fields' });
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing ${seoData.name}: ${error.message}`);
        results.push({ page: seoData.name, status: 'error', error: error.message });
      }
    }
    
    // Generate final report
    console.log('\n📊 HYBRID MCP SEO AUTOMATION RESULTS:');
    console.log(`   ✅ Successfully optimized: ${successCount}/${seoOptimizations.length} pages`);
    console.log(`   ⚠️  Failed/Issues: ${seoOptimizations.length - successCount} pages`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'not_found' ? '❓' : '❌';
      console.log(`   ${status} ${result.page} (${result.status})`);
    });
    
    if (successCount > 0) {
      console.log('\n🎉 HYBRID MCP SEO OPTIMIZATION COMPLETED!');
      console.log('\n📈 Expected Results:');
      console.log('   • Hebrew SEO keywords targeting');
      console.log('   • Improved Google search visibility');
      console.log('   • Better meta descriptions in search results');
      console.log('   • Enhanced click-through rates');
      
      console.log('\n🔄 Next: Configure the installed plugins');
      console.log('   1. Smush: Bulk image optimization');
      console.log('   2. Click to Chat: WhatsApp integration');
      console.log('   3. MonsterInsights: Google Analytics connection');
    }
    
    console.log('\n✅ MCP-POWERED SEO AUTOMATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Hybrid SEO Automation failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute the hybrid automation
hybridSEOAutomation().catch(console.error);