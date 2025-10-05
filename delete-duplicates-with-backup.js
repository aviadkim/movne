const { chromium } = require('playwright');
require('dotenv').config();
const ContentBackupSystem = require('./content-backup-system');

async function deleteDuplicatesWithBackup() {
  console.log('🔒 SAFE DUPLICATE DELETION WITH AUTOMATIC BACKUP\n');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://movne.co.il/wp-admin');
    await page.fill('#user_login', process.env.WP_USERNAME);
    await page.fill('#user_pass', process.env.WP_PASSWORD);
    await page.click('#wp-submit');
    await page.waitForTimeout(3000);

    // STEP 1: Identify duplicates
    console.log('\n🔍 STEP 1: IDENTIFYING DUPLICATE PAGES\n');

    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForTimeout(2000);

    const allPages = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
      return rows.map(row => {
        const titleEl = row.querySelector('.row-title');
        const trashLink = row.querySelector('.trash a');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          trashUrl: trashLink ? trashLink.href : ''
        };
      }).filter(p => p.title);
    });

    const seen = new Set();
    const duplicates = [];

    for (const pageData of allPages) {
      if (seen.has(pageData.title)) {
        duplicates.push(pageData);
      } else {
        seen.add(pageData.title);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!\n');
      await browser.close();
      return;
    }

    console.log(`Found ${duplicates.length} duplicate pages:`);
    duplicates.forEach((dup, i) => {
      console.log(`   ${i + 1}. ${dup.title}`);
    });
    console.log('');

    // STEP 2: Backup before deletion
    const backupSystem = new ContentBackupSystem();

    console.log('📦 STEP 2: BACKING UP DUPLICATES BEFORE DELETION\n');

    const duplicateTitles = duplicates.map(d => d.title);
    let backupPath;

    try {
      backupPath = await backupSystem.backupPages(duplicateTitles);
      console.log('✅ Backup completed successfully!');
      console.log(`   Location: ${backupPath}\n`);
    } catch (error) {
      console.error('❌ Backup failed! Aborting deletion to prevent data loss.');
      console.error(`   Error: ${error.message}`);
      await browser.close();
      return;
    }

    // STEP 3: Delete duplicates
    console.log('🗑️  STEP 3: DELETING DUPLICATE PAGES\n');

    let deleted = 0;
    for (const dup of duplicates) {
      if (dup.trashUrl) {
        console.log(`   Deleting: ${dup.title.substring(0, 50)}...`);
        await page.goto(dup.trashUrl);
        await page.waitForTimeout(800);
        deleted++;
        console.log(`      ✅ Deleted`);
      }
    }

    // STEP 4: Verify
    console.log('\n🔍 STEP 4: VERIFYING RESULTS\n');

    await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
    await page.waitForTimeout(2000);

    const remainingPages = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr:not(.no-items)'));
      return rows.map(row => {
        const titleEl = row.querySelector('.row-title');
        return titleEl ? titleEl.textContent.trim() : '';
      }).filter(t => t);
    });

    const uniqueCount = new Set(remainingPages).size;
    const remainingDuplicates = remainingPages.length - uniqueCount;

    console.log(`   Total pages: ${remainingPages.length}`);
    console.log(`   Unique pages: ${uniqueCount}`);
    console.log(`   Remaining duplicates: ${remainingDuplicates}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ OPERATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`📦 Backup location: ${backupPath}`);
    console.log(`🗑️  Duplicates deleted: ${deleted}`);
    console.log(`✅ Unique pages: ${uniqueCount}`);
    console.log(`${remainingDuplicates === 0 ? '✅' : '⚠️'} Remaining duplicates: ${remainingDuplicates}`);
    console.log('\nTo restore deleted pages:');
    console.log(`   node content-backup-system.js list`);
    console.log(`   node content-backup-system.js restore <timestamp>`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

deleteDuplicatesWithBackup();
