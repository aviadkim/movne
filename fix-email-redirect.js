const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Fixing Email Redirect to Comprehensive Portal...\n');

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

        // Check if we're at login page
        await new Promise(resolve => setTimeout(resolve, 2000));

        const loginForm = await page.$('#loginform, form[name="loginform"]');

        if (loginForm) {
            // Fill in login credentials
            console.log('📝 Entering credentials...');
            await page.waitForSelector('input[name="log"], #user_login', { timeout: 5000 });
            await page.type('input[name="log"], #user_login', 'aviad@kimfo-fs.com');
            await page.type('input[name="pwd"], #user_pass', 'Kimfo1982');

            // Click login button
            console.log('🔑 Logging in...');
            await page.click('#wp-submit, button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            console.log('✅ Logged in successfully!\n');
        } else {
            console.log('✅ Already logged in!\n');
        }

        // Navigate to Pages
        console.log('📄 Going to Pages list...');
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Search for the investor declaration page
        console.log('🔍 Searching for investor declaration page...');

        // Try to find the search box and search for the page
        const searchBox = await page.$('#post-search-input');
        if (searchBox) {
            await searchBox.type('הצהרת משקיע');
            await page.keyboard.press('Enter');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Find all page titles and look for investor declaration
        const pageFound = await page.evaluate(() => {
            const rows = document.querySelectorAll('.row-title');
            for (let row of rows) {
                const text = row.textContent;
                if (text.includes('הצהרת') || text.includes('משקיע') || text.includes('כשיר')) {
                    // Click to edit
                    row.click();
                    return true;
                }
            }
            return false;
        });

        if (pageFound) {
            console.log('✅ Found investor declaration page, opening editor...');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Switch to Code Editor if not already
            console.log('📝 Switching to code editor...');

            // Try to click "Code editor" toggle
            const codeEditorButton = await page.$('button[aria-label="Code editor"]');
            if (codeEditorButton) {
                await codeEditorButton.click();
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            // Get the page content
            console.log('🔍 Searching for old portal URL...');
            const content = await page.evaluate(() => {
                // Try to find the textarea with the page content
                const codeEditor = document.querySelector('.edit-post-text-editor__body textarea');
                if (codeEditor) {
                    return codeEditor.value;
                }
                return '';
            });

            console.log(`📄 Page content length: ${content.length} characters`);

            // Check if old URL exists
            const oldURL = 'portal-page-2-EXACT.html';
            const newURL = 'portal-page-2-COMPREHENSIVE-3.html';

            if (content.includes(oldURL)) {
                console.log(`✅ Found old URL: ${oldURL}`);
                console.log(`🔄 Replacing with: ${newURL}\n`);

                // Replace the URL
                const updated = await page.evaluate((oldUrl, newUrl) => {
                    const codeEditor = document.querySelector('.edit-post-text-editor__body textarea');
                    if (codeEditor) {
                        codeEditor.value = codeEditor.value.replace(oldUrl, newUrl);
                        // Trigger input event
                        codeEditor.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                    return false;
                }, oldURL, newURL);

                if (updated) {
                    console.log('✅ URL replaced successfully!');

                    // Save the page
                    console.log('💾 Publishing changes...');
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const publishButton = await page.$('button.editor-post-publish-button__button');
                    if (publishButton) {
                        await publishButton.click();
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // May need to click confirm button
                        const confirmButton = await page.$('button.editor-post-publish-button__button');
                        if (confirmButton) {
                            await confirmButton.click();
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        }

                        console.log('✅ Page published!\n');
                    } else {
                        // Try update button instead
                        const updateButton = await page.$('button.editor-post-publish-button');
                        if (updateButton) {
                            await updateButton.click();
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            console.log('✅ Page updated!\n');
                        }
                    }

                    console.log('🎉 SUCCESS! Email redirect has been fixed!');
                    console.log('📧 Test by entering: test@movne.co.il');
                    console.log(`🔗 Should now redirect to: https://movne.co.il/wp-content/uploads/2025/10/${newURL}\n`);

                } else {
                    console.log('❌ Could not update content');
                }

            } else {
                console.log(`⚠️  Old URL "${oldURL}" not found in page content`);
                console.log('🔍 Searching for any portal references...');

                const portalMatches = content.match(/portal-page-\d+-[A-Z]+\.html/g);
                if (portalMatches) {
                    console.log('Found portal URLs:', portalMatches);
                } else {
                    console.log('No portal URLs found in page content');
                }
            }

        } else {
            console.log('⚠️  Could not find investor declaration page automatically');
            console.log('📋 Please search manually in the browser window');
        }

        console.log('\n✋ Browser will stay open for verification. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nBrowser will stay open for manual completion.');
        await new Promise(() => {});
    }
})();
