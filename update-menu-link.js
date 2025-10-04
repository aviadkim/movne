const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Updating WordPress Menu Link...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Navigate to WordPress Menus
        console.log('🔐 Navigating to WordPress Menus...');
        await page.goto('https://movne.co.il/wp-admin/nav-menus.php', {
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

            // Navigate to menus after login
            await page.goto('https://movne.co.il/wp-admin/nav-menus.php', {
                waitUntil: 'networkidle2'
            });
        }

        console.log('🔍 Looking for portal menu item...');
        await page.waitForSelector('.menu-item', { timeout: 10000 });

        // Find all menu items
        const menuItems = await page.$$('.menu-item');

        let portalMenuItem = null;
        for (const item of menuItems) {
            const text = await page.evaluate(el => el.textContent, item);
            if (text.includes('פורטל') || text.includes('משקיעים כשירים')) {
                portalMenuItem = item;
                console.log('✅ Found portal menu item!');
                break;
            }
        }

        if (!portalMenuItem) {
            console.log('❌ Could not find portal menu item automatically.');
            console.log('\n📋 Manual instructions:');
            console.log('1. Find "פורטל למשקיעים כשירים" in the menu');
            console.log('2. Click to expand it');
            console.log('3. In the URL field, paste: https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html');
            console.log('4. Click "Save Menu"\n');
            console.log('✋ Browser will stay open for manual editing...');
            await new Promise(() => {});
            return;
        }

        // Click to expand the menu item
        console.log('📂 Expanding menu item...');
        await portalMenuItem.click();
        await page.waitForTimeout(1000);

        // Find the URL input field within this menu item
        const urlInput = await portalMenuItem.$('input.edit-menu-item-url');

        if (urlInput) {
            // Clear existing value
            await page.evaluate(el => el.value = '', urlInput);

            // Type new URL
            console.log('✏️  Updating URL...');
            await urlInput.type('https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html');

            console.log('✅ URL updated!');

            // Save menu
            console.log('💾 Saving menu...');
            const saveButton = await page.$('#save_menu_header');
            if (saveButton) {
                await saveButton.click();
                await page.waitForTimeout(3000);
                console.log('✅ Menu saved successfully!\n');
            }

            console.log('🎉 Done! Your comprehensive portal is now live!');
            console.log('🔗 Visit: https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html\n');
            console.log('Or click the menu item from the homepage!\n');

        } else {
            console.log('⚠️  Could not find URL input field.');
            console.log('Please update manually in the browser that just opened.');
        }

        console.log('✋ Browser will stay open. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n📋 Please update manually:');
        console.log('1. Go to: https://movne.co.il/wp-admin/nav-menus.php');
        console.log('2. Find "פורטל למשקיעים כשירים"');
        console.log('3. Update URL to: https://movne.co.il/wp-content/uploads/2025/10/portal-page-2-COMPREHENSIVE-2.html');
        console.log('4. Save Menu\n');
    }
})();
