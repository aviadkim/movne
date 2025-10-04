/**
 * 🛠️ WORDPRESS CLI HELPER
 * Complement to Playwright automation using WP-CLI when possible
 */

const { execSync } = require('child_process');
const fs = require('fs');

class WordPressCLIHelper {
    constructor() {
        this.wpCliPath = 'php wp-cli.phar';
        this.siteUrl = 'https://movne.co.il';
    }

    /**
     * Test WP-CLI connectivity
     */
    testCLI() {
        try {
            console.log('🧪 Testing WP-CLI...');
            const result = execSync(`${this.wpCliPath} --info`, { encoding: 'utf8' });
            console.log('✅ WP-CLI is working');
            console.log(result);
            return true;
        } catch (error) {
            console.log('❌ WP-CLI test failed:', error.message);
            return false;
        }
    }

    /**
     * Try remote WordPress operations
     */
    testRemoteConnection() {
        const commands = [
            // Test basic connectivity
            `${this.wpCliPath} option get home --url=${this.siteUrl}`,

            // Try with SSH (if configured)
            `${this.wpCliPath} option get home --ssh=user@movne.co.il`,

            // Try with HTTP authentication
            `${this.wpCliPath} option get home --http=${this.siteUrl}`,
        ];

        for (const command of commands) {
            try {
                console.log(`🔍 Trying: ${command}`);
                const result = execSync(command, { encoding: 'utf8' });
                console.log('✅ Success:', result);
                return true;
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        return false;
    }

    /**
     * Generate WordPress page creation commands
     */
    generatePageCommands() {
        const commands = [
            // Create pages using WP-CLI
            `${this.wpCliPath} post create --post_type=page --post_title="פורטל משקיעים - עמוד 2" --post_name="portal-page-2" --post_status=publish --url=${this.siteUrl}`,
            `${this.wpCliPath} post create --post_type=page --post_title="פורטל משקיעים - עמוד 3" --post_name="portal-page-3" --post_status=publish --url=${this.siteUrl}`,

            // List pages
            `${this.wpCliPath} post list --post_type=page --format=table --url=${this.siteUrl}`,

            // Get site info
            `${this.wpCliPath} option get home --url=${this.siteUrl}`,
            `${this.wpCliPath} theme list --url=${this.siteUrl}`,
        ];

        console.log('\n📝 WordPress CLI Commands:');
        commands.forEach((cmd, index) => {
            console.log(`${index + 1}. ${cmd}`);
        });

        return commands;
    }

    /**
     * Create batch script for manual execution
     */
    createBatchScript() {
        const commands = this.generatePageCommands();
        const batchContent = `@echo off
echo Starting WordPress CLI operations...

REM Test CLI
${this.wpCliPath} --info

REM Try to connect to WordPress
${commands.join('\n\nREM Next command\n')}

echo.
echo WordPress CLI operations completed.
pause
`;

        fs.writeFileSync('wordpress-cli-commands.bat', batchContent);
        console.log('\n📁 Created wordpress-cli-commands.bat for manual execution');
    }

    run() {
        console.log('🛠️ WordPress CLI Helper Starting...\n');

        // Test CLI
        this.testCLI();

        // Test remote connection
        console.log('\n🌐 Testing remote WordPress connection...');
        this.testRemoteConnection();

        // Generate commands
        this.generatePageCommands();

        // Create batch script
        this.createBatchScript();

        console.log('\n✅ CLI Helper completed!');
    }
}

// Export for use
module.exports = WordPressCLIHelper;

// Run if called directly
if (require.main === module) {
    const helper = new WordPressCLIHelper();
    helper.run();
}