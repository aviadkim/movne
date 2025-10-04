/**
 * Extract WordPress-ready content from portal HTML files
 */

const fs = require('fs');

function extractWordPressContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract all style tags
    const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    let styles = styleMatches.join('\n');

    // Extract body content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = '';

    if (bodyMatch) {
        bodyContent = bodyMatch[1];
        // Clean up body content - remove scripts and unnecessary elements
        bodyContent = bodyContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/class="has-banner"/g, '')
            .trim();
    }

    // Combine styles and body for WordPress
    const wordpressContent = styles + '\n\n' + bodyContent;

    return wordpressContent;
}

// Extract content for both portal pages
console.log('📄 Extracting WordPress-ready content...');

try {
    // Portal Page 2
    const page2Content = extractWordPressContent('portal-page-2-EXACT.html');
    fs.writeFileSync('wordpress-portal-page-2-content.html', page2Content, 'utf8');
    console.log('✅ Portal Page 2 content extracted');
    console.log(`   Size: ${Math.round(page2Content.length/1024)}KB`);

    // Portal Page 3
    const page3Content = extractWordPressContent('portal-page-3-EXACT.html');
    fs.writeFileSync('wordpress-portal-page-3-content.html', page3Content, 'utf8');
    console.log('✅ Portal Page 3 content extracted');
    console.log(`   Size: ${Math.round(page3Content.length/1024)}KB`);

    console.log('\n🎯 WordPress-ready content files created:');
    console.log('   - wordpress-portal-page-2-content.html');
    console.log('   - wordpress-portal-page-3-content.html');

} catch (error) {
    console.error('❌ Error:', error.message);
}