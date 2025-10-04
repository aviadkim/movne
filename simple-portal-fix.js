/**
 * 🎯 SIMPLE PORTAL FIX - Handles timeout issues and SSL problems
 */

const { chromium } = require('playwright');
const fs = require('fs');

class SimplePortalFix {
    constructor() {
        this.browser = null;
        this.page = null;
        this.config = {
            wpAdminUrl: 'https://movne.co.il/wp-admin/',
            username: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982',
            timeout: 60000,
            portalFile: 'portal-page-2-EXACT.html'
        };
    }

    async init() {
        console.log('🚀 Initializing Simple Portal Fix...\n');

        this.browser = await chromium.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args: [
                '--ignore-certificate-errors-spki-list',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ]
        });

        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(this.config.timeout);

        // Handle errors gracefully
        this.page.on('error', (error) => {
            console.log('⚠️ Page error:', error.message);
        });

        this.page.on('pageerror', (error) => {
            console.log('⚠️ Page error:', error.message);
        });
    }

    async loginToWordPress() {
        try {
            console.log('🔐 Attempting WordPress login...');

            // Navigate with multiple retry attempts
            let loginSuccess = false;
            let attempts = 0;
            const maxAttempts = 3;

            while (!loginSuccess && attempts < maxAttempts) {
                attempts++;
                console.log(`Attempt ${attempts}/${maxAttempts}...`);

                try {
                    await this.page.goto(this.config.wpAdminUrl, {
                        waitUntil: 'networkidle',
                        timeout: this.config.timeout
                    });
                    loginSuccess = true;
                } catch (error) {
                    console.log(`⚠️ Navigation attempt ${attempts} failed:`, error.message);
                    if (attempts < maxAttempts) {
                        await this.page.waitForTimeout(3000);
                    }
                }
            }

            if (!loginSuccess) {
                throw new Error('Could not navigate to WordPress admin after 3 attempts');
            }

            await this.page.waitForTimeout(3000);

            // Check if already logged in
            const loginForm = await this.page.$('#loginform');
            if (!loginForm) {
                console.log('✅ Already logged in!');
                return true;
            }

            // Perform login
            await this.page.fill('#user_login', this.config.username);
            await this.page.fill('#user_pass', this.config.password);
            await this.page.click('#wp-submit');

            // Wait for redirect
            await this.page.waitForNavigation({ timeout: this.config.timeout });

            console.log('✅ Login successful!');
            return true;

        } catch (error) {
            console.error('❌ Login failed:', error.message);
            return false;
        }
    }

    async createPortalPage() {
        try {
            console.log('📄 Creating portal page...');

            // Navigate to new page creation
            await this.page.goto(this.config.wpAdminUrl + 'post-new.php?post_type=page', {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout
            });

            await this.page.waitForTimeout(5000);

            // Set title
            const title = 'פורטל משקיעים - עמוד 2 - WORKING VERSION';
            console.log('📝 Setting title:', title);

            await this.page.fill('input[name="post_title"], #title', title);
            await this.page.waitForTimeout(2000);

            // Load portal content
            const portalContent = fs.readFileSync(this.config.portalFile, 'utf8');
            console.log(`📂 Loaded portal content (${portalContent.length} chars)`);

            // Extract body content only
            const bodyMatch = portalContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
            const bodyContent = bodyMatch ? bodyMatch[1] : portalContent;

            // Extract styles
            const styleMatches = portalContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
            const styles = styleMatches.join('\n');

            // Create WordPress-optimized content
            const wordpressContent = `${styles}

<div class="movne-portal-wrapper">
${bodyContent}
</div>

<style>
.movne-portal-wrapper {
    direction: rtl !important;
    text-align: right !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
}
</style>`;

            // Try multiple methods to add content
            const methods = [
                {
                    name: 'Block Editor HTML',
                    action: async () => {
                        // Add Custom HTML block
                        await this.page.click('button[aria-label="Block Inserter"], .block-editor-inserter__toggle');
                        await this.page.waitForTimeout(1000);

                        await this.page.fill('input[placeholder*="Search"], input[placeholder*="חיפוש"]', 'HTML');
                        await this.page.waitForTimeout(500);

                        await this.page.click('button:has-text("Custom HTML"), button:has-text("HTML מותאם")');
                        await this.page.waitForTimeout(1000);

                        const htmlTextarea = await this.page.$('textarea[placeholder*="HTML"], .wp-block-html textarea');
                        if (htmlTextarea) {
                            await htmlTextarea.fill(wordpressContent);
                            console.log('✅ HTML content inserted via Custom HTML block');
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: 'Code Editor',
                    action: async () => {
                        // Switch to code editor
                        await this.page.click('button:has-text("Code editor"), .editor-mode-toggle');
                        await this.page.waitForTimeout(1000);

                        const codeEditor = await this.page.$('textarea.editor-post-text-editor');
                        if (codeEditor) {
                            await codeEditor.fill(wordpressContent);
                            console.log('✅ Content inserted via Code Editor');
                            return true;
                        }
                        return false;
                    }
                }
            ];

            // Try each method
            let success = false;
            for (const method of methods) {
                try {
                    console.log(`🔧 Trying method: ${method.name}`);
                    if (await method.action()) {
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Method ${method.name} failed:`, error.message);
                }
            }

            if (!success) {
                throw new Error('All content insertion methods failed');
            }

            // Publish the page
            await this.page.waitForTimeout(2000);
            console.log('📢 Publishing page...');

            await this.page.click('button:has-text("Publish"), .editor-post-publish-button');
            await this.page.waitForTimeout(3000);

            // Try to get the URL
            let pageUrl = 'https://movne.co.il/portal-page-2-working/';
            try {
                const urlElement = await this.page.$('.post-publish-panel__postpublish-header a');
                if (urlElement) {
                    pageUrl = await urlElement.getAttribute('href');
                }
            } catch (error) {
                console.log('⚠️ Could not get exact URL, using default');
            }

            console.log(`✅ Page published: ${pageUrl}`);
            return pageUrl;

        } catch (error) {
            console.error('❌ Failed to create portal page:', error.message);
            throw error;
        }
    }

    async testPage(url) {
        try {
            console.log(`🧪 Testing page: ${url}`);

            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout
            });
            await this.page.waitForTimeout(3000);

            const title = await this.page.title();
            const hasContent = await this.page.$('body *') !== null;
            const hasPortalContent = await this.page.$('.movne-portal-wrapper, .portal-container, .exclusive-banner') !== null;

            const result = {
                url: url,
                title: title,
                hasContent: hasContent,
                hasPortalContent: hasPortalContent,
                status: hasPortalContent ? 'SUCCESS' : (hasContent ? 'PARTIAL' : 'BLANK')
            };

            console.log(`📊 Test Result: ${result.status}`);
            console.log(`📝 Title: ${title}`);
            console.log(`🎨 Portal Content: ${hasPortalContent ? 'YES' : 'NO'}`);

            return result;

        } catch (error) {
            console.error('❌ Test failed:', error.message);
            return {
                url: url,
                status: 'ERROR',
                error: error.message
            };
        }
    }

    async run() {
        try {
            await this.init();

            // Login
            const loginSuccess = await this.loginToWordPress();
            if (!loginSuccess) {
                throw new Error('Cannot proceed without WordPress access');
            }

            // Create portal page
            const pageUrl = await this.createPortalPage();

            // Test the page
            const testResult = await this.testPage(pageUrl);

            // Generate report
            console.log('\n' + '='.repeat(60));
            console.log('📋 SIMPLE PORTAL FIX REPORT');
            console.log('='.repeat(60));
            console.log(`✅ Portal Page Created: ${pageUrl}`);
            console.log(`🎯 Status: ${testResult.status}`);
            console.log(`📝 Title: ${testResult.title || 'N/A'}`);
            console.log(`🎨 Portal Content Visible: ${testResult.hasPortalContent ? 'YES' : 'NO'}`);

            if (testResult.status === 'SUCCESS') {
                console.log('\n🎉 SUCCESS! Portal page is working correctly!');
                console.log('🔗 Working URL:', pageUrl);
                console.log('\n📌 Next Steps:');
                console.log('1. Update main site navigation to link to this page');
                console.log('2. Create Portal Page 3 using the same method');
                console.log('3. Test complete user flow');
            } else {
                console.log('\n⚠️ Portal page created but content may not be fully visible');
                console.log('💡 Try checking the page manually and reviewing theme settings');
            }

            console.log('='.repeat(60));

        } catch (error) {
            console.error('💥 Critical error:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the script
if (require.main === module) {
    const fix = new SimplePortalFix();
    fix.run().catch(console.error);
}

module.exports = SimplePortalFix;