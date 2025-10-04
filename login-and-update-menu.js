const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Logging in and updating menu...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Navigate to WordPress login
        console.log('🔐 Going to WordPress login...');
        await page.goto('https://movne.co.il/wp-login.php', {
            waitUntil: 'networkidle2'
        });

        // Fill in login credentials
        console.log('📝 Entering credentials...');
        await page.type('#user_login', 'aviad@kimfo-fs.com');
        await page.type('#user_pass', 'Kimfo1982');

        // Click login button
        console.log('🔑 Logging in...');
        await page.click('#wp-submit');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('✅ Logged in successfully!\n');

        // Navigate to Menus
        console.log('📋 Going to Menus page...');
        await page.goto('https://movne.co.il/wp-admin/nav-menus.php', {
            waitUntil: 'networkidle2'
        });

        await page.waitForTimeout(2000);

        console.log('🔍 Looking for portal menu item...');

        // Try to find menu items by their text content
        const menuItemFound = await page.evaluate(() => {
            const allMenuItems = document.querySelectorAll('.menu-item-bar .menu-item-title');
            for (let item of allMenuItems) {
                if (item.textContent.includes('פורטל') || item.textContent.includes('משקיעים')) {
                    item.click();
                    return true;
                }
            }
            return false;
        });

        if (menuItemFound) {
            console.log('✅ Found and clicked portal menu item!');
            await page.waitForTimeout(1500);

            // Find and update the URL field
            console.log('✏️  Updating URL...');

            const updated = await page.evaluate(() => {
                const urlInputs = document.querySelectorAll('input.edit-menu-item-url');
                for (let input of urlInputs) {
                    if (input.offsetParent !== null) { // visible
                        input.value = 'https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html';
                        // Trigger change event
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        return true;
                    }
                }
                return false;
            });

            if (updated) {
                console.log('✅ URL updated!');

                // Save menu
                console.log('💾 Saving menu...');
                await page.click('#save_menu_header');
                await page.waitForTimeout(3000);

                console.log('\n🎉 SUCCESS! Menu updated!\n');
                console.log('🔗 Your new portal is live at:');
                console.log('   https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html\n');
                console.log('Or visit the homepage and click "פורטל למשקיעים כשירים"\n');

            } else {
                console.log('⚠️  Could not find URL input field');
            }

        } else {
            console.log('⚠️  Could not find portal menu item automatically');
            console.log('📋 Please update manually in the browser window');
        }

        console.log('✋ Browser will stay open for verification. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nBrowser will stay open for manual completion.');
        await new Promise(() => {});
    }
})();
