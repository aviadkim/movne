# WordPress Integration Guide for Movne Portal Pages

## Overview
This guide explains how to properly integrate the portal pages into the Movne WordPress website with correct URLs and navigation.

## Step 1: WordPress Admin Access

### Login Credentials:
- URL: https://movne.co.il/wp-admin/
- Username: aviad@kimfo-fs.com
- Password: Kimfo1982

### If Security Block Appears:
- Contact hosting provider to whitelist your IP
- Or use WordPress mobile app
- Or contact site administrator

## Step 2: Upload Portal Pages

### Method A: WordPress Media Library
1. Go to Media > Add New
2. Upload both HTML files:
   - portal-page-2-EXACT.html
   - portal-page-3-EXACT.html
3. Note the uploaded URLs

### Method B: FTP/File Manager
Upload to: `/wp-content/uploads/2025/09/`
- portal-page-2-EXACT.html
- portal-page-3-EXACT.html

## Step 3: Create WordPress Pages

### Create Main Portal Page:
1. Pages > Add New
2. Title: "פורטל למשקיעים כשירים"
3. Slug: "portal"
4. Content: Embed original portal HTML or redirect
5. Publish

### Create Sub-Pages:
1. **Investment Products Page:**
   - Title: "מוצרי השקעה"
   - Slug: "portal/investment-products"
   - Parent: Portal main page
   - Content: Link to portal-page-2-EXACT.html

2. **Services Page:**
   - Title: "שירותי השקעות"
   - Slug: "portal/services"  
   - Parent: Portal main page
   - Content: Link to portal-page-3-EXACT.html

## Step 4: Update WordPress Navigation

### Main Menu:
1. Appearance > Menus
2. Find main navigation menu
3. Update "פורטל למשקיעים כשירים" link to: `https://movne.co.il/portal/`

### Footer Menu:
1. Update footer portal link to: `https://movne.co.il/portal/`

## Step 5: URL Structure

### Recommended WordPress URLs:
- Main Portal: `https://movne.co.il/portal/`
- Investment Products: `https://movne.co.il/portal/investment-products/`
- Services: `https://movne.co.il/portal/services/`

### Alternative Direct File URLs:
- Page 2: `https://movne.co.il/wp-content/uploads/2025/09/portal-page-2-EXACT.html`
- Page 3: `https://movne.co.il/wp-content/uploads/2025/09/portal-page-3-EXACT.html`

## Step 6: Update All Internal Links

### Files to Update:
- Main website navigation (in theme files)
- Portal page navigation links
- Footer links
- Any existing portal references

### Navigation Links Already Updated In Portal Pages:
- All header navigation now points to `/portal/`
- Footer links updated
- Internal navigation between pages setup

## Step 7: Test Everything

### Check These URLs Work:
- [ ] https://movne.co.il/portal/
- [ ] https://movne.co.il/portal/investment-products/
- [ ] https://movne.co.il/portal/services/
- [ ] All Calendly integrations
- [ ] Contact forms
- [ ] Bank logos slider
- [ ] Navigation between pages

## Step 8: SEO and Meta Tags

### Add to WordPress:
1. Install Yoast SEO or similar
2. Set meta descriptions for portal pages
3. Add proper Hebrew language tags
4. Set canonical URLs

## Technical Notes

### Calendly URLs Used:
- Zoom: `https://calendly.com/aviad-3/movne`
- Phone: `https://calendly.com/aviad-3/meet-with-me`
- Office: `https://calendly.com/aviad-3/meet-with-me-1`

### JavaScript Dependencies:
- jQuery (already loaded)
- Slick Slider (already loaded)
- Calendly Widget (loaded dynamically)
- All main site scripts included

### CSS Dependencies:
- All original theme stylesheets included
- No additional CSS files needed
- Responsive design maintained

## Next Steps

1. Access WordPress admin using provided credentials
2. Upload portal pages to WordPress
3. Create proper WordPress pages with clean URLs
4. Update main site navigation to point to new URLs
5. Test all functionality works correctly

## Support

If you encounter issues:
1. Check WordPress error logs
2. Verify file permissions
3. Clear WordPress cache
4. Contact hosting provider if needed

All portal pages are now ready for WordPress integration with:
- Complete functionality
- Professional appearance
- Proper URL structure
- Working Calendly integration
- Responsive design