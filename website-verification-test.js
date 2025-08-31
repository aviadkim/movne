// WEBSITE VERIFICATION TEST - Check what's actually visible on movne.co.il
const { chromium } = require('playwright');

async function verifyWebsiteImplementation() {
  console.log('🔍 TESTING MOVNE.CO.IL - Verifying all implementations...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Basic site accessibility
    console.log('\n📊 TEST 1: Website Accessibility');
    await page.goto('https://movne.co.il', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const basicInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      hasContent: document.body.textContent.length > 100,
      isHebrew: document.body.textContent.includes('ו') || document.body.textContent.includes('ה'),
      loadTime: performance.now()
    }));
    
    console.log(`   ✅ Site accessible: ${basicInfo.title}`);
    console.log(`   📝 Hebrew content: ${basicInfo.isHebrew ? 'Yes' : 'No'}`);
    console.log(`   ⚡ Load time: ${Math.round(basicInfo.loadTime)}ms`);
    
    // Test 2: WhatsApp Button Check
    console.log('\n📱 TEST 2: WhatsApp Integration');
    const whatsappCheck = await page.evaluate(() => {
      const whatsappSelectors = [
        '[href*="whatsapp"]',
        '[class*="whatsapp"]',
        '[id*="whatsapp"]',
        'a[href*="wa.me"]',
        '.ht_ctc_chat_data',
        '#ht-ctc-chat'
      ];
      
      let whatsappElements = [];
      whatsappSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          whatsappElements.push({
            selector: selector,
            tag: el.tagName,
            href: el.href || '',
            text: el.textContent?.trim() || '',
            visible: el.offsetParent !== null,
            classes: el.className || '',
            id: el.id || ''
          });
        });
      });
      
      return whatsappElements;
    });
    
    if (whatsappCheck.length > 0) {
      console.log(`   ✅ WhatsApp elements found: ${whatsappCheck.length}`);
      whatsappCheck.forEach((element, index) => {
        console.log(`   ${index + 1}. ${element.tag} - Visible: ${element.visible ? 'Yes' : 'No'} - ${element.selector}`);
        if (element.href) console.log(`      Link: ${element.href}`);
      });
    } else {
      console.log('   ❌ No WhatsApp elements found');
    }
    
    // Test 3: Content Check - Look for new articles
    console.log('\n📝 TEST 3: Hebrew Content Articles');
    
    // Check main navigation and content areas
    const contentCheck = await page.evaluate(() => {
      const contentAreas = [
        document.querySelector('main'),
        document.querySelector('#content'),
        document.querySelector('.content'),
        document.querySelector('article'),
        document.querySelector('.post'),
        document.body
      ].filter(Boolean);
      
      let foundArticles = [];
      const articleTitles = [
        'מוצרים מובנים',
        'שיווק השקעות',
        'השקעות מובנות',
        'המדריך המלא',
        'בישראל'
      ];
      
      contentAreas.forEach(area => {
        if (area && area.textContent) {
          articleTitles.forEach(title => {
            if (area.textContent.includes(title)) {
              foundArticles.push(title);
            }
          });
        }
      });
      
      // Check for navigation links
      const navLinks = Array.from(document.querySelectorAll('a')).map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href || '',
        isHebrew: link.textContent?.includes('ו') || link.textContent?.includes('ה') || false
      })).filter(link => link.isHebrew && link.text.length > 2);
      
      return {
        articlesFound: [...new Set(foundArticles)],
        hebrewLinks: navLinks.slice(0, 10), // First 10 Hebrew links
        hasStructuredProducts: area.textContent?.includes('מוצרים מובנים') || false
      };
    });
    
    console.log(`   📄 Article keywords found: ${contentCheck.articlesFound.length}`);
    contentCheck.articlesFound.forEach(article => {
      console.log(`      ✅ "${article}"`);
    });
    
    console.log(`   🔗 Hebrew navigation links: ${contentCheck.hebrewLinks.length}`);
    contentCheck.hebrewLinks.slice(0, 5).forEach(link => {
      console.log(`      - ${link.text} → ${link.href}`);
    });
    
    // Test 4: Check for blog/articles section
    console.log('\n📰 TEST 4: Blog/Articles Section');
    
    const blogURLs = [
      'https://movne.co.il/blog',
      'https://movne.co.il/articles',
      'https://movne.co.il/מאמרים',
      'https://movne.co.il/כתבות'
    ];
    
    let blogFound = false;
    for (const blogURL of blogURLs) {
      try {
        const response = await page.goto(blogURL, { timeout: 5000 });
        if (response.status() === 200) {
          console.log(`   ✅ Blog section found: ${blogURL}`);
          
          const blogContent = await page.evaluate(() => {
            const posts = document.querySelectorAll('article, .post, .entry, h2, h3');
            return Array.from(posts).slice(0, 10).map(post => ({
              text: post.textContent?.trim().substring(0, 100) || '',
              tag: post.tagName
            }));
          });
          
          console.log(`   📄 Blog posts/content found: ${blogContent.length}`);
          blogContent.slice(0, 3).forEach((post, index) => {
            if (post.text.length > 10) {
              console.log(`      ${index + 1}. ${post.text}...`);
            }
          });
          
          blogFound = true;
          break;
        }
      } catch (error) {
        // Continue to next URL
      }
    }
    
    if (!blogFound) {
      console.log('   ⚠️ No blog section found at common URLs');
    }
    
    // Test 5: Contact Forms
    console.log('\n📧 TEST 5: Contact Forms');
    await page.goto('https://movne.co.il', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const formCheck = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const inputs = Array.from(document.querySelectorAll('input[type="email"], input[type="text"], textarea'));
      
      return {
        formCount: forms.length,
        inputCount: inputs.length,
        forms: forms.map(form => ({
          action: form.action || '',
          method: form.method || '',
          hasEmailField: form.querySelector('input[type="email"]') !== null,
          hasNameField: form.querySelector('input[type="text"]') !== null,
          hasTextarea: form.querySelector('textarea') !== null
        }))
      };
    });
    
    console.log(`   📝 Contact forms found: ${formCheck.formCount}`);
    console.log(`   🔤 Input fields found: ${formCheck.inputCount}`);
    
    if (formCheck.forms.length > 0) {
      formCheck.forms.forEach((form, index) => {
        console.log(`   Form ${index + 1}: Email=${form.hasEmailField}, Name=${form.hasNameField}, Message=${form.hasTextarea}`);
      });
    }
    
    // Test 6: Page Speed and Performance
    console.log('\n⚡ TEST 6: Site Performance');
    const performanceData = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        imageCount: document.querySelectorAll('img').length,
        cssCount: document.querySelectorAll('link[rel="stylesheet"]').length,
        jsCount: document.querySelectorAll('script[src]').length
      };
    });
    
    console.log(`   ⚡ Page load time: ${performanceData.loadTime}ms`);
    console.log(`   🏃 DOM ready time: ${performanceData.domContentLoaded}ms`);
    console.log(`   🖼️ Images loaded: ${performanceData.imageCount}`);
    console.log(`   📄 CSS files: ${performanceData.cssCount}`);
    console.log(`   ⚙️ JavaScript files: ${performanceData.jsCount}`);
    
    // Test 7: WordPress Admin Check (if accessible)
    console.log('\n🔧 TEST 7: WordPress Admin Check');
    try {
      await page.goto('https://movne.co.il/wp-admin/', { timeout: 10000 });
      const adminCheck = await page.evaluate(() => ({
        isAdminPage: document.querySelector('#wpadminbar, .wp-admin, #login') !== null,
        hasLoginForm: document.querySelector('#loginform, #user_login') !== null,
        title: document.title
      }));
      
      if (adminCheck.isAdminPage || adminCheck.hasLoginForm) {
        console.log('   ✅ WordPress admin accessible');
        console.log(`   📄 Admin page title: ${adminCheck.title}`);
      } else {
        console.log('   ⚠️ WordPress admin not accessible or protected');
      }
    } catch (error) {
      console.log('   ⚠️ WordPress admin not accessible');
    }
    
    // Test 8: SEO Elements Check
    console.log('\n🔍 TEST 8: SEO Elements');
    await page.goto('https://movne.co.il', { timeout: 10000 });
    
    const seoCheck = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || 'Not found',
      keywords: document.querySelector('meta[name="keywords"]')?.content || 'Not found',
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || 'Not found',
      canonical: document.querySelector('link[rel="canonical"]')?.href || 'Not found',
      hasSchema: document.querySelector('script[type="application/ld+json"]') !== null,
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length
    }));
    
    console.log(`   📄 Page title: ${seoCheck.title}`);
    console.log(`   📝 Meta description: ${seoCheck.description.substring(0, 100)}...`);
    console.log(`   🏷️ Keywords: ${seoCheck.keywords}`);
    console.log(`   📱 Open Graph title: ${seoCheck.ogTitle}`);
    console.log(`   🔗 Canonical URL: ${seoCheck.canonical}`);
    console.log(`   📊 Schema markup: ${seoCheck.hasSchema ? 'Yes' : 'No'}`);
    console.log(`   📑 H1 headings: ${seoCheck.h1Count}, H2 headings: ${seoCheck.h2Count}`);
    
    // Final Summary
    console.log('\n📋 VERIFICATION SUMMARY:');
    console.log('==========================================');
    console.log(`✅ Site accessible: Yes`);
    console.log(`📱 WhatsApp elements: ${whatsappCheck.length > 0 ? 'Found' : 'Not found'}`);
    console.log(`📝 Hebrew content: ${basicInfo.isHebrew ? 'Yes' : 'No'}`);
    console.log(`📄 Article content: ${contentCheck.articlesFound.length > 0 ? 'Some found' : 'Not found'}`);
    console.log(`📰 Blog section: ${blogFound ? 'Found' : 'Not found'}`);
    console.log(`📧 Contact forms: ${formCheck.formCount > 0 ? 'Found' : 'Not found'}`);
    console.log(`⚡ Page speed: ${performanceData.loadTime < 3000 ? 'Good' : 'Needs improvement'} (${performanceData.loadTime}ms)`);
    console.log(`🔍 SEO elements: ${seoCheck.description !== 'Not found' ? 'Present' : 'Missing'}`);
    
    console.log('\n🎯 NEXT STEPS BASED ON FINDINGS:');
    if (whatsappCheck.length === 0) {
      console.log('❌ WhatsApp button not visible - needs activation');
    }
    if (contentCheck.articlesFound.length === 0) {
      console.log('❌ Hebrew articles not visible - may need publishing or different location');
    }
    if (!blogFound) {
      console.log('❌ Blog section not accessible - may need creation or different URL');
    }
    if (formCheck.formCount === 0) {
      console.log('❌ Contact forms not found - may need addition to pages');
    }
    
    console.log('\n✅ WEBSITE VERIFICATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Website verification error:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute verification test
verifyWebsiteImplementation().catch(console.error);