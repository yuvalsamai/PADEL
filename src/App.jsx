import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ArrowUpLeft, Plus, Instagram, Pause, Play } from 'lucide-react';
import Logo from './Logo.jsx';
import { openConsentSettings } from './lib/consent.js';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from './lib/business.js';

/* Design: a club-tennis spec sheet. Light bone pages, a classic Hebrew serif
   for the headline and prices only, lime kept for the order button. The one
   loud moment is the net band: a stitched white net tape over a dark court,
   with the real "ball in" frame. */

const HERO_VIDEO = '/netcam-hero.mp4';
const HERO_POSTER = '/netcam-hero-poster.webp';
const COURT_IMG = '/hero.webp'; // grass court, ball on the line

/* Trust badges — kept for other pages that may import them. */
export const TRUST_ITEMS = [
  { label: 'תשלום מאובטח · Hyp' },
  { label: 'משלוח חינם עד הדלת' },
];

/* ================================================================== */
/*  Header                                                            */
/* ================================================================== */

const navLinks = [
  { label: 'איך זה עובד', href: '#how' },
  { label: 'שאלות', href: '#faq' },
];

const Header = () => (
  <header className="border-b border-ink/10 bg-bone">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
      <a href="#top" aria-label="NETCAM — לראש העמוד" className="inline-flex items-center">
        <Logo className="h-11 sm:h-14" />
      </a>
      <nav aria-label="ניווט ראשי" className="flex items-center gap-5 text-sm">
        {navLinks.map((l) => (
          <a key={l.href} href={l.href} className="hidden text-moss transition-colors hover:text-ink sm:inline">
            {l.label}
          </a>
        ))}
        <a
          href="/pay"
          className="rounded-full border border-ink px-4 py-1.5 font-medium text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          הזמנה
        </a>
      </nav>
    </div>
  </header>
);

/* ================================================================== */
/*  Hero                                                              */
/* ================================================================== */

/* Product video with a pause control (WCAG 2.2.2); static photo fallback. */
const HeroMedia = ({ className = '' }) => {
  const [ok, setOk] = useState(true);
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
    <figure className={`relative overflow-hidden rounded-[18px] bg-ink shadow-[0_24px_48px_-24px_rgba(13,13,13,0.45)] ${className}`} style={{ aspectRatio: '9 / 16' }}>
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
            aria-label="סרטון: תושבת NETCAM על רשת המגרש מצלמת משחק"
            onError={() => setOk(false)}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'עצירת הסרטון' : 'הפעלת הסרטון'}
            className="absolute bottom-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-bone/90 text-ink hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-ball"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </>
      ) : (
        <img src="/product.webp" alt="תושבת NETCAM" className="h-full w-full object-cover" />
      )}
    </figure>
  );
};

/* What it does — four plain statements, set as a ruled list with a lime tick. */
const POINTS = [
  'מתאים לכל סוגי הפלאפונים',
  'השופט שלכם אם הכדור עבר את הקו',
  'מתאים לשיפור טכניקה ולתיעוד של נקודות מכריעות',
  'מתאים גם לטניס וגם לפאדל',
];

const Price = ({ className = '' }) => (
  <div className={`flex items-end justify-between gap-4 ${className}`}>
    <div className="flex items-baseline gap-2.5">
      <span className="font-display text-[2.6rem] font-medium leading-none text-bone">₪89</span>
      <span className="text-sm text-bone/65 line-through">₪119.90</span>
    </div>
    <p className="text-sm text-bone">
      <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-ball align-middle" aria-hidden="true" />
      שתי יחידות ב-<span className="font-display text-lg font-medium">₪149</span>
    </p>
  </div>
);

const OrderButton = ({ children = 'להזמנה', className = '' }) => (
  <a
    href="/pay"
    className={`group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ball text-lg font-semibold text-ink transition-colors hover:bg-bone hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-ball/40 ${className}`}
  >
    {children}
    <ArrowUpLeft size={19} strokeWidth={2.25} className="transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
  </a>
);

