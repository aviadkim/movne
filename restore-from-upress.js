const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔐 ACCESSING UPRESS BACKUP SYSTEM\n');

  try {
    // Go to UPress backup page
    await page.goto('https://my.upress.co.il/account/websites/movne.co.il?tab=backups');
    await page.waitForTimeout(5000);

    console.log('📋 UPress backup page loaded');
    console.log('⚠️  MANUAL ACTION REQUIRED:\n');
    console.log('1. Please log in to UPress in the browser window');
    console.log('2. Navigate to Backups tab');
    console.log('3. Find yesterday\'s backup (October 4, 2025)');
    console.log('4. Look for "Download" or "Restore" option\n');

    console.log('⏳ Waiting 2 minutes for you to access the backup...\n');
    console.log('Instructions:');
    console.log('   - If you see a "Download Database" option, click it');
    console.log('   - If you see "Partial Restore", select "Posts only"');
    console.log('   - Save the backup file to Desktop\n');

    // Wait for user to download
    await page.waitForTimeout(120000); // 2 minutes

    console.log('\n' + '='.repeat(70));
    console.log('📥 BACKUP ACCESS COMPLETE');
    console.log('='.repeat(70));
    console.log('\nNext Steps:');
    console.log('1. Check your Downloads folder for the backup file');
    console.log('2. Tell me the filename and I\'ll help import the blog posts');
    console.log('3. We\'ll keep all today\'s SEO fixes intact');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🔍 Browser kept open for manual backup access...');
    console.log('Press Ctrl+C when done');
  }
})();
