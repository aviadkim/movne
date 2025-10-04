/**
 * WordPress Portal Integration Automation Script
 * Uses WordPress CLI and VS Code extensions for streamlined portal creation
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

class WordPressPortalIntegrator {
    constructor() {
        this.wpCliPath = 'php wp-cli.phar';
        this.siteUrl = 'https://movne.co.il';
        this.portalFiles = [
            'portal-page-2-EXACT.html',
            'portal-page-3-EXACT.html'
        ];
    }

    // Check WordPress CLI availability
    async checkWpCli() {
        return new Promise((resolve, reject) => {
            exec(`${this.wpCliPath} --info`, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ WordPress CLI not available:', error.message);
                    reject(error);
                } else {
                    console.log('✅ WordPress CLI is ready');
                    console.log(stdout);
                    resolve(true);
                }
            });
        });
    }

    // Verify portal files exist
    checkPortalFiles() {
        console.log('🔍 Checking portal files...');

        for (const file of this.portalFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`❌ Portal file not found: ${file}`);
            }
            const stats = fs.statSync(file);
            console.log(`✅ ${file} (${Math.round(stats.size/1024)}KB)`);
        }
    }

    // Create portal pages using WP-CLI
    async createPortalPages() {
        console.log('🚀 Creating portal pages with WP-CLI...');

        const command = `${this.wpCliPath} eval-file create-portal-pages-wp-cli.php --url=${this.siteUrl}`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Portal page creation failed:', error.message);
                    console.error('stderr:', stderr);
                    reject(error);
                } else {
                    console.log('✅ Portal pages created successfully!');
                    console.log(stdout);
                    resolve(stdout);
                }
            });
        });
    }

    // Alternative: Create pages using WordPress REST API
    async createPageViaRestAPI(pageData) {
        const fetch = require('node-fetch');

        const auth = Buffer.from('aviad@kimfo-fs.com:Kimfo1982').toString('base64');

        const response = await fetch(`${this.siteUrl}/wp-json/wp/v2/pages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify(pageData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Page created: ${result.title.rendered} (ID: ${result.id})`);
            return result;
        } else {
            throw new Error(`❌ Failed to create page: ${response.statusText}`);
        }
    }

    // Update navigation menu
    async updateNavigationMenu() {
        console.log('🔗 Updating navigation menu...');

        const command = `${this.wpCliPath} menu list --url=${this.siteUrl}`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Menu check failed:', error.message);
                    reject(error);
                } else {
                    console.log('📋 Available menus:');
                    console.log(stdout);
                    resolve(stdout);
                }
            });
        });
    }

    // Test portal pages
    async testPortalPages() {
        console.log('🧪 Testing portal pages...');

        const testUrls = [
            `${this.siteUrl}/portal-page-2/`,
            `${this.siteUrl}/portal-page-3/`
        ];

        for (const url of testUrls) {
            try {
                const fetch = require('node-fetch');
                const response = await fetch(url);

                if (response.ok) {
                    console.log(`✅ ${url} - Status: ${response.status}`);
                } else {
                    console.log(`⚠️ ${url} - Status: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${url} - Error: ${error.message}`);
            }
        }
    }

    // Main integration process
    async integrate() {
        try {
            console.log('🎯 WordPress Portal Integration Starting...');
            console.log('================================================');

            // Step 1: Check prerequisites
            await this.checkWpCli();
            this.checkPortalFiles();

            // Step 2: Create portal pages
            console.log('\n📄 Creating portal pages...');
            await this.createPortalPages();

            // Step 3: Check navigation
            console.log('\n🔗 Checking navigation...');
            await this.updateNavigationMenu();

            // Step 4: Test integration
            console.log('\n🧪 Testing integration...');
            await this.testPortalPages();

            console.log('\n🎉 Portal integration completed successfully!');
            console.log('✅ Next steps:');
            console.log('   1. Visit WordPress admin to verify pages');
            console.log('   2. Test navigation from main site');
            console.log('   3. Verify Hebrew text rendering');
            console.log('   4. Check responsive design');

        } catch (error) {
            console.error('\n❌ Integration failed:', error.message);
            console.log('\n🔧 Fallback options:');
            console.log('   1. Manual WordPress admin access');
            console.log('   2. Direct file upload via FTP');
            console.log('   3. Theme customization approach');
        }
    }
}

// Execute integration
const integrator = new WordPressPortalIntegrator();
integrator.integrate();