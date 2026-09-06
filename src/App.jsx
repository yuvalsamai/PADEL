import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Plus, X } from 'lucide-react';
import MountViewer from './MountViewer.jsx';

const PRICE_ANCHOR = 'פחות ממחיר של שעת מגרש — ונשאר איתך לתמיד.';

/* ================================================================== */
/*  Small primitives                                                  */
/* ================================================================== */

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Eyebrow = ({ children, className = '' }) => (
  <span className={`eyebrow text-moss ${className}`}>{children}</span>
);

/* ================================================================== */
/*  Header                                                            */
/* ================================================================== */

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-ink/10 bg-bone/85 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
      <a href="#top" className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-medium tracking-[0.2em] text-ink">
          COURTSNAP
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-ball ring-1 ring-ink/20" />
      </a>
      <motion.a
        href="#buy"
        whileHover={{ y: -1 }}
        whileTap={{ y: 0 }}
        className="group inline-flex items-center gap-2 border border-ink px-4 py-2 font-mono text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-bone"
      >
        הזמנה — ₪89
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
      </motion.a>
    </div>
  </header>
);

/* ================================================================== */
/*  Hawk-Eye line-call signature                                      */
/* ================================================================== */

const LineCall = ({ compact = false }) => (
  <div className={`relative ${compact ? 'h-40' : 'h-full min-h-[240px]'} w-full overflow-hidden`}>
    {/* baseline (horizontal) */}
    <motion.span
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      style={{ transformOrigin: 'right' }}
      className="absolute bottom-10 right-0 h-[2px] w-full bg-ink/70"
    />
    {/* sideline (vertical) */}
    <motion.span
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.15 }}
      style={{ transformOrigin: 'bottom' }}
      className="absolute bottom-10 right-24 h-full w-[2px] bg-ink/70 sm:right-40"
    />
    {/* ball mark — lands just inside the line */}
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 16 }}
      className="absolute bottom-[3.1rem] right-14 h-7 w-7 rounded-full bg-ball shadow-[0_6px_16px_rgba(0,0,0,0.18)] ring-1 ring-ink/30 sm:right-28"
    />
    {/* verdict stamp */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 1.15, duration: 0.5 }}
      className="absolute right-6 top-6 flex items-center gap-3 sm:right-10"
    >
      <span className="font-mono text-[0.6rem] tracking-[0.3em] text-moss">HAWK-EYE</span>
      <span className="font-serif text-3xl font-black leading-none text-ink sm:text-4xl">
        בפנים<span className="text-ball">.</span>
      </span>
    </motion.div>
  </div>
);

/* ================================================================== */
/*  Hero                                                              */
/* ================================================================== */

