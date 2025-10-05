const { chromium } = require('playwright');
require('dotenv').config();

async function verifyTodaysWork() {
  console.log('🔍 COMPREHENSIVE VERIFICATION OF TODAY\'S WORK\n');
  console.log('Testing if wp-content restore affected our fixes...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const report = {
    seo: { status: 'unknown', details: [] },
    pages: { status: 'unknown', details: [] },
    keywords: { status: 'unknown', details: [] },
    rankMath: { status: 'unknown', details: [] },
    blogPosts: { status: 'unknown', details: [] }
  };

  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('https://movne.co.il/wp-admin');
    await page.fill('#user_login', process.env.WP_USERNAME);
    await page.fill('#user_pass', process.env.WP_PASSWORD);
    await page.click('#wp-submit');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in\n');

    // TEST 1: Check if duplicates are still deleted
    console.log('📄 TEST 1: Checking page count (duplicates should be deleted)...');
    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForTimeout(2000);

    const pages = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
      return rows.map(row => {
        const titleEl = row.querySelector('.row-title');
        return titleEl ? titleEl.textContent.trim() : '';
      }).filter(t => t);
    });

    const pageCount = pages.length;
    const duplicateCount = pages.length - new Set(pages).size;

    report.pages.status = duplicateCount === 0 ? '✅ GOOD' : '❌ ISSUE';
    report.pages.details = [
      `Total pages: ${pageCount}`,
      `Duplicates: ${duplicateCount}`,
      `Unique pages: ${new Set(pages).size}`
    ];

    console.log(`   Total pages: ${pageCount}`);
    console.log(`   Duplicates: ${duplicateCount}`);
    console.log(`   Status: ${report.pages.status}\n`);

    // TEST 2: Check Rank Math plugin
    console.log('🔌 TEST 2: Checking Rank Math SEO plugin...');
    await page.goto('https://movne.co.il/wp-admin/plugins.php');
    await page.waitForTimeout(2000);

    const rankMathStatus = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-plugin]'));
      const rankMath = rows.find(r =>
        r.querySelector('.plugin-title strong')?.textContent.includes('Rank Math')
      );
      const yoast = rows.find(r =>
        r.querySelector('.plugin-title strong')?.textContent.includes('Yoast')
      );

      return {
        rankMathActive: rankMath?.classList.contains('active') || false,
        yoastActive: yoast?.classList.contains('active') || false
      };
    });

    report.rankMath.status = rankMathStatus.rankMathActive && !rankMathStatus.yoastActive ? '✅ GOOD' : '❌ ISSUE';
    report.rankMath.details = [
      `Rank Math: ${rankMathStatus.rankMathActive ? 'Active ✅' : 'Inactive ❌'}`,
      `Yoast: ${rankMathStatus.yoastActive ? 'Active (should be off) ❌' : 'Inactive ✅'}`
    ];

    console.log(`   Rank Math: ${rankMathStatus.rankMathActive ? 'Active ✅' : 'Inactive ❌'}`);
    console.log(`   Yoast: ${rankMathStatus.yoastActive ? 'Active ❌' : 'Inactive ✅'}`);
    console.log(`   Status: ${report.rankMath.status}\n`);

    // TEST 3: Check homepage SEO and keywords
    console.log('🏠 TEST 3: Checking homepage SEO & Hebrew keywords...');
    await page.goto('https://movne.co.il');
    await page.waitForTimeout(2000);

    const homePageData = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
      const body = document.body.textContent || '';

      const keywords = {
        'מוצרים מובנים': (body.match(/מוצרים מובנים/g) || []).length,
        'שיווק השקעות': (body.match(/שיווק השקעות/g) || []).length,
        'פורטפוליו השקעות': (body.match(/פורטפוליו השקעות/g) || []).length,
        'משקיעים כשירים': (body.match(/משקיעים כשירים/g) || []).length,
        'השקעות מובנות': (body.match(/השקעות מובנות/g) || []).length,
        'מוצרי השקעה': (body.match(/מוצרי השקעה/g) || []).length,
        'שירותי השקעה': (body.match(/שירותי השקעה/g) || []).length
      };

      return { title, metaDesc, keywords };
    });

    const hasTitle = homePageData.title.includes('Movne') || homePageData.title.includes('שיווק השקעות');
    const hasDesc = homePageData.metaDesc.length > 50;
    const keywordCount = Object.values(homePageData.keywords).reduce((a, b) => a + b, 0);

    report.seo.status = hasTitle && hasDesc ? '✅ GOOD' : '❌ ISSUE';
    report.seo.details = [
      `Title: ${homePageData.title.substring(0, 60)}...`,
      `Meta Desc: ${homePageData.metaDesc.substring(0, 60)}...`,
      `Title present: ${hasTitle ? 'Yes ✅' : 'No ❌'}`,
      `Description present: ${hasDesc ? 'Yes ✅' : 'No ❌'}`
    ];

    report.keywords.status = keywordCount >= 5 ? '✅ GOOD' : '⚠️ PARTIAL';
    report.keywords.details = Object.entries(homePageData.keywords).map(
      ([kw, count]) => `${kw}: ${count} occurrences`
    );

    console.log(`   Title: ${homePageData.title.substring(0, 50)}...`);
    console.log(`   Meta Desc: ${hasDesc ? 'Present ✅' : 'Missing ❌'}`);
    console.log(`   Keywords found: ${keywordCount}`);
    console.log(`   SEO Status: ${report.seo.status}`);
    console.log(`   Keywords Status: ${report.keywords.status}\n`);

    // TEST 4: Check blog posts
    console.log('📝 TEST 4: Checking blog posts restoration...');
    await page.goto('https://movne.co.il/wp-admin/edit.php');
    await page.waitForTimeout(2000);

    const blogPosts = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
      return rows.map(row => {
        const titleEl = row.querySelector('.row-title');
        return titleEl ? titleEl.textContent.trim() : '';
      }).filter(t => t);
    });

    report.blogPosts.status = blogPosts.length > 0 ? '✅ RESTORED' : '❌ MISSING';
    report.blogPosts.details = [
      `Total posts: ${blogPosts.length}`,
      `Sample posts: ${blogPosts.slice(0, 3).join(', ')}`
    ];

    console.log(`   Blog posts found: ${blogPosts.length}`);
    console.log(`   Status: ${report.blogPosts.status}\n`);

    // FINAL SUMMARY
    console.log('='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n✅ Pages (Duplicates Deleted): ${report.pages.status}`);
    console.log(`   ${report.pages.details.join(', ')}`);
    console.log(`\n✅ Rank Math Plugin: ${report.rankMath.status}`);
    console.log(`   ${report.rankMath.details.join(', ')}`);
    console.log(`\n✅ SEO Meta Tags: ${report.seo.status}`);
    console.log(`   ${report.seo.details[0]}`);
    console.log(`\n✅ Hebrew Keywords: ${report.keywords.status}`);
    console.log(`   Total keyword occurrences: ${Object.values(homePageData.keywords).reduce((a, b) => a + b, 0)}`);
    console.log(`\n✅ Blog Posts: ${report.blogPosts.status}`);
    console.log(`   ${report.blogPosts.details[0]}`);

    const allGood =
      report.pages.status.includes('✅') &&
      report.rankMath.status.includes('✅') &&
      report.seo.status.includes('✅') &&
      report.blogPosts.status.includes('✅');

    console.log('\n' + '='.repeat(70));
    if (allGood) {
      console.log('🎉 EXCELLENT! ALL TODAY\'S WORK IS INTACT!');
      console.log('✅ wp-content restore did NOT affect our fixes');
      console.log('✅ Blog posts are restored');
      console.log('✅ SEO optimizations are preserved');
    } else {
      console.log('⚠️  SOME ISSUES DETECTED');
      console.log('   Review the summary above for details');
    }
    console.log('='.repeat(70));

    // Save report
    const fs = require('fs');
    fs.writeFileSync(
      'verification-report.json',
      JSON.stringify({ timestamp: new Date(), report }, null, 2)
    );
    console.log('\n📄 Detailed report saved: verification-report.json');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    await browser.close();
  }
}

verifyTodaysWork();
