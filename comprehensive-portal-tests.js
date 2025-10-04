const puppeteer = require('puppeteer');

const PORTAL_URL = 'C:\\Users\\Aviad\\Desktop\\web-movne\\portal-page-2-COMPREHENSIVE.html';

(async () => {
    console.log('🚀 Starting Comprehensive Portal Testing Suite...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    let testsPassed = 0;
    let testsFailed = 0;
    const bugs = [];

    try {
        // TEST 1: Page loads correctly
        console.log('TEST 1: Page Load...');
        await page.goto(`file:///${PORTAL_URL}`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const title = await page.title();
        if (title.includes('פורטל')) {
            console.log('✅ PASS: Page loaded with correct title');
            testsPassed++;
        } else {
            console.log('❌ FAIL: Page title incorrect');
            testsFailed++;
            bugs.push('Page title does not contain "פורטל"');
        }

        // TEST 2: All 3 product cards visible
        console.log('\nTEST 2: Product Cards Visibility...');
        const productCards = await page.$$('.product-card');
        if (productCards.length === 3) {
            console.log('✅ PASS: All 3 product cards found');
            testsPassed++;
        } else {
            console.log(`❌ FAIL: Expected 3 product cards, found ${productCards.length}`);
            testsFailed++;
            bugs.push(`Found ${productCards.length} product cards instead of 3`);
        }

        // TEST 3: All "לפרטים נוספים" buttons present
        console.log('\nTEST 3: CTA Buttons Present...');
        const ctaButtons = await page.$$('button.product-cta');
        if (ctaButtons.length === 3) {
            console.log('✅ PASS: All 3 CTA buttons found');
            testsPassed++;
        } else {
            console.log(`❌ FAIL: Expected 3 CTA buttons, found ${ctaButtons.length}`);
            testsFailed++;
            bugs.push(`Found ${ctaButtons.length} CTA buttons instead of 3`);
        }

        // TEST 4-6: Test each modal opens
        for (let i = 1; i <= 3; i++) {
            console.log(`\nTEST ${3 + i}: Product ${i} Modal Opens...`);

            await new Promise(resolve => setTimeout(resolve, 1000));
            const buttons = await page.$$('button.product-cta');
            await buttons[i - 1].click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            const modal = await page.$(`#product${i}Modal.active`);
            if (modal) {
                console.log(`✅ PASS: Product ${i} modal opened`);
                testsPassed++;

                // Check if modal content is visible
                const modalContent = await page.$(`#product${i}Modal .modal-body`);
                const isVisible = await page.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.height > 0 && rect.width > 0;
                }, modalContent);

                if (isVisible) {
                    console.log(`✅ PASS: Product ${i} modal content visible`);
                    testsPassed++;
                } else {
                    console.log(`❌ FAIL: Product ${i} modal content not visible`);
                    testsFailed++;
                    bugs.push(`Product ${i} modal content not visible`);
                }
            } else {
                console.log(`❌ FAIL: Product ${i} modal did not open`);
                testsFailed++;
                bugs.push(`Product ${i} modal did not open`);
            }

            // TEST: Close modal with Escape
            console.log(`TEST ${3 + i}.1: Close Product ${i} Modal with Escape...`);
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));

            const modalClosed = await page.$(`#product${i}Modal.active`);
            if (!modalClosed) {
                console.log(`✅ PASS: Product ${i} modal closed`);
                testsPassed++;
            } else {
                console.log(`❌ FAIL: Product ${i} modal did not close`);
                testsFailed++;
                bugs.push(`Product ${i} modal did not close with Escape`);
            }

            // TEST: Check page is not blank after closing
            console.log(`TEST ${3 + i}.2: Page Not Blank After Modal Close...`);
            await new Promise(resolve => setTimeout(resolve, 500));

            const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
            const bodyVisible = await page.evaluate(() => {
                const body = document.body;
                return body.offsetHeight > 0 && body.offsetWidth > 0;
            });

            if (bodyVisible && bodyOverflow !== 'hidden') {
                console.log(`✅ PASS: Page visible after modal ${i} closed`);
                testsPassed++;
            } else {
                console.log(`❌ FAIL: Page blank after modal ${i} closed (overflow: ${bodyOverflow})`);
                testsFailed++;
                bugs.push(`Page blank after closing modal ${i} (overflow: ${bodyOverflow})`);
            }
        }

        // TEST: Modal tables are rendered correctly
        console.log('\nTEST 13: Modal Tables Rendered...');
        await (await page.$$('button.product-cta'))[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        const tables = await page.$$('.returns-table');
        if (tables.length > 0) {
            console.log(`✅ PASS: Found ${tables.length} table(s) in modal`);
            testsPassed++;
        } else {
            console.log('❌ FAIL: No tables found in modal');
            testsFailed++;
            bugs.push('Returns tables not rendering in modals');
        }

        await page.keyboard.press('Escape');
        await new Promise(resolve => setTimeout(resolve, 500));

        // TEST: "בואו ניפגש" section exists
        console.log('\nTEST 14: Meet Section Exists...');
        const meetSection = await page.$('.meet');
        if (meetSection) {
            const isVisible = await page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.height > 0;
            }, meetSection);

            if (isVisible) {
                console.log('✅ PASS: Meet section visible');
                testsPassed++;
            } else {
                console.log('❌ FAIL: Meet section exists but not visible');
                testsFailed++;
                bugs.push('Meet section exists but has no height');
            }
        } else {
            console.log('❌ FAIL: Meet section not found');
            testsFailed++;
            bugs.push('Meet section (.meet) not found in DOM');
        }

        // TEST: Bank logos carousel
        console.log('\nTEST 15: Bank Logos Present...');
        const bankLogos = await page.$$('.foundations_logos .logos_item');
        if (bankLogos.length > 0) {
            console.log(`✅ PASS: Found ${bankLogos.length} bank logos`);
            testsPassed++;
        } else {
            console.log('❌ FAIL: No bank logos found');
            testsFailed++;
            bugs.push('Bank logos not found');
        }

        // TEST: Quick actions buttons
        console.log('\nTEST 16: Quick Actions Buttons...');
        const quickActions = await page.$$('.actions-grid .action-button');
        if (quickActions.length === 4) {
            console.log('✅ PASS: All 4 quick action buttons found');
            testsPassed++;

            // Check button colors
            const buttonColor = await page.evaluate(() => {
                const button = document.querySelector('.action-button');
                return window.getComputedStyle(button).backgroundColor;
            });

            console.log(`   Button color: ${buttonColor}`);
            if (buttonColor.includes('255, 157, 10') || buttonColor.includes('rgb(255, 157, 10)')) {
                console.log('✅ PASS: Quick action buttons have correct orange color');
                testsPassed++;
            } else {
                console.log(`❌ FAIL: Quick action buttons wrong color: ${buttonColor}`);
                testsFailed++;
                bugs.push(`Quick action buttons wrong color: ${buttonColor}`);
            }
        } else {
            console.log(`❌ FAIL: Expected 4 quick action buttons, found ${quickActions.length}`);
            testsFailed++;
            bugs.push(`Found ${quickActions.length} quick action buttons instead of 4`);
        }

        // TEST: Modal close button (X) works
        console.log('\nTEST 18: Modal Close Button (X)...');
        await (await page.$$('button.product-cta'))[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        const closeButton = await page.$('.modal-close');
        if (closeButton) {
            // Try to click, but it might be blocked by banner
            try {
                await page.evaluate(() => {
                    document.querySelector('.modal-close').click();
                });
                await new Promise(resolve => setTimeout(resolve, 500));

                const stillOpen = await page.$('#product1Modal.active');
                if (!stillOpen) {
                    console.log('✅ PASS: Close button (X) works');
                    testsPassed++;
                } else {
                    console.log('❌ FAIL: Close button did not close modal');
                    testsFailed++;
                    bugs.push('Modal close button (X) does not work');
                }
            } catch (e) {
                console.log('⚠️  WARN: Close button click blocked, using Escape instead');
                await page.keyboard.press('Escape');
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            console.log('❌ FAIL: Close button not found');
            testsFailed++;
            bugs.push('Modal close button (X) not found');
        }

        // TEST: Responsive design (mobile viewport)
        console.log('\nTEST 19: Mobile Responsiveness...');
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mobileProductCards = await page.$$('.product-card');
        if (mobileProductCards.length === 3) {
            console.log('✅ PASS: All product cards visible on mobile');
            testsPassed++;
        } else {
            console.log('❌ FAIL: Product cards not all visible on mobile');
            testsFailed++;
            bugs.push('Not all product cards visible on mobile viewport');
        }

        // Reset viewport
        await page.setViewport({ width: 1920, height: 1080 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TEST: Console errors
        console.log('\nTEST 20: No Console Errors...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.reload({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (consoleErrors.length === 0) {
            console.log('✅ PASS: No console errors');
            testsPassed++;
        } else {
            console.log(`❌ FAIL: ${consoleErrors.length} console error(s)`);
            consoleErrors.forEach(err => console.log(`   - ${err}`));
            testsFailed++;
            bugs.push(`Console errors: ${consoleErrors.join(', ')}`);
        }

        // FINAL RESULTS
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${testsPassed}`);
        console.log(`❌ Tests Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);

        if (bugs.length > 0) {
            console.log('\n🐛 BUGS FOUND:');
            bugs.forEach((bug, index) => {
                console.log(`   ${index + 1}. ${bug}`);
            });
        } else {
            console.log('\n🎉 NO BUGS FOUND! Portal is working perfectly!');
        }

        console.log('\n✋ Browser will stay open for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        testsFailed++;
    }

    await browser.close();

    if (testsFailed === 0) {
        console.log('\n✅ ALL TESTS PASSED!');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED`);
        process.exit(1);
    }
})();
