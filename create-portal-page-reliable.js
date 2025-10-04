const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Reliable Portal Page Creator
 *
 * This script focuses on the most reliable method to create working portal pages
 * by testing multiple content insertion approaches and using the one that works.
 */

class ReliablePortalPageCreator {
    constructor() {
        this.browser = null;
        this.page = null;

        this.credentials = {
            url: 'https://movne.co.il/wp-admin/',
            email: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982'
        };
    }

    async init() {
        console.log('🚀 Initializing Reliable Portal Page Creator...');

        this.browser = await chromium.launch({
            headless: false,
            slowMo: 1000
        });

        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        return this;
    }

    async login() {
        console.log('🔐 Logging into WordPress...');

        await this.page.goto(this.credentials.url, { waitUntil: 'networkidle' });

        await this.page.waitForSelector('#user_login');
        await this.page.fill('#user_login', this.credentials.email);
        await this.page.fill('#user_pass', this.credentials.password);
        await this.page.click('#wp-submit');

        await this.page.waitForSelector('#wpadminbar', { timeout: 15000 });
        console.log('✅ Login successful');
    }

    async createPortalPage(pageNumber, portalFile) {
        console.log(`\n📄 Creating Portal Page ${pageNumber}...`);

        // Read portal content
        const portalContent = fs.readFileSync(portalFile, 'utf8');
        console.log(`📄 Portal content loaded (${portalContent.length} chars)`);

        // Extract just the body content for WordPress
        const bodyMatch = portalContent.match(/<body[^>]*>(.*?)<\/body>/s);
        const contentToInsert = bodyMatch ? bodyMatch[1] : portalContent;

        // Navigate to add new page
        await this.page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page', { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000);

        // Method 1: Try WordPress Block Editor with Custom HTML
        const method1Result = await this.method1_BlockEditorHTML(pageNumber, contentToInsert);
        if (method1Result.success) return method1Result;

        // Method 2: Try Classic Editor (if available)
        const method2Result = await this.method2_ClassicEditor(pageNumber, contentToInsert);
        if (method2Result.success) return method2Result;

        // Method 3: Try Code Editor Plugin Method
        const method3Result = await this.method3_CodeEditor(pageNumber, contentToInsert);
        if (method3Result.success) return method3Result;

        // Method 4: Try Shortcode Method
        const method4Result = await this.method4_Shortcode(pageNumber, portalContent);
        if (method4Result.success) return method4Result;

        return { success: false, error: 'All methods failed' };
    }

    async method1_BlockEditorHTML(pageNumber, content) {
        console.log('🔧 Method 1: Block Editor with Custom HTML...');

        try {
            // Set title
            const titleField = this.page.locator('.editor-post-title__input, [placeholder*="Add title"]');
            await titleField.fill(`פורטל למשקיעים כשירים - עמוד ${pageNumber}`);

            // Open block inserter
            await this.page.click('.block-editor-inserter__toggle');
            await this.page.waitForTimeout(1000);

            // Search for Custom HTML block
            await this.page.fill('.block-editor-inserter__search input', 'Custom HTML');
            await this.page.waitForTimeout(500);

            // Click Custom HTML block
            await this.page.click('[data-type="core/html"]');
            await this.page.waitForTimeout(1000);

            // Insert content
            await this.page.fill('.block-editor-html__textarea', content);

            // Publish
            const publishResult = await this.publishPage();
            if (publishResult.success) {
                console.log('✅ Method 1 successful!');
                return { success: true, method: 'Block Editor HTML', url: publishResult.url };
            }

        } catch (error) {
            console.log('❌ Method 1 failed:', error.message);
        }

        return { success: false };
    }

    async method2_ClassicEditor(pageNumber, content) {
        console.log('🔧 Method 2: Classic Editor...');

        try {
            // Refresh page to reset
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);

            // Set title
            const titleField = this.page.locator('#title, .editor-post-title__input');
            await titleField.fill(`פורטל למשקיעים כשירים - עמוד ${pageNumber}`);

            // Switch to Text/HTML mode in classic editor
            const htmlTab = this.page.locator('#content-html');
            if (await htmlTab.count() > 0) {
                await htmlTab.click();
                await this.page.waitForTimeout(1000);

                // Insert content
                await this.page.fill('#content', content);

                // Publish
                const publishResult = await this.publishPage();
                if (publishResult.success) {
                    console.log('✅ Method 2 successful!');
                    return { success: true, method: 'Classic Editor', url: publishResult.url };
                }
            }

        } catch (error) {
            console.log('❌ Method 2 failed:', error.message);
        }

