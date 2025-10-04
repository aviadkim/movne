const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WordPressPortalIntegrator {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.adminUrl = 'https://movne.co.il/wp-admin/';
        this.credentials = {
            username: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982'
        };
        this.results = {
            login: false,
            navigation: [],
            pagesFound: [],
            mediaUpload: [],
            menuUpdate: false,
            testing: [],
            errors: []
        };
    }

    async init() {
        console.log('🚀 Initializing WordPress Portal Integration...');
        
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 500,
            args: [
                '--disable-web-security', 
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--disable-dev-shm-usage'
            ]
        });
        
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        this.page = await this.context.newPage();
        
        // Set longer timeouts for security checks
        this.page.setDefaultTimeout(60000);
        this.page.setDefaultNavigationTimeout(60000);
    }

    async accessWordPressAdmin() {
        console.log('🔐 Step 1: Accessing WordPress Admin...');
        
        try {
            console.log(`Navigating to: ${this.adminUrl}`);
            await this.page.goto(this.adminUrl, { waitUntil: 'networkidle' });
            
            // Check for security interstitial or login page
            await this.page.waitForTimeout(3000);
            
            // Look for common security interstitial elements, including uPress
            const securityElements = [
                'text=Security Check',
                'text=Please wait',
                'text=Checking your browser',
                'text=DDoS protection',
                'text=Verifying Connection',  // uPress
                'text=Secured by uPress',     // uPress
                '[data-cf-beacon]', // Cloudflare
                '.cf-browser-verification',
                '#challenge-stage'
            ];

            let isSecurityPage = false;
            let securityType = '';
            for (const selector of securityElements) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        console.log(`⚠️ Detected security interstitial: ${selector}`);
                        isSecurityPage = true;
                        securityType = selector;
                        break;
                    }
                } catch (e) {
                    // Element not found, continue checking
                }
            }

            if (isSecurityPage) {
                console.log(`⏳ Waiting for ${securityType} security check to complete...`);
                
                // Wait for either the page to change or timeout
                try {
                    await Promise.race([
                        // Wait for URL change indicating successful bypass
                        this.page.waitForURL(url => url.includes('wp-admin') && !url.includes('verifying'), { timeout: 60000 }),
                        // Wait for login form to appear
                        this.page.waitForSelector('#loginform, #user_login', { timeout: 60000 }),
                        // Wait for dashboard if already logged in
                        this.page.waitForSelector('#wpadminbar, .wp-admin', { timeout: 60000 })
                    ]);
                    console.log('✅ Security check completed successfully');
                } catch (e) {
                    console.log('⚠️ Security check taking longer than expected, trying to proceed...');
                    // Take another screenshot to see current state
                    await this.page.screenshot({ path: 'security-check-timeout.png' });
                }
            }

            // Take screenshot for debugging
            await this.page.screenshot({ path: 'wordpress-admin-access.png' });
            
            // Check if we're on login page or already logged in
            const isLoginPage = await this.page.locator('#loginform, #user_login').first().isVisible({ timeout: 5000 }).catch(() => false);
            const isDashboard = await this.page.locator('#wpadminbar, .wp-admin').first().isVisible({ timeout: 5000 }).catch(() => false);
            
            if (isLoginPage) {
                console.log('📝 Found login form, attempting to log in...');
                await this.performLogin();
            } else if (isDashboard) {
                console.log('✅ Already logged in to WordPress admin');
                this.results.login = true;
            } else {
                throw new Error('Unable to determine page state - not login page or dashboard');
            }
            
        } catch (error) {
            console.error('❌ Error accessing WordPress admin:', error.message);
            this.results.errors.push(`Admin access: ${error.message}`);
            await this.page.screenshot({ path: 'wordpress-admin-error.png' });
        }
    }

    async performLogin() {
        try {
            // Fill in credentials
            await this.page.fill('#user_login', this.credentials.username);
            await this.page.fill('#user_pass', this.credentials.password);
            
            // Submit login form
            await this.page.click('#wp-submit');
            
            // Wait for navigation
            await this.page.waitForLoadState('networkidle');
            
            // Check if login was successful
            const loginError = await this.page.locator('#login_error').isVisible().catch(() => false);
            if (loginError) {
                const errorText = await this.page.locator('#login_error').textContent();
                throw new Error(`Login failed: ${errorText}`);
            }
            
            // Verify we're in admin dashboard
            await this.page.waitForSelector('#wpadminbar, .wp-admin', { timeout: 10000 });
            console.log('✅ Successfully logged in to WordPress admin');
            this.results.login = true;
            
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            this.results.errors.push(`Login: ${error.message}`);
            throw error;
        }
    }

    async navigateWordPressAdmin() {
        console.log('🧭 Step 2: Navigating WordPress Admin...');
        
        try {
            // Check current URL and navigate to dashboard if needed
            if (!this.page.url().includes('wp-admin')) {
                await this.page.goto('https://movne.co.il/wp-admin/', { waitUntil: 'networkidle' });
            }

            // Navigate to Pages section
            console.log('📄 Checking Pages section...');
            await this.page.hover('#menu-pages');
            await this.page.click('#menu-pages a[href="edit.php?post_type=page"]');
            await this.page.waitForLoadState('networkidle');
            
            // Get list of existing pages
            const pages = await this.page.locator('.wp-list-table tbody tr').all();
            console.log(`Found ${pages.length} existing pages`);
            
            for (let i = 0; i < Math.min(pages.length, 10); i++) { // Limit to first 10
                try {
                    const title = await pages[i].locator('.row-title').textContent();
                    const status = await pages[i].locator('.post-state').textContent().catch(() => 'Published');
                    this.results.pagesFound.push({ title: title.trim(), status: status.trim() });
                } catch (e) {
                    // Skip if can't extract page info
                }
            }
            
            // Check menu structure
            console.log('🎯 Checking menu structure...');
            await this.page.hover('#menu-appearance');
            await this.page.click('#menu-appearance a[href="nav-menus.php"]');
            await this.page.waitForLoadState('networkidle');
            
            // Get available menus
            const menus = await this.page.locator('#menu-to-edit option').all();
            for (const menu of menus) {
                const menuText = await menu.textContent();
                if (menuText && menuText.trim()) {
                    this.results.navigation.push(menuText.trim());
                }
            }
            
            console.log('✅ Navigation completed successfully');
            
        } catch (error) {
            console.error('❌ Navigation error:', error.message);
            this.results.errors.push(`Navigation: ${error.message}`);
        }
    }

    async uploadPortalFiles() {
        console.log('📁 Step 3: Attempting to upload portal files...');
        
        try {
            // Navigate to Media > Add New
            await this.page.hover('#menu-media');
            await this.page.click('#menu-media a[href="media-new.php"]');
            await this.page.waitForLoadState('networkidle');
            
            // Get list of portal HTML files
            const portalFiles = [
                'portal-index.html',
                'portal-page-2-EXACT.html',
                'portal-page-3-EXACT.html'
            ].filter(file => fs.existsSync(path.join(__dirname, file)));
            
            console.log(`Found ${portalFiles.length} portal files to upload`);
            
            for (const file of portalFiles) {
                try {
                    const filePath = path.join(__dirname, file);
                    
                    // Check if file input exists
                    const fileInput = await this.page.locator('input[type="file"]').first();
                    if (await fileInput.isVisible()) {
                        await fileInput.setInputFiles(filePath);
                        await this.page.waitForTimeout(2000);
                        
                        // Wait for upload to complete
                        await this.page.waitForSelector('.media-item', { timeout: 10000 });
                        console.log(`✅ Uploaded: ${file}`);
                        this.results.mediaUpload.push({ file, status: 'success' });
                    } else {
                        console.log('⚠️ File upload input not found, trying alternative method...');
                        this.results.mediaUpload.push({ file, status: 'no_upload_input' });
                    }
                    
                } catch (uploadError) {
                    console.error(`❌ Failed to upload ${file}:`, uploadError.message);
                    this.results.mediaUpload.push({ file, status: 'error', error: uploadError.message });
                }
            }
            
        } catch (error) {
            console.error('❌ Media upload error:', error.message);
            this.results.errors.push(`Media upload: ${error.message}`);
        }
    }

    async updateNavigation() {
        console.log('🔗 Step 4: Updating navigation menu...');
        
        try {
            // Navigate to Appearance > Menus
            await this.page.goto('https://movne.co.il/wp-admin/nav-menus.php', { waitUntil: 'networkidle' });
            
            // Select the main menu (usually the first one)
            const menuSelect = await this.page.locator('#menu-to-edit').first();
            if (await menuSelect.isVisible()) {
                // Get the first menu option
                const firstOption = await this.page.locator('#menu-to-edit option').nth(1); // Skip "Select a menu" option
                if (await firstOption.isVisible()) {
                    await firstOption.click();
                    await this.page.click('#submit-nav-menu-dropdown');
                    await this.page.waitForLoadState('networkidle');
                }
            }
            
            // Look for existing portal link
            const menuItems = await this.page.locator('#menu-to-edit .menu-item').all();
            let portalItemFound = false;
            
            for (const item of menuItems) {
                try {
                    const itemText = await item.locator('.menu-item-title').textContent();
                    if (itemText && itemText.includes('פורטל') || itemText.includes('משקיעים')) {
                        console.log(`Found potential portal menu item: ${itemText}`);
                        portalItemFound = true;
                        
                        // Try to update the URL
                        await item.locator('.item-edit').click();
                        await this.page.waitForTimeout(1000);
                        
                        const urlField = await item.locator('.edit-menu-item-url').first();
                        if (await urlField.isVisible()) {
                            await urlField.fill('https://movne.co.il/portal-index.html');
                            console.log('✅ Updated portal URL in menu');
                        }
                        break;
                    }
                } catch (e) {
                    // Skip if can't extract item info
                }
            }
            
            if (!portalItemFound) {
                console.log('⚠️ Portal menu item not found - would need to create new menu item');
                this.results.menuUpdate = false;
            } else {
                // Save menu changes
                await this.page.click('#update-nav-menu');
                await this.page.waitForLoadState('networkidle');
                console.log('✅ Menu updated successfully');
                this.results.menuUpdate = true;
            }
            
        } catch (error) {
            console.error('❌ Menu update error:', error.message);
            this.results.errors.push(`Menu update: ${error.message}`);
        }
    }

    async testIntegration() {
        console.log('🧪 Step 5: Testing portal integration...');
        
        try {
            // Test main site
            console.log('Testing main site access...');
            await this.page.goto('https://movne.co.il/', { waitUntil: 'networkidle' });
            
            // Look for portal link in navigation
            const portalLink = await this.page.locator('a[href*="portal"], a:has-text("פורטל"), a:has-text("משקיעים")').first();
            const portalLinkExists = await portalLink.isVisible().catch(() => false);
            
            this.results.testing.push({
                test: 'Portal link in main navigation',
                result: portalLinkExists ? 'Found' : 'Not found'
            });
            
            // Test direct portal access
            const portalUrls = [
                'https://movne.co.il/portal-index.html',
                'https://movne.co.il/wp-content/uploads/portal-index.html'
            ];
            
            for (const url of portalUrls) {
                try {
                    console.log(`Testing portal access: ${url}`);
                    const response = await this.page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
                    const status = response ? response.status() : 0;
                    
                    this.results.testing.push({
                        test: `Direct portal access: ${url}`,
                        result: status === 200 ? 'Accessible' : `HTTP ${status}`
                    });
                    
                    if (status === 200) {
                        // Check if portal content is properly loaded
                        const hasPortalContent = await this.page.locator('h1:has-text("פורטל"), .portal-container, [class*="portal"]').first().isVisible().catch(() => false);
                        this.results.testing.push({
                            test: 'Portal content loaded',
                            result: hasPortalContent ? 'Yes' : 'No'
                        });
                        break; // Found working portal URL
                    }
                } catch (e) {
                    this.results.testing.push({
                        test: `Direct portal access: ${url}`,
                        result: `Error: ${e.message}`
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Testing error:', error.message);
            this.results.errors.push(`Testing: ${error.message}`);
        }
    }

    async generateReport() {
        console.log('\n📊 WORDPRESS PORTAL INTEGRATION REPORT');
        console.log('=' .repeat(50));
        
        console.log('\n🔐 LOGIN STATUS:');
        console.log(`${this.results.login ? '✅' : '❌'} WordPress Admin Login: ${this.results.login ? 'Success' : 'Failed'}`);
        
        console.log('\n📄 EXISTING PAGES FOUND:');
        if (this.results.pagesFound.length > 0) {
            this.results.pagesFound.forEach(page => {
                console.log(`  • ${page.title} (${page.status})`);
            });
        } else {
            console.log('  No pages found or unable to access pages section');
        }
        
        console.log('\n🧭 NAVIGATION MENUS:');
        if (this.results.navigation.length > 0) {
            this.results.navigation.forEach(menu => {
                console.log(`  • ${menu}`);
            });
        } else {
            console.log('  No menus found or unable to access menus section');
        }
        
        console.log('\n📁 MEDIA UPLOAD RESULTS:');
        if (this.results.mediaUpload.length > 0) {
            this.results.mediaUpload.forEach(upload => {
                const status = upload.status === 'success' ? '✅' : '❌';
                console.log(`  ${status} ${upload.file}: ${upload.status}`);
                if (upload.error) console.log(`      Error: ${upload.error}`);
            });
        } else {
            console.log('  No upload attempts made');
        }
        
        console.log('\n🔗 MENU UPDATE:');
        console.log(`${this.results.menuUpdate ? '✅' : '❌'} Navigation Menu Update: ${this.results.menuUpdate ? 'Success' : 'Failed/Not Found'}`);
        
        console.log('\n🧪 INTEGRATION TESTING:');
        if (this.results.testing.length > 0) {
            this.results.testing.forEach(test => {
                console.log(`  • ${test.test}: ${test.result}`);
            });
        } else {
            console.log('  No tests performed');
        }
        
        console.log('\n❌ ERRORS ENCOUNTERED:');
        if (this.results.errors.length > 0) {
            this.results.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
        } else {
            console.log('  No errors encountered');
        }
        
        console.log('\n📋 NEXT STEPS RECOMMENDATIONS:');
        console.log('  1. If login failed, verify credentials and check for 2FA');
        console.log('  2. If portal files couldn\'t be uploaded via Media, consider FTP upload');
        console.log('  3. Manual menu creation may be needed if auto-update failed');
        console.log('  4. Test portal pages in incognito mode to verify public access');
        console.log('  5. Consider creating WordPress pages instead of HTML files for better integration');
        
        // Save detailed report to file
        const reportData = {
            timestamp: new Date().toISOString(),
            results: this.results,
            summary: {
                loginSuccessful: this.results.login,
                pagesCount: this.results.pagesFound.length,
                menusCount: this.results.navigation.length,
                uploadsAttempted: this.results.mediaUpload.length,
                uploadsSuccessful: this.results.mediaUpload.filter(u => u.status === 'success').length,
                menuUpdated: this.results.menuUpdate,
                testsPerformed: this.results.testing.length,
                errorsCount: this.results.errors.length
            }
        };
        
        fs.writeFileSync('wordpress-integration-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Detailed report saved to: wordpress-integration-report.json');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.init();
            await this.accessWordPressAdmin();
            
            if (this.results.login) {
                await this.navigateWordPressAdmin();
                await this.uploadPortalFiles();
                await this.updateNavigation();
                await this.testIntegration();
            }
            
            await this.generateReport();
            
        } catch (error) {
            console.error('💥 Critical error:', error.message);
            this.results.errors.push(`Critical: ${error.message}`);
            await this.generateReport();
        } finally {
            await this.cleanup();
        }
    }
}

// Run the integration
const integrator = new WordPressPortalIntegrator();
integrator.run().catch(console.error);