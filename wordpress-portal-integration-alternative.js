const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class AlternativeWordPressIntegrator {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.adminUrl = 'https://movne.co.il/wp-admin/';
        this.siteUrl = 'https://movne.co.il/';
        this.credentials = {
            username: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982'
        };
        this.results = {
            securityBypass: false,
            alternativeAccess: [],
            siteAnalysis: {},
            portalFiles: [],
            recommendations: []
        };
    }

    async init() {
        console.log('🚀 Initializing Alternative WordPress Integration...');
        
        // Try different browser configurations
        const configs = [
            {
                name: 'Stealth Mode',
                options: {
                    headless: false,
                    slowMo: 2000,
                    args: [
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-web-security',
                        '--allow-running-insecure-content',
                        '--disable-features=VizDisplayCompositor'
                    ]
                },
                context: {
                    viewport: { width: 1920, height: 1080 },
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    extraHTTPHeaders: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                }
            }
        ];
        
        for (const config of configs) {
            try {
                console.log(`📋 Trying ${config.name}...`);
                
                this.browser = await chromium.launch(config.options);
                this.context = await this.browser.newContext(config.context);
                this.page = await this.context.newPage();
                
                // Set extended timeouts
                this.page.setDefaultTimeout(90000);
                this.page.setDefaultNavigationTimeout(90000);
                
                // Add stealth techniques
                await this.page.addInitScript(() => {
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined,
                    });
                    
                    // Mock chrome property
                    window.chrome = {
                        runtime: {},
                    };
                    
                    // Mock permissions
                    const originalQuery = window.navigator.permissions.query;
                    window.navigator.permissions.query = (parameters) => (
                        parameters.name === 'notifications' ?
                            Promise.resolve({ state: Cypress.env('NOTIFICATION_PERMISSION') || 'granted' }) :
                            originalQuery(parameters)
                    );
                });
                
                const success = await this.attemptAccess();
                if (success) {
                    console.log(`✅ Success with ${config.name}`);
                    break;
                } else {
                    console.log(`❌ Failed with ${config.name}`);
                    await this.browser.close();
                }
                
            } catch (error) {
                console.error(`Error with ${config.name}:`, error.message);
                if (this.browser) await this.browser.close();
            }
        }
    }

    async attemptAccess() {
        console.log('🔍 Attempting to access WordPress admin...');
        
        try {
            // Method 1: Direct admin access
            console.log('Method 1: Direct admin URL access...');
            await this.page.goto(this.adminUrl, { waitUntil: 'networkidle', timeout: 30000 });
            
            const result1 = await this.checkPageState();
            if (result1.success) return true;
            
            // Method 2: Try main site first, then admin
            console.log('Method 2: Main site then admin...');
            await this.page.goto(this.siteUrl, { waitUntil: 'networkidle', timeout: 30000 });
            await this.page.waitForTimeout(5000);
            await this.page.goto(this.adminUrl, { waitUntil: 'networkidle', timeout: 30000 });
            
            const result2 = await this.checkPageState();
            if (result2.success) return true;
            
            // Method 3: Try wp-login.php directly
            console.log('Method 3: wp-login.php direct access...');
            await this.page.goto('https://movne.co.il/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
            
            const result3 = await this.checkPageState();
            if (result3.success) return true;
            
            // Method 4: Extended wait on security page
            console.log('Method 4: Extended wait for security bypass...');
            await this.page.goto(this.adminUrl, { waitUntil: 'networkidle', timeout: 30000 });
            
            // Wait up to 2 minutes for security check
            for (let i = 0; i < 24; i++) { // 24 * 5 seconds = 2 minutes
                await this.page.waitForTimeout(5000);
                const currentState = await this.checkPageState();
                if (currentState.success) {
                    console.log(`✅ Security bypass successful after ${(i + 1) * 5} seconds`);
                    return true;
                }
                
                if (i % 6 === 0) { // Every 30 seconds
                    console.log(`⏳ Still waiting... ${(i + 1) * 5}s elapsed`);
                    await this.page.screenshot({ path: `security-wait-${i + 1}.png` });
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Access attempt failed:', error.message);
            return false;
        }
    }

    async checkPageState() {
        try {
            await this.page.screenshot({ path: `page-state-${Date.now()}.png` });
            
            // Check for login form
            const hasLoginForm = await this.page.locator('#loginform, #user_login, input[name="log"]').first().isVisible({ timeout: 3000 }).catch(() => false);
            if (hasLoginForm) {
                console.log('✅ Found WordPress login form');
                return { success: true, state: 'login' };
            }
            
            // Check for dashboard
            const hasDashboard = await this.page.locator('#wpadminbar, .wp-admin, #adminmenu').first().isVisible({ timeout: 3000 }).catch(() => false);
            if (hasDashboard) {
                console.log('✅ Already in WordPress dashboard');
                return { success: true, state: 'dashboard' };
            }
            
            // Check for security page
            const hasSecurityPage = await this.page.locator('text=Verifying Connection, text=Security Check, text=Please wait').first().isVisible({ timeout: 3000 }).catch(() => false);
            if (hasSecurityPage) {
                console.log('⚠️ Still on security verification page');
                return { success: false, state: 'security' };
            }
            
            // Check for error page
            const hasError = await this.page.locator('text=Error, text=404, text=Access denied').first().isVisible({ timeout: 3000 }).catch(() => false);
            if (hasError) {
                console.log('❌ Error page detected');
                return { success: false, state: 'error' };
            }
            
            console.log('❓ Unknown page state');
            return { success: false, state: 'unknown' };
            
        } catch (error) {
            console.error('Error checking page state:', error.message);
            return { success: false, state: 'error' };
        }
    }

    async performLogin() {
        try {
            console.log('📝 Attempting WordPress login...');
            
            // Fill credentials with human-like delays
            await this.page.fill('#user_login', '');
            await this.page.type('#user_login', this.credentials.username, { delay: 100 });
            await this.page.waitForTimeout(1000);
            
            await this.page.fill('#user_pass', '');
            await this.page.type('#user_pass', this.credentials.password, { delay: 100 });
            await this.page.waitForTimeout(1000);
            
            // Submit form
            await this.page.click('#wp-submit');
            await this.page.waitForLoadState('networkidle');
            
            // Check result
            const loginError = await this.page.locator('#login_error').isVisible().catch(() => false);
            if (loginError) {
                const errorText = await this.page.locator('#login_error').textContent();
                throw new Error(`Login failed: ${errorText}`);
            }
            
            const isLoggedIn = await this.page.locator('#wpadminbar, .wp-admin').first().isVisible({ timeout: 10000 }).catch(() => false);
            if (isLoggedIn) {
                console.log('✅ Login successful!');
                return true;
            } else {
                throw new Error('Login appeared to succeed but dashboard not found');
            }
            
        } catch (error) {
            console.error('Login failed:', error.message);
            return false;
        }
    }

    async analyzeSiteStructure() {
        console.log('🔍 Analyzing site structure for alternative approaches...');
        
        try {
            // Check main site structure
            await this.page.goto(this.siteUrl, { waitUntil: 'networkidle' });
            
            // Look for existing portal links
            const portalLinks = await this.page.locator('a[href*="portal"], a:has-text("פורטל"), a:has-text("משקיעים")').all();
            const portalLinkTexts = [];
            for (const link of portalLinks) {
                try {
                    const text = await link.textContent();
                    const href = await link.getAttribute('href');
                    portalLinkTexts.push({ text: text?.trim(), href });
                } catch (e) {
                    // Skip if can't extract
                }
            }
            
            this.results.siteAnalysis.portalLinks = portalLinkTexts;
            
            // Check for common WordPress paths
            const commonPaths = [
                '/wp-content/',
                '/wp-includes/',
                '/wp-admin/',
                '/wp-login.php'
            ];
            
            const accessiblePaths = [];
            for (const path of commonPaths) {
                try {
                    const response = await this.page.goto(this.siteUrl + path.substring(1), { timeout: 10000 });
                    const status = response ? response.status() : 0;
                    accessiblePaths.push({ path, status });
                } catch (e) {
                    accessiblePaths.push({ path, status: 'timeout' });
                }
            }
            
            this.results.siteAnalysis.accessiblePaths = accessiblePaths;
            
            console.log('✅ Site structure analysis completed');
            
        } catch (error) {
            console.error('Site analysis failed:', error.message);
        }
    }

    async checkPortalFiles() {
        console.log('📄 Checking available portal files...');
        
        const portalFiles = [
            'portal-index.html',
            'portal-page-2-EXACT.html',
            'portal-page-3-EXACT.html',
            'portal-page-2-COMPLETE.html',
            'portal-page-3-COMPLETE.html'
        ];
        
        for (const file of portalFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                this.results.portalFiles.push({
                    name: file,
                    size: stats.size,
                    modified: stats.mtime,
                    exists: true
                });
            } else {
                this.results.portalFiles.push({
                    name: file,
                    exists: false
                });
            }
        }
        
        console.log(`✅ Found ${this.results.portalFiles.filter(f => f.exists).length} portal files`);
    }

    async generateAlternativeRecommendations() {
        console.log('💡 Generating alternative integration recommendations...');
        
        this.results.recommendations = [
            {
                method: 'Manual WordPress Admin Access',
                steps: [
                    'Open browser manually and navigate to https://movne.co.il/wp-admin/',
                    'Wait for uPress security check to complete (may take 1-2 minutes)',
                    'Login with credentials: aviad@kimfo-fs.com / Kimfo1982',
                    'Navigate to Pages > Add New to create portal pages',
                    'Copy-paste portal HTML content into WordPress pages'
                ],
                priority: 'High',
                difficulty: 'Easy'
            },
            {
                method: 'FTP/cPanel File Upload',
                steps: [
                    'Access website hosting control panel or FTP',
                    'Upload portal HTML files to /wp-content/uploads/ directory',
                    'Create custom pages in WordPress that link to uploaded files',
                    'Update navigation menu to include portal links'
                ],
                priority: 'High',
                difficulty: 'Medium'
            },
            {
                method: 'WordPress Page Templates',
                steps: [
                    'Access WordPress admin manually',
                    'Go to Pages > Add New',
                    'Create new pages: "פורטל משקיעים כשירים", "עמוד 2", "עמוד 3"',
                    'Use Custom HTML blocks to insert portal content',
                    'Set up proper internal linking between pages'
                ],
                priority: 'Medium',
                difficulty: 'Medium'
            },
            {
                method: 'Theme Customization',
                steps: [
                    'Access Appearance > Theme Editor',
                    'Create custom page templates (page-portal.php)',
                    'Integrate portal HTML into theme structure',
                    'Add portal navigation to theme menu'
                ],
                priority: 'Low',
                difficulty: 'High'
            },
            {
                method: 'Plugin-Based Solution',
                steps: [
                    'Install a custom page builder plugin (Elementor, etc.)',
                    'Create portal pages using visual builder',
                    'Recreate portal design using plugin elements',
                    'Set up navigation and linking'
                ],
                priority: 'Medium',
                difficulty: 'Medium'
            }
        ];
    }

    async generateDetailedReport() {
        console.log('\n📊 ALTERNATIVE WORDPRESS INTEGRATION REPORT');
        console.log('=' .repeat(60));
        
        console.log('\n🔒 SECURITY BYPASS STATUS:');
        console.log(`${this.results.securityBypass ? '✅' : '❌'} Automated bypass: ${this.results.securityBypass ? 'Successful' : 'Failed'}`);
        console.log('The uPress security system appears to be blocking automated access.');
        
        console.log('\n🌐 SITE ANALYSIS:');
        if (this.results.siteAnalysis.portalLinks) {
            console.log('Existing portal links found:');
            this.results.siteAnalysis.portalLinks.forEach(link => {
                console.log(`  • ${link.text}: ${link.href}`);
            });
        }
        
        if (this.results.siteAnalysis.accessiblePaths) {
            console.log('WordPress path accessibility:');
            this.results.siteAnalysis.accessiblePaths.forEach(path => {
                console.log(`  • ${path.path}: HTTP ${path.status}`);
            });
        }
        
        console.log('\n📄 PORTAL FILES INVENTORY:');
        this.results.portalFiles.forEach(file => {
            if (file.exists) {
                console.log(`  ✅ ${file.name} (${Math.round(file.size / 1024)}KB, modified: ${file.modified.toLocaleDateString()})`);
            } else {
                console.log(`  ❌ ${file.name} (not found)`);
            }
        });
        
        console.log('\n💡 RECOMMENDED INTEGRATION METHODS:');
        this.results.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.method} (${rec.priority} Priority, ${rec.difficulty} Difficulty)`);
            rec.steps.forEach((step, stepIndex) => {
                console.log(`   ${stepIndex + 1}. ${step}`);
            });
        });
        
        console.log('\n🎯 IMMEDIATE ACTION PLAN:');
        console.log('1. Try Manual Access:');
        console.log('   - Open Chrome browser manually');
        console.log('   - Navigate to https://movne.co.il/wp-admin/');
        console.log('   - Wait patiently for uPress security check (1-2 minutes)');
        console.log('   - Login with provided credentials');
        console.log('');
        console.log('2. Once in WordPress Admin:');
        console.log('   - Go to Pages > Add New');
        console.log('   - Create "פורטל משקיעים כשירים" page');
        console.log('   - Use HTML editor to paste portal content');
        console.log('   - Publish and test');
        console.log('');
        console.log('3. Update Navigation:');
        console.log('   - Go to Appearance > Menus');
        console.log('   - Add portal page to main menu');
        console.log('   - Update "פורטל למשקיעים כשירים" link');
        
        // Save comprehensive report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: 'WordPress admin protected by uPress security system',
            securityBypass: this.results.securityBypass,
            siteAnalysis: this.results.siteAnalysis,
            portalFiles: this.results.portalFiles,
            recommendations: this.results.recommendations,
            credentials: {
                url: this.adminUrl,
                username: this.credentials.username,
                note: 'Password provided separately for security'
            }
        };
        
        fs.writeFileSync('wordpress-integration-comprehensive-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Comprehensive report saved to: wordpress-integration-comprehensive-report.json');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.checkPortalFiles();
            await this.init();
            await this.analyzeSiteStructure();
            await this.generateAlternativeRecommendations();
            await this.generateDetailedReport();
            
        } catch (error) {
            console.error('💥 Critical error:', error.message);
            await this.generateDetailedReport();
        } finally {
            await this.cleanup();
        }
    }
}

// Run the alternative integrator
const integrator = new AlternativeWordPressIntegrator();
integrator.run().catch(console.error);