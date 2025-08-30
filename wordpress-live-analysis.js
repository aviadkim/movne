// Comprehensive Live WordPress Analysis for Movne.co.il
const { chromium } = require('playwright');

async function analyzeWordPressSite() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Analyzing live WordPress site: movne.co.il');
  
  const analysis = {
    technical: {},
    content: {},
    conversion: {},
    seo: {},
    userExperience: {},
    recommendations: []
  };
  
  try {
    // 1. Load and analyze homepage
    await page.goto('https://movne.co.il', { waitUntil: 'networkidle' });
    
    console.log('📊 Analyzing homepage structure...');
    
    // Technical analysis
    analysis.technical = await page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2Count: document.querySelectorAll('h2').length,
        h2Text: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
        imageCount: document.querySelectorAll('img').length,
        imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length,
        internalLinks: Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('movne.co.il')).length,
        externalLinks: Array.from(document.querySelectorAll('a')).filter(a => !a.href.includes('movne.co.il') && a.href.startsWith('http')).length,
        phoneNumbers: document.body.innerText.match(/\d{2,3}-?\d{7,8}|\d{10}/g) || [],
        emailAddresses: document.body.innerText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
        hasWhatsApp: document.body.innerText.toLowerCase().includes('whatsapp') || document.body.innerText.includes('ווטסאפ'),
        hasContactForm: document.querySelectorAll('form').length > 0,
        formCount: document.querySelectorAll('form').length,
        ctaButtons: Array.from(document.querySelectorAll('a, button')).filter(el => 
          el.textContent.includes('צרו קשר') || 
          el.textContent.includes('התקשרו') ||
          el.textContent.includes('לפגישה') ||
          el.textContent.includes('יעוץ') ||
          el.textContent.includes('שיווק')
        ).length
      };
    });
    
    // Content analysis
    analysis.content = await page.evaluate(() => {
      const text = document.body.innerText;
      const hebrewKeywords = [
        'מוצרים מובנים',
        'שיווק השקעות',
        'השקעות מובנות', 
        'מוצרי השקעה',
        'שיווק פיננסי',
        'משווק השקעות',
        'פורטפוליו השקעות',
        'משקיעים מתקדמים',
        'השקעות אלטרנטיביות',
        'ניהול סיכונים'
      ];
      
      const keywordAnalysis = {};
      hebrewKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex) || [];
        keywordAnalysis[keyword] = {
          count: matches.length,
          present: matches.length > 0
        };
      });
      
      return {
        wordCount: text.split(/\s+/).length,
        hebrewRatio: ((text.match(/[\u0590-\u05FF]/g) || []).length / text.length * 100).toFixed(1),
        keywordAnalysis,
        hasTestimonials: text.includes('לקוח') || text.includes('המלצה') || text.includes('חוות דעת'),
        hasCaseStudies: text.includes('מקרה') || text.includes('דוגמה') || text.includes('הצלחה'),
        hasAboutSection: text.includes('אודות') || text.includes('מי אנחנו') || text.includes('הצוות'),
        hasServicesSection: text.includes('שירותים') || text.includes('מוצרים') || text.includes('פתרונות'),
        trustSignals: {
          hasLicense: text.includes('רישיון') || text.includes('רשות'),
          hasExperience: text.includes('ניסיון') || text.includes('שנות'),
          hasRegulation: text.includes('רגולציה') || text.includes('פיקוח')
        }
      };
    });
    
    // Performance analysis
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        resourceCount: performance.getEntriesByType('resource').length,
        transferSize: Math.round(navigation.transferSize / 1024) // KB
      };
    });
    
    analysis.technical.performance = performanceMetrics;
    
    // Check mobile responsiveness
    console.log('📱 Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);
    
    const mobileAnalysis = await page.evaluate(() => {
      return {
        hasHamburgerMenu: document.querySelector('.hamburger, .mobile-menu, .menu-toggle') !== null,
        textReadable: window.getComputedStyle(document.body).fontSize,
        buttonsClickable: Array.from(document.querySelectorAll('button, a')).every(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44; // Minimum touch target
        })
      };
    });
    
    analysis.userExperience.mobile = mobileAnalysis;
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Check specific pages
    console.log('📄 Analyzing key pages...');
    const pagesToCheck = [
      '/about/',
      '/contact/', 
      '/services/',
      '/products/'
    ];
    
    analysis.pageAnalysis = {};
    
    for (const pagePath of pagesToCheck) {
      try {
        await page.goto(`https://movne.co.il${pagePath}`, { timeout: 10000 });
        const pageExists = !page.url().includes('404');
        
        if (pageExists) {
          const pageAnalysis = await page.evaluate(() => {
            return {
              title: document.title,
              h1: document.querySelector('h1')?.textContent || 'Missing H1',
              wordCount: document.body.innerText.split(/\s+/).length,
              hasContactInfo: document.body.innerText.includes('@') || document.body.innerText.match(/\d{2,3}-?\d{7,8}/),
              hasCTA: document.body.innerText.includes('צרו קשר') || document.body.innerText.includes('התקשרו')
            };
          });
          analysis.pageAnalysis[pagePath] = pageAnalysis;
        } else {
          analysis.pageAnalysis[pagePath] = { error: 'Page not found' };
        }
      } catch (error) {
        analysis.pageAnalysis[pagePath] = { error: 'Could not access' };
      }
    }
    
    // Go back to homepage for final analysis
    await page.goto('https://movne.co.il');
    
    // Conversion optimization analysis
    console.log('🎯 Analyzing conversion elements...');
    analysis.conversion = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const ctaButtons = Array.from(document.querySelectorAll('a, button')).filter(el => 
        el.textContent.includes('צרו קשר') || 
        el.textContent.includes('התקשרו') ||
        el.textContent.includes('לפגישה')
      );
      
      return {
        formsAnalysis: forms.map(form => ({
          fields: form.querySelectorAll('input, textarea, select').length,
          hasPhone: form.querySelector('input[type="tel"], input[name*="phone"], input[name*="טלפון"]') !== null,
          hasEmail: form.querySelector('input[type="email"], input[name*="email"], input[name*="מייל"]') !== null,
          hasName: form.querySelector('input[name*="name"], input[name*="שם"]') !== null,
          hasSubject: form.querySelector('select, input[name*="subject"], input[name*="נושא"]') !== null
        })),
        ctaAnalysis: {
          total: ctaButtons.length,
          aboveFold: ctaButtons.filter(btn => {
            const rect = btn.getBoundingClientRect();
            return rect.top < window.innerHeight;
          }).length,
          hasUrgency: ctaButtons.some(btn => 
            btn.textContent.includes('חינם') || 
            btn.textContent.includes('מהיום') ||
            btn.textContent.includes('מיידי')
          )
        },
        trustElements: {
          hasTestimonials: document.body.innerText.includes('המלצ') || document.body.innerText.includes('לקוח'),
          hasLicenseInfo: document.body.innerText.includes('רישיון') || document.body.innerText.includes('רשות'),
          hasCertifications: document.body.innerText.includes('הסמכ') || document.body.innerText.includes('תעוד'),
          hasSecurityInfo: document.body.innerText.includes('אבטח') || document.body.innerText.includes('הצפנ')
        }
      };
    });
    
  } catch (error) {
    console.error('Error during analysis:', error.message);
  } finally {
    await browser.close();
  }
  
  // Generate recommendations
  generateRecommendations(analysis);
  
  // Save detailed report
  const fs = require('fs');
  fs.writeFileSync('movne-wordpress-analysis.json', JSON.stringify(analysis, null, 2));
  
  return analysis;
}

