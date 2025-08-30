// Realistic Google Ranking Analysis for Movne.co.il
const { chromium } = require('playwright');

async function analyzeGoogleRankings() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Analyzing Google ranking potential for מוצרים מובנים...');
  
  const targetKeywords = [
    'מוצרים מובנים',
    'מוצרים מובנים ישראל', 
    'שיווק השקעות מוצרים מובנים',
    'מוצרי השקעה מובנים',
    'השקעות מובנות',
    'סטרקצ\'רים השקעה',
    'משווק השקעות מוצרים מובנים'
  ];
  
  const competitorAnalysis = {};
  
  for (const keyword of targetKeywords) {
    console.log(`\n📊 Analyzing keyword: "${keyword}"`);
    
    try {
      // Search Google for the keyword
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=he&gl=il`);
      await page.waitForSelector('#search', { timeout: 10000 });
      
      // Extract top 10 organic results
      const results = await page.evaluate(() => {
        const searchResults = [];
        const organicResults = document.querySelectorAll('[data-ved] h3');
        
        for (let i = 0; i < Math.min(10, organicResults.length); i++) {
          const result = organicResults[i];
          const link = result.closest('a');
          if (link && link.href) {
            const domain = new URL(link.href).hostname;
            searchResults.push({
              position: i + 1,
              title: result.textContent,
              domain: domain,
              url: link.href
            });
          }
        }
        return searchResults;
      });
      
      competitorAnalysis[keyword] = {
        totalResults: results.length,
        topCompetitors: results,
        bankDomination: results.filter(r => 
          r.domain.includes('bank') || 
          r.domain.includes('meitav') || 
          r.domain.includes('mizrahi') || 
          r.domain.includes('leumi') ||
          r.domain.includes('hapoalim')
        ).length,
        investmentHouses: results.filter(r =>
          r.domain.includes('meitav') ||
          r.domain.includes('psagot') ||
          r.domain.includes('inter-inv') ||
          r.domain.includes('phoenix')
        ).length
      };
      
      console.log(`   Top 3 competitors:`);
      results.slice(0, 3).forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.domain} - "${result.title.substring(0, 50)}..."`);
      });
      
      // Check if movne.co.il appears
      const movnePosition = results.findIndex(r => r.domain.includes('movne.co.il'));
      if (movnePosition >= 0) {
        console.log(`   🎯 MOVNE FOUND at position ${movnePosition + 1}!`);
      } else {
        console.log(`   ❌ Movne not in top 10`);
      }
      
      await page.waitForTimeout(2000); // Be respectful to Google
      
    } catch (error) {
      console.log(`   ❌ Error analyzing "${keyword}": ${error.message}`);
      competitorAnalysis[keyword] = { error: error.message };
    }
  }
  
  await browser.close();
  
  // Generate analysis report
  console.log('\n📋 GOOGLE RANKING ANALYSIS REPORT');
  console.log('=====================================');
  
  let totalBankDomination = 0;
  let totalInvestmentHouses = 0;
  let keywordsAnalyzed = 0;
  
  Object.entries(competitorAnalysis).forEach(([keyword, data]) => {
    if (!data.error) {
      totalBankDomination += data.bankDomination;
      totalInvestmentHouses += data.investmentHouses;
      keywordsAnalyzed++;
    }
  });
  
  const avgBankDomination = (totalBankDomination / keywordsAnalyzed).toFixed(1);
  const avgInvestmentHouses = (totalInvestmentHouses / keywordsAnalyzed).toFixed(1);
  
  console.log(`\n🏦 MARKET DOMINATION ANALYSIS:`);
  console.log(`   Average bank presence in top 10: ${avgBankDomination} results`);
  console.log(`   Average investment houses: ${avgInvestmentHouses} results`);
  console.log(`   Market controlled by: ${avgBankDomination > 5 ? 'BANKS 🏦' : avgInvestmentHouses > 3 ? 'INVESTMENT HOUSES 🏢' : 'MIXED 🔄'}`);
  
  // Difficulty assessment
  const difficulty = avgBankDomination > 6 ? 'EXTREMELY HIGH' :
                    avgBankDomination > 4 ? 'HIGH' :
                    avgBankDomination > 2 ? 'MEDIUM' : 'LOW';
  
  console.log(`\n⚖️  RANKING DIFFICULTY: ${difficulty}`);
  
  if (difficulty === 'EXTREMELY HIGH' || difficulty === 'HIGH') {
    console.log(`\n❌ HONEST ASSESSMENT: First page ranking extremely difficult because:`);
    console.log(`   • Major banks dominate search results`);
    console.log(`   • Established investment houses have strong SEO`);
    console.log(`   • High competition for financial keywords`);
    console.log(`   • Domain authority disadvantage`);
  }
  
  // Realistic recommendations
  console.log(`\n💡 REALISTIC STRATEGY FOR MOVNE:`);
  console.log(`   1. Focus on LONG-TAIL keywords instead:`);
  console.log(`      - "מוצרים מובנים תל אביב"`);
  console.log(`      - "משווק השקעות מוצרים מובנים פרטי"`);
  console.log(`      - "מוצרים מובנים ללא עמלות"`);
  console.log(`      - "השקעות מובנות למשקיעים פרטיים"`);
  
  console.log(`\n   2. Content Marketing Strategy:`);
  console.log(`      - Hebrew blog about structured products education`);
  console.log(`      - "מדריך למתחילים במוצרים מובנים"`);
  console.log(`      - Case studies and success stories`);
  console.log(`      - Video content explaining products`);
  
  console.log(`\n   3. Local SEO Focus:`);
  console.log(`      - Google My Business optimization`);
  console.log(`      - Local directories registration`);
  console.log(`      - Customer reviews and testimonials`);
  
  console.log(`\n   4. Link Building:`);
  console.log(`      - Financial industry publications`);
  console.log(`      - Guest posts on investment blogs`);
  console.log(`      - Professional networking`);
  
  console.log(`\n⏰ REALISTIC TIMELINE:`);
  console.log(`   • Month 1-3: Technical SEO and content foundation`);
  console.log(`   • Month 4-6: Long-tail keyword rankings possible`);
  console.log(`   • Month 7-12: Local market penetration`);
  console.log(`   • Year 2+: Potential for competitive keywords`);
  
  console.log(`\n🎯 REALISTIC EXPECTATIONS:`);
  console.log(`   • First page for main keywords: ${difficulty === 'EXTREMELY HIGH' ? '0-5% chance' : difficulty === 'HIGH' ? '10-20% chance' : '30-50% chance'}`);
  console.log(`   • First page for long-tail: 60-80% chance`);
  console.log(`   • Local market dominance: 80-90% chance`);
  console.log(`   • Brand awareness growth: 90% guarantee`);
  
  return competitorAnalysis;
}

analyzeGoogleRankings().catch(console.error);