        return { success: false };
    }

    async method3_CodeEditor(pageNumber, content) {
        console.log('🔧 Method 3: Code Editor Mode...');

        try {
            // Refresh page
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);

            // Set title
            const titleField = this.page.locator('.editor-post-title__input');
            await titleField.fill(`פורטל למשקיעים כשירים - עמוד ${pageNumber}`);

            // Try to switch to code editor
            const codeEditorButton = this.page.locator('[aria-label*="Code editor"], .components-button:has-text("Code editor")');
            if (await codeEditorButton.count() > 0) {
                await codeEditorButton.click();
                await this.page.waitForTimeout(1000);

                // Insert content in code editor
                const codeEditor = this.page.locator('.editor-post-text-editor, .edit-post-text-editor__body textarea');
                if (await codeEditor.count() > 0) {
                    await codeEditor.fill(content);

                    // Switch back to visual editor
                    const visualEditorButton = this.page.locator('[aria-label*="Visual editor"], .components-button:has-text("Visual editor")');
                    if (await visualEditorButton.count() > 0) {
                        await visualEditorButton.click();
                        await this.page.waitForTimeout(2000);
                    }

                    // Publish
                    const publishResult = await this.publishPage();
                    if (publishResult.success) {
                        console.log('✅ Method 3 successful!');
                        return { success: true, method: 'Code Editor', url: publishResult.url };
                    }
                }
            }

        } catch (error) {
            console.log('❌ Method 3 failed:', error.message);
        }

        return { success: false };
    }

    async method4_Shortcode(pageNumber, fullContent) {
        console.log('🔧 Method 4: Shortcode Method...');

        try {
            // Refresh page
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);

            // Set title
            const titleField = this.page.locator('.editor-post-title__input');
            await titleField.fill(`פורטל למשקיעים כשירים - עמוד ${pageNumber}`);

            // Create a simple iframe or include shortcode
            const shortcodeContent = `
            <div style="width: 100%; height: 100vh;">
                ${fullContent}
            </div>
            `;

            // Add HTML block
            await this.page.click('.block-editor-inserter__toggle');
            await this.page.waitForTimeout(1000);
            await this.page.fill('.block-editor-inserter__search input', 'HTML');
            await this.page.waitForTimeout(500);
            await this.page.click('[data-type="core/html"]');
            await this.page.waitForTimeout(1000);

            await this.page.fill('.block-editor-html__textarea', shortcodeContent);

            // Publish
            const publishResult = await this.publishPage();
            if (publishResult.success) {
                console.log('✅ Method 4 successful!');
                return { success: true, method: 'Shortcode Method', url: publishResult.url };
            }

        } catch (error) {
            console.log('❌ Method 4 failed:', error.message);
        }

        return { success: false };
    }

    async publishPage() {
        console.log('📤 Publishing page...');

        try {
            // Look for publish button variations
            const publishSelectors = [
                '.editor-post-publish-panel__toggle',
                '.editor-post-publish-button',
                '#publish',
                '.components-button.is-primary'
            ];

            for (const selector of publishSelectors) {
                const button = this.page.locator(selector).first();
                if (await button.count() > 0 && await button.isVisible()) {
                    await button.click();
                    await this.page.waitForTimeout(2000);

                    // Look for final publish confirmation
                    const confirmButton = this.page.locator('.editor-post-publish-button');
                    if (await confirmButton.count() > 0) {
                        await confirmButton.click();
                        await this.page.waitForTimeout(3000);
                    }

                    // Get published URL
                    const urlSelectors = [
                        '.post-publish-panel__postpublish-header a',
                        '.components-notice__content a',
                        '.notice-success a'
                    ];

                    for (const urlSelector of urlSelectors) {
                        const urlElement = this.page.locator(urlSelector);
                        if (await urlElement.count() > 0) {
                            const url = await urlElement.getAttribute('href');
                            if (url) {
                                console.log('✅ Page published:', url);

                                // Test the page
                                const testResult = await this.testPage(url);
                                return { success: testResult.working, url: url, testResult: testResult };
                            }
                        }
                    }

                    break;
                }
            }

        } catch (error) {
            console.log('❌ Publishing failed:', error.message);
        }

        return { success: false };
    }

    async testPage(url) {
        console.log('🧪 Testing published page:', url);

        try {
            const newPage = await this.browser.newPage();
            await newPage.goto(url, { waitUntil: 'networkidle' });

            const bodyText = await newPage.textContent('body');
            const hasContent = bodyText.length > 500;
            const hasPortalElements = bodyText.includes('פורטל') || bodyText.includes('movne') || bodyText.includes('משקיעים');

            const result = {
                url: url,
                contentLength: bodyText.length,
                hasContent: hasContent,
                hasPortalElements: hasPortalElements,
                working: hasContent && hasPortalElements
            };

            console.log(`📊 Test Result:
            - Content Length: ${result.contentLength} chars
            - Has Content: ${result.hasContent}
            - Has Portal Elements: ${result.hasPortalElements}
            - Status: ${result.working ? '✅ WORKING' : '❌ NOT WORKING'}`);

            await newPage.close();
            return result;

        } catch (error) {
            console.log('❌ Page test failed:', error.message);
            return { working: false, error: error.message };
        }
    }

    async run() {
        try {
            await this.init();
            await this.login();

            // Create Portal Page 2
            const portal2File = 'C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-EXACT.html';
            const page2Result = await this.createPortalPage(2, portal2File);

            console.log('\n🎉 PORTAL PAGE CREATION COMPLETED!');
            console.log('📊 Results:', JSON.stringify(page2Result, null, 2));

            // Save results
            const results = {
                timestamp: new Date().toISOString(),
                portalPage2: page2Result,
                success: page2Result.success,
                workingUrl: page2Result.success ? page2Result.url : null
            };

            fs.writeFileSync('C:\\Users\\Aviad\\Desktop\\web-movne\\portal-creation-results.json', JSON.stringify(results, null, 2));

            if (page2Result.success) {
                console.log(`\n✅ SUCCESS! Portal Page 2 is working at: ${page2Result.url}`);
                console.log(`📝 Method used: ${page2Result.method}`);
                console.log('\n📋 Next Steps for Portal Page 3:');
                console.log(`1. Use the same method (${page2Result.method}) for page 3`);
                console.log('2. Replace content with portal-page-3 HTML');
                console.log('3. Test the page after creation');
            } else {
                console.log('\n❌ All methods failed. Manual intervention required.');
                console.log('📋 Alternative approaches:');
                console.log('1. Try uploading as static HTML file');
                console.log('2. Use FTP to upload directly');
                console.log('3. Check theme compatibility');
            }

            return results;

        } catch (error) {
            console.error('❌ Fatal error:', error);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Execute
async function main() {
    const creator = new ReliablePortalPageCreator();
    try {
        return await creator.run();
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ReliablePortalPageCreator };