function generateRecommendations(analysis) {
  console.log('\n📋 WORDPRESS IMPROVEMENT RECOMMENDATIONS');
  console.log('=========================================');
  
  // Technical Issues
  console.log('\n🔧 TECHNICAL ISSUES:');
  if (analysis.technical.imagesWithoutAlt > 0) {
    console.log(`   ❌ ${analysis.technical.imagesWithoutAlt} images missing alt text`);
  }
  
  if (analysis.technical.performance?.loadComplete > 3000) {
    console.log(`   ⚡ Page load time: ${analysis.technical.performance.loadComplete}ms (should be <3000ms)`);
  }
  
  // Content Issues  
  console.log('\n📝 CONTENT ISSUES:');
  const missingKeywords = Object.entries(analysis.content.keywordAnalysis)
    .filter(([key, data]) => !data.present)
    .map(([key]) => key);
    
  if (missingKeywords.length > 0) {
    console.log(`   ❌ Missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  if (!analysis.content.hasTestimonials) {
    console.log('   ❌ No client testimonials found');
  }
  
  if (!analysis.content.hasCaseStudies) {
    console.log('   ❌ No case studies or success stories');
  }
  
  // Conversion Issues
  console.log('\n🎯 CONVERSION ISSUES:');
  if (analysis.technical.ctaButtons < 3) {
    console.log(`   ❌ Only ${analysis.technical.ctaButtons} CTA buttons (need 3-5)`);
  }
  
  if (analysis.conversion.ctaAnalysis?.aboveFold < 1) {
    console.log('   ❌ No CTA buttons above the fold');
  }
  
  if (!analysis.technical.hasWhatsApp) {
    console.log('   ❌ No WhatsApp integration for Israeli market');
  }
  
  // Required WordPress Plugins
  console.log('\n🔌 REQUIRED WORDPRESS PLUGINS:');
  console.log('   1. **Elementor Pro** - Advanced page building and conversion optimization');
  console.log('   2. **WP Forms Pro** - Professional contact forms with Hebrew support');
  console.log('   3. **Calendly Integration** - Online meeting booking');
  console.log('   4. **WhatsApp Chat** - Direct WhatsApp integration');
  console.log('   5. **Schema Pro** - Rich snippets for financial services');
  console.log('   6. **MonsterInsights Pro** - Advanced Google Analytics');
  console.log('   7. **OptinMonster** - Lead capture and conversion optimization');
  console.log('   8. **WP Testimonials** - Client testimonials showcase');
  console.log('   9. **Hebrew Calendar Plugin** - Local market relevance');
  console.log('   10. **Security Plugin** - Enhanced security for financial site');
}

// Run the analysis
analyzeWordPressSite().catch(console.error);