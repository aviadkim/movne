# 📦 Content Backup & Restore System

## Overview

This automated backup system prevents content loss by creating complete backups before any deletion operations. All backups include full content, metadata, SEO fields, and restoration capabilities.

---

## 🎯 Purpose

**Problem Solved:** Prevents accidental permanent deletion of WordPress content (posts, pages, articles)

**Key Features:**
- ✅ Automatic backup before deletion
- ✅ Complete content preservation (title, content, SEO metadata, custom fields)
- ✅ Timestamp-based versioning
- ✅ Simple restore process
- ✅ Hebrew content fully supported

---

## 🚀 Quick Start

### Safe Article Hiding (with backup)
```bash
node hide-articles-with-backup.js
```

### Safe Duplicate Deletion (with backup)
```bash
node delete-duplicates-with-backup.js
```

### List All Backups
```bash
node content-backup-system.js list
```

### Restore from Backup
```bash
node content-backup-system.js restore <timestamp>
```

---

## 📚 Complete Usage Guide

### 1. Automatic Backup Scripts (RECOMMENDED)

#### Hide Articles with Backup
```bash
# Automatically backs up articles before hiding them
node hide-articles-with-backup.js
```

**What it does:**
1. Creates backup of 5 articles without pictures
2. Sets them to Draft status (hides from website)
3. Shows backup location for future restoration

**Articles backed up:**
- השוואה: מוצרים מובנים מול ETF
- מס על מוצרים מובנים בישראל
- מוצרי הגנה על הון
- בריירים (Barriers) במוצרים מובנים
- Autocallable (אוטוקולבל)

#### Delete Duplicates with Backup
```bash
# Automatically backs up duplicate pages before deletion
node delete-duplicates-with-backup.js
```

**What it does:**
1. Identifies all duplicate pages
2. Backs up all duplicates
3. Deletes duplicates
4. Verifies no duplicates remain

---

### 2. Manual Backup Operations

#### Backup Specific Posts
```javascript
const ContentBackupSystem = require('./content-backup-system');
const backupSystem = new ContentBackupSystem();

const postsToBackup = [
  'Article Title 1',
  'Article Title 2',
  'Article Title 3'
];

await backupSystem.backupPosts(postsToBackup);
```

#### Backup Specific Pages
```javascript
const ContentBackupSystem = require('./content-backup-system');
const backupSystem = new ContentBackupSystem();

const pagesToBackup = [
  'בית',
  'גילוי נאות',
  'הצהרת משקיע כשיר'
];

await backupSystem.backupPages(pagesToBackup);
```

---

### 3. Viewing Backups

```bash
node content-backup-system.js list
```

**Example Output:**
```
📋 AVAILABLE BACKUPS

   1. 2025-10-05T14-30-00-000Z
      Type: posts, Items: 5
      Date: 10/5/2025, 2:30:00 PM

   2. 2025-10-05T12-15-00-000Z
      Type: pages, Items: 12
      Date: 10/5/2025, 12:15:00 PM
```

---

### 4. Restoring Content

#### Restore All Items from a Backup
```bash
node content-backup-system.js restore 2025-10-05T14-30-00-000Z
```

#### Restore Specific Items Programmatically
```javascript
const ContentBackupSystem = require('./content-backup-system');
const backupSystem = new ContentBackupSystem();

const timestamp = '2025-10-05T14-30-00-000Z';
const specificTitles = [
  'מס על מוצרים מובנים בישראל: מה חשוב לדעת',
  'Autocallable (אוטוקולבל): איך זה עובד ומה הסיכונים'
];

await backupSystem.restoreFromBackup(timestamp, specificTitles);
```

---

## 📁 Backup Structure

### Directory Layout
```
movne-main/
├── content-backups/
│   ├── 2025-10-05T14-30-00-000Z/          # Backup timestamp
│   │   ├── MANIFEST.json                  # Backup metadata
│   │   ├── article-1_1728140000000.json   # Individual post backup
│   │   ├── article-2_1728140001000.json
│   │   └── article-3_1728140002000.json
│   └── 2025-10-05T12-15-00-000Z/
│       ├── MANIFEST.json
│       └── ...
```

### Backup File Contents

#### MANIFEST.json
```json
{
  "timestamp": "2025-10-05T14-30-00-000Z",
  "date": "2025-10-05T14:30:00.000Z",
  "type": "posts",
  "totalPosts": 5,
  "posts": [
    {
      "title": "Article Title",
      "slug": "article-slug",
      "status": "publish"
    }
  ]
}
```

