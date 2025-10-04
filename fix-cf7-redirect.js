const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Fixing Contact Form 7 Redirect...\n');

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

        await new Promise(resolve => setTimeout(resolve, 2000));

        const loginForm = await page.$('#loginform, form[name="loginform"]');

        if (loginForm) {
            console.log('📝 Entering credentials...');
            await page.waitForSelector('input[name="log"], #user_login', { timeout: 5000 });
            await page.type('input[name="log"], #user_login', 'aviad@kimfo-fs.com');
            await page.type('input[name="pwd"], #user_pass', 'Kimfo1982');

            console.log('🔑 Logging in...');
            await page.click('#wp-submit, button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            console.log('✅ Logged in successfully!\n');
        } else {
            console.log('✅ Already logged in!\n');
        }

        // Navigate to Contact Form 7 list
        console.log('📋 Going to Contact Form 7...');
        await page.goto('https://movne.co.il/wp-admin/admin.php?page=wpcf7', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find the form with ID ac60d56 or text containing "משקיע"
        console.log('🔍 Looking for investor form...');

        const formFound = await page.evaluate(() => {
            const rows = document.querySelectorAll('.wp-list-table tbody tr');
            for (let row of rows) {
                const titleCell = row.querySelector('.column-title a');
                if (titleCell && (titleCell.textContent.includes('משקיע') || titleCell.textContent.includes('יצירת קשר'))) {
                    titleCell.click();
                    return true;
                }
            }
            return false;
        });

        if (formFound) {
            console.log('✅ Found form, opening editor...');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Look for redirect settings in Additional Settings tab
            console.log('📝 Looking for redirect settings...');

            // Click on "Additional Settings" tab if it exists
            const additionalSettingsTab = await page.$('a[href="#additional-settings-panel"]');
            if (additionalSettingsTab) {
                await additionalSettingsTab.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Get the additional settings textarea
            const additionalSettings = await page.evaluate(() => {
                const textarea = document.querySelector('#wpcf7-additional-settings, textarea[name="wpcf7-additional-settings"]');
                if (textarea) {
                    return textarea.value;
                }
                return '';
            });

            console.log('📄 Current additional settings:');
            console.log(additionalSettings || 'None');

            // Check if there's a redirect setting
            const oldURL = 'portal-page-2-EXACT.html';
            const newURL = 'portal-page-2-COMPREHENSIVE-3.html';

            if (additionalSettings.includes(oldURL)) {
                console.log(`\n✅ Found old URL: ${oldURL}`);
                console.log(`🔄 Replacing with: ${newURL}\n`);

                // Update the redirect URL
                const updatedSettings = additionalSettings.replace(oldURL, newURL);

                await page.evaluate((newSettings) => {
                    const textarea = document.querySelector('#wpcf7-additional-settings, textarea[name="wpcf7-additional-settings"]');
                    if (textarea) {
                        textarea.value = newSettings;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, updatedSettings);

                // Save the form
                console.log('💾 Saving form...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                const saveButton = await page.$('#publishing-action input[type="submit"], #submit');
                if (saveButton) {
                    await saveButton.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    console.log('✅ Form saved!\n');
                }

                console.log('🎉 SUCCESS! Contact Form redirect has been updated!');
                console.log(`📧 Test by entering: test@movne.co.il`);
                console.log(`🔗 Should now redirect to: https://movne.co.il/wp-content/uploads/2025/10/${newURL}\n`);

            } else {
                console.log(`\n⚠️  Old URL "${oldURL}" not found in additional settings`);
                console.log('📋 The redirect might be set elsewhere. Let me check for JavaScript redirects...\n');

                // Check the form template for any redirect code
                const formTemplate = await page.evaluate(() => {
                    const textarea = document.querySelector('#wpcf7-form, textarea[name="wpcf7-form"]');
                    if (textarea) {
                        return textarea.value;
                    }
                    return '';
                });

                if (formTemplate.includes(oldURL)) {
                    console.log('✅ Found redirect in form template!');
                    console.log('🔄 Updating form template...\n');

                    const updatedTemplate = formTemplate.replace(oldURL, newURL);

                    await page.evaluate((newTemplate) => {
                        const textarea = document.querySelector('#wpcf7-form, textarea[name="wpcf7-form"]');
                        if (textarea) {
                            textarea.value = newTemplate;
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, updatedTemplate);

                    const saveButton = await page.$('#publishing-action input[type="submit"], #submit');
                    if (saveButton) {
                        await saveButton.click();
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        console.log('✅ Form saved!\n');
                    }

                    console.log('🎉 SUCCESS! Form template updated!');
                } else {
                    console.log('⚠️  Redirect not found in form settings');
                    console.log('📋 Browser will stay open for manual inspection');
                }
            }

        } else {
            console.log('⚠️  Could not find investor form automatically');
            console.log('📋 Browser will stay open - please find and edit the form manually');
        }

        console.log('\n✋ Browser will stay open for verification. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nBrowser will stay open for manual completion.');
        await new Promise(() => {});
    }
})();
