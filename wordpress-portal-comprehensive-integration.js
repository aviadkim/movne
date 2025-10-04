/**
 * 🚀 COMPREHENSIVE WORDPRESS PORTAL INTEGRATION
 * Multiple methods to add and test portal pages
 * Using Playwright automation with fallback approaches
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// WordPress credentials and configuration
const CONFIG = {
    wpAdminUrl: 'https://movne.co.il/wp-admin/',
    siteUrl: 'https://movne.co.il/',
    username: 'aviad@kimfo-fs.com',
    password: 'Kimfo1982',
    portalFiles: [
        {
            name: 'portal-page-2-EXACT.html',
            title: 'פורטל משקיעים - עמוד 2',
            slug: 'portal-page-2'
        },
        {
            name: 'portal-page-3-EXACT.html',
            title: 'פורטל משקיעים - עמוד 3',
            slug: 'portal-page-3'
        }
    ]
};

class WordPressPortalIntegrator {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            methods: [],
            successfulUrls: [],
            errors: []
        };
    }

    async init() {
        console.log('🚀 Initializing WordPress Portal Integration...\n');

        this.browser = await chromium.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        this.page = await this.browser.newPage();

        // Set longer timeout for WordPress admin
        this.page.setDefaultTimeout(60000);
    }

    /**
     * METHOD 1: WordPress Admin Login and Page Creation
     */
    async loginToWordPress() {
        try {
            console.log('🔐 Method 1: WordPress Admin Login...');

            await this.page.goto(CONFIG.wpAdminUrl);

            // Wait for uPress security check
            await this.page.waitForTimeout(3000);

            // Check if login form exists
            const loginForm = await this.page.$('#loginform');
            if (loginForm) {
                await this.page.fill('#user_login', CONFIG.username);
                await this.page.fill('#user_pass', CONFIG.password);
                await this.page.click('#wp-submit');
                await this.page.waitForNavigation();
                console.log('✅ Successfully logged into WordPress admin');
            } else {
                console.log('✅ Already logged in to WordPress admin');
            }

            return true;
        } catch (error) {
            console.error('❌ WordPress login failed:', error.message);
            this.results.errors.push('WordPress login failed: ' + error.message);
            return false;
        }
    }

    /**
     * METHOD 2: Direct File Upload to Media Library
     */
    async uploadFilesToMedia() {
        try {
            console.log('\n📁 Method 2: Uploading files to Media Library...');

            await this.page.goto(CONFIG.wpAdminUrl + 'media-new.php');
            await this.page.waitForSelector('.wp-upload-form');

            // Prepare file paths
            const filePaths = CONFIG.portalFiles.map(file =>
                path.resolve(__dirname, file.name)
            );

            // Upload files
            const fileInput = await this.page.$('input[type="file"]');
            await fileInput.setInputFiles(filePaths);

            // Wait for upload completion
            await this.page.waitForTimeout(5000);

            // Get uploaded file URLs
            const uploadedFiles = await this.page.$$eval('.attachment', (elements) => {
                return elements.map(el => {
                    const copyButton = el.querySelector('button[data-clipboard-text]');
                    return copyButton ? copyButton.getAttribute('data-clipboard-text') : null;
                }).filter(url => url);
            });

            this.results.methods.push({
                method: 'Media Upload',
                status: 'success',
                urls: uploadedFiles
            });

            console.log('✅ Files uploaded to media library');
            console.log('📂 Uploaded URLs:', uploadedFiles);

            return uploadedFiles;
        } catch (error) {
            console.error('❌ Media upload failed:', error.message);
            this.results.errors.push('Media upload failed: ' + error.message);
            return [];
        }
    }

    /**
     * METHOD 3: Create WordPress Pages with HTML Content
     */
    async createWordPressPages() {
        try {
            console.log('\n📄 Method 3: Creating WordPress Pages...');

            const createdPages = [];

            for (const portalFile of CONFIG.portalFiles) {
                console.log(`\n🏗️ Creating page: ${portalFile.title}`);

                // Go to new page
                await this.page.goto(CONFIG.wpAdminUrl + 'post-new.php?post_type=page');
                await this.page.waitForTimeout(2000);

                // Set title
                await this.page.fill('input[name="post_title"], #title', portalFile.title);

                // Switch to code editor
                try {
                    await this.page.click('button:has-text("עורך קוד"), button:has-text("Code editor")');
                    await this.page.waitForTimeout(1000);
                } catch (e) {
                    console.log('Code editor button not found, trying alternative method');
                }

                // Read portal file content
                const filePath = path.resolve(__dirname, portalFile.name);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');

                    // Extract body content for WordPress
                    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                    const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];

                    let wpContent = '';
                    if (styleMatches.length > 0) {
                        wpContent += '<!-- wp:html -->\n';
                        wpContent += styleMatches.join('\n') + '\n';
                    }
                    if (bodyMatch) {
                        wpContent += bodyMatch[1].trim();
                    }
                    if (styleMatches.length > 0) {
                        wpContent += '\n<!-- /wp:html -->';
                    }

                    // Insert content into editor
                    const contentEditor = await this.page.$('#content, textarea[name="content"]');
                    if (contentEditor) {
                        await contentEditor.fill(wpContent);
                    }

                    // Set slug
                    await this.page.evaluate((slug) => {
                        const slugField = document.querySelector('#post_name, input[name="post_name"]');
                        if (slugField) {
                            slugField.value = slug;
                        }
                    }, portalFile.slug);

                    // Publish page
                    await this.page.click('button:has-text("פרסום"), #publish');
                    await this.page.waitForTimeout(3000);

                    // Get page URL
                    const currentUrl = this.page.url();
                    const pageId = currentUrl.match(/post=(\d+)/)?.[1];

                    if (pageId) {
                        const pageUrl = `${CONFIG.siteUrl}${portalFile.slug}/`;
                        createdPages.push({
                            title: portalFile.title,
                            slug: portalFile.slug,
                            url: pageUrl,
                            id: pageId
                        });
                        console.log(`✅ Created page: ${pageUrl}`);
                    }
                } else {
                    console.error(`❌ File not found: ${filePath}`);
                }
            }

            this.results.methods.push({
                method: 'WordPress Pages',
                status: 'success',
                pages: createdPages
            });

            return createdPages;
        } catch (error) {
            console.error('❌ WordPress page creation failed:', error.message);
            this.results.errors.push('WordPress page creation failed: ' + error.message);
            return [];
        }
    }

    /**
     * METHOD 4: Test All Created Pages
     */
    async testAllPages() {
        try {
            console.log('\n🧪 Method 4: Testing All Created Pages...');

            const testResults = [];

            // Test WordPress pages
            if (this.results.methods.find(m => m.method === 'WordPress Pages')) {
                const wpPages = this.results.methods.find(m => m.method === 'WordPress Pages').pages || [];

                for (const page of wpPages) {
                    console.log(`\n🔍 Testing WordPress page: ${page.url}`);

                    try {
                        await this.page.goto(page.url);
                        await this.page.waitForTimeout(3000);

                        const pageTitle = await this.page.title();
                        const hasContent = await this.page.$('body *');

                        const result = {
                            url: page.url,
                            title: pageTitle,
                            hasContent: !!hasContent,
                            status: hasContent ? 'working' : 'blank'
                        };

                        testResults.push(result);
                        console.log(`📊 Result: ${result.status} - Title: ${pageTitle}`);

                        if (result.status === 'working') {
                            this.results.successfulUrls.push(page.url);
                        }
                    } catch (error) {
                        console.error(`❌ Error testing ${page.url}:`, error.message);
                        testResults.push({
                            url: page.url,
                            status: 'error',
                            error: error.message
                        });
                    }
                }
            }

            // Test media URLs
            if (this.results.methods.find(m => m.method === 'Media Upload')) {
                const mediaUrls = this.results.methods.find(m => m.method === 'Media Upload').urls || [];

                for (const url of mediaUrls) {
                    console.log(`\n🔍 Testing media URL: ${url}`);

                    try {
                        await this.page.goto(url);
                        await this.page.waitForTimeout(3000);

                        const pageTitle = await this.page.title();
                        const hasContent = await this.page.$('body *');

                        const result = {
                            url: url,
                            title: pageTitle,
                            hasContent: !!hasContent,
                            status: hasContent ? 'working' : 'blank'
                        };

                        testResults.push(result);
                        console.log(`📊 Result: ${result.status} - Title: ${pageTitle}`);

                        if (result.status === 'working') {
                            this.results.successfulUrls.push(url);
                        }
                    } catch (error) {
                        console.error(`❌ Error testing ${url}:`, error.message);
                        testResults.push({
                            url: url,
                            status: 'error',
                            error: error.message
                        });
                    }
                }
            }

            this.results.methods.push({
                method: 'Page Testing',
                status: 'completed',
                results: testResults
            });

            return testResults;
        } catch (error) {
            console.error('❌ Page testing failed:', error.message);
            this.results.errors.push('Page testing failed: ' + error.message);
            return [];
        }
    }

    /**
     * Generate Final Report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 FINAL INTEGRATION REPORT');
        console.log('='.repeat(80));

        console.log('\n🚀 METHODS ATTEMPTED:');
        this.results.methods.forEach((method, index) => {
            console.log(`${index + 1}. ${method.method}: ${method.status}`);
        });

        if (this.results.successfulUrls.length > 0) {
            console.log('\n✅ WORKING URLS:');
            this.results.successfulUrls.forEach((url, index) => {
                console.log(`${index + 1}. ${url}`);
            });
        } else {
            console.log('\n⚠️ NO WORKING URLS FOUND');
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS ENCOUNTERED:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        // Generate recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (this.results.successfulUrls.length > 0) {
            console.log('1. Use the working URLs above for your portal navigation');
            console.log('2. Update main site menu to point to these URLs');
            console.log('3. Test navigation flow between portal pages');
        } else {
            console.log('1. Check WordPress theme compatibility');
            console.log('2. Contact hosting provider about page rendering issues');
            console.log('3. Consider using custom page templates');
        }

        console.log('\n' + '='.repeat(80));
    }

    async run() {
        try {
            await this.init();

            // Step 1: Login to WordPress
            const loginSuccess = await this.loginToWordPress();
            if (!loginSuccess) {
                throw new Error('Cannot proceed without WordPress access');
            }

            // Step 2: Upload files to media library
            await this.uploadFilesToMedia();

            // Step 3: Create WordPress pages
            await this.createWordPressPages();

            // Step 4: Test all created pages
            await this.testAllPages();

            // Step 5: Generate final report
            this.generateReport();

        } catch (error) {
            console.error('💥 Critical error:', error.message);
            this.results.errors.push('Critical error: ' + error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Export for use
module.exports = WordPressPortalIntegrator;

// Run if called directly
if (require.main === module) {
    const integrator = new WordPressPortalIntegrator();
    integrator.run().catch(console.error);
}