#### Individual Post Backup
```json
{
  "title": "מס על מוצרים מובנים בישראל: מה חשוב לדעת",
  "content": "<!-- Full article content -->",
  "excerpt": "...",
  "status": "publish",
  "slug": "tax-on-structured-products",
  "categories": [1, 5],
  "tags": [12, 15, 18],
  "rankMathTitle": "SEO title",
  "rankMathDescription": "Meta description",
  "rankMathFocusKeyword": "מוצרים מובנים",
  "customFields": {},
  "backupTimestamp": "2025-10-05T14-30-00-000Z",
  "originalEditUrl": "https://movne.co.il/wp-admin/post.php?post=123&action=edit"
}
```

---

## 🔄 Common Workflows

### Workflow 1: Hide Articles Safely
```bash
# 1. Run automatic backup + hide script
node hide-articles-with-backup.js

# 2. Verify articles are hidden on website
# Visit: https://movne.co.il/blog/

# 3. If you need to restore later:
node content-backup-system.js list
node content-backup-system.js restore <timestamp>
```

### Workflow 2: Clean Duplicates Safely
```bash
# 1. Run automatic backup + delete script
node delete-duplicates-with-backup.js

# 2. Verify in WordPress admin
# Visit: https://movne.co.il/wp-admin/edit.php?post_type=page

# 3. If wrong pages deleted, restore immediately:
node content-backup-system.js list
node content-backup-system.js restore <latest-timestamp>
```

### Workflow 3: Emergency Recovery
```bash
# If you accidentally deleted content:

# 1. DON'T PANIC - check backups immediately
node content-backup-system.js list

# 2. Find the most recent backup before deletion
# (backups are sorted newest first)

# 3. Restore everything
node content-backup-system.js restore <timestamp>

# 4. Verify restoration in WordPress admin
```

---

## 🛡️ Safety Features

### Automatic Abort on Backup Failure
All scripts abort if backup fails, preventing data loss:

```javascript
try {
  backupPath = await backupSystem.backupPosts(articlesToHide);
} catch (error) {
  console.error('❌ Backup failed! Aborting operation to prevent data loss.');
  return; // Script stops here - no deletion happens
}
```

### Backup Verification
Every backup includes a manifest file with:
- Total items backed up
- Timestamp
- Content type (posts/pages)
- Success confirmation

### Restore Safety
- Restores as Draft status by default (not published immediately)
- Preserves all SEO metadata
- Maintains Hebrew content integrity
- Supports partial restoration (specific items only)

---

## 🔧 Integration with Existing Scripts

### Modify Existing Deletion Script

**Before (no backup):**
```javascript
// Delete posts directly
for (const post of postsToDelete) {
  await deletePage(post);
}
```

**After (with backup):**
```javascript
const ContentBackupSystem = require('./content-backup-system');
const backupSystem = new ContentBackupSystem();

// Backup before deletion
const postTitles = postsToDelete.map(p => p.title);
const backupPath = await backupSystem.backupPosts(postTitles);

if (!backupPath) {
  console.error('Backup failed! Aborting deletion.');
  return;
}

// Now safe to delete
for (const post of postsToDelete) {
  await deletePage(post);
}
```

---

## 📊 What Gets Backed Up

### WordPress Posts
- ✅ Title
- ✅ Full content (blocks/HTML)
- ✅ Excerpt
- ✅ Status (publish/draft/pending)
- ✅ Categories
- ✅ Tags
- ✅ Featured image
- ✅ Author
- ✅ Publish date
- ✅ Modified date
- ✅ Slug
- ✅ Yoast SEO fields (title, description, focus keyword)
- ✅ Rank Math SEO fields (title, description, focus keyword)
- ✅ All custom fields

### WordPress Pages
- ✅ Title
- ✅ Full content
- ✅ Status
- ✅ Slug
- ✅ Template
- ✅ Parent page
- ✅ Menu order
- ✅ Rank Math SEO fields
- ✅ All custom fields

---

## 🇮🇱 Hebrew Content Support

The backup system fully supports Hebrew content:

- ✅ **RTL Text**: Preserved exactly as entered
- ✅ **Hebrew Characters**: UTF-8 encoded correctly
- ✅ **Hebrew SEO**: Meta titles, descriptions, keywords
- ✅ **Financial Terms**: "מוצרים מובנים", "שיווק השקעות", etc.

**Example Hebrew Backup:**
```json
{
  "title": "מס על מוצרים מובנים בישראל",
  "content": "<p>תוכן מלא בעברית...</p>",
  "rankMathTitle": "מדריך מס על מוצרים מובנים | Movne",
  "rankMathDescription": "כל מה שצריך לדעת על מיסוי מוצרים מובנים בישראל..."
}
```

