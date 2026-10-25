import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ArrowUpLeft, Plus, X, Menu, Instagram, Pause, Play } from 'lucide-react';
import Logo from './Logo.jsx';
import { openConsentSettings } from './lib/consent.js';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from './lib/business.js';

/* Hero background photo (public/hero.webp);
   a court-toned gradient shows behind it while it loads. */
const HERO_IMG = '/hero.webp';
/* Optional hero video — shown in the product column; falls back to the spinning
   product photo if it can't load. Keep the file small (ideally < 8MB) so it
   doesn't slow the page. */
const HERO_VIDEO = '/netcam-hero.mp4';
const HERO_POSTER = '/netcam-hero-poster.webp';

/* Trust badges — reused on the landing page and (compact) on checkout. */
export const TRUST_ITEMS = [
  { icon: '🔒', label: 'תשלום מאובטח · Hyp' },
  { icon: '🚚', label: 'משלוח חינם עד הדלת' },
];

/* ================================================================== */
/*  Primitives                                                       */
/* ================================================================== */

const Eyebrow = ({ children, className = '' }) => (
  <span className={`text-xs font-medium uppercase tracking-[0.18em] ${className}`}>{children}</span>
);

/* ================================================================== */
/*  Nav                                                               */
/* ================================================================== */

const navLinks = [
  { label: 'בית', href: '#top' },
  { label: 'איך זה עובד', href: '#how' },
  { label: 'שאלות', href: '#faq' },
];

const Nav = () => {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <header className="relative flex w-full items-center justify-between gap-3 border-b border-white/30 bg-bone/90 px-4 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-8 sm:py-2.5 lg:px-10">
      <a href="#top" aria-label="NETCAM" className="inline-flex items-center">
        <Logo className="h-11 sm:h-14 lg:h-16" />
      </a>

      {/* desktop pill */}
      <nav aria-label="ניווט ראשי" className="hidden items-center gap-1 md:flex">
        {navLinks.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === 0 ? 'bg-ball text-ink' : 'text-ink/70 hover:text-ink'
            }`}
          >
            {l.label}
          </a>
        ))}
        <a
          href="/pay"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-court"
        >
          הזמנה ₪89
        </a>
      </nav>

      {/* mobile */}
      <button
        onClick={() => setOpenMenu((v) => !v)}
        className="rounded-full border border-ink/15 bg-ink/5 p-2.5 text-ink md:hidden"
        aria-label="תפריט"
        aria-expanded={openMenu}
        aria-controls="mobile-menu"
      >
        {openMenu ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {openMenu && (
          <motion.nav
            id="mobile-menu"
            aria-label="ניווט ראשי"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-full z-30 mt-2 flex flex-col gap-1 rounded-3xl border border-white/15 bg-court/95 p-3 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpenMenu(false)}
                className="rounded-2xl px-4 py-3 text-bone/90 hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <a href="/pay" onClick={() => setOpenMenu(false)} className="rounded-2xl bg-ball px-4 py-3 text-center font-semibold text-ink">
              הזמנה ₪89
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ================================================================== */
/*  Hero — the whole pitch on the first phone screen                  */
/* ================================================================== */

/* Hero video. Falls back to a STATIC product image if it can't load. */
const HeroMedia = ({ className = '' }) => {
  const [ok, setOk] = useState(true);
  // Moving content needs a pause control (WCAG 2.2.2). Start paused when the
  // visitor prefers reduced motion or turned animations off in the a11y menu.
  const videoRef = React.useRef(null);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('acc-no-animations');
    if (reduce) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, []);
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink shadow-2xl ring-1 ring-white/15 lg:rounded-3xl ${className}`} style={{ aspectRatio: '9 / 16' }}>
      {ok ? (
        <>
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="סרטון המחשה: תושבת NETCAM על רשת המגרש מצלמת משחק"
            onError={() => setOk(false)}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'עצירת הסרטון' : 'הפעלת הסרטון'}
            className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-bone backdrop-blur hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ball"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </>
      ) : (
        <img src="/product.webp" alt="תושבת NETCAM" className="h-full w-full object-cover" />
      )}
    </div>
  );
};

const BULLETS = [
  { icon: '📱', text: 'מתאים לכל טלפון' },
  { icon: '⚡', text: 'מתלבש על הרשת בשניות' },
  { icon: '🎾', text: 'פאדל וטניס' },
  { icon: '🏆', text: 'מכריע כל ויכוח על קו' },
];

