// --- מאגר ידע מקומי (ה-AI המובנה של התוסף) ---
const localDatabase = {
  "prompt": "הנחיה או פקודה טקסטואלית הניתנת למודל בינה מלאכותית (כמו ג'מיני) כדי להפיק ממנו תוצאה מסוימת.",
  "api": "ממשק תכנות המאפשר לתוכנות שונות לתקשר ביניהן. בתוספים, הוא משמש למשיכת מידע מאתרים אחרים.",
  "gemini": "הבינה המלאכותית המתקדמת של גוגל, המסוגלת להבין טקסט, קוד ותמונות ולענות על שאלות מורכבות.",
  "gpt": "משפחת מודלי שפה חכמים (כמו ChatGPT) המסוגלים לנהל שיחה ולכתוב טקסטים ברמה אנושית.",
  "manifest": "קובץ ההגדרות הראשי של תוסף כרום. הוא מכיל את שם התוסף, הגרסה וההרשאות שלו.",
  "github": "אתר איחסון לקודי תוכנה. מתכנתים משתמשים בו כדי לשמור גרסאות של הקוד שלהם ולשתף אותם.",
  "open source": "קוד פתוח: תוכנה שכל אחד יכול לראות את הקוד שלה, להעתיק אותו ולשפר אותו בחינם.",
  "json": "פורמט נפוץ להעברת נתונים בין מחשבים, הבנוי מרשימה של מפתחות וערכים.",
  "backend": "צד השרת: החלק בתוכנה שרץ 'מאחורי הקלעים' ומטפל בלוגיקה ובבסיסי הנתונים.",
  "frontend": "צד הלקוח: כל מה שהמשתמש רואה ומתקשר איתו בדפדפן (עיצוב וכפתורים).",
  "netfree": "ספק אינטרנט עם סינון תוכן מתקדם המותאם לציבור החרדי, הכולל סינון תמונות אנושי.",
  "extension": "תוסף: אפליקציה קטנה שמותקנת על הדפדפן ומוסיפה לו יכולות חדשות.",
  "cache": "זיכרון מטמון: מקום בו הדפדפן שומר עותק של אתרים כדי להאיץ את הטעינה שלהם בעתיד.",
  "vpn": "רשת פרטית שיוצרת 'צינור' מאובטח לגלישה ומסתירה את המיקום האמיתי של המחשב.",
  "token": "קוד זיהוי דיגיטלי המשמש לאבטחת כניסה או לגישה לשירותים מוגנים.",
  "script": "סקריפט: רצף של פקודות קוד שהמחשב מבצע כדי להשלים משימה אוטומטית.",
  "cookie": "קובץ קטן שהאתר שומר בדפדפן כדי לזכור את המשתמש ולהשאיר אותו מחובר.",
  "האם ישראל עשה ניתוח בחיים שלו ואם כן למה": "כן ישראל עשה ניתוח להכנסת ברגי טטיניום כי נשברה לו חוליה בגב לאחר טיול."

};

// יצירת התפריט בלחיצה ימנית
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explain-concept",
    title: "מה זה: %s?",
    contexts: ["selection"]
  });
});

// טיפול בלחיצה על התפריט עם הגנה משגיאות Tab
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // בדיקת בטיחות: האם הדף תקין וניתן להזרקה?
  if (!tab || !tab.id || tab.id === -1 || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
    return;
  }

  const query = info.selectionText.trim();
  
  try {
    // שלב 1: הזרקת הריבוע הכתום (טעינה)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        const old = document.getElementById('what-is-it-box');
        if (old) old.remove();
        const box = document.createElement('div');
        box.id = 'what-is-it-box';
        box.style.cssText = "position:fixed; bottom:20px; right:20px; width:320px; background:white; border-radius:12px; border:1px solid #ddd; box-shadow:0 8px 30px rgba(0,0,0,0.2); z-index:2147483647; padding:15px; font-family:system-ui, sans-serif; direction:rtl; text-align:right; cursor:pointer;";
        box.innerHTML = `<div style='color:#e67e22; font-weight:bold; margin-bottom:5px;'>🔍 בודק עבור: ${text}</div><div id='wi-res' style='color:#7f8c8d;'>מחפש במאגרים...</div>`;
        document.body.appendChild(box);
        box.onclick = () => box.remove();
      },
      args: [query]
    });

    // שלב 2: חיפוש המידע
    const result = await getSmartInfo(query);

    // שלב 3: עדכון הריבוע עם התוצאה הסופית
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (res) => {
        const el = document.getElementById('wi-res');
        if (el) {
          el.innerHTML = `<div style='font-weight:bold; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:5px;'>${res.title}</div>
                          <div style='font-size:14px; color:#34495e; line-height:1.5;'>${res.desc}</div>
                          <div style='font-size:10px; color:#999; margin-top:10px; text-align:left;'>לחץ לסגירה</div>`;
        }
      },
      args: [result]
    });
  } catch (err) {
    console.error("שגיאה בהפעלת התוסף:", err);
  }
});

// פונקציית החיפוש המשולבת
async function getSmartInfo(q) {
  const cleanQ = q.toLowerCase();
  
  // 1. בדיקה במאגר ה-AI המקומי (הכי מהיר)
  if (localDatabase[cleanQ]) {
    return { title: "הסבר ממאגר התוסף 💡", desc: localDatabase[cleanQ] };
  }

  // 2. חיפוש ב-API של המכלול
  try {
    const response = await fetch(`https://www.hamichlol.org.il/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(q)}&format=json&origin=*`);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== "-1" && pages[pageId].extract) {
      return { title: "מהמכלול:", desc: pages[pageId].extract.split('.')[0] + "." };
    }
  } catch (e) {}

  // 3. חיפוש בויקיפדיה (עברית)
  try {
    const response = await fetch(`https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
    const data = await response.json();
    if (data.extract) {
      return { title: "מוויקיפדיה:", desc: data.extract };
    }
  } catch (e) {}

  return { title: "תוצאה:", desc: "לא נמצא הסבר מפורט למושג '" + q + "'. נסה לסמן מילה בודדת או מושג מוכר." };
}