const Hero = () => (
  <section id="top" className="relative isolate overflow-hidden bg-ink">
    {/* the court: grass and the white line, darkened for legible type */}
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(13,13,13,0.62) 0%, rgba(13,13,13,0.5) 45%, rgba(13,13,13,0.82) 100%), url(${COURT_IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    <div
      id="main"
      tabIndex={-1}
      className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-y-6 px-5 pb-9 pt-6 outline-none sm:px-8 lg:grid-cols-[1fr_360px] lg:gap-x-20 lg:gap-y-8 lg:pb-20 lg:pt-16"
    >
      <div className="lg:col-start-1">
        <p className="text-xs font-medium text-bone/75">תושבת צילום לרשת המגרש</p>
        <h1
          dir="ltr"
          className="mt-3 text-right font-display text-[2.7rem] font-medium leading-[1.02] tracking-[-0.01em] text-bone [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-[5.4rem]"
        >
          Your game
          <br />
          <span className="text-ball">on camera</span>
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-bone lg:text-xl">
          NETCAM מאפשר לך להציב את הטלפון על רשת הטניס ולצלם את המשחק שלך — לאימון, לניתוח ביצועים ולהכרעה
          במחלוקות על נקודות.
        </p>
      </div>

      {/* The video, big: near full width on phones, its own tall column on desktop. */}
      <HeroMedia className="mx-auto w-full max-w-[min(100%,calc(72svh*9/16))] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-w-none" />

      <div className="lg:col-start-1 lg:max-w-md">
        <Price />
        <OrderButton className="mt-4" />
        <p className="mt-3 text-center text-xs text-bone/75 lg:text-right">
          משלוח חינם עד הדלת תוך 7–12 ימי עסקים · תשלום מאובטח
        </p>
      </div>

      <ul className="lg:col-start-1 lg:max-w-md">
        {POINTS.map((t) => (
          <li
            key={t}
            className="flex items-start gap-3 border-t border-bone/20 py-3 text-[15px] font-medium leading-snug text-bone first:border-t-0 first:pt-0 lg:py-4 lg:text-lg lg:first:border-t lg:first:pt-4"
          >
            <span aria-hidden="true" className="mt-[0.55em] h-[2px] w-3.5 flex-shrink-0 bg-ball" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ================================================================== */
/*  How it works — a real 3-step sequence                             */
/* ================================================================== */

const steps = [
  { title: 'מחברים', desc: 'מלבישים את NETCAM על סרט הרשת.' },
  { title: 'מצלמים', desc: 'מכניסים את הטלפון ולוחצים הקלטה.' },
  { title: 'משחקים', desc: 'יש מחלוקת? מריצים אחורה ורואים.' },
];

const HowItWorks = () => (
  <section id="how" className="bg-chalk px-5 py-12 sm:px-8 lg:py-24">
    <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-[2rem] font-medium leading-tight text-ink sm:text-5xl">
        מהתיק למגרש בפחות מדקה.
      </h2>
      <ol className="mt-7 grid grid-cols-3 border-y border-ink/15 lg:mt-10">
        {steps.map((s, i) => (
          <li key={s.title} className={`py-4 pl-3 sm:py-6 sm:pl-6 ${i > 0 ? 'border-r border-ink/15 pr-3 sm:pr-6' : ''}`}>
            <span className="font-display text-sm text-moss">{i + 1}</span>
            <h3 className="mt-1 text-base font-semibold text-ink sm:text-xl">{s.title}</h3>
            <p className="mt-1 text-xs leading-snug text-moss sm:text-sm">{s.desc}</p>
          </li>
        ))}
      </ol>
      <img
        src="/feature.webp"
        loading="lazy"
        decoding="async"
        alt="תושבת NETCAM על סרט הרשת, עם טלפון שמצלם משחק פאדל"
        className="mt-6 aspect-[16/10] w-full rounded-[18px] object-cover lg:mt-10 lg:aspect-[16/8]"
      />
    </div>
  </section>
);

/* ================================================================== */
/*  The net band — signature                                          */
/* ================================================================== */

const NetBand = () => (
  <section aria-labelledby="line-call" className="bg-ink text-bone">
    {/* net tape: white band, stitched edges */}
    <div className="bg-[#FAFAF7] py-[5px]" aria-hidden="true">
      <div className="h-3 border-y border-dashed border-ink/30" />
    </div>
    {/* mesh hanging under the tape, fading into the court */}
    <div
      aria-hidden="true"
      className="h-20 lg:h-28"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(246,247,245,0.16) 0 1px, transparent 1px 16px), repeating-linear-gradient(-45deg, rgba(246,247,245,0.16) 0 1px, transparent 1px 16px)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent)',
        maskImage: 'linear-gradient(to bottom, #000, transparent)',
      }}
    />
    <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:pb-24">
      <div>
        <h2 id="line-call" className="font-display text-[2.2rem] font-medium leading-[1.08] sm:text-6xl">
          הכדור היה על הקו?
          <br />
          <span className="text-ball">עכשיו יש הוכחה.</span>
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone/75 sm:text-lg">
          הטלפון מצלם מגובה הרשת, ממש מעל הקו. במקום להתווכח על סנטימטרים, מריצים את ההקלטה אחורה.
        </p>
        <div className="mt-7 max-w-sm">
          <OrderButton>להזמנה · שתיים ב-₪149</OrderButton>
          <p className="mt-3 text-center text-xs text-bone/70">או יחידה אחת ב-₪89 · משלוח חינם עד הדלת</p>
        </div>
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
    q: 'זה מתאים גם לפאדל וגם לטניס?',
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
  <div className="border-b border-ink/15">
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-4 py-4 text-right focus:outline-none focus-visible:underline sm:py-5"
    >
      <span className="text-base font-medium text-ink sm:text-lg">{item.q}</span>
      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0 text-ink">
        <Plus size={18} strokeWidth={1.75} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="pb-5 text-sm leading-relaxed text-moss sm:text-base">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" className="bg-bone px-5 py-12 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="font-display text-[2rem] font-medium leading-tight text-ink sm:text-5xl">שאלות נפוצות</h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-moss underline-offset-4 hover:text-ink hover:underline"
          >
            <Instagram size={16} />
            שאלה אחרת? כתבו לנו באינסטגרם <span dir="ltr" className="font-medium text-ink">{INSTAGRAM_HANDLE}</span>
          </a>
        </div>
        <div className="border-t border-ink/15">
          {faqs.map((item, i) => (
            <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================================================================== */
/*  Footer                                                            */
/* ================================================================== */

const Footer = () => (
  <footer className="bg-ink px-5 py-12 text-bone sm:px-8 lg:py-16">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 border-b border-bone/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo dark className="h-16" />
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-bone/75 hover:text-ball"
          >
            <Instagram size={16} />
            <span dir="ltr">{INSTAGRAM_HANDLE}</span>
          </a>
        </div>
        <nav aria-label="מידע משפטי" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <a href="/terms" className="text-bone/80 underline-offset-4 hover:text-ball hover:underline">תקנון ותנאי רכישה</a>
          <a href="/cancel" className="rounded-full border border-bone/40 px-4 py-1.5 font-medium text-bone hover:border-ball hover:text-ball">ביטול עסקה</a>
          <a href="/privacy" className="text-bone/80 underline-offset-4 hover:text-ball hover:underline">מדיניות פרטיות</a>
          <a href="/accessibility" className="text-bone/80 underline-offset-4 hover:text-ball hover:underline">הצהרת נגישות</a>
          <button type="button" onClick={openConsentSettings} className="text-bone/80 underline-offset-4 hover:text-ball hover:underline">הגדרות עוגיות</button>
        </nav>
      </div>
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-bone/70">
        יש להתקין את המוצר לפי הוראות השימוש ולוודא שהוא נעול היטב על הרשת לפני כל שימוש. השימוש באתר ובמוצר
        כפוף ל<a href="/terms" className="underline">תקנון</a>.
      </p>
      <div className="mt-4 text-xs text-bone/70">© 2026 NETCAM · כל הזכויות שמורות</div>
    </div>
  </footer>
);

/* ================================================================== */
/*  Sticky mobile buy bar — appears once the hero button is gone      */
/* ================================================================== */

const StickyBar = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 420;
      setShow(window.scrollY > 600 && !nearBottom);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mobile-bar"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-ink/10 bg-bone/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 text-right">
              <span className="font-display text-2xl font-medium leading-none text-ink">₪89</span>
              <div className="mt-0.5 text-[11px] text-moss">שתיים ב-₪149</div>
            </div>
            <a
              href="/pay"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ball text-base font-semibold text-ink"
            >
              להזמנה <ArrowUpLeft size={17} strokeWidth={2.25} />
            </a>
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
  return (
    <MotionConfig reducedMotion="user">
      <div dir="rtl" className="min-h-screen bg-bone font-sans text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
          דלג לתוכן הראשי
        </a>
        <Header />
        <main>
          <Hero />
          <HowItWorks />
          <NetBand />
          <Faq />
        </main>
        <Footer />
        <StickyBar />
      </div>
    </MotionConfig>
  );
}