const Hero = () => (
  <section id="top" className="relative isolate overflow-hidden">
    <div
      className="absolute inset-0 -z-10 bg-court"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(17,24,19,0.72) 0%, rgba(17,24,19,0.6) 50%, rgba(17,24,19,0.85) 100%), url(${HERO_IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    <Nav />

    {/* Phone: title / bullets + video side by side / price + CTA.
        Desktop: text column + tall video column. */}
    <div
      id="main"
      tabIndex={-1}
      className="mx-auto grid max-w-6xl grid-cols-[1fr_minmax(0,36%)] items-center gap-x-4 gap-y-4 px-4 pb-6 pt-4 outline-none sm:px-8 lg:grid-cols-[1fr_340px] lg:gap-x-12 lg:gap-y-6 lg:py-14"
    >
      <div className="col-span-2 lg:col-span-1">
        <Eyebrow className="text-bone/80">תושבת צילום לרשת · NETCAM</Eyebrow>
        <h1 className="mt-2 font-display text-[2.35rem] font-black leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
          צלם כל נקודה.
          <br />
          שחק חכם יותר.
        </h1>
      </div>

      <ul className="flex flex-col gap-2.5 self-center text-[15px] font-semibold text-bone sm:text-lg lg:col-start-1 lg:gap-3">
        {BULLETS.map((b) => (
          <li key={b.text} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg sm:text-xl">{b.icon}</span>
            {b.text}
          </li>
        ))}
      </ul>

      <HeroMedia className="w-full lg:col-start-2 lg:row-span-4 lg:row-start-1" />

      <div className="col-span-2 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md lg:col-span-1 lg:max-w-md lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-bone/60 line-through">₪119.90</span>
            <span className="font-display text-3xl font-black text-ball">₪89</span>
          </div>
          <span className="rounded-full bg-ball px-3 py-1 text-sm font-black text-ink">2 ב-₪149</span>
        </div>
        <a
          href="/pay"
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ball py-3.5 text-lg font-black text-ink shadow-lg shadow-ball/20 transition-transform hover:scale-[1.02]"
        >
          להזמנה
          <ArrowUpLeft size={20} strokeWidth={2.75} className="transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <p className="mt-2.5 text-center text-xs font-medium text-bone/80">
          🚚 משלוח חינם עד הדלת · 7–12 ימי עסקים · 🔒 תשלום מאובטח
        </p>
      </div>
    </div>
  </section>
);

/* ================================================================== */
/*  Why + how — one short section                                     */
/* ================================================================== */

const steps = [
  { n: '1', title: 'מחברים', desc: 'מלבישים את NETCAM על הרשת.' },
  { n: '2', title: 'מצלמים', desc: 'מכניסים את הטלפון ולוחצים הקלטה.' },
  { n: '3', title: 'משחקים', desc: 'ויש מחלוקת? מריצים אחורה ורואים.' },
];

const HowItWorks = () => (
  <section id="how" className="bg-bone px-4 py-10 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <h2 className="font-display text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
        שלושה צעדים. פחות מדקה.
      </h2>
      <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((s) => (
          <li key={s.n} className="rounded-2xl bg-chalk p-3 ring-1 ring-ink/5 sm:p-5">
            <span className="font-display text-3xl font-black leading-none text-moss sm:text-4xl">{s.n}</span>
            <h3 className="mt-2 font-display text-base font-bold text-ink sm:text-xl">{s.title}</h3>
            <p className="mt-1 text-xs leading-snug text-ink/60 sm:text-sm">{s.desc}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-ink/5 sm:rounded-3xl">
        <img
          src="/STUND.webp"
          loading="lazy"
          decoding="async"
          alt="תושבת NETCAM ננעלת על עמוד הרשת ומחזיקה את הטלפון"
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
    </div>
  </section>
);

/* ================================================================== */
/*  FAQ                                                               */
/* ================================================================== */

const faqs = [
  {
    q: 'לאיזה טלפון זה מתאים?',
    a: 'התאמה אוניברסלית: המתקן מתאים למגוון רחב של סמארטפונים, לצילום חי או לתיעוד אימונים.',
  },
  {
    q: 'האם זה מתאים גם לפאדל וגם לטניס?',
    a: 'כן. התושבת מתלבשת על רשת מגרשי פאדל וטניס כאחד ונותנת זווית צילום גבוהה ויציבה בשניהם.',
  },
  {
    q: 'תוך כמה זמן המשלוח מגיע?',
    a: 'המשלוח חינם עד הדלת ומגיע תוך 7–12 ימי עסקים, עם מספר מעקב.',
  },
  {
    q: 'ממה עשוי המתקן?',
    a: 'המתקן מיוצר מ‑PLA 100% — חומר עמיד וחזק שמתאים לשימוש בכל מזג אוויר.',
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="overflow-hidden rounded-2xl bg-chalk ring-1 ring-ink/5">
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-right sm:px-6 sm:py-4"
    >
      <span className="font-display text-base font-bold text-ink sm:text-lg">{item.q}</span>
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ball/70"
      >
        <Plus size={16} className="text-ink" strokeWidth={2.5} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="px-4 pb-4 text-sm leading-relaxed text-ink/70 sm:px-6">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" className="bg-bone2 px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">שאלות נפוצות</h2>
        <div className="mt-5 space-y-2">
          {faqs.map((item, i) => (
            <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-center text-sm font-semibold text-bone hover:bg-court"
        >
          <Instagram size={18} className="text-ball" />
          יש לכם שאלה? כתבו לנו באינסטגרם
          <span dir="ltr" className="font-bold text-ball">{INSTAGRAM_HANDLE}</span>
        </a>
      </div>
    </section>
  );
};

/* ================================================================== */
/*  Closing offer                                                     */
/* ================================================================== */

const FinalCta = () => (
  <section className="bg-court px-4 py-10 text-center sm:px-8 sm:py-14">
    <h2 className="font-display text-3xl font-black leading-tight text-bone sm:text-5xl">
      הכדור היה על הקו?
      <br />
      <span className="text-ball">עכשיו יש הוכחה.</span>
    </h2>
    <a
      href="/pay"
      className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 rounded-full bg-ball py-3.5 text-lg font-black text-ink hover:bg-white"
    >
      להזמנה · 2 ב-₪149 <ArrowUpLeft size={20} strokeWidth={2.75} />
    </a>
    <p className="mt-2.5 text-xs text-bone/70">או יחידה אחת ב-₪89 · משלוח חינם עד הדלת</p>
  </section>
);

/* ================================================================== */
/*  Footer                                                            */
/* ================================================================== */

const Footer = () => (
  <footer className="bg-ink px-5 py-16 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-2xl bg-bone px-4 py-3">
            <Logo className="h-20" />
          </span>

          <p className="mt-3 max-w-sm text-lg text-bone/70">
            המשחק שלך במצלמה. צלם, נתח והכרע.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-bone/80 transition-colors hover:border-ball hover:text-ball"
          >
            <Instagram size={18} />
            <span>יש לכם שאלה? דברו איתנו באינסטגרם</span>
            <span dir="ltr" className="font-semibold">{INSTAGRAM_HANDLE}</span>
          </a>
        </div>
        <nav aria-label="מידע משפטי" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <a href="/terms" className="font-medium text-ball underline-offset-4 hover:underline">תקנון ותנאי רכישה</a>
          <a href="/cancel" className="rounded-full border border-ball px-4 py-1.5 font-semibold text-ball hover:bg-ball hover:text-ink">ביטול עסקה</a>
          <a href="/privacy" className="font-medium text-ball underline-offset-4 hover:underline">מדיניות פרטיות</a>
          <a href="/accessibility" className="font-medium text-ball underline-offset-4 hover:underline">הצהרת נגישות</a>
          <button type="button" onClick={openConsentSettings} className="font-medium text-ball underline-offset-4 hover:underline">הגדרות עוגיות</button>
          <a href="#top" className="text-bone/70 hover:text-bone">חזרה למעלה ↑</a>
        </nav>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-bone/70">
        יש להתקין את המוצר לפי הוראות השימוש ולוודא שהוא נעול היטב על הרשת לפני כל שימוש. השימוש באתר ובמוצר
        כפוף ל<a href="/terms" className="underline">תקנון</a>.
      </p>
      <div className="mt-6 text-xs text-bone/70">© 2026 NETCAM · כל הזכויות שמורות</div>
    </div>
  </footer>
);

/* ================================================================== */
/*  Sticky mobile buy bar                                             */
/* ================================================================== */

const StickyBar = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 420;
      setShow(window.scrollY > 560 && !nearBottom);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <React.Fragment>
          {/* Mobile: full-width bottom bar */}
          <motion.div
            key="mobile-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-3 bottom-3 z-[70] rounded-full border border-white/10 bg-ink/95 px-3 py-2.5 backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 pr-2 text-right">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-bone/50 line-through">₪119.90</span>
                  <span className="font-display text-lg font-black leading-none text-bone">₪89</span>
                </div>
                <div className="mt-0.5 text-[0.6rem] text-ball">מחיר מבצע · משלוח חינם עד הדלת</div>
              </div>
              <motion.a
                href="/pay"
                whileTap={{ scale: 0.98 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ball py-3 text-sm font-bold text-ink"
              >
                להזמנה · ₪89 <ArrowUpLeft size={16} strokeWidth={2.5} />
              </motion.a>
            </div>
          </motion.div>

          {/* Desktop: floating purchase card, bottom-left */}
          <motion.div
            key="desktop-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            dir="rtl"
            className="fixed bottom-6 left-6 z-[70] hidden w-72 rounded-3xl border border-white/10 bg-ink/95 p-5 shadow-2xl backdrop-blur-md lg:block"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-ball">🎾 תושבת NETCAM</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm text-bone/50 line-through">₪119.90</span>
              <span className="font-display text-3xl font-black leading-none text-bone">₪89</span>
            </div>
            <div className="mt-1 text-xs text-bone/70">מחיר מבצע · משלוח חינם עד הדלת</div>
            <a
              href="/pay"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ball py-3 font-bold text-ink transition-colors hover:bg-white"
            >
              להזמנה · ₪89 <ArrowUpLeft size={18} strokeWidth={2.5} />
            </a>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

/* ================================================================== */
/*  App                                                               */
/* ================================================================== */

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <div dir="rtl" className="min-h-screen bg-olive p-2.5 font-sans text-ink sm:p-4">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
        דלג לתוכן הראשי
      </a>
      <div className="overflow-hidden rounded-panel bg-bone">
        <main>
        <Hero />
        <HowItWorks />
        <Faq />
        <FinalCta />
        </main>
        <Footer />
      </div>
      <StickyBar />
    </div>
    </MotionConfig>
  );
}
