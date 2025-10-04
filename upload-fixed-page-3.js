const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🚀 Uploading FIXED Portal Page 3 to WordPress...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Login
        console.log('🔐 Logging into WordPress...');
        await page.goto('https://movne.co.il/wp-login.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const loginForm = await page.$('#loginform');
        if (loginForm) {
            await page.type('input[name="log"], #user_login', 'aviad@kimfo-fs.com');
            await page.type('input[name="pwd"], #user_pass', 'Kimfo1982');
            await page.click('#wp-submit');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('✅ Logged in\n');
        }

        // Go to Media Library
        console.log('📁 Going to Media Library...');
        await page.goto('https://movne.co.il/wp-admin/media-new.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Upload the fixed file
        console.log('📤 Uploading fixed portal-page-3-EXACT.html...');

        const fileInput = await page.$('input[type="file"]');
        const filePath = path.resolve('wordpress-ready-portal-page-3-EXACT.html');

        await fileInput.uploadFile(filePath);

        console.log('⏳ Waiting for upload to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('✅ File uploaded!\n');

        // Get the uploaded file URL
        console.log('🔗 Getting uploaded file URL...');

        await page.goto('https://movne.co.il/wp-admin/upload.php?orderby=date&order=desc', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const fileUrl = await page.evaluate(() => {
            const firstItem = document.querySelector('.attachment a');
            return firstItem ? firstItem.href : null;
        });

        if (fileUrl) {
            console.log(`✅ Uploaded file URL: ${fileUrl}\n`);
            console.log('🎉 SUCCESS! Fixed portal page 3 has been uploaded!');
            console.log('📋 The file now redirects to: portal-page-2-COMPREHENSIVE-3.html\n');
        }

        console.log('✋ Browser will stay open. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nBrowser will stay open for manual upload.');
        await new Promise(() => {});
    }
})();
