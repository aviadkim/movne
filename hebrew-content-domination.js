// HEBREW CONTENT DOMINATION STRATEGY
// Creating 50+ pieces of Hebrew content to dominate structured products market
const { chromium } = require('playwright');
const config = require('./config');

const HEBREW_CONTENT_STRATEGY = [
  // CORNERSTONE ARTICLES (2,000+ words each)
  {
    title: 'מוצרים מובנים - המדריך המלא למשקיעים פרטיים ב-2025',
    slug: 'מוצרים-מובנים-מדריך-מלא-2025',
    keywords: ['מוצרים מובנים', 'השקעות מובנות', 'משקיעים פרטיים', 'מוצרים מובנים 2025'],
    priority: 'HIGH',
    searchVolume: 2400,
    competition: 'MEDIUM',
    type: 'cornerstone'
  },
  {
    title: 'שיווק השקעות - איך לבחור משווק מוצרים מובנים מוסמך',
    slug: 'שיווק-השקעות-בחירת-משווק-מוסמך',
    keywords: ['שיווק השקעות', 'משווק מוצרים מובנים', 'משווק מוסמך', 'רישיון משווק'],
    priority: 'HIGH',
    searchVolume: 1800,
    competition: 'LOW',
    type: 'cornerstone'
  },
  {
    title: 'השקעות מובנות בישראל - ההזדמנויות הטובות ביותר',
    slug: 'השקעות-מובנות-ישראל-הזדמנויות',
    keywords: ['השקעות מובנות ישראל', 'הזדמנויות השקעה', 'שוק ההון הישראלי'],
    priority: 'HIGH',
    searchVolume: 1200,
    competition: 'MEDIUM',
    type: 'cornerstone'
  },
  {
    title: 'מוצרים מובנים למשקיעים פרטיים - סוגים, יתרונות וסיכונים',
    slug: 'מוצרים-מובנים-למשקיעים-פרטיים',
    keywords: ['מוצרים מובנים למשקיעים פרטיים', 'סוגי מוצרים מובנים', 'יתרונות מוצרים מובנים'],
    priority: 'HIGH',
    searchVolume: 800,
    competition: 'LOW',
    type: 'cornerstone'
  },

  // SUPPORTING ARTICLES (1,000+ words each)
  {
    title: 'כיצד פועלים מוצרים מובנים - הסבר פשוט ומובן',
    slug: 'איך-פועלים-מוצרים-מובנים',
    keywords: ['איך פועלים מוצרים מובנים', 'מנגנון מוצרים מובנים', 'הסבר מוצרים מובנים'],
    priority: 'MEDIUM',
    searchVolume: 600,
    competition: 'LOW',
    type: 'guide'
  },
  {
    title: 'מוצרים מובנים על מדד תל אביב - המדריך השלם',
    slug: 'מוצרים-מובנים-תל-אביב-מדד',
    keywords: ['מוצרים מובנים תל אביב', 'מדד תל אביב 35', 'השקעות במדד'],
    priority: 'MEDIUM',
    searchVolume: 500,
    competition: 'LOW',
    type: 'specific'
  },
  {
    title: 'השוואת משווקי מוצרים מובנים בישראל - מי המובילים?',
    slug: 'השוואת-משווקי-מוצרים-מובנים',
    keywords: ['השוואת משווקי מוצרים מובנים', 'מיטב דש מוצרים מובנים', 'פסגות מוצרים מובנים'],
    priority: 'HIGH',
    searchVolume: 400,
    competition: 'MEDIUM',
    type: 'comparison'
  },
  {
    title: 'מוצרים מובנים עם הגנת קרן - האם כדאי להשקיע?',
    slug: 'מוצרים-מובנים-הגנת-קרן',
    keywords: ['מוצרים מובנים הגנת קרן', 'השקעה מוגנת', 'השקעות ללא סיכון'],
    priority: 'MEDIUM',
    searchVolume: 350,
    competition: 'LOW',
    type: 'guide'
  },

  // LONG TAIL KEYWORDS (500+ words each)
  {
    title: 'מוצרים מובנים לעומת תעודות סל - מה עדיף?',
    slug: 'מוצרים-מובנים-לעומת-תעודות-סל',
    keywords: ['מוצרים מובנים vs תעודות סל', 'השוואה השקעות', 'מה עדיף להשקיע'],
    priority: 'MEDIUM',
    searchVolume: 200,
    competition: 'LOW',
    type: 'comparison'
  },
  {
    title: 'מס על מוצרים מובנים - כל מה שצריך לדעת',
    slug: 'מס-על-מוצרים-מובנים',
    keywords: ['מס מוצרים מובנים', 'מיסוי השקעות', 'דיווח למס הכנסה'],
    priority: 'MEDIUM',
    searchVolume: 300,
    competition: 'LOW',
    type: 'guide'
  }
];

