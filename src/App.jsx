import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  Video,
  LineChart,
  Wrench,
  Truck,
  X,
} from 'lucide-react';
import MountHologram from './MountHologram.jsx';

/* Price anchor reused across hero + sticky bar */
const PRICE_ANCHOR = 'פחות ממחיר של שעת מגרש – ונשאר איתך לתמיד!';

/* ------------------------------------------------------------------ */
/*  Shared motion presets                                             */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700"></span>
        COURTSNAP
      </div>
      <motion.a
        href="#buy"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-full bg-emerald-800 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900"
      >
        הזמן עכשיו
      </motion.a>
    </div>
  </header>
);

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

const Hero = () => (
  <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 lg:grid-cols-2">
    {/* Copy + buy */}
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800">
        <Zap size={14} /> תוכן, טכניקה וסוף לויכוחים על הקווים
      </div>

      <h1 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
        צלם כל נקודה.
        <br />
        <span className="text-emerald-800">שדרג את המשחק, את התוכן ואת הטכניקה.</span>
      </h1>

      <p className="text-lg leading-relaxed text-slate-600">
        תושבת חכמה שמתלבשת בשניות על רשת המגרש ונותנת לך זווית צילום מושלמת: מפיקים
        סרטונים מרשימים ל-Reels ול-TikTok, מנתחים ומשפרים את הטכניקה שלכם — וכשיש
        ספק אם הכדור היה בפנים או בחוץ, פשוט מריצים אחורה עם "עין הנץ" וסוגרים את הויכוח.
      </p>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-black text-slate-900">₪89</div>
          <div className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            משלוח מהיר לנקודת איסוף / לוקר כלול
          </div>
        </div>
        <p className="text-sm font-semibold text-emerald-800">{PRICE_ANCHOR}</p>
      </div>

      <div className="pt-2">
        <motion.a
          id="buy"
          href="#checkout"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-800 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/10 transition-colors hover:bg-emerald-900 lg:w-auto"
        >
          לרכישה מהירה <ArrowLeft size={20} />
        </motion.a>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-700" /> מתאים לכל סוגי הטלפונים
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-emerald-700" /> התקנה בשניות על הרשת
        </div>
      </div>
    </motion.div>

    {/* 3D viewer */}
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="relative flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-inner"
    >
      <div className="absolute right-4 top-4 z-10 rounded-full border border-emerald-100 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
        הולוגרמה תלת-ממדית
      </div>

      {/* Procedural holographic 3D model of the COURTSNAP fence clip. */}
      <MountHologram />

      <span className="mt-2 text-xs text-slate-400">סיבוב אוטומטי · דגם תלת-ממד של התושבת</span>
    </motion.div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  Features                                                          */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Video,
    title: 'יצירת תוכן לרשתות',
    desc: 'מצלמים בזווית גבוהה ויציבה סרטונים שנראים מקצועי — מוכנים ישר ל-Reels, ל-TikTok ולסטוריז.',
  },
  {
    icon: Eye,
    title: 'עין הנץ – סוף לויכוחים',
    desc: 'הכדור היה בפנים או בחוץ? במקום לריב על קווים, מריצים אחורה את ההקלטה ורואים בדיוק איפה נחת הכדור.',
  },
  {
    icon: LineChart,
    title: 'ניתוח ושיפור טכניקה',
    desc: 'צופים במשחק מהצד, מזהים טעויות בתנועה ובחבטה ומשפרים את הטכניקה מנקודה לנקודה.',
  },
  {
    icon: Wrench,
    title: 'התקנה מהירה ויציבות',
    desc: 'אחיזה קשיחה שמתלבשת על הרשת בשניות ושומרת על זווית צילום יציבה גם בזמן ראלי אינטנסיבי.',
  },
];

