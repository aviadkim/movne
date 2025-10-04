/**
 * 🛠️ WORDPRESS CLI PORTAL CREATOR
 * Creates portal pages using WP-CLI commands
 */

const { execSync } = require('child_process');
const fs = require('fs');

class WordPressCLIPortalCreator {
    constructor() {
        this.wpCli = 'php wp-cli.phar';
        this.siteUrl = 'https://movne.co.il';
        this.portalFile = 'portal-page-2-EXACT.html';
    }

    /**
     * Test remote connection to WordPress
     */
    testConnection() {
        try {
            console.log('🧪 Testing WordPress CLI connection...');

            // Try to get site info
            const result = execSync(`${this.wpCli} option get home --url=${this.siteUrl}`, {
                encoding: 'utf8',
                timeout: 30000
            });

            console.log('✅ Connection successful:', result.trim());
            return true;
        } catch (error) {
            console.log('❌ Remote connection failed:', error.message);
            console.log('💡 Will create local commands for manual execution');
            return false;
        }
    }

    /**
     * Prepare portal content for WordPress
     */
    preparePortalContent() {
        console.log('📄 Preparing portal content...');

        const content = fs.readFileSync(this.portalFile, 'utf8');

        // Extract body content
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : content;

        // Extract styles
        const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        const styles = styleMatches.join('\n');

        // Create WordPress-optimized content
        const wordpressContent = `${styles}

<div class="movne-portal-content" style="direction: rtl; text-align: right; width: 100%;">
${bodyContent}
</div>

<style>
.movne-portal-content {
    direction: rtl !important;
    text-align: right !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Override theme restrictions */
.entry-content .movne-portal-content {
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    margin-right: calc(-50vw + 50%) !important;
}
</style>`;

        console.log(`✅ Content prepared (${wordpressContent.length} characters)`);
        return wordpressContent;
    }

    /**
     * Create portal page using CLI
     */
    createPortalPage() {
        try {
            console.log('🏗️ Creating portal page...');

            const content = this.preparePortalContent();

            // Escape content for command line
            const escapedContent = content
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '');

            // Create the page
            const createCommand = `${this.wpCli} post create --post_type=page --post_title="פורטל משקיעים - עמוד 2 - CLI VERSION" --post_name="portal-page-2-cli" --post_status=publish --post_content="${escapedContent}" --url=${this.siteUrl}`;

            console.log('📤 Executing create command...');
            const result = execSync(createCommand, {
                encoding: 'utf8',
                timeout: 60000
            });

            console.log('✅ Page created:', result.trim());

            // Get the page ID
            const pageId = result.trim().match(/(\d+)/)?.[1];
            if (pageId) {
                const pageUrl = `${this.siteUrl}/portal-page-2-cli/`;
                console.log(`🔗 Page URL: ${pageUrl}`);
                return {
                    success: true,
                    pageId: pageId,
                    url: pageUrl
                };
            }

            return { success: true, pageId: null, url: `${this.siteUrl}/portal-page-2-cli/` };

        } catch (error) {
            console.error('❌ CLI creation failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate manual commands if remote CLI fails
     */
    generateManualCommands() {
        console.log('📝 Generating manual CLI commands...');

        const content = this.preparePortalContent();

        // Save content to file for easier handling
        const contentFile = 'portal-content-temp.html';
        fs.writeFileSync(contentFile, content);

        const commands = [
            '# WordPress CLI Commands for Portal Page Creation',
            '# Run these commands manually in the server terminal',
            '',
            '# 1. Test connection',
            `wp option get home --url=${this.siteUrl}`,
            '',
            '# 2. Create portal page 2',
            `wp post create --post_type=page --post_title="פורטל משקיעים - עמוד 2" --post_name="portal-page-2" --post_status=publish --url=${this.siteUrl}`,
            '',
            '# 3. Update page content (get page ID from step 2)',
            `wp post update [PAGE_ID] --post_content="$(cat ${contentFile})" --url=${this.siteUrl}`,
            '',
            '# 4. List pages to verify',
            `wp post list --post_type=page --format=table --url=${this.siteUrl}`,
            '',
            '# 5. Get page permalink',
            `wp post get [PAGE_ID] --field=url --url=${this.siteUrl}`,
        ];

        const commandFile = 'manual-cli-commands.txt';
        fs.writeFileSync(commandFile, commands.join('\n'));

        console.log(`✅ Manual commands saved to: ${commandFile}`);
        console.log(`✅ Content saved to: ${contentFile}`);

        return { commandFile, contentFile };
    }

    /**
     * Alternative: Create page using REST API
     */
    generateRestAPICommands() {
        console.log('🌐 Generating WordPress REST API commands...');

        const content = this.preparePortalContent();

        const restCommands = [
            '# WordPress REST API Commands',
            '# Use these if CLI is not available',
            '',
            '# Create page using curl',
            `curl -X POST "${this.siteUrl}/wp-json/wp/v2/pages" \\`,
            '  -H "Content-Type: application/json" \\',
            '  -u "USERNAME:PASSWORD" \\',
            '  -d \'{',
            '    "title": "פורטל משקיעים - עמוד 2",',
            '    "slug": "portal-page-2-api",',
            '    "content": "' + content.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '",',
            '    "status": "publish"',
            '  }\'',
            '',
            '# Or using PowerShell:',
            '$headers = @{',
            '  "Content-Type" = "application/json"',
            '  "Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("USERNAME:PASSWORD"))',
            '}',
            '$body = @{',
            '  title = "פורטל משקיעים - עמוד 2"',
            '  slug = "portal-page-2-api"',
            '  content = @"',
            content,
            '"@',
            '  status = "publish"',
            '} | ConvertTo-Json',
            '',
            `Invoke-RestMethod -Uri "${this.siteUrl}/wp-json/wp/v2/pages" -Method POST -Headers $headers -Body $body`
        ];

        const restFile = 'rest-api-commands.txt';
        fs.writeFileSync(restFile, restCommands.join('\n'));

        console.log(`✅ REST API commands saved to: ${restFile}`);
        return restFile;
    }

    async run() {
        console.log('🛠️ WordPress CLI Portal Creator Starting...\n');

        // Test connection
        const canConnect = this.testConnection();

        if (canConnect) {
            // Try to create page directly
            const result = this.createPortalPage();

            if (result.success) {
                console.log('\n🎉 SUCCESS! Portal page created via CLI');
                console.log(`🔗 URL: ${result.url}`);
                console.log('\n📌 Next Steps:');
                console.log('1. Test the page in a browser');
                console.log('2. If content is visible, create Portal Page 3');
                console.log('3. Update main site navigation');
            } else {
                console.log('\n⚠️ CLI creation failed, generating manual commands...');
                this.generateManualCommands();
                this.generateRestAPICommands();
            }
        } else {
            console.log('\n💡 Cannot connect remotely, generating manual commands...');
            this.generateManualCommands();
            this.generateRestAPICommands();
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ WordPress CLI Portal Creator completed!');
        console.log('='.repeat(60));
    }
}

// Run the script
if (require.main === module) {
    const creator = new WordPressCLIPortalCreator();
    creator.run().catch(console.error);
}

module.exports = WordPressCLIPortalCreator;