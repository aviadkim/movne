// COMPETITOR INTELLIGENCE AUTOMATION
// Advanced analysis of Hebrew structured products competitors
const { chromium } = require('playwright');
const fs = require('fs');

const COMPETITORS = [
  {
    name: 'מיטב דש',
    domain: 'meitav-ds.co.il',
    type: 'major_bank',
    strengths: ['brand_recognition', 'resources', 'client_base'],
    weaknesses: ['corporate_feel', 'less_personal', 'bureaucracy']
  },
  {
    name: 'פסגות',
    domain: 'psagot.co.il',
    type: 'investment_house', 
    strengths: ['specialization', 'expertise', 'reputation'],
    weaknesses: ['limited_reach', 'traditional_approach']
  },
  {
    name: 'מגדל',
    domain: 'migdal.co.il',
    type: 'insurance_investment',
    strengths: ['insurance_integration', 'comprehensive_services'],
    weaknesses: ['complexity', 'large_corporate']
  },
  {
    name: 'הלמן אלדובי',
    domain: 'halman-aldubi.co.il',
    type: 'boutique_investment',
    strengths: ['personal_service', 'boutique_feel'],
    weaknesses: ['limited_marketing', 'smaller_scale']
  }
];

async function runCompetitorIntelligence() {
  console.log('🕵️ COMPETITOR INTELLIGENCE AUTOMATION STARTING');
  console.log('📊 Analyzing Hebrew structured products market competitors');
  
  const browser = await chromium.launch({ headless: true });
  const competitorData = [];
  
  try {
    for (const competitor of COMPETITORS) {
      console.log(`\n🔍 Analyzing ${competitor.name} (${competitor.domain})...`);
      
      const analysis = await analyzeCompetitor(browser, competitor);
      competitorData.push({
        ...competitor,
        ...analysis,
        timestamp: new Date().toISOString()
      });
      
      // Brief delay between analyses
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Generate competitive intelligence report
    await generateCompetitorReport(competitorData);
    
    // Identify opportunities
    await identifyOpportunities(competitorData);
    
    console.log('\n✅ Competitor intelligence completed');
    
  } catch (error) {
    console.error('❌ Competitor analysis error:', error.message);
  } finally {
    await browser.close();
  }
}

async function analyzeCompetitor(browser, competitor) {
  const page = await browser.newPage();
  
  try {
    // Analyze main website
    const websiteAnalysis = await analyzeWebsite(page, competitor);
    
    // Check SEO performance
    const seoAnalysis = await analyzeSEO(page, competitor);
    
    // Social media presence
    const socialAnalysis = await analyzeSocialMedia(page, competitor);
    
    // Content analysis
    const contentAnalysis = await analyzeContent(page, competitor);
    
    return {
      website: websiteAnalysis,
      seo: seoAnalysis,
      social: socialAnalysis,
      content: contentAnalysis,
      overallScore: calculateOverallScore(websiteAnalysis, seoAnalysis, socialAnalysis, contentAnalysis)
    };
    
  } catch (error) {
    console.log(`   ⚠️ Error analyzing ${competitor.name}: ${error.message}`);
    return { error: error.message };
  } finally {
    await page.close();
  }
}

async function analyzeWebsite(page, competitor) {
  try {
    await page.goto(`https://${competitor.domain}`, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const analysis = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('navigation');
      const loadTime = performanceEntries[0]?.loadEventEnd - performanceEntries[0]?.loadEventStart;
      
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || 'No description',
        hasStructuredProducts: document.body.textContent.includes('מוצרים מובנים') ||
                              document.body.textContent.includes('מוצר מובנה') ||
                              document.body.textContent.includes('השקעות מובנות'),
        hasWhatsApp: document.querySelector('[href*="whatsapp"], [class*="whatsapp"]') !== null,
        hasContactForm: document.querySelector('form[action*="contact"], input[type="email"]') !== null,
        loadTime: Math.round(loadTime) || 0,
        mobileResponsive: window.innerWidth !== document.body.scrollWidth,
        hebrewContent: document.body.textContent.match(/[\u0590-\u05FF]/g)?.length > 100,
        hasSSL: location.protocol === 'https:',
        imageCount: document.querySelectorAll('img').length,
        hasSchema: document.querySelector('script[type="application/ld+json"]') !== null
      };
    });
    
    console.log(`   📊 ${competitor.name}: Load time ${analysis.loadTime}ms, Hebrew: ${analysis.hebrewContent ? 'Yes' : 'No'}`);
    return analysis;
    
  } catch (error) {
    return { error: 'Website analysis failed', accessible: false };
  }
}