const Hero = () => (
  <section id="top" className="relative overflow-hidden">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-24">
      {/* Left — editorial copy */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-7"
      >
        <Eyebrow>תושבת צילום למגרש · פאדל &amp; טניס</Eyebrow>

        <h1 className="mt-6 font-serif text-[2.6rem] font-black leading-[1.04] text-ink sm:text-6xl lg:text-[4.2rem]">
          אין יותר
          <br />
          "בפנים או בחוץ".
          <br />
          <span className="text-moss">עין הנץ שלך</span> בכל נקודה.
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/70">
          תושבת שמתלבשת בשניות על רשת המגרש ומצלמת בזווית גבוהה ויציבה. מפיקים תוכן
          שנראה מקצועי ל‑Reels ול‑TikTok, מנתחים ומשפרים טכניקה — וכשיש ספק על קו,
          מריצים אחורה ורואים בדיוק איפה נחת הכדור.
        </p>

        {/* Price + buy */}
        <div className="mt-10 flex flex-col gap-5 border-t border-ink/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl font-black text-ink">₪89</span>
              <span className="font-mono text-xs tracking-wide text-stone">
                כולל משלוח ללוקר
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-snug text-moss">{PRICE_ANCHOR}</p>
          </div>

          <motion.a
            id="buy"
            href="#checkout"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="group inline-flex items-center justify-center gap-3 bg-ink px-8 py-4 font-mono text-sm tracking-wide text-bone shadow-[0_10px_30px_-10px_rgba(16,35,28,0.6)] transition-colors hover:bg-pine"
          >
            לרכישה מהירה
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </motion.a>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.7rem] tracking-wide text-stone">
          <span>— מתאים לכל הטלפונים</span>
          <span>— התקנה בשניות</span>
          <span>— 160 גרם</span>
        </div>
      </motion.div>

      {/* Right — product plinth with 3D + gallery placard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="lg:col-span-5"
      >
        <div className="relative flex h-full flex-col justify-between bg-court p-6 text-bone">
          <div className="flex items-center justify-between font-mono text-[0.62rem] tracking-[0.2em] text-bone/50">
            <span>MOUNT No.01</span>
            <span>360° VIEW</span>
          </div>

          <MountViewer />

          {/* gallery placard */}
          <div className="mt-2 flex items-end justify-between border-t border-bone/15 pt-4">
            <div>
              <div className="font-serif text-xl font-bold text-bone">COURTSNAP Mount</div>
              <div className="font-mono text-[0.62rem] tracking-wide text-bone/50">
                פולימר מחוזק · אחיזת רשת
              </div>
            </div>
            <span className="font-mono text-[0.62rem] tracking-wide text-ball">160g</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ================================================================== */
/*  Hawk-Eye band — the signature moment                             */
/* ================================================================== */

const HawkEyeBand = () => (
  <section className="bg-ink text-bone">
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
      <Reveal>
        <Eyebrow className="!text-ball/80">התיק שסוגר את הויכוח</Eyebrow>
        <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-bone sm:text-5xl">
          הכדור היה על הקו.
          <br />
          עכשיו יש הוכחה.
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-bone/70">
          במקום לריב על סנטימטרים, פשוט מריצים את ההקלטה אחורה. הזווית הגבוהה
          והיציבה של COURTSNAP הופכת כל נקודה שנויה במחלוקת להכרעה של שנייה.
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="relative aspect-[4/3] w-full bg-court/60 p-6">
          <LineCall />
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/*  Features — editorial ledger                                       */
/* ================================================================== */

const features = [
  {
    kicker: 'CONTENT',
    title: 'תוכן שנראה מקצועי',
    desc: 'זווית גבוהה ויציבה שמפיקה סרטונים מוכנים ל‑Reels, ל‑TikTok ולסטוריז — בלי צלם ובלי חצובה על הגדר.',
  },
  {
    kicker: 'HAWK-EYE',
    title: 'סוף לויכוחים על הקווים',
    desc: 'הכדור בפנים או בחוץ? מריצים אחורה את ההקלטה ורואים בדיוק איפה נחת. הכרעה, לא ויכוח.',
  },
  {
    kicker: 'TECHNIQUE',
    title: 'ניתוח ושיפור טכניקה',
    desc: 'צופים במשחק מהצד, מזהים טעויות בתנועה ובחבטה, ומשפרים את המשחק מנקודה לנקודה.',
  },
  {
    kicker: 'BUILD',
    title: 'התקנה מהירה ויציבות',
    desc: 'אחיזה קשיחה שמתלבשת על הרשת בשניות ושומרת על זווית צילום יציבה גם בזמן ראלי אינטנסיבי.',
  },
];

const Features = () => (
  <section className="bg-bone">
    <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal className="max-w-2xl">
        <Eyebrow>למה זה נכנס לתיק המחבט</Eyebrow>
        <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-ink sm:text-5xl">
          כלי אחד. שלוש סיבות להשתמש בו בכל משחק.
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 2) * 0.08}>
            <div
              className={`group flex gap-6 border-ink/12 py-10 md:px-8 ${
                i % 2 === 1 ? 'md:border-r' : ''
              } ${i < 2 ? 'border-b' : 'border-b md:border-b-0'}`}
            >
              <span className="mt-1 font-mono text-xs tracking-label text-moss">{f.kicker}</span>
              <div>
                <h3 className="font-serif text-2xl font-bold text-ink">{f.title}</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-ink/65">{f.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ================================================================== */
/*  FAQ                                                               */
/* ================================================================== */

const faqs = [
  {
    q: 'האם זה מתאים גם לפאדל וגם לטניס?',
    a: 'בהחלט. התושבת מתוכננת להתלבש על רשת הברזל של מגרשי פאדל ומגרשי טניס כאחד, ומספקת זווית צילום גבוהה ואידיאלית בשני המשחקים.',
  },
  {
    q: 'איך זה עוזר בויכוחים על הקווים?',
    a: 'המצלמה מתעדת את המשחק מזווית גבוהה ויציבה. כשיש ספק אם הכדור היה בפנים או בחוץ — מריצים את ההקלטה אחורה ורואים איפה נחת הכדור. פחות ויכוחים, יותר משחק.',
  },
  {
    q: 'תוך כמה זמן המשלוח מגיע?',
    a: 'המשלוח נשלח לנקודת האיסוף או הלוקר הקרובים לביתך ומגיע תוך 7–12 ימי עסקים, עם מספר מעקב מלא.',
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-ink/12">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-6 py-6 text-right transition-colors hover:text-moss"
    >
      <span className="font-serif text-xl font-bold text-ink sm:text-2xl">{item.q}</span>
      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
        <Plus size={22} className={isOpen ? 'text-moss' : 'text-stone'} strokeWidth={1.5} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="max-w-2xl pb-7 text-lg leading-relaxed text-ink/65">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-bone2">
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <Reveal>
          <Eyebrow>שאלות נפוצות</Eyebrow>
          <h2 className="mb-10 mt-5 font-serif text-4xl font-black text-ink sm:text-5xl">
            כל מה שרציתם לדעת.
          </h2>
        </Reveal>
        <div>
          {faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================== */
/*  Terms modal                                                       */
/* ================================================================== */

const TermsModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-chalk p-7 text-ink/80 shadow-2xl sm:p-9"
        >
          <button
            onClick={onClose}
            className="absolute left-5 top-5 text-stone transition-colors hover:text-ink"
            aria-label="סגור"
          >
            <X size={22} />
          </button>
          <Eyebrow>COURTSNAP</Eyebrow>
          <h3 className="mb-6 mt-3 font-serif text-3xl font-black text-ink">תקנון ותנאי שימוש</h3>
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h4 className="mb-1.5 font-mono text-xs tracking-label text-moss">01 · הגבלת אחריות</h4>
              <p>
                החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה, נזק
                למכשיר הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה מהשימוש במוצר.
                השימוש במוצר, ברשת ובסביבת המגרש הינו באחריות המלאה של המשתמש בלבד.
              </p>
            </section>
            <section>
              <h4 className="mb-1.5 font-mono text-xs tracking-label text-moss">02 · שימוש נכון</h4>
              <p>
                על המשתמש לוודא כי המוצר מותקן כראוי ומאובטח לפני כל שימוש, ולפעול בזהירות
                בהתאם לתנאי המגרש. אין להשאיר את המכשיר ללא השגחה ואין להשתמש במוצר באופן
                החורג מייעודו.
              </p>
            </section>
            <section>
              <h4 className="mb-1.5 font-mono text-xs tracking-label text-moss">03 · ביטול עסקה</h4>
              <p>
                בהתאם לחוק הגנת הצרכן, התשמ"א‑1981, ניתן לבטל את העסקה תוך 14 ימים מיום קבלת
                המוצר, ובלבד שהמוצר מוחזר באריזתו המקורית ולא נעשה בו שימוש. החזר כספי יינתן
                בהתאם להוראות החוק.
              </p>
            </section>
            <section>
              <h4 className="mb-1.5 font-mono text-xs tracking-label text-moss">04 · משלוחים</h4>
              <p>
                אספקת המוצר מתבצעת לנקודת איסוף/לוקר תוך 7–12 ימי עסקים ממועד ביצוע ההזמנה,
                בכפוף לזמינות מלאי ולתנאי חברת השילוח.
              </p>
            </section>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ================================================================== */
/*  Footer                                                            */
/* ================================================================== */

const Footer = ({ onOpenTerms }) => (
  <footer className="bg-court text-bone">
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="flex flex-col gap-8 border-b border-bone/15 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm tracking-[0.2em]">COURTSNAP</span>
            <span className="h-1.5 w-1.5 rounded-full bg-ball" />
          </div>
          <p className="mt-3 max-w-sm font-serif text-2xl font-bold leading-snug text-bone">
            עין הנץ שלך על המגרש.
          </p>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs tracking-wide">
          <button
            onClick={onOpenTerms}
            className="text-ball underline-offset-4 transition-colors hover:underline"
          >
            תקנון ותנאי שימוש
          </button>
          <a href="#top" className="text-bone/60 transition-colors hover:text-bone">
            חזרה למעלה ↑
          </a>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-bone/50">
        החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה, נזק למכשיר
        הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה מהשימוש במוצר. השימוש במוצר,
        ברשת ובסביבת המגרש הינו באחריות המלאה של המשתמש בלבד. ביטול עסקה בהתאם לחוק הגנת
        הצרכן, התשמ"א‑1981 — תוך 14 ימים מקבלת המוצר, באריזתו המקורית וללא שימוש.
      </p>
      <div className="mt-6 font-mono text-[0.62rem] tracking-wide text-bone/40">
        © 2026 COURTSNAP · כל הזכויות שמורות
      </div>
    </div>
  </footer>
);

/* ================================================================== */
/*  Sticky mobile buy bar                                             */
/* ================================================================== */

const StickyBar = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
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
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-ink/10 bg-bone/95 px-4 py-3 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 text-right">
              <div className="font-serif text-2xl font-black leading-none text-ink">₪89</div>
              <div className="mt-1 font-mono text-[0.6rem] tracking-wide text-moss">
                פחות מעלות שעת מגרש
              </div>
            </div>
            <motion.a
              href="#buy"
              whileTap={{ scale: 0.98 }}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-3.5 font-mono text-sm tracking-wide text-bone"
            >
              הזמן עכשיו <ArrowLeft size={16} />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ================================================================== */
/*  App                                                               */
/* ================================================================== */

export default function App() {
  const [termsOpen, setTermsOpen] = useState(false);
  return (
    <div dir="rtl" className="min-h-screen bg-bone font-sans text-ink">
      <Header />
      <main className="pb-24 lg:pb-0">
        <Hero />
        <HawkEyeBand />
        <Features />
        <Faq />
      </main>
      <Footer onOpenTerms={() => setTermsOpen(true)} />
      <StickyBar />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
