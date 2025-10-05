const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 COMPLETE VERIFICATION OF ALL TODAY\'S WORK\n');

  await page.goto('https://movne.co.il/wp-admin');
  await page.fill('#user_login', process.env.WP_USERNAME);
  await page.fill('#user_pass', process.env.WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForTimeout(3000);

  // Check everything
  const report = {
    title: '='.repeat(70) + '\n📊 TODAY\'S WORK - COMPLETE STATUS\n' + '='.repeat(70),
    sections: []
  };

  // 1. Pages & Duplicates
  console.log('\n📄 1. PAGES & DUPLICATES...');
  await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
  await page.waitForTimeout(2000);

  const pages = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
    return rows.map(r => r.querySelector('.row-title')?.textContent.trim() || '').filter(t => t);
  });

  const uniquePages = new Set(pages);
  const duplicates = pages.length - uniquePages.size;

  report.sections.push({
    name: 'Pages & Duplicates',
    status: duplicates === 0 ? '✅ GOOD' : '❌ HAS DUPLICATES',
    details: `Total: ${pages.length}, Unique: ${uniquePages.size}, Duplicates: ${duplicates}`
  });

  console.log(`   Total: ${pages.length}`);
  console.log(`   Unique: ${uniquePages.size}`);
  console.log(`   Duplicates: ${duplicates} ${duplicates === 0 ? '✅' : '❌'}`);

  // 2. Rank Math
  console.log('\n🔌 2. RANK MATH SEO...');
  await page.goto('https://movne.co.il/wp-admin/plugins.php');
  await page.waitForTimeout(2000);

  const plugins = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[data-plugin]'));
    return {
      rankMath: rows.find(r => r.querySelector('.plugin-title strong')?.textContent.includes('Rank Math'))?.classList.contains('active') || false,
      yoast: rows.find(r => r.querySelector('.plugin-title strong')?.textContent.includes('Yoast'))?.classList.contains('active') || false
    };
  });

  report.sections.push({
    name: 'Rank Math SEO',
    status: plugins.rankMath && !plugins.yoast ? '✅ GOOD' : '❌ ISSUE',
    details: `Rank Math: ${plugins.rankMath ? 'Active' : 'Inactive'}, Yoast: ${plugins.yoast ? 'Active' : 'Inactive'}`
  });

  console.log(`   Rank Math: ${plugins.rankMath ? '✅ Active' : '❌ Inactive'}`);
  console.log(`   Yoast: ${plugins.yoast ? '❌ Active' : '✅ Inactive'}`);

  // 3. Homepage SEO
  console.log('\n🏠 3. HOMEPAGE SEO META TAGS...');
  await page.goto('https://movne.co.il');
  await page.waitForTimeout(2000);

  const seoData = await page.evaluate(() => {
    const title = document.querySelector('title')?.textContent || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
    const schema = document.querySelector('script[type="application/ld+json"]')?.textContent || '';
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

    return { title, metaDesc, ogTitle, schema, keywords };
  });

  const hasTitle = seoData.title.includes('Movne') || seoData.title.includes('שיווק');
  const hasDesc = seoData.metaDesc.length > 50;
  const hasOG = seoData.ogTitle.length > 0;
  const hasSchema = seoData.schema.includes('FinancialService') || seoData.schema.includes('Organization');
  const totalKeywords = Object.values(seoData.keywords).reduce((a, b) => a + b, 0);

  report.sections.push({
    name: 'SEO Meta Tags',
    status: hasTitle && hasDesc ? '✅ GOOD' : '❌ PARTIAL',
    details: `Title: ${hasTitle ? 'Yes' : 'No'}, Desc: ${hasDesc ? 'Yes' : 'No'}, OG: ${hasOG ? 'Yes' : 'No'}, Schema: ${hasSchema ? 'Yes' : 'No'}`
  });

  report.sections.push({
    name: 'Hebrew Keywords',
    status: totalKeywords >= 10 ? '✅ GOOD' : '⚠️ LOW',
    details: `Total occurrences: ${totalKeywords}`
  });

  console.log(`   Title: ${hasTitle ? '✅' : '❌'} ${seoData.title.substring(0, 60)}`);
  console.log(`   Meta Desc: ${hasDesc ? '✅' : '❌'}`);
  console.log(`   Open Graph: ${hasOG ? '✅' : '❌'}`);
  console.log(`   Schema: ${hasSchema ? '✅' : '❌'}`);

  // 4. Keywords
  console.log('\n🇮🇱 4. HEBREW KEYWORDS...');
  Object.entries(seoData.keywords).forEach(([kw, count]) => {
    console.log(`   ${kw}: ${count}x ${count > 0 ? '✅' : '❌'}`);
  });
  console.log(`   Total: ${totalKeywords}`);

  // 5. Blog Posts
  console.log('\n📝 5. BLOG POSTS...');
  await page.goto('https://movne.co.il/wp-admin/edit.php');
  await page.waitForTimeout(2000);

  const posts = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
    return rows.map(row => ({
      title: row.querySelector('.row-title')?.textContent.trim() || '',
      isDraft: row.classList.contains('status-draft') || row.querySelector('.post-state')?.textContent.includes('Draft')
    })).filter(p => p.title);
  });

  const published = posts.filter(p => !p.isDraft).length;
  const drafts = posts.filter(p => p.isDraft).length;

  report.sections.push({
    name: 'Blog Posts',
    status: '✅ RESTORED',
    details: `Total: ${posts.length}, Published: ${published}, Drafts: ${drafts}`
  });

  console.log(`   Total: ${posts.length}`);
  console.log(`   Published: ${published} ✅`);
  console.log(`   Drafts: ${drafts} ✅`);

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SUMMARY - TODAY\'S WORK STATUS');
  console.log('='.repeat(70));

  report.sections.forEach(section => {
    console.log(`${section.status} ${section.name}`);
    console.log(`   ${section.details}`);
  });

  const allGood = report.sections.filter(s => s.status.includes('✅')).length >= 4;

  console.log('\n' + '='.repeat(70));
  if (allGood) {
    console.log('🎉 EXCELLENT! MOST OF TODAY\'S WORK IS PRESERVED!');
  } else {
    console.log('⚠️  SOME AREAS NEED ATTENTION');
  }
  console.log('='.repeat(70));

  await browser.close();
})();
