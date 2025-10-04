const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to https://movne.co.il...');
    await page.goto('https://movne.co.il', { waitUntil: 'networkidle' });
    
    // Extract all script sources
    const scriptSources = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map(script => script.src).filter(src => 
        src.includes('movne.co.il') && 
        (src.includes('scripts.js') || src.includes('animations.js') || src.includes('main.js'))
      );
    });
    
    console.log('Found script sources:', scriptSources);
    
    // Download each script
    for (const scriptUrl of scriptSources) {
      try {
        const response = await page.goto(scriptUrl);
        const content = await response.text();
        const fileName = scriptUrl.split('/').pop().split('?')[0];
        fs.writeFileSync(`movne-${fileName}`, content);
        console.log(`Downloaded: movne-${fileName}`);
      } catch (error) {
        console.error(`Failed to download ${scriptUrl}:`, error.message);
      }
    }
    
    // Also extract inline JavaScript that might handle meet functionality
    const inlineScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script:not([src])'));
      return scripts
        .map(script => script.textContent)
        .filter(content => 
          content && (
            content.includes('meet') || 
            content.includes('calendly') ||
            content.includes('data-meet-type') ||
            content.includes('.click') ||
            content.includes('initPage')
          )
        );
    });
    
    console.log('Found inline scripts with meeting functionality:', inlineScripts.length);
    
    if (inlineScripts.length > 0) {
      fs.writeFileSync('movne-inline-scripts.js', inlineScripts.join('\n\n// ========= NEXT SCRIPT =========\n\n'));
      console.log('Saved inline scripts to movne-inline-scripts.js');
    }
    
    // Try to extract the meeting section with all its styling
    const meetingSection = await page.evaluate(() => {
      const meetDiv = document.querySelector('.meet');
      if (meetDiv) {
        // Get computed styles for all elements
        const getAllStyles = (element) => {
          const styles = window.getComputedStyle(element);
          const styleText = [];
          for (let i = 0; i < styles.length; i++) {
            const property = styles[i];
            styleText.push(`${property}: ${styles.getPropertyValue(property)}`);
          }
          return styleText.join('; ');
        };
        
        return {
          html: meetDiv.outerHTML,
          className: meetDiv.className,
          computedStyles: getAllStyles(meetDiv)
        };
      }
      return null;
    });
    
    if (meetingSection) {
      fs.writeFileSync('meeting-section-full.json', JSON.stringify(meetingSection, null, 2));
      console.log('Saved meeting section to meeting-section-full.json');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();