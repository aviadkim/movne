const puppeteer = require('puppeteer');

(async () => {
    console.log('🔍 COMPREHENSIVE SEARCH FOR portal-page-2-EXACT.html\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Login to WordPress
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

        // Search all WordPress options
        console.log('🔍 Searching WordPress options table...');
        await page.goto('https://movne.co.il/wp-admin/options.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const optionsFound = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('portal-page-2-EXACT');
        });

        if (optionsFound) {
            console.log('✅ FOUND in WordPress options!');
            console.log('📋 Please search the page (Ctrl+F) for "portal-page-2-EXACT"\n');
        } else {
            console.log('❌ Not found in options\n');
        }

        // Check Contact Form 7
        console.log('🔍 Checking Contact Form 7 forms...');
        await page.goto('https://movne.co.il/wp-admin/admin.php?page=wpcf7', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get all form links
        const forms = await page.$$('a.row-title');
        console.log(`📋 Found ${forms.length} Contact Form 7 forms`);

        for (let i = 0; i < forms.length; i++) {
            const formTitle = await page.evaluate(el => el.textContent, forms[i]);
            console.log(`\n  Checking form ${i + 1}: ${formTitle}`);

            await forms[i].click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check form content
            const formContent = await page.evaluate(() => {
                return document.body.innerText;
            });

            if (formContent.includes('portal-page-2-EXACT')) {
                console.log(`  ✅ FOUND IN THIS FORM!`);
                console.log(`  📋 Form: ${formTitle}`);
                console.log(`  🔗 Current URL: ${page.url()}`);

                // Try to find and replace
                console.log(`  🔄 Attempting to fix redirect...`);

                const fixed = await page.evaluate(() => {
                    const oldUrl = 'portal-page-2-EXACT.html';
                    const newUrl = 'portal-page-2-COMPREHENSIVE-3.html';
                    let fixed = false;

                    // Check all textareas
                    const textareas = document.querySelectorAll('textarea');
                    textareas.forEach(textarea => {
                        if (textarea.value.includes(oldUrl)) {
                            textarea.value = textarea.value.replace(new RegExp(oldUrl, 'g'), newUrl);
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            fixed = true;
                        }
                    });

                    // Check all input fields
                    const inputs = document.querySelectorAll('input[type="text"], input[type="url"]');
                    inputs.forEach(input => {
                        if (input.value.includes(oldUrl)) {
                            input.value = input.value.replace(new RegExp(oldUrl, 'g'), newUrl);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            fixed = true;
                        }
                    });

                    return fixed;
                });

                if (fixed) {
                    console.log(`  ✅ Replaced old URL with new URL!`);
                    console.log(`  💾 Saving form...`);

                    // Click save button
                    const saveButton = await page.$('#submit, input[type="submit"][value="Save"]');
                    if (saveButton) {
                        await saveButton.click();
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        console.log(`  ✅ Form saved!\n`);
                        console.log(`🎉 SUCCESS! Redirect has been fixed!`);
                        break;
                    }
                } else {
                    console.log(`  ⚠️  Could not automatically fix. Browser will stay open for manual edit.`);
                }
                break;
            } else {
                console.log(`  ❌ Not in this form`);

                // Go back to forms list
                await page.goto('https://movne.co.il/wp-admin/admin.php?page=wpcf7', {
                    waitUntil: 'networkidle2'
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Check Redirections plugin
        console.log('\n🔍 Checking Redirection plugin...');
        await page.goto('https://movne.co.il/wp-admin/tools.php?page=redirection.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const redirectionsFound = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('portal-page-2-EXACT');
        });

        if (redirectionsFound) {
            console.log('✅ FOUND in Redirection plugin!');
            console.log('📋 Please search the page (Ctrl+F) for "portal-page-2-EXACT" and update it\n');
        } else {
            console.log('❌ Not found in Redirection plugin\n');
        }

        // Check all plugins settings
        console.log('🔍 Checking installed plugins...');
        await page.goto('https://movne.co.il/wp-admin/plugins.php', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const pluginsList = await page.evaluate(() => {
            const plugins = [];
            const rows = document.querySelectorAll('#the-list tr');
            rows.forEach(row => {
                const nameCell = row.querySelector('.plugin-title strong');
                if (nameCell) {
                    plugins.push(nameCell.textContent);
                }
            });
            return plugins;
        });

        console.log(`📋 Installed plugins (${pluginsList.length}):`);
        pluginsList.forEach((plugin, i) => {
            console.log(`   ${i + 1}. ${plugin}`);
        });

        // Check theme settings
        console.log('\n🔍 Checking theme customizer...');
        await page.goto('https://movne.co.il/wp-admin/customize.php', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check for redirect in theme
        const themeFound = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('portal-page-2-EXACT');
        });

        if (themeFound) {
            console.log('✅ FOUND in theme customizer!');
        } else {
            console.log('❌ Not found in theme customizer\n');
        }

        // Search in all pages content
        console.log('🔍 Searching all pages content...');
        await page.goto('https://movne.co.il/wp-admin/edit.php?post_type=page&s=portal', {
            waitUntil: 'networkidle2'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const pagesList = await page.evaluate(() => {
            const pages = [];
            const rows = document.querySelectorAll('.row-title');
            rows.forEach(row => {
                pages.push({
                    title: row.textContent,
                    url: row.href
                });
            });
            return pages;
        });

        console.log(`📋 Found ${pagesList.length} pages with "portal" in title/content`);

        for (const pageInfo of pagesList) {
            console.log(`\n  Checking page: ${pageInfo.title}`);
            await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Switch to code editor if needed
            const codeEditorBtn = await page.$('button[aria-label="Code editor"]');
            if (codeEditorBtn) {
                await codeEditorBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const pageContent = await page.evaluate(() => {
                const editor = document.querySelector('.edit-post-text-editor__body textarea');
                return editor ? editor.value : '';
            });

            if (pageContent.includes('portal-page-2-EXACT')) {
                console.log(`  ✅ FOUND IN THIS PAGE!`);
                console.log(`  🔄 Fixing...`);

                await page.evaluate(() => {
                    const editor = document.querySelector('.edit-post-text-editor__body textarea');
                    if (editor) {
                        editor.value = editor.value.replace(/portal-page-2-EXACT/g, 'portal-page-2-COMPREHENSIVE-3');
                        editor.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });

                // Save
                const updateBtn = await page.$('button.editor-post-publish-button');
                if (updateBtn) {
                    await updateBtn.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    console.log(`  ✅ Page updated!\n`);
                    console.log(`🎉 SUCCESS! Found and fixed the redirect!`);
                    break;
                }
            } else {
                console.log(`  ❌ Not in this page`);
            }
        }

        console.log('\n✋ Browser will stay open. Press Ctrl+C when done.');
        await new Promise(() => {});

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\nBrowser will stay open for manual inspection.');
        await new Promise(() => {});
    }
})();