const Features = () => (
  <section className="border-y border-slate-100 bg-slate-50 py-16">
    <div className="mx-auto max-w-6xl px-4">
      <Reveal>
        <h2 className="mb-12 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
          למה שחקני פאדל וטניס חייבים את זה בתיק?
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="h-full space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <f.icon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: 'האם זה מתאים גם לפאדל וגם לטניס?',
    a: 'בהחלט. התושבת מתוכננת להתלבש על רשת הברזל של מגרשי פאדל ומגרשי טניס כאחד, ומספקת זווית צילום גבוהה ואידיאלית בשני המשחקים.',
  },
  {
    q: 'איך זה עוזר בויכוחים על הקווים?',
    a: 'המצלמה מתעדת את המשחק מזווית גבוהה ויציבה. כשיש ספק אם הכדור היה בפנים או בחוץ — פשוט מריצים את ההקלטה אחורה ורואים איפה נחת הכדור. פחות ויכוחים, יותר משחק.',
  },
  {
    q: 'תוך כמה זמן המשלוח מגיע?',
    a: 'המשלוח נשלח לנקודת האיסוף או הלוקר הקרובים לביתך ומגיע תוך 7–12 ימי עסקים, עם מספר מעקב מלא.',
  },
  {
    q: 'האם הטלפון יכול ליפול מפגיעת כדור?',
    a: 'התושבת בנויה מאחיזה קשיחה המיועדת להתלבש על הרשת, אך השימוש בה ובטיחות המכשיר הם באחריות המשתמש בלבד.',
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-6 py-4 text-right font-semibold text-slate-800 transition-colors hover:bg-slate-50"
    >
      <span>{item.q}</span>
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <ChevronDown size={18} className={isOpen ? 'text-emerald-700' : 'text-slate-400'} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <p className="border-t border-slate-100 px-6 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
            {item.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Reveal>
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
          שאלות נפוצות
        </h2>
      </Reveal>
      <div className="space-y-4">
        {faqs.map((item, i) => (
          <Reveal key={item.q} delay={i * 0.06}>
            <FaqItem
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Terms & Conditions modal                                         */
/* ------------------------------------------------------------------ */

const TermsModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-700 shadow-2xl sm:p-8"
          dir="rtl"
        >
          <button
            onClick={onClose}
            className="absolute left-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="סגור"
          >
            <X size={20} />
          </button>

          <h3 className="mb-5 text-2xl font-bold text-slate-900">תקנון ותנאי שימוש</h3>

          <div className="space-y-5 text-sm leading-relaxed">
            <div>
              <h4 className="mb-1.5 font-bold text-slate-900">1. הגבלת אחריות</h4>
              <p>
                החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה,
                נזק למכשיר הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה
                מהשימוש במוצר. השימוש במוצר, ברשת ובסביבת המגרש הינו באחריות המלאה של
                המשתמש בלבד.
              </p>
            </div>

            <div>
              <h4 className="mb-1.5 font-bold text-slate-900">2. שימוש נכון במוצר</h4>
              <p>
                על המשתמש לוודא כי המוצר מותקן כראוי ומאובטח לפני כל שימוש, ולפעול בזהירות
                בהתאם לתנאי המגרש. אין להשאיר את המכשיר ללא השגחה ואין להשתמש במוצר באופן
                החורג מייעודו.
              </p>
            </div>

            <div>
              <h4 className="mb-1.5 font-bold text-slate-900">3. ביטול עסקה</h4>
              <p>
                בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ניתן לבטל את העסקה תוך 14 ימים מיום
                קבלת המוצר, ובלבד שהמוצר מוחזר באריזתו המקורית ולא נעשה בו שימוש. החזר
                כספי יינתן בהתאם להוראות החוק.
              </p>
            </div>

            <div>
              <h4 className="mb-1.5 font-bold text-slate-900">4. משלוחים</h4>
              <p>
                אספקת המוצר מתבצעת לנקודת איסוף/לוקר תוך 7–12 ימי עסקים ממועד ביצוע ההזמנה,
                בכפוף לזמינות מלאי ולתנאי חברת השילוח.
              </p>
            </div>

            <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
              האמור לעיל אינו מהווה ייעוץ משפטי. מומלץ להתאים את התקנון לפעילות העסק בפועל
              בליווי עורך/ת דין.
            </p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

const Footer = ({ onOpenTerms }) => (
  <footer className="border-t border-slate-800 bg-slate-900 py-10 text-sm text-slate-400">
    <div className="mx-auto max-w-4xl space-y-5 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-lg font-bold tracking-wider text-white">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        COURTSNAP
      </div>
      <p className="flex items-center justify-center gap-1.5">
        <Truck size={14} /> הכלי המושלם לתיעוד משחקי פאדל וטניס בישראל.
      </p>

      {/* Legal disclaimer */}
      <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-500">
        החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה, נזק
        למכשיר הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה מהשימוש במוצר.
        השימוש במוצר, ברשת ובסביבת המגרש הינו באחריות המלאה של המשתמש בלבד. ביטול
        עסקה בהתאם לחוק הגנת הצרכן, התשמ"א-1981 — תוך 14 ימים מקבלת המוצר, באריזתו
        המקורית וללא שימוש.
      </p>

      <div className="flex items-center justify-center gap-4 text-xs">
        <button
          onClick={onOpenTerms}
          className="font-medium text-emerald-400 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline"
        >
          תקנון ותנאי שימוש
        </button>
      </div>

      <div className="pt-2 text-xs text-slate-600">© 2026 COURTSNAP · כל הזכויות שמורות.</div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/*  Sticky mobile buy bar                                             */
/* ------------------------------------------------------------------ */

const StickyBar = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-right">
              <div className="text-xl font-black text-slate-900">₪89</div>
              <div className="text-[11px] font-medium leading-tight text-emerald-700">
                פחות מעלות שעת מגרש
              </div>
            </div>
            <motion.a
              href="#buy"
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/10"
            >
              הזמן עכשיו <ArrowLeft size={18} />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-700 selection:text-white"
    >
      <Header />
      <main className="pb-24 lg:pb-0">
        <Hero />
        <Features />
        <Faq />
      </main>
      <Footer onOpenTerms={() => setTermsOpen(true)} />
      <StickyBar />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
