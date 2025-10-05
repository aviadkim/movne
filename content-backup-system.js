const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * CONTENT BACKUP SYSTEM
 *
 * Automatically backs up WordPress content before deletion operations.
 * Allows full restoration of deleted content with all metadata.
 */

class ContentBackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, 'content-backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  }

  /**
   * Backup WordPress posts before deletion
   * @param {Array} postTitles - Array of post titles to backup
   * @returns {string} - Backup directory path
   */
  async backupPosts(postTitles) {
    console.log('📦 CONTENT BACKUP SYSTEM\n');
    console.log(`Backing up ${postTitles.length} posts before deletion...\n`);

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      // Login to WordPress
      await page.goto('https://movne.co.il/wp-admin');
      await page.fill('#user_login', process.env.WP_USERNAME);
      await page.fill('#user_pass', process.env.WP_PASSWORD);
      await page.click('#wp-submit');
      await page.waitForTimeout(3000);

      // Navigate to posts
      await page.goto('https://movne.co.il/wp-admin/edit.php');
      await page.waitForTimeout(2000);

      const timestamp = this.getTimestamp();
      const backupPath = path.join(this.backupDir, timestamp);
      fs.mkdirSync(backupPath, { recursive: true });

      const backedUpPosts = [];

      for (const postTitle of postTitles) {
        console.log(`   Backing up: ${postTitle.substring(0, 50)}...`);

        // Find post edit URL
        const editUrl = await page.evaluate((title) => {
          const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr'));
          const row = rows.find(r => r.querySelector('.row-title')?.textContent.trim() === title);
          return row?.querySelector('.edit a')?.href || '';
        }, postTitle);

        if (!editUrl) {
          console.log(`      ⚠️ Not found, skipping...`);
          continue;
        }

        // Go to post editor and extract all data
        await page.goto(editUrl);
        await page.waitForTimeout(2000);

        const postData = await page.evaluate(() => {
          const data = {
            title: '',
            content: '',
            excerpt: '',
            status: '',
            categories: [],
            tags: [],
            featuredImage: '',
            author: '',
            publishDate: '',
            modifiedDate: '',
            slug: '',
            metaDescription: '',
            focusKeyword: '',
            yoastTitle: '',
            rankMathTitle: '',
            rankMathDescription: '',
            customFields: {}
          };

          try {
            // WordPress Block Editor (Gutenberg) data
            if (window.wp?.data) {
              const editor = wp.data.select('core/editor');

              data.title = editor.getEditedPostAttribute('title') || '';
              data.content = editor.getEditedPostAttribute('content') || '';
              data.excerpt = editor.getEditedPostAttribute('excerpt') || '';
              data.status = editor.getEditedPostAttribute('status') || '';
              data.slug = editor.getEditedPostAttribute('slug') || '';
              data.publishDate = editor.getEditedPostAttribute('date') || '';
              data.modifiedDate = editor.getEditedPostAttribute('modified') || '';

              // Categories and tags
              data.categories = editor.getEditedPostAttribute('categories') || [];
              data.tags = editor.getEditedPostAttribute('tags') || [];

              // Featured image
              const featuredMedia = editor.getEditedPostAttribute('featured_media');
              if (featuredMedia) {
                data.featuredImage = featuredMedia;
              }

              // Meta fields
              const meta = editor.getEditedPostAttribute('meta') || {};
              data.metaDescription = meta._yoast_wpseo_metadesc || '';
              data.focusKeyword = meta._yoast_wpseo_focuskw || '';
              data.yoastTitle = meta._yoast_wpseo_title || '';
              data.rankMathTitle = meta.rank_math_title || '';
              data.rankMathDescription = meta.rank_math_description || '';
              data.customFields = meta;
            }
          } catch (e) {
            console.error('Error extracting post data:', e.message);
          }

          return data;
        });

        // Add to backup
        postData.backupTimestamp = timestamp;
        postData.originalEditUrl = editUrl;
        backedUpPosts.push(postData);

        // Save individual post backup
        const filename = `${postData.slug || 'post'}_${Date.now()}.json`;
        fs.writeFileSync(
          path.join(backupPath, filename),
          JSON.stringify(postData, null, 2)
        );

        console.log(`      ✅ Backed up to: ${filename}`);
      }

      // Save manifest file
      const manifest = {
        timestamp,
        date: new Date().toISOString(),
        totalPosts: backedUpPosts.length,
        posts: backedUpPosts.map(p => ({
          title: p.title,
          slug: p.slug,
          status: p.status,
          filename: `${p.slug || 'post'}_*.json`
        }))
      };

      fs.writeFileSync(
        path.join(backupPath, 'MANIFEST.json'),
        JSON.stringify(manifest, null, 2)
      );

      console.log(`\n✅ Backup complete!`);
      console.log(`   Backed up: ${backedUpPosts.length}/${postTitles.length} posts`);
      console.log(`   Location: ${backupPath}\n`);

      await browser.close();
      return backupPath;

    } catch (error) {
      console.error('❌ Backup error:', error.message);
      await browser.close();
      throw error;
    }
  }

  /**
   * Backup WordPress pages before deletion
   */
  async backupPages(pageTitles) {
    console.log('📦 CONTENT BACKUP SYSTEM - PAGES\n');
    console.log(`Backing up ${pageTitles.length} pages before deletion...\n`);

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto('https://movne.co.il/wp-admin');
      await page.fill('#user_login', process.env.WP_USERNAME);
      await page.fill('#user_pass', process.env.WP_PASSWORD);
      await page.click('#wp-submit');
      await page.waitForTimeout(3000);

      await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
      await page.waitForTimeout(2000);

      const timestamp = this.getTimestamp();
      const backupPath = path.join(this.backupDir, timestamp);
      fs.mkdirSync(backupPath, { recursive: true });

      const backedUpPages = [];

      for (const pageTitle of pageTitles) {
        console.log(`   Backing up: ${pageTitle}`);

        const editUrl = await page.evaluate((title) => {
          const rows = Array.from(document.querySelectorAll('.wp-list-table tbody tr'));
          const row = rows.find(r => r.querySelector('.row-title')?.textContent.trim() === title);
          return row?.querySelector('.edit a')?.href || '';
        }, pageTitle);

        if (!editUrl) {
          console.log(`      ⚠️ Not found, skipping...`);
          continue;
        }

        await page.goto(editUrl);
        await page.waitForTimeout(2000);

        const pageData = await page.evaluate(() => {
          const data = {
            title: '',
            content: '',
            status: '',
            slug: '',
            template: '',
            parent: '',
            menuOrder: 0,
            rankMathTitle: '',
            rankMathDescription: '',
            rankMathFocusKeyword: '',
            customFields: {}
          };

          try {
            if (window.wp?.data) {
              const editor = wp.data.select('core/editor');

              data.title = editor.getEditedPostAttribute('title') || '';
              data.content = editor.getEditedPostAttribute('content') || '';
              data.status = editor.getEditedPostAttribute('status') || '';
              data.slug = editor.getEditedPostAttribute('slug') || '';
              data.template = editor.getEditedPostAttribute('template') || '';
              data.parent = editor.getEditedPostAttribute('parent') || '';
              data.menuOrder = editor.getEditedPostAttribute('menu_order') || 0;

              const meta = editor.getEditedPostAttribute('meta') || {};
              data.rankMathTitle = meta.rank_math_title || '';
              data.rankMathDescription = meta.rank_math_description || '';
              data.rankMathFocusKeyword = meta.rank_math_focus_keyword || '';
              data.customFields = meta;
            }
          } catch (e) {
            console.error('Error extracting page data:', e.message);
          }

          return data;
        });

        pageData.backupTimestamp = timestamp;
        pageData.originalEditUrl = editUrl;
        backedUpPages.push(pageData);

        const filename = `${pageData.slug || 'page'}_${Date.now()}.json`;
        fs.writeFileSync(
          path.join(backupPath, filename),
          JSON.stringify(pageData, null, 2)
        );

        console.log(`      ✅ Backed up to: ${filename}`);
      }

      const manifest = {
        timestamp,
        date: new Date().toISOString(),
        type: 'pages',
        totalPages: backedUpPages.length,
        pages: backedUpPages.map(p => ({
          title: p.title,
          slug: p.slug,
          status: p.status
        }))
      };

      fs.writeFileSync(
        path.join(backupPath, 'MANIFEST.json'),
        JSON.stringify(manifest, null, 2)
      );

      console.log(`\n✅ Backup complete!`);
      console.log(`   Backed up: ${backedUpPages.length}/${pageTitles.length} pages`);
      console.log(`   Location: ${backupPath}\n`);

      await browser.close();
      return backupPath;

    } catch (error) {
      console.error('❌ Backup error:', error.message);
      await browser.close();
      throw error;
    }
  }

  /**
   * List all available backups
   */
  listBackups() {
    console.log('📋 AVAILABLE BACKUPS\n');

    const backups = fs.readdirSync(this.backupDir)
      .filter(dir => fs.statSync(path.join(this.backupDir, dir)).isDirectory())
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('   No backups found.\n');
      return [];
    }

    backups.forEach((backup, index) => {
      const manifestPath = path.join(this.backupDir, backup, 'MANIFEST.json');

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const type = manifest.type || 'posts';
        const count = manifest.totalPosts || manifest.totalPages || 0;

        console.log(`   ${index + 1}. ${backup}`);
        console.log(`      Type: ${type}, Items: ${count}`);
        console.log(`      Date: ${new Date(manifest.date).toLocaleString()}\n`);
      }
    });

    return backups;
  }

  /**
   * Restore posts from backup
   */
  async restoreFromBackup(backupTimestamp, specificTitles = null) {
    console.log('🔄 RESTORING FROM BACKUP\n');
    console.log(`Backup: ${backupTimestamp}\n`);

    const backupPath = path.join(this.backupDir, backupTimestamp);

    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup not found!');
      return;
    }

    const manifestPath = path.join(backupPath, 'MANIFEST.json');
    if (!fs.existsSync(manifestPath)) {
      console.error('❌ Backup manifest not found!');
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const backupFiles = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json') && f !== 'MANIFEST.json');

    console.log(`Found ${backupFiles.length} items to restore\n`);

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto('https://movne.co.il/wp-admin');
      await page.fill('#user_login', process.env.WP_USERNAME);
      await page.fill('#user_pass', process.env.WP_PASSWORD);
      await page.click('#wp-submit');
      await page.waitForTimeout(3000);

      let restored = 0;

      for (const file of backupFiles) {
        const itemData = JSON.parse(fs.readFileSync(path.join(backupPath, file), 'utf-8'));

        // Skip if specific titles requested and this isn't one of them
        if (specificTitles && !specificTitles.includes(itemData.title)) {
          continue;
        }

        console.log(`   Restoring: ${itemData.title}`);

        // Create new post/page
        const isPage = manifest.type === 'pages';
        const newUrl = isPage
          ? 'https://movne.co.il/wp-admin/post-new.php?post_type=page'
          : 'https://movne.co.il/wp-admin/post-new.php';

        await page.goto(newUrl);
        await page.waitForTimeout(3000);

        // Populate data using WordPress API
        const success = await page.evaluate((data) => {
          try {
            if (!window.wp?.data) return false;

            const dispatch = wp.data.dispatch('core/editor');

            // Set basic fields
            dispatch.editPost({
              title: data.title,
              content: data.content,
              excerpt: data.excerpt || '',
              status: data.status || 'draft'
            });

            // Set meta fields
            const metaUpdates = {};
            if (data.rankMathTitle) metaUpdates.rank_math_title = data.rankMathTitle;
            if (data.rankMathDescription) metaUpdates.rank_math_description = data.rankMathDescription;
            if (data.rankMathFocusKeyword) metaUpdates.rank_math_focus_keyword = data.rankMathFocusKeyword;

            if (Object.keys(metaUpdates).length > 0) {
              dispatch.editPost({ meta: metaUpdates });
            }

            return true;
          } catch (e) {
            console.error('Restore error:', e.message);
            return false;
          }
        }, itemData);

        if (success) {
          await page.keyboard.press('Control+S');
          await page.waitForTimeout(2000);
          console.log(`      ✅ Restored`);
          restored++;
        } else {
          console.log(`      ❌ Failed to restore`);
        }
      }

      console.log(`\n✅ Restore complete!`);
      console.log(`   Restored: ${restored}/${backupFiles.length} items\n`);

      await browser.close();

    } catch (error) {
      console.error('❌ Restore error:', error.message);
      await browser.close();
      throw error;
    }
  }
}

// Export for use in other scripts
module.exports = ContentBackupSystem;

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const backupSystem = new ContentBackupSystem();

  (async () => {
    if (command === 'list') {
      backupSystem.listBackups();
    } else if (command === 'restore') {
      const timestamp = args[1];
      if (!timestamp) {
        console.log('Usage: node content-backup-system.js restore <timestamp>');
        return;
      }
      await backupSystem.restoreFromBackup(timestamp);
    } else {
      console.log('📦 CONTENT BACKUP SYSTEM\n');
      console.log('Commands:');
      console.log('  node content-backup-system.js list');
      console.log('  node content-backup-system.js restore <timestamp>\n');
    }
  })();
}
