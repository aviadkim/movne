const fs = require('fs');
const path = require('path');

class PortalIntegrationValidator {
    constructor() {
        this.portalFiles = [
            'portal-index.html',
            'portal-page-2-EXACT.html',
            'portal-page-3-EXACT.html'
        ];
        this.results = {
            filesReady: [],
            htmlValidation: [],
            contentAnalysis: [],
            integrationReadiness: false
        };
    }

    validateFiles() {
        console.log('📄 Validating portal files...');
        
        for (const file of this.portalFiles) {
            const filePath = path.join(__dirname, file);
            
            if (!fs.existsSync(filePath)) {
                this.results.filesReady.push({
                    file,
                    status: 'missing',
                    message: 'File not found'
                });
                continue;
            }
            
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Basic HTML validation
            const hasHtmlStructure = content.includes('<html') && content.includes('</html>');
            const hasHead = content.includes('<head') && content.includes('</head>');
            const hasBody = content.includes('<body') && content.includes('</body>');
            const hasStyles = content.includes('<style') || content.includes('stylesheet');
            
            // Hebrew content validation
            const hasHebrewText = /[\u0590-\u05FF]/.test(content);
            const hasRTL = content.includes('dir="rtl"') || content.includes("direction: rtl");
            
            this.results.filesReady.push({
                file,
                status: 'ready',
                size: `${Math.round(stats.size / 1024)}KB`,
                modified: stats.mtime.toLocaleDateString(),
                htmlStructure: hasHtmlStructure,
                headSection: hasHead,
                bodySection: hasBody,
                styling: hasStyles,
                hebrewText: hasHebrewText,
                rtlSupport: hasRTL
            });
        }
    }

    extractContentForWordPress() {
        console.log('🔧 Extracting content for WordPress integration...');
        
        for (const file of this.portalFiles) {
            const filePath = path.join(__dirname, file);
            
            if (!fs.existsSync(filePath)) continue;
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Extract title
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : file.replace('.html', '');
            
            // Extract styles
            const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            const styles = styleMatches ? styleMatches.join('\n') : '';
            
            // Extract body content
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const bodyContent = bodyMatch ? bodyMatch[1] : '';
            
            // Prepare WordPress-ready content
            const wordpressContent = `${styles}\n${bodyContent}`;
            
            // Save extracted content
            const extractedFileName = `wordpress-ready-${file}`;
            fs.writeFileSync(extractedFileName, wordpressContent);
            
            this.results.contentAnalysis.push({
                originalFile: file,
                extractedFile: extractedFileName,
                title,
                hasStyles: styles.length > 0,
                hasContent: bodyContent.length > 0,
                wordpressReady: true
            });
        }
    }

    generateIntegrationInstructions() {
        console.log('📋 Generating specific integration instructions...');
        
        const instructions = {
            preparation: {
                title: 'Before Starting Integration',
                steps: [
                    'Ensure you have WordPress admin access credentials',
                    'Have portal files ready for copy-paste',
                    'Prepare to wait for uPress security check',
                    'Have backup plan ready (FTP access if needed)'
                ]
            },
            pages: []
        };
        
        // Generate instructions for each portal page
        this.results.contentAnalysis.forEach((page, index) => {
            instructions.pages.push({
                step: index + 1,
                originalFile: page.originalFile,
                wordpressTitle: page.title,
                slug: page.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                instructions: [
                    `Open WordPress Admin > Pages > Add New`,
                    `Set title: "${page.title}"`,
                    `Switch to HTML/Text editor mode`,
                    `Copy content from: ${page.extractedFile}`,
                    `Paste into WordPress editor`,
                    `Preview and publish page`,
                    `Note the page URL for navigation setup`
                ]
            });
        });
        
        // Save instructions
        fs.writeFileSync('wordpress-integration-instructions.json', JSON.stringify(instructions, null, 2));
        
        return instructions;
    }

    generateReport() {
        console.log('\n📊 PORTAL INTEGRATION READINESS REPORT');
        console.log('=' .repeat(50));
        
        console.log('\n📄 FILE VALIDATION:');
        this.results.filesReady.forEach(file => {
            if (file.status === 'ready') {
                console.log(`✅ ${file.file} (${file.size}, modified: ${file.modified})`);
                console.log(`   HTML: ${file.htmlStructure ? '✅' : '❌'} | Styles: ${file.styling ? '✅' : '❌'} | Hebrew: ${file.hebrewText ? '✅' : '❌'} | RTL: ${file.rtlSupport ? '✅' : '❌'}`);
            } else {
                console.log(`❌ ${file.file}: ${file.message}`);
            }
        });
        
        console.log('\n🔧 WORDPRESS CONTENT EXTRACTION:');
        this.results.contentAnalysis.forEach(content => {
            console.log(`✅ ${content.originalFile} → ${content.extractedFile}`);
            console.log(`   Title: "${content.title}"`);
            console.log(`   Styles: ${content.hasStyles ? '✅' : '❌'} | Content: ${content.hasContent ? '✅' : '❌'}`);
        });
        
        // Check overall readiness
        const allFilesReady = this.results.filesReady.every(f => f.status === 'ready');
        const allContentExtracted = this.results.contentAnalysis.length === this.portalFiles.length;
        this.results.integrationReadiness = allFilesReady && allContentExtracted;
        
        console.log('\n🎯 INTEGRATION READINESS:');
        console.log(`${this.results.integrationReadiness ? '✅' : '❌'} Overall Status: ${this.results.integrationReadiness ? 'READY FOR INTEGRATION' : 'PREPARATION NEEDED'}`);
        
        if (this.results.integrationReadiness) {
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Open browser and navigate to: https://movne.co.il/wp-admin/');
            console.log('2. Wait for uPress security check (1-2 minutes)');
            console.log('3. Login with provided credentials');
            console.log('4. Follow integration instructions in: wordpress-integration-instructions.json');
            console.log('5. Copy content from wordpress-ready-*.html files');
        }
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            readiness: this.results.integrationReadiness,
            files: this.results.filesReady,
            extraction: this.results.contentAnalysis,
            nextSteps: this.results.integrationReadiness ? 'Ready for manual WordPress integration' : 'File preparation needed'
        };
        
        fs.writeFileSync('portal-integration-readiness-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Detailed report saved to: portal-integration-readiness-report.json');
    }

    run() {
        console.log('🔍 Portal Integration Readiness Validation\n');
        
        this.validateFiles();
        this.extractContentForWordPress();
        this.generateIntegrationInstructions();
        this.generateReport();
        
        console.log('\n✨ Validation complete!');
    }
}

// Run validation
const validator = new PortalIntegrationValidator();
validator.run();