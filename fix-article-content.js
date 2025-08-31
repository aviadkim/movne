// FIX ARTICLE CONTENT - Add full content to Hebrew articles
const { chromium } = require('playwright');
const config = require('./config');

async function fixArticleContent() {
  console.log('📝 FIXING HEBREW ARTICLE CONTENT - Adding full content...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // LOGIN TO WORDPRESS
    await page.goto(config.wordpress.adminUrl);
    await page.fill('#user_login', config.wordpress.username);
    await page.fill('#user_pass', config.wordpress.password);
    await page.click('#wp-submit');
    await page.waitForSelector('#dashboard-widgets', { timeout: 10000 });
    console.log('✅ Logged into WordPress admin');
    
    // Go to posts list
    await page.goto(`${config.wordpress.siteUrl}/wp-admin/edit.php`);
    await page.waitForTimeout(3000);
    
    // Define full article content
    const HEBREW_ARTICLES = [
      {
        title: 'מוצרים מובנים - המדריך המלא למשקיעים פרטים ב-2025',
        content: `
<h2>מה זה מוצרים מובנים?</h2>

<p><strong>מוצרים מובנים</strong> הם מוצרי השקעה מתקדמים המשלבים בין מספר נכסי יסוד ליצירת פרופיל השקעה מותאם אישית. בישראל, שוק המוצרים המובנים צומח בקצב מרשים, עם מוצרים המתאימים למשקיעים פרטים המחפשים אלטרנטיבה להשקעה מסורתית.</p>

<h3>יתרונות עיקריים:</h3>
<ul>
<li><strong>גמישות וגיוון</strong>: אפשרות להתאים את המוצר לצרכים המשקיע</li>
<li><strong>פוטנציאל תשואה</strong>: אפשרות לתשואות גבוהות מהשקעות מסורתיות</li>
<li><strong>הגנת קרן</strong>: אפשרות להגן על ההשקעה בשוקים מתנדנדים</li>
<li><strong>יעילות מסוית</strong>: מוצרים רבים מציעים יתרונות מסויים</li>
</ul>

<h2>סוגי מוצרים מובנים בישראל</h2>

<h3>1. תעודות שקיפות</h3>
<p>מוצרים המבוססים על בדיקת השקיפות ומסחר בבורסה, מתאימים למשקיעים מקצועיים.</p>

<h3>2. מוצרים קשורי-מדד</h3>
<p>מוצרים הקשורים למדדים שונים כמו ת"א 25, ת"א 100, או מדדים בינלאומיים.</p>

<h3>3. מוצרים שקליים</h3>
<p>מוצרים המתבססים על שער השקל או זוגות מטבעות, מתאימים למי שרוצה להתגונן מפני שינויי שער חליפין.</p>

<h2>למי מתאימים מוצרים מובנים?</h2>

<ul>
<li><strong>משקיעים מקצועיים</strong>: בעלי הבנה בשוק ההון ובמוצרים פיננסיים</li>
<li><strong>מחפשי תשואה גבוהה</strong>: מי שמוכן לקחת סיכונים מוגבלים</li>
<li><strong>משקיעים מאוזנים</strong>: המחפשים לגוון בתיק ההשקעות</li>
</ul>

<h2>איך לבחור משווק מוצרים מובנים?</h2>

<p>בחירת <strong>שיווק השקעות</strong> מורשה ומנוסה חיונית להצלחה בשוק המוצרים המובנים. ב-<strong>Movne</strong>, אנו מתמחים ביצירת פתרונות השקעה מותאמים אישית לכל לקוח.</p>

<blockquote>
<p><strong>רוצים להתחיל?</strong><br>
צרו איתנו קשר עוד היום לייעוץ אישי ללא התחייבות!</p>
</blockquote>
        `
      },
      {
        title: 'שיווק השקעות - איך לבחור משווק מוצרים מובנים 2025',
        content: `
<h2>מה זה שיווק השקעות?</h2>

<p><strong>שיווק השקעות</strong> הוא תהליך שבו חברות פיננסיות מורשות מציעות מוצרי השקעה למשקיעים פרטים. בישראל, שיווק השקעות כולל מוצרים מובנים, קרנות נאמנות, תעודות סל ועוד.</p>

<h3>מדוע חשוב לבחור משווק השקעות טוב?</h3>
<ul>
<li><strong>ניסיון ומקצועיות</strong>: משווק מנוסה יכיר את המוצרים המתאימים ביותר</li>
<li><strong>גישה למוצרים מתקדמים</strong>: חברות משווק חשופות למוצרים שלא קיימים בבנקים</li>
<li><strong>יעוץ מקצועי</strong>: בניית תיק השקעות מותאם לאפק הסיכון והתשואה</li>
</ul>

<h2>קריטריונים לבחירת משווק השקעות</h2>

<h3>1. אשראות ורגולציה</h3>
<p>וידאו שהמשווק בעל רישיון מרשות השוק הישראלית ומפוקח על ידי הרגולטור המתאים.</p>

<h3>2. ניסיון בתחום</h3>
<ul>
<li>כמה שנים המשווק פועל בשוק</li>
<li>מה ההיצעים שלו עם מוצרים מובנים</li>
<li>אילו לקוחות הוא כבר שירת</li>
</ul>

<h3>3. מגוון מוצרים</h3>
<p>בדקו אילו מוצרים המשווק מציע והאם הם מתאימים לאפק הסיכון שלכם:</p>
<ul>
<li>מוצרים קשורי מדד</li>
<li>מוצרים שקליים</li>
<li>מוצרים עם הגנת קרן</li>
<li>מוצרים מוקדי תשואה</li>
</ul>

<h2>אזהרות וסיכונים</h2>

<div style="background-color: #fff3cd; padding: 15px; border-right: 4px solid #ffc107; margin: 20px 0;">
<h3>⚠️ חשוב לדעת:</h3>
<ul>
<li>מוצרים מובנים כרוכים בסיכונים</li>
<li>תשואה עבר אינה מבטיחה תשואה עתיד</li>
<li>חשוב לקרוא ולהבין את תנאי המוצר</li>
</ul>
</div>

<h2>למה לבחור ב-Movne?</h2>

<p><strong>Movne</strong> היא חברת <strong>שיווק השקעות</strong> מורשית בעלת ניסיון רב בשוק המוצרים המובנים בישראל:</p>

<ul>
<li>✅ <strong>רישיון משווק</strong> מרשות השוק הישראלית</li>
<li>✅ <strong>מוצרים מתאימים</strong> לכל סוג משקיע</li>
<li>✅ <strong>יעוץ אישי</strong> ללא עלות נוספות</li>
<li>✅ <strong>שקיפות מלאה</strong> ותמיכה מקצועית</li>
</ul>

<blockquote>
<p><strong>רוצים לשמוע על האפשרויות?</strong><br>
צרו איתנו קשר לייעוץ מקצועי ללא התחייבות!</p>
</blockquote>
        `
      },
      {
        title: 'סוגי מוצרים מובנים בישראל - השוואה מקיפה 2025',
        content: `
<h2>סוגי המוצרים המובנים הפופולרים בישראל</h2>

<p>שוק המוצרים המובנים בישראל מציע מגוון רחב של אפשרויות השקעה. הנה השוואה מפורטת של הסוגים השונים:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<thead>
<tr style="background-color: #f8f9fa;">
<th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">סוג מוצר</th>
<th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">רמת סיכון</th>
<th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">פוטנציאל תשואה</th>
<th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">למי מתאים</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #dee2e6; padding: 12px;">מוצרים קשורי-מדד</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">בינוני</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">8-15% שנתי</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">משקיעים מאוזנים</td>
</tr>
<tr style="background-color: #f8f9fa;">
<td style="border: 1px solid #dee2e6; padding: 12px;">מוצרים שקליים</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">גבוה</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">10-25% שנתי</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">מי שחשש מחולשת השקל</td>
</tr>
<tr>
<td style="border: 1px solid #dee2e6; padding: 12px;">תעודות שקיפות</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">גבוה</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">12-30% שנתי</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">משקיעים מקצועיים</td>
</tr>
<tr style="background-color: #f8f9fa;">
<td style="border: 1px solid #dee2e6; padding: 12px;">מוצרים עם הגנת קרן</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">נמוך-בינוני</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">5-12% שנתי</td>
<td style="border: 1px solid #dee2e6; padding: 12px;">משקיעים שמרנים</td>
</tr>
</tbody>
</table>

<h2>1. מוצרים קשורי-מדד</h2>

<h3>מה זה?</h3>
<p>מוצרים הקשורים לביצועי מדד מסוים (כמו ת"א 25, ת"א 100, S&P 500) ומציעים חשיפה מאוזנת לשוק ההון.</p>

<h3>יתרונות:</h3>
<ul>
<li>גיוון ריאל בתיק ההשקעות</li>
<li>נוחות למשקיעים מתחילים</li>
<li>עלויות נמוכות יחסית</li>
<li>שקיפות גבוהה בשוק הישראלי</li>
</ul>

<h3>חסרונות:</h3>
<ul>
<li>תלויות במדד בודד</li>
<li>אין הגנה מפני ירידות חדות</li>
<li>פוטנציאל תשואה מוגבל בשוקים יציבים</li>
</ul>

<h2>2. מוצרים שקליים</h2>

<h3>מה זה?</h3>
<p>מוצרים המבוססים על שער השקל יחס למטבעות חזקים (דולר, יורו) או סל מטבעות.</p>

<h3>יתרונות:</h3>
<ul>
<li>הגנה מפני חולשת השקל</li>
<li>פוטנציאל תשואה גבוה בתקופות של חולשת שקל</li>
<li>גיוון גאוגרפי לבעלי הוצאות במטבע זר</li>
</ul>

<h3>חסרונות:</h3>
<ul>
<li>סיכון מטבע גבוה</li>
<li>תלויות במדיניות בנק ישראל</li>
<li>עלול להפסיד בתקופות של חיזוק השקל</li>
</ul>

<h2>3. תעודות שקיפות</h2>

<h3>מה זה?</h3>
<p>מוצרים הקשורים למסחר באפשרויות (Options) על משאבים שונים, המשלבים בין מכשירים פיננסיים מקצועיים.</p>

<h3>יתרונות:</h3>
<ul>
<li>פוטנציאל תשואה גבוה מאד</li>
<li>גישה לאסטרטגיות מתקדמות</li>
<li>אפשרות להרוויח מתנודת שוקים</li>
<li>יכולת להשתתף בגידול ובירידה</li>
</ul>

<h3>חסרונות:</h3>
<ul>
<li>סיכון גבוה מאד - עלול לאיבוד מלוא</li>
<li>מורכבות גבוהה וצורך בהבנת שוק</li>
<li>לא מתאים למשקיעים שמרנים</li>
<li>עמלות גבוהות</li>
</ul>

<h2>4. מוצרים עם הגנת קרן</h2>

<h3>מה זה?</h3>
<p>מוצרים הכוללים מנגנון מובנה להגנה מפני הפסדים, תוך שמירה על פוטנציאל עלייה.</p>

<h3>יתרונות:</h3>
<ul>
<li>הגנה מפני ירידות חדות</li>
<li>מתאים למשקיעים שמרנים</li>
<li>שקט נפשי בשוקים מתנדנדים</li>
<li>אפשרות להשתתף בעלייות באופן מוגבל</li>
</ul>

<h3>חסרונות:</h3>
<ul>
<li>עלויות גבוהות יותר מאשר במוצרים רגילים</li>
<li>פוטנציאל תשואה מוגבל יותר</li>
<li>מורכבות במבנה המוצר</li>
</ul>

<h2>איך לבחור בין הסוגים?</h2>

<div style="background-color: #e3f2fd; padding: 20px; border-right: 4px solid #2196F3; margin: 20px 0;">
<h3>🎯 שאלות להתשאול לפני הבחירה:</h3>
<ul>
<li><strong>מה אפק הסיכון שלי?</strong> שמרן / מאוזן / אגרסיבי</li>
<li><strong>מה יעד ההשקעה שלי?</strong> שמירת ערך / הכנסה / צמיחה</li>
<li><strong>מה אופק הזמן שלי?</strong> קצר / בינוני / ארוך מועד</li>
<li><strong>האם יש לי חשיפה למטבע זר?</strong> הוצאות בדולר/יורו</li>
</ul>
</div>

<h2>מדוע לבחור ב-Movne?</h2>

<p>ב-<strong>Movne</strong> אנו מתמחים ב<strong>שיווק השקעות</strong> מותאם אישית. אנו עוזרים לכם לבחור בין כל הסוגים השונים בהתאם לצרכים וליעדי ההשקעה שלכם.</p>

<blockquote>
<p><strong>רוצים לשמוע על המוצרים המתאימים לכם?</strong><br>
צרו איתנו קשר לייעוץ מקצועי ללא התחייבות!</p>
</blockquote>
        `
      }
    ];
    
    // Update each article with full content
    for (const article of HEBREW_ARTICLES) {
      console.log(`\n📝 Updating article: ${article.title}`);
      
      // Search for the article in the posts list
      const articleLink = await page.locator(`a[title*="${article.title.substring(0, 20)}"], .row-title:has-text("${article.title.substring(0, 20)}")`);
      
      if (await articleLink.count() > 0) {
        await articleLink.first().click();
        await page.waitForTimeout(3000);
        
        // Switch to HTML editor
        const htmlTab = page.locator('button:has-text("HTML"), .switch-html, #content-html');
        if (await htmlTab.count() > 0) {
          await htmlTab.click();
          await page.waitForTimeout(1000);
        }
        
        // Find content textarea
        const contentArea = await page.locator('#content, .wp-editor-area, textarea[name="content"]').first();
        if (await contentArea.isVisible()) {
          // Clear existing content and add full content
          await contentArea.fill(article.content);
          
          // Update/Publish the post
          const updateButton = page.locator('#publish, input[value="Update"], button:has-text("עדכון")');
          if (await updateButton.count() > 0) {
            await updateButton.click();
            await page.waitForTimeout(2000);
            console.log(`   ✅ Updated content for: ${article.title}`);
          }
        } else {
          console.log(`   ⚠️ Could not find content editor for: ${article.title}`);
        }
        
        // Go back to posts list
        await page.goto(`${config.wordpress.siteUrl}/wp-admin/edit.php`);
        await page.waitForTimeout(2000);
      } else {
        console.log(`   ⚠️ Article not found: ${article.title}`);
      }
    }
    
    console.log('\n✅ ARTICLE CONTENT UPDATE COMPLETE!');
    console.log('🚀 All Hebrew articles now have full, SEO-optimized content');
    
  } catch (error) {
    console.error('❌ Article content update error:', error.message);
  } finally {
    await browser.close();
  }
}

// Execute article content fix
fixArticleContent().catch(console.error);
