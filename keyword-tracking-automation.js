// AUTOMATED KEYWORD TRACKING & RANKING MONITOR
// Tracking Movne's progress to #1 in Hebrew structured products
const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_KEYWORDS = [
  // Primary Hebrew Keywords
  { keyword: 'מוצרים מובנים', priority: 'HIGH', targetPosition: 1, currentPosition: null },
  { keyword: 'שיווק השקעות', priority: 'HIGH', targetPosition: 3, currentPosition: null },
  { keyword: 'מוצרים מובנים למשקיעים פרטיים', priority: 'HIGH', targetPosition: 1, currentPosition: null },
  { keyword: 'השקעות מובנות ישראל', priority: 'HIGH', targetPosition: 2, currentPosition: null },
  
  // Secondary Keywords
  { keyword: 'משווק השקעות מורשה', priority: 'MEDIUM', targetPosition: 5, currentPosition: null },
  { keyword: 'איך פועלים מוצרים מובנים', priority: 'MEDIUM', targetPosition: 3, currentPosition: null },
  { keyword: 'מוצרים מובנים הגנת קרן', priority: 'MEDIUM', targetPosition: 5, currentPosition: null },
  { keyword: 'השוואת משווקי מוצרים מובנים', priority: 'MEDIUM', targetPosition: 3, currentPosition: null },
  
  // Long Tail Keywords
  { keyword: 'מוצרים מובנים תל אביב מדד', priority: 'LOW', targetPosition: 1, currentPosition: null },
  { keyword: 'מס על מוצרים מובנים', priority: 'LOW', targetPosition: 2, currentPosition: null },
  { keyword: 'מוצרים מובנים vs תעודות סל', priority: 'LOW', targetPosition: 1, currentPosition: null },
  
  // Brand Keywords
  { keyword: 'Movne מוצרים מובנים', priority: 'HIGH', targetPosition: 1, currentPosition: null },
  { keyword: 'Movne שיווק השקעות', priority: 'HIGH', targetPosition: 1, currentPosition: null }
];

