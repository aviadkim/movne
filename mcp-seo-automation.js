// MCP-Based WordPress SEO Automation using REST API
const https = require('https');
const { chromium } = require('playwright');

async function mcpSEOAutomation() {
  console.log('🚀 Starting MCP-based WordPress SEO automation...');
  
  // Hebrew SEO data for each page
  const seoOptimizations = [
    {
      slug: 'בית',
      title: 'Movne - שיווק השקעות מוצרים מובנים | משווק מורשה ישראל',
      description: 'שיווק השקעות מקצועי במוצרים מובנים. משווק מורשה עם ניסיון מוכח. קבעו פגישה ללא עלות - WhatsApp זמין.',
      keywords: 'מוצרים מובנים שיווק השקעות'
    },
    {
      slug: 'מי-אנחנו',
      title: 'מי אנחנו | משווק השקעות מוצרים מובנים מורשה | Movne',
      description: 'צוות מקצועי של משווקי השקעות מורשים. ניסיון בשיווק מוצרים מובנים ופתרונות השקעה מתקדמים למשקיעים פרטיים.',
      keywords: 'משווק השקעות מורשה ישראל'
    },
    {
      slug: 'צרו-קשר',
      title: 'צרו קשר | פגישה ללא עלות | משווק השקעות מורשה',
      description: 'קבעו פגישת שיווק השקעות ללא עלות. זמינים לשיחה אישית, WhatsApp או פגישה במשרד. ייעוץ ראשוני ללא התחייבות.',
      keywords: 'פגישת שיווק השקעות ללא עלות'
    },
    {
      slug: 'מוצרים-מובנים',
      title: 'מוצרים מובנים | השקעות מתקדמות למשקיעים | Movne',
      description: 'מוצרים מובנים מתקדמים למשקיעים פרטיים. שיווק השקעות מקצועי עם ניהול סיכונים. פתרונות השקעה מותאמים אישית.',
      keywords: 'מוצרים מובנים למשקיעים פרטיים'
    },
    {
      slug: 'גילוי-נאות',
      title: 'גילוי נאות | שקיפות מלאה | Movne שיווק השקעות',
      description: 'גילוי נאות מלא ושקיפות בשיווק השקעות. כל המידע על עמלות, סיכונים ותנאים. משווק מורשה עם שקיפות מלאה.',
      keywords: 'גילוי נאות משווק השקעות'
    },
    {
      slug: 'מדיניות-פרטיות',
      title: 'מדיניות פרטיות | אבטחת מידע | Movne שיווק השקעות',
      description: 'מדיניות פרטיות מלאה להגנה על מידע הלקוחות. אבטחת מידע מתקדמת בשיווק השקעות. שמירה על פרטיות לקוחות.',
      keywords: 'מדיניות פרטיות שיווק השקעות'
    },
    {
      slug: 'הסכם-שימוש',
      title: 'הסכם שימוש | תנאי שירות | Movne שיווק השקעות',
      description: 'תנאי שימוש ושירות מפורטים לשיווק השקעות. הסכם שקוף וברור עם לקוחות. תנאים הוגנים ומקצועיים.',
      keywords: 'תנאי שימוש שיווק השקעות'
    },
    {
      slug: 'הצהרת-נגישות',
      title: 'הצהרת נגישות | אתר נגיש לכולם | Movne',
      description: 'הצהרת נגישות מלאה לאתר שיווק ההשקעות. מחויבות לנגישות דיגיטלית לכל המשתמשים. אתר נגיש ושווה לכולם.',
      keywords: 'נגישות אתר שיווק השקעות'
    },
    {
      slug: 'כתבות',
      title: 'כתבות ומאמרים | מדריכי השקעות מובנות | Movne',
      description: 'מאמרים וכתבות מקצועיים על השקעות מובנות. מדריכים מעמיקים על מוצרים מובנים. תוכן איכותי למשקיעים מתקדמים.',
      keywords: 'מאמרים השקעות מובנות'
    },
    {
      slug: 'הסכם-סחר',
      title: 'הסכם סחר | תנאי מסחר | Movne שיווק השקעות',
      description: 'הסכם סחר מפורט לשיווק השקעות. תנאי מסחר שקופים והוגנים. הסכם מקצועי למשקיעים פרטיים.',
      keywords: 'הסכם סחר השקעות'
    },
    {
      slug: 'תודה',
      title: 'תודה | פגישה נקבעה בהצלחה | Movne שיווק השקעות',
      description: 'תודה על קביעת הפגישה! נחזור אליכם בהקדם לתיאום פגישת שיווק השקעות. נתראה בקרוב לשיחה מקצועית.',
      keywords: 'תודה פגישת שיווק השקעות'
    }
  ];

  try {
    // Step 1: Get authentication token using browser automation
    console.log('🔐 Getting WordPress authentication token...');
    const authToken = await getWordPressAuthToken();
    
    if (!authToken) {
      throw new Error('Could not get authentication token');
    }
    
    console.log('✅ Authentication token obtained');

    // Step 2: Get all pages using REST API
    console.log('\n📄 Fetching all WordPress pages...');
    const pages = await fetchWordPressPages();
    
    console.log(`Found ${pages.length} pages to optimize`);

    // Step 3: Update each page with SEO data
    let successCount = 0;
    const results = [];
    
    for (const seoData of seoOptimizations) {
      try {
        console.log(`\n🎯 Processing: ${seoData.slug}`);
        
        // Find matching page by title
        const page = pages.find(p => 
          p.title.rendered.includes(seoData.slug.replace(/[-]/g, ' ')) ||
          p.slug === seoData.slug ||
          p.title.rendered === seoData.slug
        );
        
        if (!page) {
          console.log(`   ⚠️  Page not found: ${seoData.slug}`);
          results.push({ page: seoData.slug, status: 'not_found' });
          continue;
        }
        
        console.log(`   📝 Found page ID: ${page.id}`);
        
        // Update page with SEO data using REST API
        const updateResult = await updatePageSEO(page.id, seoData, authToken);
        
        if (updateResult.success) {
          console.log(`   ✅ SEO updated successfully`);
          successCount++;
          results.push({ page: seoData.slug, status: 'success', id: page.id });
        } else {
          console.log(`   ❌ SEO update failed: ${updateResult.error}`);
          results.push({ page: seoData.slug, status: 'failed', error: updateResult.error });
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing ${seoData.slug}: ${error.message}`);
        results.push({ page: seoData.slug, status: 'error', error: error.message });
      }
    }
    
    // Step 4: Generate comprehensive report
    console.log('\n📊 MCP SEO AUTOMATION RESULTS:');
    console.log(`   ✅ Successfully optimized: ${successCount}/${seoOptimizations.length} pages`);
    console.log(`   ⚠️  Failed/Not found: ${seoOptimizations.length - successCount} pages`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'not_found' ? '❓' : '❌';
      console.log(`   ${status} ${result.page} ${result.error ? `(${result.error})` : ''}`);
    });
    
    if (successCount > 0) {
      console.log('\n🎉 MCP SEO AUTOMATION COMPLETED!');
      console.log('\n📈 Expected Improvements:');
      console.log('   • Better Google search visibility for Hebrew keywords');
      console.log('   • Improved click-through rates from search results');
      console.log('   • Enhanced meta descriptions in Hebrew');
      console.log('   • Targeted focus keywords for financial services');
      
      console.log('\n🔄 Verifying changes...');
      await verifyChanges();
    }
    
  } catch (error) {
    console.error('❌ MCP SEO Automation failed:', error.message);
  }
}

async function getWordPressAuthToken() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login to WordPress
    await page.goto('https://www.movne.co.il/wp-admin/');
    await page.fill('#user_login', 'aviad@kimfo-fs.com');
    await page.fill('#user_pass', 'Kimfo1982');
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    // Try to get WordPress authentication cookie
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => 
      c.name.includes('wordpress_logged_in') || 
      c.name.includes('wp-settings-time') ||
      c.name.includes('wordpress_sec')
    );
    
    if (authCookie) {
      return authCookie.value;
    }
    
    // Alternative: Try to get nonce for REST API
    const nonce = await page.evaluate(() => {
      return window.wpApiSettings?.nonce || 
             window.ajaxurl?.nonce ||
             document.querySelector('meta[name="wp-nonce"]')?.content;
    });
    
    return nonce || 'authenticated';
    
  } finally {
    await browser.close();
  }
}

async function fetchWordPressPages() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'movne.co.il',
      path: '/wp-json/wp/v2/pages?per_page=100',
      method: 'GET',
      headers: {
        'User-Agent': 'WordPress-MCP-SEO-Automation',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data);
          resolve(pages);
        } catch (error) {
          reject(new Error('Failed to parse pages response'));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function updatePageSEO(pageId, seoData, authToken) {
  return new Promise((resolve) => {
    // Update page title and excerpt (WordPress core SEO)
    const updateData = {
      title: seoData.title,
      excerpt: seoData.description,
      meta: {
        _yoast_wpseo_title: seoData.title,
        _yoast_wpseo_metadesc: seoData.description,
        _yoast_wpseo_focuskw: seoData.keywords,
        _yoast_wpseo_canonical: `https://movne.co.il/${seoData.slug}/`
      }
    };
    
    const postData = JSON.stringify(updateData);
    
    const options = {
      hostname: 'movne.co.il',
      path: `/wp-json/wp/v2/pages/${pageId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'User-Agent': 'WordPress-MCP-SEO-Automation',
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function verifyChanges() {
  console.log('📊 Verifying SEO changes on live site...');
  
  const testPages = [
    'https://movne.co.il/',
    'https://movne.co.il/מי-אנחנו/',
    'https://movne.co.il/צרו-קשר/',
    'https://movne.co.il/מוצרים-מובנים/'
  ];
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    for (const url of testPages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const seoData = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        keywords: document.querySelector('meta[name="keywords"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href
      }));
      
      console.log(`\n📄 ${url}:`);
      console.log(`   Title: ${seoData.title}`);
      console.log(`   Description: ${seoData.description ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Keywords: ${seoData.keywords ? '✅ Present' : '❌ Missing'}`);
    }
  } finally {
    await browser.close();
  }
}

// Execute the automation
mcpSEOAutomation().catch(console.error);