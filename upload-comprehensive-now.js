const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🚀 Uploading portal-page-2-COMPREHENSIVE.html to WordPress...\n');

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

        // Go to Media Upload
        console.log('📁 Going to Media Upload...');
        await page.goto('https://movne.co.il/wp-admin/media-new.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Find and upload file
        console.log('📤 Uploading portal-page-2-COMPREHENSIVE.html...');

        const filePath = path.resolve('portal-page-2-COMPREHENSIVE.html');
        console.log(`   File path: ${filePath}`);

        // Try different selectors
        let fileInput = await page.$('#html5_1jj4mhbms1vbh1trg1lnk1rjf16s04_container input[type="file"]');
        if (!fileInput) {
            fileInput = await page.$('input[type="file"]');
        }
        if (!fileInput) {
            fileInput = await page.$('#plupload-browse-button');
        }

        if (fileInput) {
            await fileInput.uploadFile(filePath);
            console.log('⏳ Waiting for upload...');
            await new Promise(resolve => setTimeout(resolve, 8000));
            console.log('✅ Upload complete!\n');
        } else {
            console.log('⚠️  Could not find file input automatically.');
            console.log('📋 Please manually drag and drop the file or click "Select Files"');
            console.log(`   File location: C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html\n`);
        }

        // Go to media library to get URL
        console.log('🔗 Getting uploaded file URL...');
        await page.goto('https://movne.co.il/wp-admin/upload.php?orderby=date&order=desc', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the first (newest) item
        const fileUrl = await page.evaluate(() => {
            const items = document.querySelectorAll('.attachment');
            if (items.length > 0) {
                const firstItem = items[0];
                const link = firstItem.querySelector('a');
                const title = firstItem.querySelector('.title');
                return {
                    url: link ? link.href : null,
                    title: title ? title.textContent : null
                };
            }
            return null;
        });

        if (fileUrl && fileUrl.title && fileUrl.title.includes('COMPREHENSIVE')) {
            console.log(`✅ Found uploaded file: ${fileUrl.title}`);
            console.log(`🔗 URL: ${fileUrl.url}\n`);

            // Click on it to get the direct file URL
            await page.click('.attachment:first-child a');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const directUrl = await page.evaluate(() => {
                const urlInput = document.querySelector('.attachment-details-copy-link');
                return urlInput ? urlInput.value : null;
            });

            if (directUrl) {
                console.log(`🎉 SUCCESS! Your comprehensive portal is now uploaded!`);
                console.log(`📋 Direct URL: ${directUrl}\n`);
                console.log(`Next steps:`);
                console.log(`1. Copy this URL: ${directUrl}`);
                console.log(`2. Update your menu to point to this new URL`);
                console.log(`3. Test the portal with: test@movne.co.il\n`);
            }
        }

        console.log('✋ Browser will stay open. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n📋 Manual upload instructions:');
        console.log('1. In the open browser, drag and drop this file:');
        console.log('   C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html');
        console.log('2. Wait for upload to complete');
        console.log('3. Copy the file URL');
        console.log('4. Update menu links to point to the new URL\n');
        await new Promise(() => {});
    }
})();
