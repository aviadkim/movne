const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🌐 Downloading exact original portal HTML...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Go to original portal
    await page.goto('https://movne.co.il/wp-content/uploads/2025/09/portal-final-corrected-1.html', {
      waitUntil: 'networkidle'
    });
    
    console.log('✅ Portal page loaded successfully');
    
    // Get the complete HTML source
    const htmlContent = await page.content();
    
    // Save to file
    fs.writeFileSync('original-portal-complete.html', htmlContent, 'utf-8');
    console.log('✅ Original portal HTML saved to original-portal-complete.html');
    
    // Also get the page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check for key elements
    const hasLoginForm = await page.$('form') !== null;
    const hasFooter = await page.$('footer') !== null;
    const hasHeader = await page.$('header') !== null;
    
    console.log('🔍 Key elements found:');
    console.log('  - Login form:', hasLoginForm);
    console.log('  - Header:', hasHeader);
    console.log('  - Footer:', hasFooter);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
  console.log('🎉 Download complete!');
})();