import React from 'react';
import { A11Y_CONTACT } from './Accessibility.jsx';

/* Privacy policy page (route: /privacy). Required in Israel when collecting
   personal details (חוק הגנת הפרטיות). Adjust the copy to your actual practices. */

const Section = ({ h, children }) => (
  <section className="mb-6">
    <h2 className="mb-2 font-display text-xl font-bold text-ink">{h}</h2>
    <div className="space-y-2 text-sm leading-relaxed text-ink/70">{children}</div>
  </section>
);

export default function Privacy() {
  const { business, email, phone } = A11Y_CONTACT;
  return (
    <div dir="rtl" className="min-h-screen bg-bone px-5 py-10 font-sans text-ink">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-moss hover:underline">
          → חזרה לאתר
        </a>
        <h1 className="mb-6 font-display text-3xl font-black text-ink sm:text-4xl">מדיניות פרטיות</h1>

        <Section h="כללי">
          <p>
            {business} (״האתר״) מכבד את פרטיות המשתמשים ופועל בהתאם לחוק הגנת הפרטיות,
            התשמ״א-1981. מדיניות זו מסבירה אילו נתונים נאספים, כיצד נעשה בהם שימוש וכיצד
            הם מוגנים.
          </p>
        </Section>

        <Section h="אילו פרטים אנו אוספים">
          <p>בעת ביצוע הזמנה אנו אוספים: שם מלא, טלפון, כתובת דוא״ל וכתובת למשלוח (כולל מיקוד).</p>
          <p>
            בנוסף נאספים נתוני שימוש אנונימיים לצורכי שיפור האתר (עמודים שנצפו, מקור הגעה,
            סוג דפדפן/מכשיר ומזהה גלישה כללי).
          </p>
          <p>
            <b>פרטי כרטיס אשראי אינם נאספים ואינם נשמרים אצלנו כלל</b> — התשלום מתבצע בדף
            מאובטח של חברת הסליקה Hyp, העומדת בתקן PCI DSS.
          </p>
        </Section>

        <Section h="השימוש בנתונים">
          <p>הנתונים משמשים לצורך עיבוד ההזמנה, אספקת המוצר, שירות לקוחות ושיפור חוויית השימוש באתר. לא נעביר את פרטיך לצד שלישי אלא לצורך אספקת ההזמנה (חברת שילוח/סליקה) או על פי דין.</p>
        </Section>

        <Section h="עוגיות (Cookies)">
          <p>האתר עושה שימוש בעוגיות ובאחסון מקומי לצורך תפעול תקין, שמירת העדפות (כגון הגדרות נגישות) ומדידת תנועה. ניתן לחסום עוגיות דרך הגדרות הדפדפן, אך הדבר עלול לפגוע בחלק מהתכונות.</p>
        </Section>

        <Section h="אבטחת מידע">
          <p>אנו נוקטים באמצעים מקובלים לאבטחת המידע, לרבות הצפנה בתעבורה, הרשאות גישה מוגבלות ומסד נתונים מאובטח. עם זאת, אין אפשרות להבטיח הגנה מוחלטת.</p>
        </Section>

        <Section h="זכויותיך">
          <p>הנך רשאי לעיין במידע שנאסף אודותיך, לבקש את תיקונו או מחיקתו, בהתאם לחוק. לפניות בנושא פרטיות ניתן לפנות אלינו:</p>
          <p>
            דוא״ל: <a className="text-moss underline" href={`mailto:${email}`}>{email}</a>
            {phone ? <><br />טלפון: <a className="text-moss underline" href={`tel:${phone}`} dir="ltr">{phone}</a></> : null}
          </p>
        </Section>

        <p className="mt-8 text-xs text-ink/40">עודכן לאחרונה בעת הקמת האתר. ייתכנו עדכונים מעת לעת.</p>
      </div>
    </div>
  );
}
