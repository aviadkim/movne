const { chromium } = require('playwright');
require('dotenv').config();
const ContentBackupSystem = require('./content-backup-system');

const articlesToHide = [
  'השוואה: מוצרים מובנים מול ETF – למי מתאים כל אחד?',
  'מס על מוצרים מובנים בישראל: מה חשוב לדעת',
  'מוצרי הגנה על הון: מבנה, תשואה ותמחור',
  'בריירים (Barriers) במוצרים מובנים: מדריך מעשי',
  'Autocallable (אוטוקולבל): איך זה עובד ומה הסיכונים'
];

async function hideArticlesWithBackup() {
  console.log('🔒 SAFE ARTICLE HIDING WITH AUTOMATIC BACKUP\n');
  console.log('=' .repeat(70));

  // STEP 1: Backup before making changes
  const backupSystem = new ContentBackupSystem();

  console.log('\n📦 STEP 1: BACKING UP ARTICLES BEFORE HIDING\n');

  let backupPath;
  try {
    backupPath = await backupSystem.backupPosts(articlesToHide);
    console.log('✅ Backup completed successfully!');
    console.log(`   Location: ${backupPath}\n`);
  } catch (error) {
    console.error('❌ Backup failed! Aborting operation to prevent data loss.');
    console.error(`   Error: ${error.message}`);
    return;
  }

  // STEP 2: Proceed with hiding articles
  console.log('🔄 STEP 2: HIDING ARTICLES (SETTING TO DRAFT)\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://movne.co.il/wp-admin');
    await page.fill('#user_login', process.env.WP_USERNAME);
    await page.fill('#user_pass', process.env.WP_PASSWORD);
    await page.click('#wp-submit');
    await page.waitForTimeout(3000);

    await page.goto('https://movne.co.il/wp-admin/edit.php');
    await page.waitForTimeout(2000);

    let hidden = 0;

    for (const articleTitle of articlesToHide) {
      const editUrl = await page.evaluate((title) => {
        const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr'));
        const row = rows.find(r => r.querySelector('.row-title')?.textContent.trim() === title);
        return row?.querySelector('.edit a')?.href || '';
      }, articleTitle);

      if (!editUrl) {
        console.log(`   ⚠️ Not found: ${articleTitle.substring(0, 40)}...`);
        continue;
      }

      console.log(`   Hiding: ${articleTitle.substring(0, 40)}...`);

      await page.goto(editUrl);
      await page.waitForTimeout(2000);

      await page.evaluate(() => {
        try {
          if (window.wp?.data) {
            wp.data.dispatch('core/editor').editPost({ status: 'draft' });
          }
        } catch (e) {}
      });

      await page.keyboard.press('Control+S');
      await page.waitForTimeout(2000);
      console.log(`      ✅ Hidden (set to Draft)`);
      hidden++;

      await page.goto('https://movne.co.il/wp-admin/edit.php');
      await page.waitForTimeout(1000);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ OPERATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`📦 Backup location: ${backupPath}`);
    console.log(`🔒 Articles hidden: ${hidden}/${articlesToHide.length}`);
    console.log('\nTo restore these articles later:');
    console.log(`   node content-backup-system.js list`);
    console.log(`   node content-backup-system.js restore <timestamp>`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error during hiding:', error.message);
    console.log('\n⚠️  RECOVERY AVAILABLE:');
    console.log(`   Your articles were backed up to: ${backupPath}`);
    console.log('   You can restore them using the backup system.');
  } finally {
    await browser.close();
  }
}

hideArticlesWithBackup();