async function analyzeSEO(page, competitor) {
  try {
    // Check Google rankings for key terms
    const keywordRankings = {};
    const testKeywords = ['מוצרים מובנים', 'שיווק השקעות', 'השקעות מובנות'];
    
    for (const keyword of testKeywords) {
      const ranking = await checkCompetitorRanking(page, keyword, competitor.domain);
      keywordRankings[keyword] = ranking;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
    }
    
    return {
      rankings: keywordRankings,
      averagePosition: Object.values(keywordRankings).filter(r => r > 0).reduce((a, b) => a + b, 0) / Object.values(keywordRankings).filter(r => r > 0).length || null
    };
    
  } catch (error) {
    return { error: 'SEO analysis failed' };
  }
}

async function checkCompetitorRanking(page, keyword, domain) {
  try {
    await page.goto(`https://www.google.co.il/search?q=${encodeURIComponent(keyword)}&hl=he&gl=IL`);
    await page.waitForSelector('#search', { timeout: 10000 });
    
    const position = await page.evaluate((targetDomain) => {
      const results = Array.from(document.querySelectorAll('#search .g a[href]'));
      
      for (let i = 0; i < results.length; i++) {
        const url = results[i].href;
        if (url.includes(targetDomain)) {
          return i + 1;
        }
      }
      return 0; // Not found in top results
    }, domain);
    
    return position;
    
  } catch (error) {
    return 0;
  }
}

async function analyzeSocialMedia(page, competitor) {
  try {
    // Check for social media presence
    const socialPresence = await page.evaluate(() => {
      const socialLinks = Array.from(document.querySelectorAll('a[href*="facebook"], a[href*="linkedin"], a[href*="twitter"], a[href*="instagram"]'));
      
      return {
        facebook: socialLinks.some(link => link.href.includes('facebook')),
        linkedin: socialLinks.some(link => link.href.includes('linkedin')),
        twitter: socialLinks.some(link => link.href.includes('twitter')),
        instagram: socialLinks.some(link => link.href.includes('instagram')),
        totalPresence: socialLinks.length
      };
    });
    
    return socialPresence;
  } catch (error) {
    return { error: 'Social media analysis failed' };
  }
}

async function analyzeContent(page, competitor) {
  try {
    const contentAnalysis = await page.evaluate(() => {
      const textContent = document.body.textContent || '';
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
      
      return {
        wordCount: textContent.split(/\s+/).length,
        headingCount: headings.length,
        hasStructuredProductsContent: textContent.includes('מוצרים מובנים') || textContent.includes('מוצר מובנה'),
        hasEducationalContent: headings.some(h => h.includes('מה זה') || h.includes('איך') || h.includes('למה')),
        contentQuality: textContent.length > 1000 ? 'good' : textContent.length > 500 ? 'medium' : 'poor',
        blogSection: document.querySelector('a[href*="blog"], a[href*="מאמר"]') !== null,
        faqSection: document.querySelector('a[href*="faq"], .faq, [class*="שאלות"]') !== null
      };
    });
    
    return contentAnalysis;
  } catch (error) {
    return { error: 'Content analysis failed' };
  }
}

