const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Starting portal file upload...');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Login to WordPress
  console.log('📝 Logging in to WordPress...');
  await page.goto('https://movne.co.il/wp-admin/');
  await page.waitForSelector('#user_login');
  await page.type('#user_login', 'aviad@kimfo-fs.com');
  await page.type('#user_pass', 'Kimfo1982');
  await page.click('#wp-submit');
  await page.waitForNavigation();

  console.log('✅ Logged in successfully');

  // Go to media upload page
  console.log('📤 Navigating to media upload...');
  await page.goto('https://movne.co.il/wp-admin/media-new.php');
  await page.waitForSelector('input[type="file"]');

  // Upload the file
  console.log('📎 Uploading fixed portal file...');
  const fileInput = await page.$('input[type="file"]');
  const filePath = path.join(__dirname, 'portal-final-corrected-1.html');
  await fileInput.uploadFile(filePath);

  // Wait for upload to complete
  console.log('⏳ Waiting for upload to complete...');
  await page.waitForTimeout(5000);

  console.log('✅ Upload complete!');
  console.log('🎉 Portal file has been updated');

  await browser.close();
})();
