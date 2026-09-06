import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  Layers,
  Activity,
  Package,
  Truck,
} from 'lucide-react';
import MountHologram from './MountHologram.jsx';

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
        <Zap size={14} /> נגמרו הויכוחים על הקווים
      </div>

      <h1 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
        אין יותר "בפנים או בחוץ".
        <br />
        <span className="text-emerald-800">עין הנץ שלך בכל משחק פאדל וטניס.</span>
      </h1>

      <p className="text-lg leading-relaxed text-slate-600">
        תושבת חכמה שמתלבשת בשניות על רשת המגרש, שומרת על יציבות מוחלטת גם בראלי
        אינטנסיבי, ומצלמת וידאו ברור שסוגר כל ויכוח על קו — פשוט מריצים אחורה
        ורואים בדיוק איפה נחת הכדור.
      </p>

      <div className="flex items-center gap-4 pt-2">
        <div className="text-3xl font-black text-slate-900">₪89</div>
        <div className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          משלוח מהיר לנקודת איסוף / לוקר כלול
        </div>
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
    icon: Eye,
    title: 'נגמרו הויכוחים (עין הנץ)',
    desc: 'הכדור היה בפנים או בחוץ? במקום לריב על קווים, פשוט מציצים בהקלטה וסוגרים עניין.',
  },
  {
    icon: Layers,
    title: 'מותאם לפאדל וטניס',
    desc: 'מתלבש באופן מושלם על רשת הברזל בשני העולמות ומעניק זווית צילום בגובה האידיאלי.',
  },
  {
    icon: Activity,
    title: 'יציבות בזמן ראלי',
    desc: 'מבנה קשיח שבנוי לספוג פגיעות כדורים ולשמור על הטלפון יציב לחלוטין בלי רעידות.',
  },
  {
    icon: Package,
    title: 'קומפקטי וקל משקל',
    desc: 'נכנס בקלות לכל תיק מחבט, נשלף בשניות ומוכן לעבודה מיד כשעולים למגרש.',
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
    a: 'המצלמה מתעדת את כל המשחק מזווית גבוהה ויציבה. כשיש ספק אם הכדור היה בפנים או בחוץ — פשוט מריצים את ההקלטה אחורה ורואים בדיוק איפה נחת הכדור. סוף לויכוחים.',
  },
  {
    q: 'תוך כמה זמן המשלוח מגיע?',
    a: 'המשלוח נשלח לנקודת האיסוף או הלוקר הקרובים לביתך ומגיע תוך 7–12 ימי עסקים, עם מספר מעקב מלא.',
  },
  {
    q: 'האם הטלפון יכול ליפול מפגיעת כדור?',
    a: 'לא. המבנה הקשיח ומנגנון האחיזה המחוזק תוכננו במיוחד לספוג פגיעות כדורים ולשמור על הטלפון נעול ויציב במקומו.',
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
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

const Footer = () => (
  <footer className="border-t border-slate-800 bg-slate-900 py-10 text-center text-sm text-slate-400">
    <div className="mx-auto max-w-6xl space-y-3 px-4">
      <div className="flex items-center justify-center gap-2 text-lg font-bold tracking-wider text-white">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        COURTSNAP
      </div>
      <p className="flex items-center justify-center gap-1.5">
        <Truck size={14} /> הכלי המושלם לתיעוד משחקי פאדל וטניס בישראל.
      </p>
      <div className="pt-4 text-xs text-slate-600">© 2026 COURTSNAP · כל הזכויות שמורות.</div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-700 selection:text-white"
    >
      <Header />
      <main>
        <Hero />
        <Features />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
