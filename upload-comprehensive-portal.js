const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('🚀 Starting WordPress Comprehensive Portal Upload...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Read the comprehensive portal HTML
        console.log('📖 Reading comprehensive portal HTML...');
        const portalHTML = fs.readFileSync('C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html', 'utf8');

        // Extract only the content section (from dashboard to meet section)
        const contentStart = portalHTML.indexOf('<!-- 1. PERSONALIZED WELCOME DASHBOARD -->');
        const contentEnd = portalHTML.indexOf('<!-- Website Footer -->');
        const contentOnly = portalHTML.substring(contentStart, contentEnd);

        console.log('✅ Portal content extracted\n');

        // Login to WordPress
        console.log('🔐 Logging into WordPress...');
        await page.goto('https://movne.co.il/wp-login.php', { waitUntil: 'networkidle2' });

        // Wait for manual login
        console.log('⏳ Please log in to WordPress manually in the browser...');
        console.log('   Waiting for admin dashboard...\n');

        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 300000 // 5 minutes for manual login
        });

        console.log('✅ Logged in successfully!\n');

        // Navigate to Pages
        console.log('📄 Navigating to Pages...');
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page', { waitUntil: 'networkidle2' });

        // Find the portal page
        console.log('🔍 Looking for "פורטל למשקיעים כשירים" page...');
        await page.waitForSelector('.row-title', { timeout: 10000 });

        const pageLinks = await page.$$eval('.row-title', links =>
            links.map(link => ({
                text: link.textContent.trim(),
                href: link.href
            }))
        );

        const portalPage = pageLinks.find(link => link.text.includes('פורטל') || link.text.includes('משקיעים'));

        if (!portalPage) {
            console.log('❌ Portal page not found!');
            console.log('Available pages:', pageLinks.map(l => l.text).join(', '));
            return;
        }

        console.log(`✅ Found portal page: ${portalPage.text}\n`);

        // Go to edit page
        console.log('✏️  Opening page editor...');
        await page.goto(portalPage.href, { waitUntil: 'networkidle2' });

        // Wait a bit for editor to load
        await page.waitForTimeout(3000);

        // Check if we're in Gutenberg or Classic editor
        const isGutenberg = await page.$('.edit-post-visual-editor');
        const isClassic = await page.$('#content');

        if (isClassic) {
            console.log('📝 Classic Editor detected');

            // Switch to Text tab
            const textTab = await page.$('#content-html');
            if (textTab) {
                await textTab.click();
                await page.waitForTimeout(1000);
            }

            // Clear and insert content
            await page.evaluate(() => {
                const textarea = document.getElementById('content');
                if (textarea) {
                    textarea.value = '';
                }
            });

            await page.type('#content', contentOnly, { delay: 0 });
            console.log('✅ Content inserted into Classic Editor');

        } else if (isGutenberg) {
            console.log('📝 Gutenberg Editor detected');

            // Switch to Code Editor
            const moreMenu = await page.$('button[aria-label="Options"]');
            if (moreMenu) {
                await moreMenu.click();
                await page.waitForTimeout(500);

                const codeEditorButton = await page.$('button:has-text("Code editor")');
                if (codeEditorButton) {
                    await codeEditorButton.click();
                    await page.waitForTimeout(1000);
                }
            }

            // Insert content
            const codeEditor = await page.$('.editor-post-text-editor');
            if (codeEditor) {
                await page.evaluate(() => {
                    const textarea = document.querySelector('.editor-post-text-editor');
                    if (textarea) {
                        textarea.value = '';
                    }
                });

                await page.type('.editor-post-text-editor', contentOnly, { delay: 0 });
                console.log('✅ Content inserted into Gutenberg Code Editor');
            }
        } else {
            console.log('⚠️  Unknown editor type. Please update manually.');
            console.log('📋 Content has been saved to: wordpress-portal-upload-content.html');
            fs.writeFileSync('wordpress-portal-upload-content.html', contentOnly);
            return;
        }

        // Update/Publish
        console.log('\n💾 Saving page...');
        const updateButton = await page.$('button.editor-post-publish-button') ||
                           await page.$('#publish') ||
                           await page.$('input[name="save"]');

        if (updateButton) {
            await updateButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Page saved successfully!');
        }

        console.log('\n🎉 Portal upload complete!');
        console.log('🔗 Visit: https://movne.co.il/portal (or your portal URL)');

        // Keep browser open for verification
        console.log('\n✋ Browser will stay open for you to verify...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Save content to file as backup
        const portalHTML = fs.readFileSync('C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html', 'utf8');
        const contentStart = portalHTML.indexOf('<!-- 1. PERSONALIZED WELCOME DASHBOARD -->');
        const contentEnd = portalHTML.indexOf('<!-- Website Footer -->');
        const contentOnly = portalHTML.substring(contentStart, contentEnd);

        console.log('\n📋 Saving content to backup file...');
        fs.writeFileSync('wordpress-portal-upload-content.html', contentOnly);
        console.log('✅ Content saved to: wordpress-portal-upload-content.html');
        console.log('   You can manually copy-paste this into WordPress.');
    }

    // Don't close browser automatically
    console.log('\nPress Ctrl+C when done to close the browser.');
})();