---

## 🔍 Troubleshooting

### Backup Failed
```
❌ Backup failed! Aborting operation to prevent data loss.
   Error: Timeout waiting for page load
```

**Solution:**
1. Check internet connection
2. Verify WordPress credentials in `.env` file
3. Try running backup again
4. Increase timeout in script if site is slow

### Restore Not Working
```
❌ Restore error: Cannot find backup
```

**Solution:**
1. Run `node content-backup-system.js list` to see available backups
2. Copy exact timestamp (case-sensitive)
3. Ensure timestamp format: `2025-10-05T14-30-00-000Z`

### Missing Content After Restore
**Possible causes:**
- Content restored as Draft (check Draft posts in WordPress)
- Wrong backup timestamp selected
- Partial restore selected instead of full

**Solution:**
1. Check WordPress admin → Posts → Drafts
2. Verify correct timestamp used
3. Try restoring again without specific titles filter

---

## 📝 Best Practices

### 1. Always Use Backup Scripts
✅ **DO:** Use `hide-articles-with-backup.js` or `delete-duplicates-with-backup.js`
❌ **DON'T:** Delete content manually without backup

### 2. Verify Backups
After backup completes:
```bash
node content-backup-system.js list
```
Confirm latest backup exists before proceeding.

### 3. Keep Recent Backups
- Backups are small (JSON files)
- Keep at least last 5-10 backups
- Clean old backups manually if needed

### 4. Test Restore Process
Before relying on backups:
```bash
# 1. Create test backup
# 2. Restore it to verify process works
# 3. Delete test restoration
```

---

## 🎓 Example: Complete Safe Deletion Process

```bash
# SCENARIO: Need to hide 5 articles without pictures

# STEP 1: Run safe hiding script
node hide-articles-with-backup.js

# Expected output:
# 📦 STEP 1: BACKING UP ARTICLES BEFORE HIDING
#    Backing up: השוואה: מוצרים מובנים מול ETF...
#       ✅ Backed up to: article_1728140000000.json
# ... (more articles)
# ✅ Backup completed successfully!
#    Location: C:\Users\aviad\OneDrive\Desktop\movne-main\content-backups\2025-10-05T14-30-00-000Z
#
# 🔄 STEP 2: HIDING ARTICLES (SETTING TO DRAFT)
#    Hiding: השוואה: מוצרים מובנים מול ETF...
#       ✅ Hidden (set to Draft)
# ... (more articles)
#
# ✅ OPERATION COMPLETED SUCCESSFULLY
# 📦 Backup location: ...\content-backups\2025-10-05T14-30-00-000Z
# 🔒 Articles hidden: 5/5

# STEP 2: Verify on website
# Visit: https://movne.co.il/blog/
# Confirm 5 articles no longer visible

# STEP 3: If restoration needed later
node content-backup-system.js list
# Copy timestamp from output

node content-backup-system.js restore 2025-10-05T14-30-00-000Z
# Articles restored to WordPress (as Drafts)

# STEP 4: Publish restored articles if needed
# Go to WordPress admin → Posts → Drafts
# Select articles and publish
```

---

## 🚨 Emergency Contact

If backup system fails or you lose content:

1. **Check backups immediately:**
   ```bash
   node content-backup-system.js list
   ```

2. **Restore most recent backup:**
   ```bash
   node content-backup-system.js restore <timestamp>
   ```

3. **If no backup exists:**
   - Check UPress hosting backup system
   - Restore wp-content folder from UPress
   - Contact Aviad with backup timestamp

---

## 📈 Future Enhancements

Planned features:
- [ ] Scheduled automatic backups (daily/weekly)
- [ ] Backup compression for large sites
- [ ] Cloud backup storage (Google Drive/Dropbox)
- [ ] Email notifications on backup completion
- [ ] Backup comparison tool (diff between versions)
- [ ] WordPress admin panel integration

---

## 📞 Support

For questions or issues with the backup system:

1. Check this guide first
2. Review example workflows
3. Test with small backup/restore first
4. Contact Aviad if problems persist

---

**Created:** October 5, 2025
**Last Updated:** October 5, 2025
**Version:** 1.0

---

## Quick Reference Commands

```bash
# List all backups
node content-backup-system.js list

# Restore from backup
node content-backup-system.js restore <timestamp>

# Hide articles safely (with backup)
node hide-articles-with-backup.js

# Delete duplicates safely (with backup)
node delete-duplicates-with-backup.js
```
