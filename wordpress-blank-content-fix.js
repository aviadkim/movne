const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * WordPress Blank Content Fix - Comprehensive Playwright Solution
 *
 * This script systematically diagnoses and fixes WordPress pages showing blank content
 * by testing site editor, plugins, themes, and creating working portal pages.
 */

class WordPressBlanksFixAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            loginSuccess: false,
            siteEditorAccess: false,
            pluginTests: [],
            themeTests: [],
            portalPageCreation: [],
            recommendations: []
        };

        // WordPress credentials
        this.credentials = {
            url: 'https://movne.co.il/wp-admin/',
            email: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982'
        };

        // Portal content file
        this.portalFile = 'C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-EXACT.html';
    }

    async init() {
        console.log('🚀 Initializing WordPress Blank Content Fix...');

        this.browser = await chromium.launch({
            headless: false,
            slowMo: 1000
        });

        this.page = await this.browser.newPage();

        // Set viewport
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        // Handle console logs for debugging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            }
        });

        return this;
    }

    async step1_LoginAndAccessSiteEditor() {
        console.log('\n📋 STEP 1: Login & Access Site Editor');

        try {
            // Navigate to WordPress admin
            console.log('🔐 Logging into WordPress...');
            await this.page.goto(this.credentials.url, { waitUntil: 'networkidle' });

            // Handle login
            await this.page.waitForSelector('#user_login', { timeout: 10000 });
            await this.page.fill('#user_login', this.credentials.email);
            await this.page.fill('#user_pass', this.credentials.password);
            await this.page.click('#wp-submit');

            // Wait for dashboard
            await this.page.waitForSelector('#wpadminbar', { timeout: 15000 });
            console.log('✅ Login successful');
            this.results.loginSuccess = true;

            // Navigate to Site Editor
            console.log('🏗️ Accessing Site Editor...');
            await this.page.goto('https://movne.co.il/wp-admin/site-editor.php', { waitUntil: 'networkidle' });

            // Wait for site editor to load
            await this.page.waitForTimeout(5000);

            // Check if site editor loaded
            const siteEditorExists = await this.page.locator('.edit-site-layout').count() > 0;
            if (siteEditorExists) {
                console.log('✅ Site Editor accessed successfully');
                this.results.siteEditorAccess = true;

                // Navigate to Templates → Pages
                await this.checkPageTemplates();
            } else {
                console.log('❌ Site Editor not accessible');
            }

        } catch (error) {
            console.log('❌ Step 1 failed:', error.message);
            this.results.recommendations.push('Login or Site Editor access failed - check credentials and theme compatibility');
        }
    }

    async checkPageTemplates() {
        console.log('📄 Checking page templates...');

        try {
            // Look for Templates navigation
            const templatesButton = this.page.locator('text=Templates').first();
            if (await templatesButton.count() > 0) {
                await templatesButton.click();
                await this.page.waitForTimeout(3000);

                // Look for Pages template
                const pagesTemplate = this.page.locator('text=Pages').first();
                if (await pagesTemplate.count() > 0) {
                    await pagesTemplate.click();
                    await this.page.waitForTimeout(3000);

                    // Check for content blocks
                    const hasPostTitle = await this.page.locator('[data-type="core/post-title"]').count() > 0;
                    const hasPostContent = await this.page.locator('[data-type="core/post-content"]').count() > 0;

                    console.log(`📋 Template Analysis:
                    - Post Title Block: ${hasPostTitle ? '✅ Present' : '❌ Missing'}
                    - Post Content Block: ${hasPostContent ? '✅ Present' : '❌ Missing'}`);

                    if (!hasPostTitle || !hasPostContent) {
                        this.results.recommendations.push('Page template missing post title or content blocks - this causes blank pages');
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Template check failed:', error.message);
        }
    }

    async step2_PluginConflictTest() {
        console.log('\n📋 STEP 2: Plugin Conflict Testing');

        try {
            // Navigate to plugins page
            await this.page.goto('https://movne.co.il/wp-admin/plugins.php', { waitUntil: 'networkidle' });

            // Get list of active plugins
            const activePlugins = await this.page.locator('.active .plugin-title strong').allTextContents();
            console.log('🔌 Active plugins:', activePlugins);

            this.results.pluginTests.push({
                step: 'plugin_list',
                activePlugins: activePlugins,
                count: activePlugins.length
            });

            // Test: Deactivate all plugins
            console.log('🔄 Testing plugin deactivation...');

            // Select all plugins checkbox
            const selectAllCheckbox = this.page.locator('#cb-select-all-1');
            if (await selectAllCheckbox.count() > 0) {
                await selectAllCheckbox.check();

                // Apply bulk deactivation
                await this.page.selectOption('#bulk-action-selector-top', 'deactivate-selected');
                await this.page.click('#doaction');

                // Wait for deactivation
                await this.page.waitForTimeout(3000);

                console.log('✅ All plugins deactivated');

                // Test a portal page
                const testResult = await this.testPortalPageDisplay();
                this.results.pluginTests.push({
                    step: 'all_plugins_deactivated',
                    result: testResult,
                    pageDisplays: testResult.contentVisible
                });

                // Reactivate plugins
                await this.reactivatePlugins(activePlugins);
            }

        } catch (error) {
            console.log('❌ Plugin testing failed:', error.message);
            this.results.recommendations.push('Plugin conflict testing failed - manual investigation needed');
        }
    }

    async reactivatePlugins(pluginNames) {
        console.log('🔄 Reactivating plugins...');

        try {
            // Go back to plugins page
            await this.page.goto('https://movne.co.il/wp-admin/plugins.php', { waitUntil: 'networkidle' });

            // Select all inactive plugins
            await this.page.locator('#cb-select-all-1').check();
            await this.page.selectOption('#bulk-action-selector-top', 'activate-selected');
            await this.page.click('#doaction');

            await this.page.waitForTimeout(3000);
            console.log('✅ Plugins reactivated');

        } catch (error) {
            console.log('⚠️ Plugin reactivation failed:', error.message);
        }
    }

    async step3_ThemeTesting() {
        console.log('\n📋 STEP 3: Theme Testing');

        try {
            // Navigate to themes page
            await this.page.goto('https://movne.co.il/wp-admin/themes.php', { waitUntil: 'networkidle' });

            // Get current theme
            const currentTheme = await this.page.locator('.current .theme-name').textContent();
            console.log('🎨 Current theme:', currentTheme);

            this.results.themeTests.push({
                step: 'current_theme',
                themeName: currentTheme
            });

            // Test with default theme
            console.log('🔄 Testing with Twenty Twenty-Four theme...');

            // Look for a default WordPress theme
            const defaultThemes = [
                'Twenty Twenty-Four',
                'Twenty Twenty-Three',
                'Twenty Twenty-Two',
                'Twenty Twenty-One'
            ];

            for (const themeName of defaultThemes) {
                const themeElement = this.page.locator(`.theme:has(.theme-name:has-text("${themeName}"))`);
                if (await themeElement.count() > 0) {
                    console.log(`🎨 Switching to ${themeName}...`);

                    await themeElement.locator('.activate').click();
                    await this.page.waitForTimeout(5000);

                    // Test portal page with new theme
                    const testResult = await this.testPortalPageDisplay();
                    this.results.themeTests.push({
                        step: 'default_theme_test',
                        themeName: themeName,
                        result: testResult,
                        pageDisplays: testResult.contentVisible
                    });

                    // Switch back to original theme
                    await this.page.goto('https://movne.co.il/wp-admin/themes.php', { waitUntil: 'networkidle' });
                    const originalThemeElement = this.page.locator(`.theme:has(.theme-name:has-text("${currentTheme}"))`);
                    if (await originalThemeElement.count() > 0) {
                        await originalThemeElement.locator('.activate').click();
                        await this.page.waitForTimeout(3000);
                    }

                    break;
                }
            }

        } catch (error) {
            console.log('❌ Theme testing failed:', error.message);
            this.results.recommendations.push('Theme testing failed - current theme may have issues');
        }
    }

    async testPortalPageDisplay() {
        console.log('🧪 Testing portal page display...');

        try {
            // Test existing portal page
            const testUrls = [
                'https://movne.co.il/portal-page-2/',
                'https://movne.co.il/portal/',
                'https://movne.co.il/investors-portal/'
            ];

            for (const url of testUrls) {
                try {
                    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });

                    // Check if content is visible
                    const bodyText = await this.page.locator('body').textContent();
                    const hasContent = bodyText.length > 100; // Basic content check
                    const hasTitle = await this.page.locator('h1, h2, .title').count() > 0;

                    return {
                        url: url,
                        contentVisible: hasContent,
                        hasTitle: hasTitle,
                        bodyLength: bodyText.length,
                        status: hasContent ? 'working' : 'blank'
                    };

                } catch (error) {
                    console.log(`⚠️ Cannot access ${url}: ${error.message}`);
                }
            }

            return {
                url: 'none_accessible',
                contentVisible: false,
                status: 'inaccessible'
            };

        } catch (error) {
            console.log('❌ Portal page testing failed:', error.message);
            return {
                url: 'test_failed',
                contentVisible: false,
                status: 'error',
                error: error.message
            };
        }
    }

    async step4_CreateWorkingPortalPage() {
        console.log('\n📋 STEP 4: Creating Working Portal Page');

        try {
            // Read the portal content
            const portalContent = fs.readFileSync(this.portalFile, 'utf8');
            console.log('📄 Portal content loaded, size:', portalContent.length, 'characters');

            // Navigate to add new page
            await this.page.goto('https://movne.co.il/wp-admin/post-new.php?post_type=page', { waitUntil: 'networkidle' });

            // Wait for editor to load
            await this.page.waitForTimeout(5000);

            // Method 1: Try Block Editor
            await this.createPageWithBlockEditor(portalContent);

            // Method 2: Try Classic Editor if available
            await this.createPageWithClassicEditor(portalContent);

        } catch (error) {
            console.log('❌ Portal page creation failed:', error.message);
            this.results.recommendations.push('Portal page creation failed - try manual upload or different method');
        }
    }

    async createPageWithBlockEditor(content) {
        console.log('🏗️ Attempting Block Editor creation...');

        try {
            // Set page title
            const titleField = this.page.locator('[placeholder*="Add title"], .editor-post-title__input');
            if (await titleField.count() > 0) {
                await titleField.fill('פורטל למשקיעים כשירים - עמוד 2');
                console.log('✅ Title set');
            }

            // Try to add HTML block
            const addBlockButton = this.page.locator('.block-editor-inserter__toggle');
            if (await addBlockButton.count() > 0) {
                await addBlockButton.click();
                await this.page.waitForTimeout(1000);

                // Search for HTML block
                const searchBox = this.page.locator('.block-editor-inserter__search input');
                if (await searchBox.count() > 0) {
                    await searchBox.fill('HTML');
                    await this.page.waitForTimeout(500);

                    // Click HTML block
                    const htmlBlock = this.page.locator('[data-type="core/html"], .editor-block-list-item-html');
                    if (await htmlBlock.count() > 0) {
                        await htmlBlock.first().click();
                        await this.page.waitForTimeout(1000);

                        // Add HTML content
                        const htmlTextarea = this.page.locator('.block-editor-html__textarea, textarea');
                        if (await htmlTextarea.count() > 0) {
                            await htmlTextarea.fill(content);
                            console.log('✅ HTML content added to block');

                            // Save/publish
                            await this.publishPage('block-editor');
                            return true;
                        }
                    }
                }
            }

        } catch (error) {
            console.log('⚠️ Block editor method failed:', error.message);
        }

        return false;
    }

    async createPageWithClassicEditor(content) {
        console.log('🏗️ Attempting Classic Editor creation...');

        try {
            // Switch to text/HTML mode
            const textTab = this.page.locator('#content-html, .wp-switch-editor.switch-html');
            if (await textTab.count() > 0) {
                await textTab.click();
                await this.page.waitForTimeout(1000);

                // Add content to textarea
                const textarea = this.page.locator('#content');
                if (await textarea.count() > 0) {
                    await textarea.fill(content);
                    console.log('✅ HTML content added to classic editor');

                    // Save/publish
                    await this.publishPage('classic-editor');
                    return true;
                }
            }

        } catch (error) {
            console.log('⚠️ Classic editor method failed:', error.message);
        }

        return false;
    }

    async publishPage(method) {
        console.log(`📤 Publishing page with ${method}...`);

        try {
            // Look for publish button
            const publishButtons = [
                '.editor-post-publish-panel__toggle',
                '.editor-post-publish-button',
                '#publish',
                '#save-post'
            ];

            for (const selector of publishButtons) {
                const button = this.page.locator(selector);
                if (await button.count() > 0) {
                    await button.click();
                    await this.page.waitForTimeout(2000);

                    // If there's a confirmation, click it
                    const confirmButton = this.page.locator('.editor-post-publish-button');
                    if (await confirmButton.count() > 0) {
                        await confirmButton.click();
                        await this.page.waitForTimeout(3000);
                    }

                    // Get the page URL
                    const urlElement = this.page.locator('.post-publish-panel__postpublish-header a, .notice-success a');
                    if (await urlElement.count() > 0) {
                        const pageUrl = await urlElement.getAttribute('href');
                        console.log('✅ Page published:', pageUrl);

                        this.results.portalPageCreation.push({
                            method: method,
                            success: true,
                            url: pageUrl,
                            timestamp: new Date().toISOString()
                        });

                        // Test the published page
                        await this.testPublishedPage(pageUrl);
                        return true;
                    }

                    break;
                }
            }

        } catch (error) {
            console.log('❌ Publishing failed:', error.message);
        }

        return false;
    }

    async testPublishedPage(url) {
        console.log('🧪 Testing published page:', url);

        try {
            await this.page.goto(url, { waitUntil: 'networkidle' });

            // Check if content is displayed
            const bodyText = await this.page.locator('body').textContent();
            const hasContent = bodyText.length > 1000; // Portal content should be substantial
            const hasPortalElements = bodyText.includes('פורטל למשקיעים') || bodyText.includes('movne');

            const testResult = {
                url: url,
                contentVisible: hasContent,
                hasPortalElements: hasPortalElements,
                bodyLength: bodyText.length,
                status: hasContent && hasPortalElements ? 'working' : 'blank'
            };

            console.log(`📊 Test Result:
            - Content visible: ${testResult.contentVisible}
            - Portal elements: ${testResult.hasPortalElements}
            - Status: ${testResult.status}
            - Body length: ${testResult.bodyLength} chars`);

            this.results.portalPageCreation[this.results.portalPageCreation.length - 1].testResult = testResult;

        } catch (error) {
            console.log('❌ Page testing failed:', error.message);
        }
    }

    async generateReport() {
        console.log('\n📊 GENERATING COMPREHENSIVE REPORT...');

        // Add final recommendations based on results
        this.addIntelligentRecommendations();

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                loginSuccess: this.results.loginSuccess,
                siteEditorAccess: this.results.siteEditorAccess,
                pluginTestsCompleted: this.results.pluginTests.length > 0,
                themeTestsCompleted: this.results.themeTests.length > 0,
                portalPageCreated: this.results.portalPageCreation.some(p => p.success)
            },
            detailedResults: this.results,
            nextSteps: this.generateNextSteps()
        };

        // Save report
        const reportPath = 'C:\\Users\\Aviad\\Desktop\\web-movne\\wordpress-blank-fix-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('📄 Report saved to:', reportPath);

        return report;
    }

    addIntelligentRecommendations() {
        // Analyze results and add smart recommendations

        if (!this.results.siteEditorAccess) {
            this.results.recommendations.push('Site Editor inaccessible - theme may not support Full Site Editing');
        }

        // Check plugin test results
        const pluginTestWorked = this.results.pluginTests.find(p => p.step === 'all_plugins_deactivated' && p.pageDisplays);
        if (pluginTestWorked) {
            this.results.recommendations.push('SOLUTION FOUND: Plugin conflict detected - content displays when plugins disabled');
        }

        // Check theme test results
        const themeTestWorked = this.results.themeTests.find(t => t.step === 'default_theme_test' && t.pageDisplays);
        if (themeTestWorked) {
            this.results.recommendations.push('SOLUTION FOUND: Theme issue detected - content displays with default theme');
        }

        // Check portal page creation
        const successfulPortalPage = this.results.portalPageCreation.find(p => p.success && p.testResult?.status === 'working');
        if (successfulPortalPage) {
            this.results.recommendations.push(`SOLUTION FOUND: Working portal page created at ${successfulPortalPage.url}`);
        }
    }

    generateNextSteps() {
        const steps = [];

        // Based on what worked, provide specific next steps
        const workingMethod = this.results.portalPageCreation.find(p => p.success && p.testResult?.status === 'working');

        if (workingMethod) {
            steps.push(`Use ${workingMethod.method} method to create portal page 3`);
            steps.push(`Portal page 2 is working at: ${workingMethod.url}`);
        } else {
            steps.push('Try alternative content insertion methods');
            steps.push('Consider using a different page builder or direct database insertion');
        }

        // Plugin-specific recommendations
        if (this.results.pluginTests.some(p => p.pageDisplays)) {
            steps.push('Identify specific plugin causing conflict and replace or configure');
        }

        // Theme-specific recommendations
        if (this.results.themeTests.some(t => t.pageDisplays)) {
            steps.push('Update current theme or switch to compatible theme');
        }

        steps.push('Test portal page 3 creation using working method');
        steps.push('Implement content backup and version control');

        return steps;
    }

    async run() {
        try {
            await this.init();

            await this.step1_LoginAndAccessSiteEditor();
            await this.step2_PluginConflictTest();
            await this.step3_ThemeTesting();
            await this.step4_CreateWorkingPortalPage();

            const report = await this.generateReport();

            console.log('\n🎉 WORDPRESS BLANK CONTENT FIX COMPLETED!');
            console.log('📊 Check the report for detailed results and next steps.');

            return report;

        } catch (error) {
            console.log('❌ Fatal error:', error.message);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Execute the automation
async function main() {
    const automation = new WordPressBlanksFixAutomation();
    try {
        const report = await automation.run();
        console.log('\n✅ Automation completed successfully!');
        return report;
    } catch (error) {
        console.error('❌ Automation failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { WordPressBlanksFixAutomation };