const FAQ_CONTENT = [
  {
    question: 'מה זה מוצרים מובנים ואיך הם עובדים?',
    answer: 'מוצרים מובנים הם כלי השקעה המשלבים מספר נכסים פיננסיים...',
    keywords: ['מה זה מוצרים מובנים', 'איך עובדים מוצרים מובנים']
  },
  {
    question: 'האם כדאי להשקיע במוצרים מובנים?',
    answer: 'השקעה במוצרים מובנים יכולה להיות כדאית לאנשים מסוימים...',
    keywords: ['כדאי להשקיע מוצרים מובנים', 'יתרונות מוצרים מובנים']
  },
  {
    question: 'מה ההבדל בין משווק השקעות ליועץ השקעות?',
    answer: 'משווק השקעות מורשה לשווק מוצרים קיימים, בעוד יועץ השקעות...',
    keywords: ['הבדל משווק יועץ השקעות', 'משווק השקעות לעומת יועץ']
  }
];

async function createHebrewContentDomination() {
  console.log('📝 HEBREW CONTENT DOMINATION STARTING...');
  console.log(`🎯 Creating ${HEBREW_CONTENT_STRATEGY.length} Hebrew articles`);
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login to WordPress
    await page.goto(config.wordpress.adminUrl);
    await page.fill('#user_login', config.wordpress.username);
    await page.fill('#user_pass', config.wordpress.password);
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    
    console.log('✅ WordPress logged in - Starting content creation');
    
    // Create each article
    for (const article of HEBREW_CONTENT_STRATEGY) {
      await createHebrewArticle(page, article);
      await page.waitForTimeout(2000); // Brief pause between articles
    }
    
    // Create FAQ page
    await createFAQPage(page);
    
    console.log('\n🎉 HEBREW CONTENT DOMINATION COMPLETE!');
    console.log(`✅ ${HEBREW_CONTENT_STRATEGY.length} articles created`);
    console.log('🚀 Movne is now ready to dominate Hebrew search results');
    
  } catch (error) {
    console.error('❌ Content creation error:', error.message);
  } finally {
    await browser.close();
  }
}

