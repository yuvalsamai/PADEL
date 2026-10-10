import React from 'react';
import { LegalLayout, Section } from './legal/LegalLayout.jsx';
import { BUSINESS } from './lib/business.js';

/* Accessibility statement (/accessibility) — regulation 35 of the Equal Rights
   for Persons with Disabilities (Service Accessibility Adjustments) Regulations
   2013 and Israeli Standard 5568. Keep the "known limitations" list honest. */
export default function AccessibilityStatement() {
  const b = BUSINESS;
  return (
    <LegalLayout title="הצהרת נגישות">
      <Section h="מחויבות לנגישות">
        <p>
          {b.brand} רואה חשיבות במתן שירות שוויוני לכלל הלקוחות, לרבות אנשים עם מוגבלות. האתר הונגש בהתאם לתקנות
          שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן הישראלי ת״י 5568 המבוסס על
          הנחיות WCAG 2.0 ברמה AA, ככל שהדבר אפשרי.
        </p>
      </Section>

      <Section h="מה עשינו באתר">
        <ul className="list-disc space-y-1 pr-5">
          <li>האתר בעברית ומוגדר כימין-לשמאל, עם מבנה כותרות היררכי ותגיות סמנטיות.</li>
          <li>קישור ״דלג לתוכן הראשי״ בראש כל עמוד.</li>
          <li>ניווט מלא במקלדת, כולל סימון מיקוד נראה; חלונות קופצים נסגרים במקש Esc.</li>
          <li>טקסט חלופי לתמונות, ותוויות לכל שדות הטפסים והכפתורים.</li>
          <li>הודעות שגיאה בטפסים מוקראות על ידי קוראי מסך.</li>
          <li>ניגודיות צבעים מותאמת לטקסט.</li>
          <li>אפשרות לעצור את הסרטון בעמוד הבית; אנימציות מושבתות כשהמכשיר מוגדר ל״הפחתת תנועה״.</li>
          <li>האתר מותאם לתצוגה בטלפון, בטאבלט ובמחשב, ולהגדלת טקסט עד 200%.</li>
          <li>
            תפריט נגישות (הכפתור בפינת המסך): הגדלת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, גופן קריא,
            סמן מוגדל ועצירת אנימציות.
          </li>
        </ul>
        <p>האתר נבדק בדפדפנים Chrome, Safari ו-Edge העדכניים.</p>
      </Section>

      <Section h="רכיבים שאינם בשליטתנו">
        <ul className="list-disc space-y-1 pr-5">
          <li>דף התשלום מסופק על ידי חברת הסליקה Hyp ומוצג בתוך האתר; נגישותו באחריות החברה.</li>
          <li>הצעות הכתובת בטופס ההזמנה מגיעות מ-Google; ניתן תמיד להזין כתובת ידנית.</li>
          <li>הסרטון בעמוד הבית הוא סרטון המחשה ללא דיבור.</li>
        </ul>
        <p>אם נתקלתם בקושי באחד מהרכיבים — פנו אלינו ונשלים את ההזמנה עבורכם בטלפון או בדוא״ל.</p>
      </Section>

      <Section h="פניות בנושא נגישות">
        <p>נתקלתם בבעיה? נשמח לשמוע ולתקן. נא לפרט את העמוד, את הבעיה ואת הדפדפן/טכנולוגיה המסייעת שבה השתמשתם.</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl bg-chalk p-5 ring-1 ring-ink/10">
          {b.a11yContactName ? (<><dt className="font-semibold">רכז/ת נגישות:</dt><dd>{b.a11yContactName}</dd></>) : null}
          {b.phone ? (<><dt className="font-semibold">טלפון:</dt><dd><a href={`tel:${b.phone}`} dir="ltr" className="underline">{b.phone}</a></dd></>) : null}
          <dt className="font-semibold">דוא״ל:</dt>
          <dd><a href={`mailto:${b.email}`} dir="ltr" className="underline">{b.email}</a></dd>
          {b.address ? (<><dt className="font-semibold">כתובת:</dt><dd>{b.address}</dd></>) : null}
        </dl>
      </Section>
    </LegalLayout>
  );
}
