/**
 * 🔍 PORTAL STATUS CHECKER
 * Comprehensive review and testing of current portal setup
 */

const { chromium } = require('playwright');

class PortalStatusChecker {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            mainSite: null,
            portalPages: [],
            uploadedFiles: [],
            recommendations: []
        };
    }

    async init() {
        console.log('🔍 Initializing Portal Status Checker...\n');

        this.browser = await chromium.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(30000);
    }

    /**
     * Test main Movne website
     */
    async testMainSite() {
        try {
            console.log('🌐 Testing main Movne website...');

            await this.page.goto('https://movne.co.il/', { waitUntil: 'domcontentloaded' });
            await this.page.waitForTimeout(3000);

            const title = await this.page.title();
            const hasContent = await this.page.$('body *') !== null;
            const portalLink = await this.page.$('a[href*="portal"]');

            this.results.mainSite = {
                status: hasContent ? 'working' : 'blank',
                title: title,
                hasPortalLink: !!portalLink,
                url: 'https://movne.co.il/'
            };

            if (portalLink) {
                const portalHref = await portalLink.getAttribute('href');
                console.log(`📄 Found portal link: ${portalHref}`);
                this.results.mainSite.portalLinkUrl = portalHref;
            }

            console.log(`✅ Main site status: ${this.results.mainSite.status}`);
            console.log(`📝 Title: ${title}`);

            return this.results.mainSite;
        } catch (error) {
            console.error('❌ Main site test failed:', error.message);
            this.results.mainSite = {
                status: 'error',
                error: error.message
            };
            return this.results.mainSite;
        }
    }

    /**
     * Test uploaded portal files
     */
    async testUploadedFiles() {
        console.log('\n📁 Testing uploaded portal files...');

        const uploadUrls = [
            'https://movne.co.il/wp-content/uploads/2025/09/portal-page-2-EXACT.html',
            'https://movne.co.il/wp-content/uploads/2025/09/portal-page-3-EXACT.html'
        ];

        for (const url of uploadUrls) {
            try {
                console.log(`🔍 Testing: ${url}`);

                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                await this.page.waitForTimeout(2000);

                const title = await this.page.title();
                const hasContent = await this.page.$('body *') !== null;
                const isAccessible = !title.includes('אינך מורשה') && !title.includes('not authorized');

                const result = {
                    url: url,
                    status: isAccessible && hasContent ? 'working' : 'blocked',
                    title: title,
                    accessible: isAccessible
                };

                this.results.uploadedFiles.push(result);
                console.log(`📊 Status: ${result.status} - ${title}`);

            } catch (error) {
                console.error(`❌ Error testing ${url}:`, error.message);
                this.results.uploadedFiles.push({
                    url: url,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return this.results.uploadedFiles;
    }

    /**
     * Test WordPress portal pages
     */
    async testWordPressPages() {
        console.log('\n📄 Testing WordPress portal pages...');

        const wpPageUrls = [
            'https://movne.co.il/portal-page-2/',
            'https://movne.co.il/portal-page-3/',
            'https://movne.co.il/פורטל-משקיעים-עמוד-2/',
            'https://movne.co.il/פורטל-משקיעים-עמוד-3/',
            'https://movne.co.il/פורטל-משקיעים-עמוד-2-2/',
            'https://movne.co.il/פורטל-משקיעים-עמוד-3-3/'
        ];

        for (const url of wpPageUrls) {
            try {
                console.log(`🔍 Testing: ${url}`);

                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                await this.page.waitForTimeout(2000);

                const title = await this.page.title();
                const hasContent = await this.page.$('body *') !== null;
                const is404 = title.includes('לא נמצא') || title.includes('Not Found') || title.includes('404');

                const result = {
                    url: url,
                    status: !is404 && hasContent ? 'working' : (is404 ? '404' : 'blank'),
                    title: title,
                    exists: !is404
                };

                this.results.portalPages.push(result);
                console.log(`📊 Status: ${result.status} - ${title}`);

            } catch (error) {
                console.error(`❌ Error testing ${url}:`, error.message);
                this.results.portalPages.push({
                    url: url,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return this.results.portalPages;
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        console.log('\n💡 Analyzing results and generating recommendations...');

        const recommendations = [];

        // Check for working solutions
        const workingUploads = this.results.uploadedFiles.filter(f => f.status === 'working');
        const workingPages = this.results.portalPages.filter(p => p.status === 'working');

        if (workingUploads.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                method: 'Direct File Access',
                description: 'Use uploaded HTML files directly',
                action: 'Update navigation to point to working uploaded files',
                urls: workingUploads.map(f => f.url)
            });
        }

        if (workingPages.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                method: 'WordPress Pages',
                description: 'Use working WordPress pages',
                action: 'Update navigation to point to working WordPress pages',
                urls: workingPages.map(p => p.url)
            });
        }

        // Check for blocked uploads
        const blockedUploads = this.results.uploadedFiles.filter(f => f.status === 'blocked');
        if (blockedUploads.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                method: 'File Permissions',
                description: 'Uploaded files are blocked by security settings',
                action: 'Contact hosting provider to allow HTML file access or use alternative method'
            });
        }

        // Check for blank WordPress pages
        const blankPages = this.results.portalPages.filter(p => p.status === 'blank');
        if (blankPages.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                method: 'WordPress Theme Fix',
                description: 'WordPress pages exist but display blank',
                action: 'Check theme compatibility or switch to different page template'
            });
        }

        // Always include manual alternatives
        recommendations.push({
            priority: 'LOW',
            method: 'Manual Integration',
            description: 'Create custom PHP templates or use shortcodes',
            action: 'Use WordPress custom page templates or plugin-based solutions'
        });

        this.results.recommendations = recommendations;
        return recommendations;
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 COMPREHENSIVE PORTAL STATUS REPORT');
        console.log('='.repeat(80));

        // Main site status
        console.log('\n🌐 MAIN SITE STATUS:');
        if (this.results.mainSite) {
            console.log(`Status: ${this.results.mainSite.status}`);
            console.log(`Title: ${this.results.mainSite.title || 'N/A'}`);
            console.log(`Portal Link: ${this.results.mainSite.hasPortalLink ? 'Found' : 'Not Found'}`);
            if (this.results.mainSite.portalLinkUrl) {
                console.log(`Portal URL: ${this.results.mainSite.portalLinkUrl}`);
            }
        }

        // Uploaded files status
        console.log('\n📁 UPLOADED FILES STATUS:');
        if (this.results.uploadedFiles.length > 0) {
            this.results.uploadedFiles.forEach((file, index) => {
                console.log(`${index + 1}. ${file.url}`);
                console.log(`   Status: ${file.status}`);
                console.log(`   Title: ${file.title || 'N/A'}`);
            });
        } else {
            console.log('No uploaded files tested');
        }

        // WordPress pages status
        console.log('\n📄 WORDPRESS PAGES STATUS:');
        if (this.results.portalPages.length > 0) {
            this.results.portalPages.forEach((page, index) => {
                console.log(`${index + 1}. ${page.url}`);
                console.log(`   Status: ${page.status}`);
                console.log(`   Title: ${page.title || 'N/A'}`);
            });
        } else {
            console.log('No WordPress pages tested');
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS (Priority Order):');
        if (this.results.recommendations.length > 0) {
            this.results.recommendations.forEach((rec, index) => {
                console.log(`\n${index + 1}. [${rec.priority}] ${rec.method}`);
                console.log(`   Description: ${rec.description}`);
                console.log(`   Action: ${rec.action}`);
                if (rec.urls) {
                    console.log(`   URLs: ${rec.urls.join(', ')}`);
                }
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('🎯 NEXT STEPS:');
        console.log('1. Review the recommendations above');
        console.log('2. Implement the highest priority working solution');
        console.log('3. Update main site navigation accordingly');
        console.log('4. Test the complete portal flow');
        console.log('='.repeat(80));
    }

    async run() {
        try {
            await this.init();

            // Test main site
            await this.testMainSite();

            // Test uploaded files
            await this.testUploadedFiles();

            // Test WordPress pages
            await this.testWordPressPages();

            // Generate recommendations
            this.generateRecommendations();

            // Generate final report
            this.generateReport();

        } catch (error) {
            console.error('💥 Critical error:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Export for use
module.exports = PortalStatusChecker;

// Run if called directly
if (require.main === module) {
    const checker = new PortalStatusChecker();
    checker.run().catch(console.error);
}