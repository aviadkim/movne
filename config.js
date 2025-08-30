// Configuration with environment variables
require('dotenv').config();

module.exports = {
  wordpress: {
    username: process.env.WP_USERNAME || 'your_wp_username',
    password: process.env.WP_PASSWORD || 'your_wp_password',
    siteUrl: process.env.WP_SITE_URL || 'https://yoursite.com',
    adminUrl: process.env.WP_SITE_URL + '/wp-admin/' || 'https://yoursite.com/wp-admin/'
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '972XXXXXXXXX'
  },
  site: {
    domain: process.env.SITE_DOMAIN || 'yoursite.com'
  }
};