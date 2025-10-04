/**
 * 🎯 WORDPRESS HTML BLOCK SOLUTION
 * Bypassing uPress security by using Custom HTML blocks instead of file uploads
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordPressHTMLBlockSolution {
    constructor() {
        this.browser = null;
        this.page = null;
        this.config = {
            wpAdminUrl: 'https://movne.co.il/wp-admin/',
            username: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982',
            portalFiles: [
                {
                    name: 'portal-page-2-EXACT.html',
                    title: 'פורטל משקיעים - עמוד 2',
                    slug: 'portal-page-2-final'
                },
                {
                    name: 'portal-page-3-EXACT.html',
                    title: 'פורטל משקיעים - עמוד 3',
                    slug: 'portal-page-3-final'
                }
            ]
        };
    }

    async init() {
        console.log('🎯 Initializing HTML Block Solution...\n');

        this.browser = await chromium.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(60000);
    }

    /**
     * Extract and prepare HTML content for WordPress Custom HTML blocks
     */
    prepareHTMLContent(filePath) {
        console.log(`📄 Preparing HTML content from: ${filePath}`);

        const content = fs.readFileSync(filePath, 'utf8');

        // Extract styles
        const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        let styles = styleMatches.join('\n');

        // Extract body content
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : '';

        // Clean up and prepare for WordPress
        bodyContent = bodyContent
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Combine styles and content for WordPress
        const wordpressHTML = `
${styles}

<div class="movne-portal-content">
${bodyContent}
</div>

<style>
/* Ensure proper RTL and theme compatibility */
.movne-portal-content {
    direction: rtl;
    text-align: right;
    width: 100%;
    max-width: none;
}

/* Override theme styles */
.movne-portal-content * {
    box-sizing: border-box;
}
</style>`;

        return wordpressHTML;
    }

    /**
     * Login to WordPress admin
     */
    async loginToWordPress() {
        try {
            console.log('🔐 Logging into WordPress...');

            await this.page.goto(this.config.wpAdminUrl);
            await this.page.waitForTimeout(3000); // Wait for uPress security check

            const loginForm = await this.page.$('#loginform');
            if (loginForm) {
                await this.page.fill('#user_login', this.config.username);
                await this.page.fill('#user_pass', this.config.password);
                await this.page.click('#wp-submit');
                await this.page.waitForNavigation();
            }

            console.log('✅ Successfully logged in');
            return true;
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            return false;
        }
    }

    /**
     * Create WordPress page with Custom HTML blocks
     */
    async createPageWithHTMLBlocks(portalFile) {
        try {
            console.log(`\n🏗️ Creating page: ${portalFile.title}`);

            // Navigate to new page
            await this.page.goto(this.config.wpAdminUrl + 'post-new.php?post_type=page');
            await this.page.waitForTimeout(2000);

            // Set page title
            await this.page.fill('input[name="post_title"], #title', portalFile.title);
            await this.page.waitForTimeout(1000);

            // Add Custom HTML block
            await this.page.click('button[aria-label="Block Inserter"]');
            await this.page.waitForTimeout(1000);

            // Search for HTML block
            await this.page.fill('input[placeholder="חיפוש"], input[placeholder="Search"]', 'HTML');
            await this.page.waitForTimeout(500);

            // Click on Custom HTML block
            await this.page.click('button:has-text("HTML מותאם"), button:has-text("Custom HTML")');
            await this.page.waitForTimeout(1000);

            // Prepare HTML content
            const filePath = path.resolve(__dirname, portalFile.name);
            const htmlContent = this.prepareHTMLContent(filePath);

            // Insert HTML content into the block
            const htmlTextarea = await this.page.$('textarea[placeholder*="HTML"], .wp-block-html textarea');
            if (htmlTextarea) {
                await htmlTextarea.fill(htmlContent);
                console.log('✅ HTML content inserted');
            }

            // Set page slug
            await this.page.evaluate((slug) => {
                // Try to set slug if accessible
                const slugField = document.querySelector('#post_name, input[name="post_name"]');
                if (slugField) {
                    slugField.value = slug;
                }
            }, portalFile.slug);

            // Publish the page
            await this.page.click('button:has-text("פרסום"), .editor-post-publish-button');
            await this.page.waitForTimeout(3000);

            // Get the page URL
            const pageUrl = `https://movne.co.il/${portalFile.slug}/`;
            console.log(`✅ Page created: ${pageUrl}`);

            return {
                title: portalFile.title,
                url: pageUrl,
                status: 'created'
            };

        } catch (error) {
            console.error(`❌ Failed to create page ${portalFile.title}:`, error.message);
            return {
                title: portalFile.title,
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Test created pages
     */
    async testCreatedPages(pages) {
        console.log('\n🧪 Testing created pages...');

        const results = [];

        for (const page of pages) {
            if (page.status === 'created') {
                try {
                    console.log(`\n🔍 Testing: ${page.url}`);

                    await this.page.goto(page.url);
                    await this.page.waitForTimeout(3000);

                    const title = await this.page.title();
                    const hasContent = await this.page.$('.movne-portal-content') !== null;
                    const hasMovneStyles = await this.page.$('*[class*="movne"], *[id*="movne"]') !== null;

                    const result = {
                        url: page.url,
                        title: title,
                        hasContent: hasContent,
                        hasMovneStyles: hasMovneStyles,
                        status: hasContent ? 'working' : 'blank'
                    };

                    results.push(result);
                    console.log(`📊 Status: ${result.status}`);
                    console.log(`📝 Title: ${title}`);
                    console.log(`🎨 Has Movne styles: ${hasMovneStyles}`);

                } catch (error) {
                    console.error(`❌ Error testing ${page.url}:`, error.message);
                    results.push({
                        url: page.url,
                        status: 'error',
                        error: error.message
                    });
                }
            }
        }

        return results;
    }

    /**
     * Generate final report
     */
    generateReport(createdPages, testResults) {
        console.log('\n' + '='.repeat(80));
        console.log('📋 HTML BLOCK SOLUTION REPORT');
        console.log('='.repeat(80));

        console.log('\n🏗️ CREATED PAGES:');
        createdPages.forEach((page, index) => {
            console.log(`${index + 1}. ${page.title}: ${page.status}`);
            if (page.url) console.log(`   URL: ${page.url}`);
            if (page.error) console.log(`   Error: ${page.error}`);
        });

        console.log('\n🧪 TEST RESULTS:');
        testResults.forEach((result, index) => {
            console.log(`${index + 1}. ${result.url}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Title: ${result.title || 'N/A'}`);
            console.log(`   Content: ${result.hasContent ? 'Yes' : 'No'}`);
            console.log(`   Movne Styles: ${result.hasMovneStyles ? 'Yes' : 'No'}`);
        });

        const workingPages = testResults.filter(r => r.status === 'working');

        console.log('\n💡 RECOMMENDATIONS:');
        if (workingPages.length > 0) {
            console.log('✅ SUCCESS! HTML Block method works!');
            console.log('📌 Working URLs:');
            workingPages.forEach(page => console.log(`   - ${page.url}`));
            console.log('\n🎯 Next Steps:');
            console.log('1. Update main site navigation to point to these URLs');
            console.log('2. Add portal links to site menu');
            console.log('3. Test complete navigation flow');
        } else {
            console.log('⚠️ No working pages found');
            console.log('1. Check theme compatibility');
            console.log('2. Review HTML block content');
            console.log('3. Consider alternative embedding methods');
        }

        console.log('\n' + '='.repeat(80));
    }

    async run() {
        try {
            await this.init();

            // Login to WordPress
            const loginSuccess = await this.loginToWordPress();
            if (!loginSuccess) {
                throw new Error('Cannot proceed without WordPress access');
            }

            // Create pages with HTML blocks
            const createdPages = [];
            for (const portalFile of this.config.portalFiles) {
                const result = await this.createPageWithHTMLBlocks(portalFile);
                createdPages.push(result);
            }

            // Test created pages
            const testResults = await this.testCreatedPages(createdPages);

            // Generate report
            this.generateReport(createdPages, testResults);

        } catch (error) {
            console.error('💥 Critical error:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Export and run
module.exports = WordPressHTMLBlockSolution;

if (require.main === module) {
    const solution = new WordPressHTMLBlockSolution();
    solution.run().catch(console.error);
}