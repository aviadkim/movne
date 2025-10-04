const { chromium } = require('playwright');
const fs = require('fs');

async function extractDesignSystem() {
  console.log('🔍 Extracting exact design system from original portal...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to original portal
    console.log('📡 Loading original portal...');
    await page.goto('https://movne.co.il/wp-content/uploads/2025/09/portal-final-corrected-1.html');
    await page.waitForTimeout(5000);
    
    // Extract complete HTML source
    const htmlSource = await page.content();
    fs.writeFileSync('original-portal-complete.html', htmlSource);
    console.log('✅ Original HTML source saved');
    
    // Extract all computed styles from the root element
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const cssVariables = {};
      
      // Extract all CSS custom properties
      for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle[i];
        if (property.startsWith('--')) {
          cssVariables[property] = computedStyle.getPropertyValue(property);
        }
      }
      
      return cssVariables;
    });
    
    console.log('🎨 Found CSS Variables:', Object.keys(rootStyles).length);
    fs.writeFileSync('css-variables.json', JSON.stringify(rootStyles, null, 2));
    
    // Extract body styles
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = getComputedStyle(body);
      
      return {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        background: computedStyle.background,
        direction: computedStyle.direction,
        textAlign: computedStyle.textAlign
      };
    });
    
    console.log('📝 Body Styles:', bodyStyles);
    fs.writeFileSync('body-styles.json', JSON.stringify(bodyStyles, null, 2));
    
    // Extract specific element styles
    const elementStyles = await page.evaluate(() => {
      const elements = {
        hero: document.querySelector('.hero, h1, .main-title'),
        button: document.querySelector('button, .btn, .cta'),
        card: document.querySelector('.card, .glass-card, .login-card'),
        input: document.querySelector('input, .form-input'),
        container: document.querySelector('.container, .wrapper, main')
      };
      
      const styles = {};
      
      for (const [name, element] of Object.entries(elements)) {
        if (element) {
          const computedStyle = getComputedStyle(element);
          styles[name] = {
            fontFamily: computedStyle.fontFamily,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            background: computedStyle.background,
            padding: computedStyle.padding,
            margin: computedStyle.margin,
            borderRadius: computedStyle.borderRadius,
            border: computedStyle.border,
            boxShadow: computedStyle.boxShadow,
            width: computedStyle.width,
            height: computedStyle.height,
            display: computedStyle.display,
            justifyContent: computedStyle.justifyContent,
            alignItems: computedStyle.alignItems,
            textAlign: computedStyle.textAlign,
            transform: computedStyle.transform,
            transition: computedStyle.transition
          };
        }
      }
      
      return styles;
    });
    
    console.log('🏗️ Element Styles extracted');
    fs.writeFileSync('element-styles.json', JSON.stringify(elementStyles, null, 2));
    
    // Extract color palette from all elements
    const colorPalette = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const colors = new Set();
      
      allElements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        
        // Extract colors
        if (computedStyle.color && computedStyle.color !== 'rgba(0, 0, 0, 0)') {
          colors.add(computedStyle.color);
        }
        if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(computedStyle.backgroundColor);
        }
        if (computedStyle.borderColor && computedStyle.borderColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(computedStyle.borderColor);
        }
      });
      
      return Array.from(colors);
    });
    
    console.log('🎨 Color Palette:', colorPalette.length, 'colors found');
    fs.writeFileSync('color-palette.json', JSON.stringify(colorPalette, null, 2));
    
    // Extract font information
    const fontInfo = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const fonts = new Set();
      const fontSizes = new Set();
      const fontWeights = new Set();
      
      allElements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        
        if (computedStyle.fontFamily) {
          fonts.add(computedStyle.fontFamily);
        }
        if (computedStyle.fontSize) {
          fontSizes.add(computedStyle.fontSize);
        }
        if (computedStyle.fontWeight) {
          fontWeights.add(computedStyle.fontWeight);
        }
      });
      
      return {
        fontFamilies: Array.from(fonts),
        fontSizes: Array.from(fontSizes),
        fontWeights: Array.from(fontWeights)
      };
    });
    
    console.log('🔤 Font Info extracted');
    fs.writeFileSync('font-info.json', JSON.stringify(fontInfo, null, 2));
    
    // Extract layout measurements
    const layoutInfo = await page.evaluate(() => {
      const body = document.body;
      const container = document.querySelector('.container, .wrapper, main, .content');
      
      return {
        bodyDimensions: {
          width: body.offsetWidth,
          height: body.offsetHeight,
          scrollWidth: body.scrollWidth,
          scrollHeight: body.scrollHeight
        },
        containerDimensions: container ? {
          width: container.offsetWidth,
          height: container.offsetHeight,
          maxWidth: getComputedStyle(container).maxWidth,
          padding: getComputedStyle(container).padding,
          margin: getComputedStyle(container).margin
        } : null,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    console.log('📐 Layout Info extracted');
    fs.writeFileSync('layout-info.json', JSON.stringify(layoutInfo, null, 2));
    
    // Take full page screenshot for reference
    await page.screenshot({ path: 'original-portal-reference.png', fullPage: true });
    console.log('📸 Reference screenshot saved');
    
    // Extract all CSS rules
    const allCSS = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let allRules = '';
      
      try {
        styleSheets.forEach(sheet => {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              allRules += rule.cssText + '\\n';
            });
          }
        });
      } catch (e) {
        console.log('Some CSS rules could not be accessed due to CORS');
      }
      
      return allRules;
    });
    
    fs.writeFileSync('extracted-css.css', allCSS);
    console.log('🎨 CSS rules extracted');
    
    // Create design system summary
    const designSystemSummary = {
      colors: colorPalette,
      fonts: fontInfo,
      layout: layoutInfo,
      bodyStyles: bodyStyles,
      elementStyles: elementStyles,
      cssVariables: rootStyles
    };
    
    fs.writeFileSync('DESIGN-SYSTEM.json', JSON.stringify(designSystemSummary, null, 2));
    
    console.log('✅ Complete design system extracted!');
    console.log('📁 Files created:');
    console.log('   - original-portal-complete.html');
    console.log('   - DESIGN-SYSTEM.json');
    console.log('   - css-variables.json');
    console.log('   - color-palette.json');
    console.log('   - font-info.json');
    console.log('   - layout-info.json');
    console.log('   - extracted-css.css');
    console.log('   - original-portal-reference.png');
    
  } catch (error) {
    console.error('❌ Error extracting design system:', error);
    await page.screenshot({ path: 'extraction-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the extraction
extractDesignSystem().catch(console.error);