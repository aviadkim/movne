const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 UPRESS BACKUP HELPER\n');

  try {
    await page.goto('https://my.upress.co.il/account/websites/movne.co.il?tab=backups');
    await page.waitForTimeout(5000);

    console.log('📋 UPress page loaded');
    console.log('✅ You are logged in\n');

    console.log('📥 MANUAL INSTRUCTIONS:\n');
    console.log('1. In the browser window, find the BACKUPS section');
    console.log('2. Look for backup from: October 4, 2025 (yesterday)');
    console.log('3. Click the "..." or "Actions" menu for that backup');
    console.log('4. Select one of these options:');
    console.log('   • "Partial Restore" → Select "Posts" only');
    console.log('   • "Download Database"');
    console.log('   • "Export Posts"\n');

    console.log('⚠️  IMPORTANT:');
    console.log('   - We ONLY need the blog posts (articles)');
    console.log('   - Do NOT restore pages (we fixed those today)');
    console.log('   - Do NOT restore settings (we optimized those)\n');

    console.log('⏳ Browser will stay open for 5 minutes...');
    console.log('   Take your time to find and download the backup\n');

    await page.waitForTimeout(300000); // 5 minutes

    console.log('\n' + '='.repeat(70));
    console.log('NEXT STEPS:');
    console.log('='.repeat(70));
    console.log('\nIf you downloaded a file:');
    console.log('   1. Tell me the filename (e.g., "backup.sql" or "posts.xml")');
    console.log('   2. Tell me where it was saved');
    console.log('   3. I will import ONLY the blog posts\n');

    console.log('If UPress has "Partial Restore":');
    console.log('   1. Click Partial Restore');
    console.log('   2. Select ONLY "Posts" checkbox');
    console.log('   3. Click Restore');
    console.log('   4. Blog posts will be restored automatically');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