function calculateOverallScore(website, seo, social, content) {
  let score = 0;
  let maxScore = 0;
  
  // Website factors (40% weight)
  if (website && !website.error) {
    if (website.loadTime < 3000) score += 10;
    if (website.hasStructuredProducts) score += 10;
    if (website.hasWhatsApp) score += 5;
    if (website.hasContactForm) score += 5;
    if (website.mobileResponsive) score += 10;
    maxScore += 40;
  }
  
  // SEO factors (30% weight)
  if (seo && !seo.error && seo.averagePosition) {
    const seoScore = Math.max(0, 30 - (seo.averagePosition - 1) * 3);
    score += seoScore;
    maxScore += 30;
  }
  
  // Social media (10% weight)
  if (social && !social.error) {
    score += social.totalPresence * 2.5;
    maxScore += 10;
  }
  
  // Content quality (20% weight)
  if (content && !content.error) {
    if (content.hasStructuredProductsContent) score += 8;
    if (content.hasEducationalContent) score += 6;
    if (content.blogSection) score += 3;
    if (content.faqSection) score += 3;
    maxScore += 20;
  }
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

async function generateCompetitorReport(competitorData) {
  const date = new Date().toISOString().split('T')[0];
  
  const report = `
# Competitor Intelligence Report - ${date}
## Hebrew Structured Products Market Analysis

### 🏆 COMPETITOR RANKINGS BY OVERALL SCORE

${competitorData
  .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
  .map((comp, index) => `
${index + 1}. **${comp.name}** (${comp.domain}) - Score: ${comp.overallScore || 'N/A'}%
   - Type: ${comp.type}
   - Load Time: ${comp.website?.loadTime || 'N/A'}ms
   - Structured Products Content: ${comp.website?.hasStructuredProducts ? '✅' : '❌'}
   - WhatsApp Integration: ${comp.website?.hasWhatsApp ? '✅' : '❌'}
   - SEO Average Position: ${comp.seo?.averagePosition || 'Not ranking'}
`)
  .join('\n')}

### 📊 MARKET GAPS & OPPORTUNITIES

#### 🎯 What Movne Can Exploit:
${identifyMovneOpportunities(competitorData).map(opp => `- ${opp}`).join('\n')}

#### 🏃‍♂️ Quick Wins Available:
1. **WhatsApp Integration**: ${competitorData.filter(c => !c.website?.hasWhatsApp).length}/${competitorData.length} competitors lack WhatsApp
2. **Site Speed**: Average competitor load time: ${Math.round(competitorData.reduce((avg, c) => avg + (c.website?.loadTime || 0), 0) / competitorData.length)}ms
3. **Hebrew Content**: Focus on educational Hebrew content gap
4. **Personal Approach**: Most are corporate - leverage boutique advantage

### 🎯 RECOMMENDED STRATEGY

1. **Immediate Actions** (This Week):
   - Capitalize on WhatsApp advantage ✅ (Already implemented)
   - Create Hebrew educational content
   - Improve site speed below 2000ms
   
2. **Short Term** (1 Month):
   - Target keywords where competitors rank poorly
   - Build authority content in Hebrew
   - Implement superior schema markup

3. **Long Term** (2-3 Months):
   - Establish thought leadership
   - Build quality backlink profile
   - Create comprehensive resource hub

---
*Generated by Movne Competitive Intelligence System*
`;

  fs.writeFileSync(`competitor-analysis-${date}.md`, report);
  console.log(`📋 Competitor report generated: competitor-analysis-${date}.md`);
}

function identifyMovneOpportunities(competitorData) {
  const opportunities = [];
  
  // Check WhatsApp gap
  const whatsappGap = competitorData.filter(c => !c.website?.hasWhatsApp).length;
  if (whatsappGap > 0) {
    opportunities.push(`WhatsApp integration gap: ${whatsappGap}/${competitorData.length} competitors missing this`);
  }
  
  // Check speed gap
  const avgLoadTime = competitorData.reduce((avg, c) => avg + (c.website?.loadTime || 0), 0) / competitorData.length;
  if (avgLoadTime > 3000) {
    opportunities.push(`Site speed advantage: Competitors average ${Math.round(avgLoadTime)}ms load time`);
  }
  
  // Check content gaps
  const educationalGap = competitorData.filter(c => !c.content?.hasEducationalContent).length;
  if (educationalGap > 0) {
    opportunities.push(`Educational content gap: ${educationalGap}/${competitorData.length} lack educational Hebrew content`);
  }
  
  // Check SEO gaps
  const poorSEO = competitorData.filter(c => !c.seo?.averagePosition || c.seo.averagePosition > 5).length;
  if (poorSEO > 0) {
    opportunities.push(`SEO opportunity: ${poorSEO}/${competitorData.length} competitors rank poorly for key terms`);
  }
  
  return opportunities;
}

async function identifyOpportunities(competitorData) {
  const opportunities = identifyMovneOpportunities(competitorData);
  
  console.log('\n🎯 MARKET OPPORTUNITIES IDENTIFIED:');
  opportunities.forEach((opp, index) => {
    console.log(`   ${index + 1}. ${opp}`);
  });
  
  // Save opportunities for action
  fs.writeFileSync('market-opportunities.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    opportunities: opportunities,
    competitorData: competitorData.map(c => ({
      name: c.name,
      domain: c.domain,
      overallScore: c.overallScore,
      gaps: {
        whatsapp: !c.website?.hasWhatsApp,
        speed: (c.website?.loadTime || 0) > 3000,
        education: !c.content?.hasEducationalContent,
        seo: !c.seo?.averagePosition || c.seo.averagePosition > 5
      }
    }))
  }, null, 2));
}

// Execute competitor intelligence
runCompetitorIntelligence().catch(console.error);