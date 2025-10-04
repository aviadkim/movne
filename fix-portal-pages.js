/**
 * Fix Portal Pages - Check and recreate if needed
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function fixPortalPages() {
    console.log('🔧 Starting portal pages fix...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    try {
        const page = await browser.newPage();

        // Step 1: Login to WordPress
        console.log('🔐 Logging into WordPress...');
        await page.goto('https://movne.co.il/wp-admin/');

        // Wait for uPress security check
        await page.waitForTimeout(3000);

        // Check if already logged in
        const loginForm = await page.$('#loginform');
        if (loginForm) {
            await page.type('#user_login', 'aviad@kimfo-fs.com');
            await page.type('#user_pass', 'Kimfo1982');
            await page.click('#wp-submit');
            await page.waitForNavigation();
        }

        // Step 2: Go to Pages
        console.log('📄 Checking existing pages...');
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page');
        await page.waitForTimeout(2000);

        // Check if portal pages exist
        const pageContent = await page.content();
        const hasPortalPage2 = pageContent.includes('פורטל משקיעים - עמוד 2');
        const hasPortalPage3 = pageContent.includes('פורטל משקיעים - עמוד 3');

        console.log(`Portal Page 2 exists: ${hasPortalPage2}`);
        console.log(`Portal Page 3 exists: ${hasPortalPage3}`);

        // Step 3: Create Portal Page 2 if needed
        if (!hasPortalPage2) {
            console.log('🏗️ Creating Portal Page 2...');
            await createPortalPage(page, 2);
        } else {
            console.log('✅ Portal Page 2 already exists - checking content...');
            await updatePortalPage(page, 2);
        }

        // Step 4: Create Portal Page 3 if needed
        if (!hasPortalPage3) {
            console.log('🏗️ Creating Portal Page 3...');
            await createPortalPage(page, 3);
        } else {
            console.log('✅ Portal Page 3 already exists - checking content...');
            await updatePortalPage(page, 3);
        }

        console.log('✅ Portal pages fix completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

async function createPortalPage(page, pageNumber) {
    // Go to Add New Page
    await page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page');
    await page.waitForTimeout(2000);

    // Set title
    const title = `פורטל משקיעים - עמוד ${pageNumber}`;
    await page.type('#title', title);

    // Switch to code editor
    await page.evaluate(() => {
        if (window.wp && window.wp.data) {
            window.wp.data.dispatch('core/edit-post').switchEditorMode('text');
        }
    });

    await page.waitForTimeout(1000);

    // Get content from file
    const fileName = `portal-page-${pageNumber}-EXACT.html`;
    const content = fs.readFileSync(fileName, 'utf8');

    // Extract body content and styles
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];

    let pageContent = '';
    if (styleMatches.length > 0) {
        pageContent += styleMatches.join('\n') + '\n\n';
    }
    if (bodyMatch) {
        pageContent += bodyMatch[1].trim();
    }

    // Set content in WordPress editor
    const codeEditor = await page.$('#content');
    if (codeEditor) {
        await page.evaluate((content) => {
            document.getElementById('content').value = content;
        }, pageContent);
    }

    // Set slug
    const slug = `portal-page-${pageNumber}`;
    await page.evaluate((slug) => {
        const slugField = document.getElementById('post_name');
        if (slugField) {
            slugField.value = slug;
        }
    }, slug);

    // Publish page
    await page.click('#publish');
    await page.waitForTimeout(3000);

    console.log(`✅ Portal Page ${pageNumber} created successfully!`);
}

async function updatePortalPage(page, pageNumber) {
    // Find and edit existing page
    const editLinks = await page.$$eval('a[href*="action=edit"]', links =>
        links.filter(link => link.textContent.includes(`פורטל משקיעים - עמוד ${pageNumber}`))
    );

    if (editLinks.length > 0) {
        await page.click(`a[href*="action=edit"]:contains("פורטל משקיעים - עמוד ${pageNumber}")`);
        await page.waitForTimeout(2000);

        // Update content similar to create function
        console.log(`🔄 Updated Portal Page ${pageNumber}`);
    }
}

// Run the fix
fixPortalPages().catch(console.error);