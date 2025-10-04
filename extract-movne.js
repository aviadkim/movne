const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to https://movne.co.il...');
    await page.goto('https://movne.co.il', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    console.log('\n=== EXTRACTING MEETING SECTION ===');
    
    // Extract the meeting section
    const meetingSection = await page.evaluate(() => {
      // Look for the meeting section by text content
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const meetingHeading = headings.find(h => 
        h.textContent.includes('איך תעדיפו להיפגש') || 
        h.textContent.includes('How would you prefer to meet')
      );
      
      if (meetingHeading) {
        // Get the parent container
        let container = meetingHeading.closest('section, div[class*="meeting"], div[class*="contact"]');
        if (!container) {
          container = meetingHeading.parentElement;
          while (container && container.children.length < 2) {
            container = container.parentElement;
          }
        }
        
        return {
          html: container ? container.outerHTML : null,
          selector: container ? container.tagName + (container.className ? '.' + container.className.split(' ').join('.') : '') : null
        };
      }
      return null;
    });
    
    console.log('Meeting section HTML:', meetingSection?.html || 'Not found');
    
    console.log('\n=== EXTRACTING BANK LOGOS SECTION ===');
    
    // Extract bank logos section
    const bankLogosSection = await page.evaluate(() => {
      // Look for bank logos or slider sections
      const selectors = [
        '[class*="bank"]',
        '[class*="logo"]',
        '[class*="slider"]',
        '[class*="carousel"]',
        '.slick-slider',
        '[class*="client"]',
        '[class*="partner"]'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const imgs = element.querySelectorAll('img');
          if (imgs.length >= 3) { // Likely a logos section
            return {
              html: element.outerHTML,
              selector: selector,
              imageCount: imgs.length
            };
          }
        }
      }
      
      // Also look for any slick slider initialization
      const scripts = Array.from(document.querySelectorAll('script'));
      const slickScript = scripts.find(script => 
        script.textContent && script.textContent.includes('slick')
      );
      
      return {
        html: null,
        slickScript: slickScript ? slickScript.textContent : null
      };
    });
    
    console.log('Bank logos section:', bankLogosSection);
    
    console.log('\n=== EXTRACTING ALL JAVASCRIPT ===');
    
    // Extract all JavaScript
    const allScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.map(script => ({
        src: script.src || null,
        content: script.textContent || null,
        type: script.type || 'text/javascript'
      })).filter(script => script.src || script.content);
    });
    
    console.log('Found', allScripts.length, 'script elements');
    
    // Look for specific functionality
    const functionality = await page.evaluate(() => {
      const result = {
        calendlyFound: false,
        slickFound: false,
        meetingButtons: [],
        modalElements: [],
        formElements: []
      };
      
      // Check for Calendly
      if (window.Calendly || document.querySelector('[href*="calendly"]') || 
          document.querySelector('[class*="calendly"]')) {
        result.calendlyFound = true;
      }
      
      // Check for Slick
      if (window.jQuery && window.jQuery.fn.slick) {
        result.slickFound = true;
      }
      
      // Find meeting-related buttons
      const buttons = Array.from(document.querySelectorAll('button, a[href], [onclick]'));
      result.meetingButtons = buttons
        .filter(btn => 
          btn.textContent.includes('פגישה') || 
          btn.textContent.includes('meet') ||
          btn.textContent.includes('calendar') ||
          btn.textContent.includes('יעוץ')
        )
        .map(btn => ({
          tag: btn.tagName,
          text: btn.textContent.trim(),
          href: btn.href || null,
          onclick: btn.onclick ? btn.onclick.toString() : null,
          classes: btn.className,
          outerHTML: btn.outerHTML
        }));
      
      // Find modal elements
      const modals = Array.from(document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]'));
      result.modalElements = modals.map(modal => ({
        classes: modal.className,
        id: modal.id,
        outerHTML: modal.outerHTML
      }));
      
      // Find forms
      const forms = Array.from(document.querySelectorAll('form'));
      result.formElements = forms.map(form => ({
        action: form.action,
        method: form.method,
        classes: form.className,
        outerHTML: form.outerHTML
      }));
      
      return result;
    });
    
    console.log('\n=== FUNCTIONALITY ANALYSIS ===');
    console.log('Calendly found:', functionality.calendlyFound);
    console.log('Slick found:', functionality.slickFound);
    console.log('Meeting buttons found:', functionality.meetingButtons.length);
    console.log('Modal elements found:', functionality.modalElements.length);
    console.log('Form elements found:', functionality.formElements.length);
    
    // Extract full page HTML
    const fullHTML = await page.content();
    
    console.log('\n=== SAVING EXTRACTED DATA ===');
    
    // Save all extracted data to a file
    const extractedData = {
      meetingSection,
      bankLogosSection,
      allScripts,
      functionality,
      fullHTML
    };
    
    const fs = require('fs');
    fs.writeFileSync('extracted-movne-data.json', JSON.stringify(extractedData, null, 2));
    
    console.log('Data saved to extracted-movne-data.json');
    
    // Also save just the HTML for easier viewing
    fs.writeFileSync('movne-full-page.html', fullHTML);
    console.log('Full HTML saved to movne-full-page.html');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();