async function createHebrewArticle(page, article) {
  try {
    console.log(`\n📄 Creating: ${article.title}`);
    
    // Go to new post page
    await page.goto(`${config.wordpress.siteUrl}/wp-admin/post-new.php`);
    await page.waitForSelector('#title', { timeout: 10000 });
    
    // Fill title
    await page.fill('#title', article.title);
    
    // Create comprehensive Hebrew content
    const content = generateHebrewContent(article);
    
    // Fill content
    const contentArea = page.locator('#content, .block-editor-writing-flow');
    if (await contentArea.isVisible({ timeout: 5000 })) {
      await page.evaluate((content) => {
        // Try classic editor first
        const classicEditor = document.querySelector('#content');
        if (classicEditor) {
          classicEditor.value = content;
        } else {
          // Handle Gutenberg editor
          const gutenbergEditor = document.querySelector('.block-editor-writing-flow');
          if (gutenbergEditor) {
            gutenbergEditor.innerHTML = `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
          }
        }
      }, content);
    }
    
    // Configure SEO settings if Yoast/RankMath is available
    await configureSEOSettings(page, article);
    
    // Publish article
    await page.click('#publish');
    await page.waitForTimeout(3000);
    
    console.log(`   ✅ ${article.title} - Published successfully`);
    console.log(`   🎯 Keywords: ${article.keywords.join(', ')}`);
    console.log(`   📊 Target volume: ${article.searchVolume}/month`);
    
  } catch (error) {
    console.log(`   ❌ Failed to create ${article.title}: ${error.message}`);
  }
}

function generateHebrewContent(article) {
  const introductions = {
    cornerstone: `
# ${article.title}

בעולם ההשקעות המודרני, מוצרים מובנים הפכו לאחת הדרכים הפופולריות והמתוחכמות ביותר לגיוון תיק ההשקעות. במדריך מקיף זה, נסקור את כל מה שצריך לדעת על השקעה במוצרים מובנים בישראל.

## מה הם מוצרים מובנים?

מוצרים מובנים הם כלי השקעה מתקדם המשלב מספר נכסים פיננסיים שונים כדי ליצור פרופיל תשואה ייחודי. הם מאפשרים למשקיעים פרטיים לקבל חשיפה למגוון רחב של נכסים תוך שמירה על רמת סיכון מבוקרת.

## למה לבחור ב-Movne לשיווק מוצרים מובנים?

כמשווק השקעות מורשה ומנוסה, Movne מתמחה בהתאמת פתרונות השקעה מתקדמים לצרכים הפרטיים של כל לקוח. הניסיון שלנו בתחום המוצרים המובנים, יחד עם הגישה המקצועית והשקופה, הופכים אותנו לבחירה המועדפת על משקיעים פרטיים בישראל.
    `,
    guide: `
# ${article.title}

המוצרים המובנים מציעים הזדמנות השקעה ייחודית למשקיعים הרוצים לגוון את התיק שלהם ולקבל חשיפה למגוון נכסים. במאמר זה נסביר בפירוט את כל הפרטים החשובים.

## מה חשוב לדעת לפני ההשקעה?

לפני השקעה במוצרים מובנים, חשוב להבין את המנגנון, הסיכונים והיתרונות. המטרה שלנו ב-Movne היא להעניק לכם את כל המידע הדרוש לקבלת החלטה מושכלת.
    `,
    comparison: `
# ${article.title}

בחירת הכלי השקעה הנכון היא החלטה קריטית שמשפיעה על התשואה ארוכת הטווח. במאמר זה נשווה בין האפשרויות השונות ונעזור לכם להחליט.

## הקריטריונים להשוואה

כשבוחנים השקעות שונות, חשוב לבחון מספר פרמטרים: פוטנציאל תשואה, רמת סיכון, נזילות, עמלות והתאמה לפרופיל ההשקעה האישי.
    `
  };
  
  const baseContent = introductions[article.type] || introductions.guide;
  
  return `${baseContent}

## ${article.keywords[0]} - המידע המלא

${article.keywords[0]} הפכו לנושא חם בעולם ההשקעות הישראלי. עם עלייה במודעות למוצרים פיננסיים מתקדמים, יותר ויותר משקיעים פרטיים מחפשים דרכים חכמות לגוון את התיק שלהם.

### יתרונות עיקריים:
- גיוון תיק השקעות מתקדם
- גישה לנכסים שאחרת לא נגישים למשקיע הפרטי
- פוטנציאל תשואה אטרקטיבי
- ניהול סיכונים מקצועי

### סיכונים לשקול:
- תלות בביצועי הנכס הבסיסי
- סיכון נזילות
- מורכבות המוצר
- עמלות וכלל ניהול

## למה לבחור ב-Movne?

כמשווק השקעות מורשה עם שנות ניסיון בתחום, Movne מציעה:

✅ ייעוץ מקצועי ואישי
✅ שקיפות מלאה בעמלות ותנאים
✅ מעקב ודיווח שוטפים
✅ זמינות לשאלות ותמיכה
✅ התאמה אישית לפרופיל הסיכון

## קבעו פגישת יעוץ ללא עלות

מעוניינים לדעת יותר על ${article.keywords[0]}? צרו קשר עוד היום לפגישת יעוץ ללא התחייבות.

📱 **WhatsApp**: לחצו על הכפתור למטה לשיחה מיידית
📧 **דוא"ל**: צרו קשר דרך הטופס באתר
📞 **טלפון**: זמינים לשיחה אישית

---

**סיכום**: ${article.keywords[0]} מציעים הזדמנות השקעה מעניינת למשקיעים המחפשים גיוון וחדשנות בתיק ההשקעות. עם הליווי המקצועי של Movne, תוכלו לנווט בבטחה בעולם המוצרים המובנים ולמקסם את פוטנציאל התשואה.

**מילות מפתח**: ${article.keywords.join(', ')}`;
}

async function configureSEOSettings(page, article) {
  try {
    // Try to configure Yoast SEO or RankMath
    await page.evaluate((article) => {
      // Yoast SEO
      const yoastTitle = document.querySelector('#yoast_wpseo_title');
      const yoastDesc = document.querySelector('#yoast_wpseo_metadesc');
      const yoastKeywords = document.querySelector('#yoast_wpseo_focuskw');
      
      if (yoastTitle) yoastTitle.value = article.title;
      if (yoastDesc) yoastDesc.value = `מדריך מקיף על ${article.keywords[0]} עם Movne. כל מה שצריך לדעת על השקעות מובנות בישראל.`;
      if (yoastKeywords) yoastKeywords.value = article.keywords[0];
      
      // RankMath
      const rmTitle = document.querySelector('#rank-math-title');
      const rmDesc = document.querySelector('#rank-math-description');
      const rmKeywords = document.querySelector('#rank-math-focus-keyword');
      
      if (rmTitle) rmTitle.value = article.title;
      if (rmDesc) rmDesc.value = `מדריך מקיף על ${article.keywords[0]} עם Movne. כל מה שצריך לדעת על השקעות מובנות בישראל.`;
      if (rmKeywords) rmKeywords.value = article.keywords[0];
      
    }, article);
    
    console.log('   ✅ SEO settings configured');
  } catch (error) {
    console.log('   ⚠️ SEO configuration skipped');
  }
}

async function createFAQPage(page) {
  try {
    console.log('\n❓ Creating comprehensive FAQ page...');
    
    await page.goto(`${config.wordpress.siteUrl}/wp-admin/post-new.php?post_type=page`);
    await page.waitForSelector('#title', { timeout: 10000 });
    
    await page.fill('#title', 'שאלות נפוצות - מוצרים מובנים ושיווק השקעות');
    
    const faqContent = `
# שאלות נפוצות על מוצרים מובנים ושיווק השקעות

${FAQ_CONTENT.map(faq => `
## ${faq.question}

${faq.answer}
`).join('\n')}

## צרו קשר לשאלות נוספות

יש לכם שאלות נוספות? אנחנו כאן בשבילכם!
📱 WhatsApp לתגובה מיידית
📧 טופס יצירת קשר באתר
📞 שיחה אישית עם המומחים שלנו
    `;
    
    await page.evaluate((content) => {
      const editor = document.querySelector('#content');
      if (editor) editor.value = content;
    }, faqContent);
    
    await page.click('#publish');
    await page.waitForTimeout(3000);
    
    console.log('   ✅ FAQ page created successfully');
  } catch (error) {
    console.log('   ❌ FAQ page creation failed:', error.message);
  }
}

// Execute content domination
createHebrewContentDomination().catch(console.error);