const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('🚀 Uploading Comprehensive Portal to WordPress Media Library...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Login to WordPress
        console.log('🔐 Navigating to WordPress Media Library...');
        await page.goto('https://movne.co.il/wp-admin/upload.php', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Check if we're at login page
        const isLoginPage = await page.$('#loginform');

        if (isLoginPage) {
            console.log('⏳ Please log in to WordPress...\n');
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 300000
            });
            console.log('✅ Logged in!\n');

            // Navigate to media library after login
            await page.goto('https://movne.co.il/wp-admin/upload.php', {
                waitUntil: 'networkidle2'
            });
        }

        console.log('📤 Looking for "Add New" button...');

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Click "Add New" button
        const addNewButton = await page.$('a.page-title-action');
        if (addNewButton) {
            console.log('✅ Found "Add New" button, clicking...');
            await addNewButton.click();
            await page.waitForTimeout(3000);
        } else {
            console.log('⚠️  Could not find Add New button, trying to navigate directly...');
            await page.goto('https://movne.co.il/wp-admin/media-new.php', {
                waitUntil: 'networkidle2'
            });
        }

        console.log('📂 Preparing to upload file...\n');

        // Wait for file input
        await page.waitForSelector('input[type="file"]', { timeout: 10000 });

        // Upload the comprehensive portal HTML file
        const fileInput = await page.$('input[type="file"]');
        const filePath = 'C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html';

        console.log(`📄 Uploading: ${filePath}`);
        await fileInput.uploadFile(filePath);

        console.log('⏳ Waiting for upload to complete...');
        await page.waitForTimeout(5000);

        // Wait for upload to finish
        await page.waitForSelector('.attachment-preview', { timeout: 30000 });
        console.log('✅ File uploaded successfully!\n');

        // Get the uploaded file URL
        await page.waitForTimeout(2000);

        // Click on the uploaded file to see details
        const uploadedFile = await page.$('.attachment-preview');
        if (uploadedFile) {
            await uploadedFile.click();
            await page.waitForTimeout(2000);

            // Try to get the file URL
            const fileUrlInput = await page.$('input.attachment-display-settings');
            if (fileUrlInput) {
                const fileUrl = await page.evaluate(el => el.value, fileUrlInput);
                console.log('🔗 Uploaded file URL:', fileUrl);
                console.log('\n📋 IMPORTANT: Copy this URL and update your menu link!\n');
            }
        }

        console.log('\n✅ Upload complete!');
        console.log('\n📌 Next steps:');
        console.log('1. Go to Appearance > Menus');
        console.log('2. Find the "פורטל למשקיעים כשירים" menu item');
        console.log('3. Update its URL to the new file URL shown above');
        console.log('\nOr I can help you do this automatically...\n');

        console.log('✋ Browser will stay open. Press Ctrl+C when done.');

        // Keep browser open
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Manual upload instructions:');
        console.log('1. Go to: https://movne.co.il/wp-admin/media-new.php');
        console.log('2. Upload: portal-page-2-COMPREHENSIVE.html');
        console.log('3. Copy the file URL');
        console.log('4. Update your menu to point to the new URL\n');
    }
})();
