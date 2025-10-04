<?php
/**
 * WordPress CLI Script for Portal Pages Creation
 * This script uses WP-CLI to create the portal pages automatically
 *
 * Usage: php wp-cli.phar eval-file create-portal-pages-wp-cli.php --url=https://movne.co.il
 */

// Portal Page 2 Content (HTML will be read from file)
function create_portal_page_2() {
    $page_content = file_get_contents('portal-page-2-EXACT.html');

    // Extract body content (remove DOCTYPE, html, head tags for WordPress)
    $dom = new DOMDocument();
    @$dom->loadHTML($page_content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

    // Get the body content
    $body = $dom->getElementsByTagName('body')->item(0);
    if ($body) {
        $body_content = '';
        foreach ($body->childNodes as $child) {
            $body_content .= $dom->saveHTML($child);
        }

        // Get the style content from head
        $styles = '';
        $style_tags = $dom->getElementsByTagName('style');
        foreach ($style_tags as $style) {
            $styles .= '<style>' . $style->textContent . '</style>';
        }

        $final_content = $styles . $body_content;
    } else {
        $final_content = $page_content;
    }

    // Create WordPress page
    $page_data = array(
        'post_title'    => 'פורטל משקיעים - עמוד 2',
        'post_content'  => $final_content,
        'post_status'   => 'publish',
        'post_type'     => 'page',
        'post_name'     => 'portal-page-2'
    );

    $page_id = wp_insert_post($page_data);

    if ($page_id) {
        WP_CLI::success("Portal Page 2 created successfully! ID: $page_id");
        WP_CLI::log("URL: " . get_permalink($page_id));
    } else {
        WP_CLI::error("Failed to create Portal Page 2");
    }

    return $page_id;
}

// Portal Page 3 Content
function create_portal_page_3() {
    $page_content = file_get_contents('portal-page-3-EXACT.html');

    // Extract body content (remove DOCTYPE, html, head tags for WordPress)
    $dom = new DOMDocument();
    @$dom->loadHTML($page_content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

    // Get the body content
    $body = $dom->getElementsByTagName('body')->item(0);
    if ($body) {
        $body_content = '';
        foreach ($body->childNodes as $child) {
            $body_content .= $dom->saveHTML($child);
        }

        // Get the style content from head
        $styles = '';
        $style_tags = $dom->getElementsByTagName('style');
        foreach ($style_tags as $style) {
            $styles .= '<style>' . $style->textContent . '</style>';
        }

        $final_content = $styles . $body_content;
    } else {
        $final_content = $page_content;
    }

    // Create WordPress page
    $page_data = array(
        'post_title'    => 'פורטל משקיעים - עמוד 3',
        'post_content'  => $final_content,
        'post_status'   => 'publish',
        'post_type'     => 'page',
        'post_name'     => 'portal-page-3'
    );

    $page_id = wp_insert_post($page_data);

    if ($page_id) {
        WP_CLI::success("Portal Page 3 created successfully! ID: $page_id");
        WP_CLI::log("URL: " . get_permalink($page_id));
    } else {
        WP_CLI::error("Failed to create Portal Page 3");
    }

    return $page_id;
}

// Main execution
WP_CLI::log("🚀 Starting Portal Pages Creation...");

// Check if files exist
if (!file_exists('portal-page-2-EXACT.html')) {
    WP_CLI::error("portal-page-2-EXACT.html not found in current directory");
    exit;
}

if (!file_exists('portal-page-3-EXACT.html')) {
    WP_CLI::error("portal-page-3-EXACT.html not found in current directory");
    exit;
}

// Create pages
WP_CLI::log("📄 Creating Portal Page 2...");
$page2_id = create_portal_page_2();

WP_CLI::log("📄 Creating Portal Page 3...");
$page3_id = create_portal_page_3();

// Update navigation menu (if needed)
WP_CLI::log("🔗 Checking navigation menus...");

// Get all menus
$menus = wp_get_nav_menus();
if (!empty($menus)) {
    foreach ($menus as $menu) {
        WP_CLI::log("Found menu: " . $menu->name . " (ID: " . $menu->term_id . ")");

        // Check if portal menu item exists
        $menu_items = wp_get_nav_menu_items($menu->term_id);
        foreach ($menu_items as $item) {
            if (strpos($item->title, 'פורטל') !== false || strpos($item->title, 'משקיעים') !== false) {
                WP_CLI::log("Found portal menu item: " . $item->title);
            }
        }
    }
}

WP_CLI::success("✅ Portal pages creation completed!");
WP_CLI::log("🎉 Next steps:");
WP_CLI::log("1. Visit your WordPress admin to verify pages");
WP_CLI::log("2. Update navigation menu if needed");
WP_CLI::log("3. Test pages from frontend");

?>