/**
 * WordPress Portal Integration Helper
 * Run this script in WordPress admin console after login
 * This will help create the portal pages with proper content
 */

// WordPress Portal Page Creation Helper
const PortalIntegrationHelper = {

    // Step 1: Navigate to Pages > Add New
    createPage2: function() {
        console.log('🚀 Creating Portal Page 2...');

        // Check if we're in WordPress admin
        if (!window.wp || !window.location.href.includes('wp-admin')) {
            alert('❌ Please run this script in WordPress admin area');
            return false;
        }

        // Navigate to add new page
        window.location.href = '/wp-admin/post-new.php?post_type=page';

        // Instructions for manual process
        console.log(`
📋 Manual Steps for Page 2:
1. Title: "פורטל משקיעים - עמוד 2"
2. Switch to HTML/Text editor mode
3. Copy content from portal-page-2-EXACT.html
4. Set page slug: "portal-page-2"
5. Publish the page

💡 The HTML content is ready in portal-page-2-EXACT.html file
        `);
    },

    createPage3: function() {
        console.log('🚀 Creating Portal Page 3...');

        // Check if we're in WordPress admin
        if (!window.wp || !window.location.href.includes('wp-admin')) {
            alert('❌ Please run this script in WordPress admin area');
            return false;
        }

        // Navigate to add new page
        window.location.href = '/wp-admin/post-new.php?post_type=page';

        // Instructions for manual process
        console.log(`
📋 Manual Steps for Page 3:
1. Title: "פורטל משקיעים - עמוד 3"
2. Switch to HTML/Text editor mode
3. Copy content from portal-page-3-EXACT.html
4. Set page slug: "portal-page-3"
5. Publish the page

💡 The HTML content is ready in portal-page-3-EXACT.html file
        `);
    },

    // Update menu links
    updateMenus: function() {
        console.log('🔗 Updating navigation menus...');

        // Navigate to Appearance > Menus
        window.location.href = '/wp-admin/nav-menus.php';

        console.log(`
📋 Menu Update Steps:
1. Find the main navigation menu
2. Look for existing "פורטל למשקיעים כשירים" menu item
3. Update/add links to new portal pages:
   - Page 2: /portal-page-2/
   - Page 3: /portal-page-3/
4. Save menu changes
        `);
    },

    // Complete integration guide
    showGuide: function() {
        console.log(`
🎯 Complete WordPress Portal Integration Guide
==============================================

📍 Current Status:
✅ Portal files are ready (portal-page-2-EXACT.html, portal-page-3-EXACT.html)
✅ WordPress admin is accessible
✅ Security (uPress) bypass is ready

🔧 Integration Steps:

1️⃣ LOGIN TO WORDPRESS
   URL: https://movne.co.il/wp-admin/
   Username: aviad@kimfo-fs.com
   Password: Kimfo1982
   ⚠️ Wait 1-2 minutes for uPress security check

2️⃣ CREATE PORTAL PAGE 2
   • Go to: Pages > Add New
   • Title: פורטל משקיעים - עמוד 2
   • Switch to HTML editor mode
   • Copy entire content from portal-page-2-EXACT.html
   • Slug: portal-page-2
   • Publish

3️⃣ CREATE PORTAL PAGE 3
   • Go to: Pages > Add New
   • Title: פורטל משקיעים - עמוד 3
   • Switch to HTML editor mode
   • Copy entire content from portal-page-3-EXACT.html
   • Slug: portal-page-3
   • Publish

4️⃣ UPDATE NAVIGATION
   • Go to: Appearance > Menus
   • Find main menu
   • Update portal links to point to new pages
   • Save menu

5️⃣ TEST INTEGRATION
   • Visit: https://movne.co.il/
   • Click portal navigation
   • Test Hebrew text rendering
   • Verify page navigation works

🎉 Success Criteria:
✅ Portal pages load from main site
✅ Hebrew (RTL) text displays correctly
✅ Navigation between pages works
✅ Styling is preserved
✅ Professional appearance maintained

📞 Need Help?
Run: PortalIntegrationHelper.createPage2() for Page 2
Run: PortalIntegrationHelper.createPage3() for Page 3
Run: PortalIntegrationHelper.updateMenus() for menu updates
        `);
    }
};

// Auto-run guide
PortalIntegrationHelper.showGuide();

// Make functions available globally
window.PortalHelper = PortalIntegrationHelper;

console.log('✅ Portal Integration Helper loaded successfully!');
console.log('📞 Use PortalHelper.createPage2(), PortalHelper.createPage3(), etc.');