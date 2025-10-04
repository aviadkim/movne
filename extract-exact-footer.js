const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Extracting exact footer structure from original portal...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Go to original portal
  await page.goto('https://movne.co.il/wp-content/uploads/2025/09/portal-final-corrected-1.html');
  await page.waitForLoadState('networkidle');
  
  // Extract complete footer HTML
  const footerHTML = await page.evaluate(() => {
    const footer = document.querySelector('footer') || document.querySelector('.footer') || document.querySelector('[class*="footer"]');
    return footer ? footer.outerHTML : 'Footer not found';
  });
  
  // Extract complete header HTML
  const headerHTML = await page.evaluate(() => {
    const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('[class*="header"]');
    return header ? header.outerHTML : 'Header not found';
  });
  
  // Save extracted HTML
  fs.writeFileSync('extracted-footer.html', footerHTML);
  fs.writeFileSync('extracted-header.html', headerHTML);
  
  console.log('✅ Footer HTML saved to extracted-footer.html');
  console.log('✅ Header HTML saved to extracted-header.html');
  
  // Look for bank logos specifically
  const bankLogos = await page.evaluate(() => {
    const logos = [];
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && (img.src.includes('bank') || img.src.includes('logo') || img.alt.includes('bank'))) {
        logos.push({
          src: img.src,
          alt: img.alt,
          className: img.className
        });
      }
    });
    return logos;
  });
  
  console.log('🏦 Bank logos found:', bankLogos);
  
  // Look for "Let's Talk" or contact buttons
  const contactButtons = await page.evaluate(() => {
    const buttons = [];
    const elements = document.querySelectorAll('a, button');
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('נדבר') || text.includes('קשר') || text.includes('talk') || text.includes('contact')) {
        buttons.push({
          text: text,
          href: el.href || '',
          className: el.className
        });
      }
    });
    return buttons;
  });
  
  console.log('💬 Contact buttons found:', contactButtons);
  
  await browser.close();
  console.log('🎉 Extraction complete!');
})();