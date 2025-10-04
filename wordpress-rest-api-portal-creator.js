/**
 * WordPress REST API Portal Page Creator
 * Works with remote WordPress sites using REST API
 * Compatible with VS Code WordPress development extensions
 */

const fs = require('fs');
const https = require('https');

class WordPressRESTAPIPortalCreator {
    constructor() {
        this.siteUrl = 'https://movne.co.il';
        this.apiBase = `${this.siteUrl}/wp-json/wp/v2`;
        this.credentials = {
            username: 'aviad@kimfo-fs.com',
            password: 'Kimfo1982'
        };
    }

    // Extract content from HTML file for WordPress
    extractWordPressContent(htmlFile) {
        const content = fs.readFileSync(htmlFile, 'utf8');

        // For WordPress, we need to extract the body content and styles
        const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

        let styles = '';
        if (styleMatch) {
            styles = styleMatch.join('\n');
        }

        let bodyContent = '';
        if (bodyMatch) {
            bodyContent = bodyMatch[1];
        }

        // Combine styles and body content for WordPress
        return styles + '\n' + bodyContent;
    }

    // Create WordPress page via REST API
    async createPage(title, content, slug) {
        return new Promise((resolve, reject) => {
            const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');

            const pageData = JSON.stringify({
                title: title,
                content: content,
                slug: slug,
                status: 'publish',
                type: 'page'
            });

            const options = {
                hostname: 'movne.co.il',
                port: 443,
                path: '/wp-json/wp/v2/pages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(pageData),
                    'Authorization': `Basic ${auth}`,
                    'User-Agent': 'WordPress-Portal-Creator/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);

                        if (res.statusCode === 201) {
                            console.log(`✅ Page created successfully: ${title}`);
                            console.log(`   ID: ${response.id}`);
                            console.log(`   URL: ${response.link}`);
                            resolve(response);
                        } else {
                            console.error(`❌ Failed to create page: ${title}`);
                            console.error(`   Status: ${res.statusCode}`);
                            console.error(`   Response:`, response);
                            reject(new Error(`HTTP ${res.statusCode}: ${response.message || 'Unknown error'}`));
                        }
                    } catch (error) {
                        console.error(`❌ Parse error:`, error.message);
                        console.error(`   Raw response:`, data);
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                console.error(`❌ Request error:`, error.message);
                reject(error);
            });

            req.write(pageData);
            req.end();
        });
    }

    // Test WordPress REST API access
    async testConnection() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'movne.co.il',
                port: 443,
                path: '/wp-json/wp/v2',
                method: 'GET',
                headers: {
                    'User-Agent': 'WordPress-Portal-Creator/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ WordPress REST API is accessible');
                        resolve(true);
                    } else {
                        console.error(`❌ WordPress REST API error: ${res.statusCode}`);
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                console.error(`❌ Connection error:`, error.message);
                reject(error);
            });

            req.end();
        });
    }

    // Main execution
    async execute() {
        try {
            console.log('🎯 WordPress REST API Portal Creator');
            console.log('===================================');

            // Test connection
            console.log('🔗 Testing WordPress REST API connection...');
            await this.testConnection();

            // Check portal files
            console.log('\n📁 Checking portal files...');
            const portalFiles = [
                { file: 'portal-page-2-EXACT.html', title: 'פורטל משקיעים - עמוד 2', slug: 'portal-page-2' },
                { file: 'portal-page-3-EXACT.html', title: 'פורטל משקיעים - עמוד 3', slug: 'portal-page-3' }
            ];

            for (const fileInfo of portalFiles) {
                if (!fs.existsSync(fileInfo.file)) {
                    throw new Error(`❌ File not found: ${fileInfo.file}`);
                }
                const stats = fs.statSync(fileInfo.file);
                console.log(`✅ ${fileInfo.file} (${Math.round(stats.size/1024)}KB)`);
            }

            // Create pages
            console.log('\n📄 Creating portal pages...');

            for (const fileInfo of portalFiles) {
                console.log(`\n🚀 Processing ${fileInfo.file}...`);

                const content = this.extractWordPressContent(fileInfo.file);
                await this.createPage(fileInfo.title, content, fileInfo.slug);

                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('\n🎉 Portal pages created successfully!');
            console.log('✅ Next steps:');
            console.log('   1. Visit WordPress admin to verify pages');
            console.log('   2. Update navigation menu links');
            console.log('   3. Test pages from frontend');
            console.log('   4. Verify Hebrew text rendering');

        } catch (error) {
            console.error('\n❌ Portal creation failed:', error.message);

            console.log('\n🔧 Alternative methods:');
            console.log('   1. Manual WordPress admin login:');
            console.log('      URL: https://movne.co.il/wp-admin/');
            console.log('      Username: aviad@kimfo-fs.com');
            console.log('      Password: Kimfo1982');
            console.log('   2. Copy portal file content manually');
            console.log('   3. Use WordPress page builder plugins');
        }
    }
}

// Execute
const creator = new WordPressRESTAPIPortalCreator();
creator.execute();