async function trackKeywordRankings() {
  console.log('📊 STARTING KEYWORD TRACKING AUTOMATION');
  console.log('🎯 Monitoring Movne progress to #1 Hebrew structured products');
  
  const browser = await chromium.launch({ headless: true }); // Run in background
  const results = [];
  
  try {
    for (const keywordData of TARGET_KEYWORDS) {
      const ranking = await checkKeywordRanking(browser, keywordData.keyword);
      keywordData.currentPosition = ranking.position;
      keywordData.url = ranking.url;
      keywordData.timestamp = new Date().toISOString();
      
      results.push({
        ...keywordData,
        competitorUrls: ranking.competitors,
        searchVolume: await estimateSearchVolume(keywordData.keyword),
        trend: calculateTrend(keywordData)
      });
      
      console.log(`   ${keywordData.priority === 'HIGH' ? '🔥' : keywordData.priority === 'MEDIUM' ? '⚡' : '📈'} ${keywordData.keyword}: Position ${ranking.position || 'Not found'}`);
      
      // Brief delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Save results
    await saveTrackingResults(results);
    
    // Generate daily report
    await generateDailyReport(results);
    
    console.log('✅ Keyword tracking completed');
    
  } catch (error) {
    console.error('❌ Keyword tracking error:', error.message);
  } finally {
    await browser.close();
  }
}

async function checkKeywordRanking(browser, keyword) {
  const page = await browser.newPage();
  
  try {
    // Search on Google.co.il for Hebrew results
    await page.goto(`https://www.google.co.il/search?q=${encodeURIComponent(keyword)}&hl=he&gl=IL`);
    await page.waitForSelector('#search', { timeout: 10000 });
    
    // Extract search results
    const results = await page.evaluate((targetDomain) => {
      const searchResults = Array.from(document.querySelectorAll('#search .g'));
      const competitors = [];
      let movnePosition = null;
      let movneUrl = null;
      
      searchResults.forEach((result, index) => {
        const linkElement = result.querySelector('a[href]');
        const titleElement = result.querySelector('h3');
        
        if (linkElement && titleElement) {
          const url = linkElement.href;
          const title = titleElement.textContent;
          const domain = new URL(url).hostname;
          
          competitors.push({
            position: index + 1,
            title,
            url,
            domain
          });
          
          if (domain.includes('movne.co.il')) {
            movnePosition = index + 1;
            movneUrl = url;
          }
        }
      });
      
      return {
        position: movnePosition,
        url: movneUrl,
        competitors: competitors.slice(0, 10) // Top 10 results
      };
    }, 'movne.co.il');
    
    return results;
    
  } catch (error) {
    console.log(`   ⚠️ Error checking ${keyword}: ${error.message}`);
    return { position: null, url: null, competitors: [] };
  } finally {
    await page.close();
  }
}

async function estimateSearchVolume(keyword) {
  // Simple estimation based on keyword characteristics
  const volumeMap = {
    'מוצרים מובנים': 2400,
    'שיווק השקעות': 1800,
    'השקעות מובנות ישראל': 1200,
    'מוצרים מובנים למשקיעים פרטיים': 800,
    'משווק השקעות מורשה': 600,
    'איך פועלים מוצרים מובנים': 500,
    'מוצרים מובנים הגנת קרן': 350,
    'השוואת משווקי מוצרים מובנים': 400,
    'מוצרים מובנים תל אביב מדד': 200,
    'מס על מוצרים מובנים': 300,
    'מוצרים מובנים vs תעודות סל': 150
  };
  
  return volumeMap[keyword] || Math.floor(Math.random() * 100 + 50); // Default estimate
}

function calculateTrend(keywordData) {
  // Load previous data to calculate trend
  try {
    const previousData = JSON.parse(fs.readFileSync('keyword-history.json', 'utf8'));
    const previousRecord = previousData.find(item => item.keyword === keywordData.keyword);
    
    if (previousRecord && previousRecord.currentPosition && keywordData.currentPosition) {
      const change = previousRecord.currentPosition - keywordData.currentPosition;
      if (change > 0) return 'IMPROVING';
      if (change < 0) return 'DECLINING';
      return 'STABLE';
    }
  } catch (error) {
    // No previous data
  }
  
  return 'NEW';
}

async function saveTrackingResults(results) {
  const timestamp = new Date().toISOString();
  
  // Save current results
  fs.writeFileSync(`keyword-tracking-${timestamp.split('T')[0]}.json`, JSON.stringify(results, null, 2));
  
  // Update history file
  try {
    let history = [];
    if (fs.existsSync('keyword-history.json')) {
      history = JSON.parse(fs.readFileSync('keyword-history.json', 'utf8'));
    }
    
    history.push({
      timestamp,
      results: results.map(r => ({
        keyword: r.keyword,
        position: r.currentPosition,
        url: r.url
      }))
    });
    
    // Keep only last 30 days
    history = history.slice(-30);
    fs.writeFileSync('keyword-history.json', JSON.stringify(history, null, 2));
    
  } catch (error) {
    console.log('⚠️ History update failed:', error.message);
  }
  
  console.log('💾 Tracking results saved');
}

async function generateDailyReport(results) {
  const date = new Date().toISOString().split('T')[0];
  
  const report = `
# Movne SEO Progress Report - ${date}

## 📊 KEYWORD RANKINGS SUMMARY

### 🎯 HIGH PRIORITY KEYWORDS
${results.filter(r => r.priority === 'HIGH').map(r => 
  `- **${r.keyword}**: Position ${r.currentPosition || 'Not ranking'} (Target: #${r.targetPosition})`
).join('\n')}

### ⚡ MEDIUM PRIORITY KEYWORDS  
${results.filter(r => r.priority === 'MEDIUM').map(r =>
  `- **${r.keyword}**: Position ${r.currentPosition || 'Not ranking'} (Target: #${r.targetPosition})`
).join('\n')}

### 📈 LONG TAIL KEYWORDS
${results.filter(r => r.priority === 'LOW').map(r =>
  `- **${r.keyword}**: Position ${r.currentPosition || 'Not ranking'} (Target: #${r.targetPosition})`
).join('\n')}

## 🏆 PROGRESS TO GOALS

### Rankings Achieved:
${results.filter(r => r.currentPosition && r.currentPosition <= r.targetPosition).length} / ${results.length} keywords at target position

### Top Performers:
${results
  .filter(r => r.currentPosition && r.currentPosition <= 3)
  .map(r => `✅ ${r.keyword} - Position #${r.currentPosition}`)
  .join('\n') || 'Working toward first top 3 rankings...'}

### Areas for Improvement:
${results
  .filter(r => !r.currentPosition || r.currentPosition > r.targetPosition)
  .slice(0, 5)
  .map(r => `🔧 ${r.keyword} - Needs content/optimization`)
  .join('\n')}

## 📈 NEXT ACTIONS

1. **Content Creation**: Focus on keywords not ranking
2. **On-Page Optimization**: Improve existing content
3. **Technical SEO**: Continue site optimization  
4. **Link Building**: Increase domain authority
5. **Hebrew Content**: More local market focus

---
*Generated automatically by Movne SEO tracking system*
  `;
  
  fs.writeFileSync(`seo-report-${date}.md`, report);
  console.log(`📋 Daily report generated: seo-report-${date}.md`);
}

// Execute keyword tracking
trackKeywordRankings().catch(console.error);