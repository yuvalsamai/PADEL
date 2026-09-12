import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpLeft, Plus, X, Menu } from 'lucide-react';

/* Hero background photo. Drop the supplied image at public/hero.jpg to swap it in;
   a court-toned gradient shows until then. */
const HERO_IMG = '/hero.jpg';

/* ================================================================== */
/*  Orders counter (social proof)                                     */
/*  Starts at 127 and grows every day by a deterministic 2–8, so all  */
/*  visitors see the same number and it climbs on its own — no DB.     */
/* ================================================================== */
const COUNTER_START = 127;
const COUNTER_START_DATE = new Date('2026-09-12T00:00:00');

function ordersCount() {
  const dayMs = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(COUNTER_START_DATE);
  start.setHours(0, 0, 0, 0);
  let days = Math.floor((today - start) / dayMs);
  if (days < 0) days = 0;

  let total = COUNTER_START;
  for (let d = 1; d <= days; d++) {
    // Deterministic pseudo-random 2..8 from the day index.
    const x = Math.sin(d * 999.13) * 10000;
    const frac = x - Math.floor(x);
    total += 2 + Math.floor(frac * 7);
  }
  return total;
}

const OrdersCounter = () => {
  const count = ordersCount();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ball opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ball" />
      </span>
      <span className="text-sm text-bone">
        <span className="font-black text-ball">{count.toLocaleString('he-IL')}</span> הזמנות בוצעו כבר
      </span>
    </div>
  );
};

/* ================================================================== */
/*  Primitives                                                        */
/* ================================================================== */

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Eyebrow = ({ children, className = '' }) => (
  <span className={`text-xs font-medium uppercase tracking-[0.18em] ${className}`}>{children}</span>
);

const ArrowChip = ({ className = '' }) => (
  <span
    className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ball text-ink transition-transform group-hover:rotate-12 ${className}`}
  >
    <ArrowUpLeft size={20} strokeWidth={2.5} />
  </span>
);

/* ================================================================== */
/*  Nav                                                               */
/* ================================================================== */

const navLinks = [
  { label: 'בית', href: '#top' },
  { label: 'יתרונות', href: '#features' },
  { label: 'איך זה עובד', href: '#how' },
  { label: 'המוצר', href: '#product' },
  { label: 'עין הנץ', href: '#hawkeye' },
  { label: 'ביקורות', href: '#reviews' },
  { label: 'שאלות', href: '#faq' },
];

const Nav = () => {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div className="flex w-full items-center justify-between gap-3 border-b border-white/30 bg-bone/60 px-5 py-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-8 lg:px-10">
      <a href="#top" aria-label="CourtCheck" className="inline-flex items-center">
        <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-12 w-auto sm:h-14 lg:h-16" />
      </a>

      {/* desktop pill */}
      <nav className="hidden items-center gap-1 md:flex">
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
      >
        {openMenu ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-20 z-30 flex flex-col gap-1 rounded-3xl border border-white/15 bg-court/95 p-3 backdrop-blur-xl md:hidden"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================================================== */
/*  Hero                                                              */
/* ================================================================== */

/* Product image with a continuous 3D turn + float (single-photo pseudo-3D). */
const ProductSpin = () => (
  <div
    className="relative flex items-center justify-center py-6 lg:py-0"
    style={{ perspective: '1400px' }}
  >
    {/* ambient glow */}
    <div className="pointer-events-none absolute h-2/3 w-2/3 rounded-full bg-ball/25 blur-3xl" />
    <motion.img
      src="/product.png"
      alt="תושבת CourtCheck עם אייפון על המגרש"
      draggable={false}
      className="relative w-[min(72%,300px)] select-none drop-shadow-2xl lg:w-[min(95%,420px)]"
      style={{ transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, rotateY: [-28, 28, -28], y: [-12, 12, -12] }}
      transition={{
        opacity: { duration: 0.8 },
        scale: { duration: 0.8 },
        rotateY: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      }}
    />
  </div>
);

const Hero = () => (
  <section id="top" className="relative isolate overflow-hidden rounded-panel">
    {/* background photo + court gradient fallback */}
    <div
      className="absolute inset-0 -z-10 bg-court"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(17,24,19,0.35) 0%, rgba(17,24,19,0.08) 42%, rgba(17,24,19,0.6) 100%), linear-gradient(270deg, rgba(17,24,19,0) 0%, rgba(17,24,19,0.25) 100%), url(${HERO_IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />

    <div className="flex min-h-[92vh] flex-col">
      <Nav />

      <div className="grid flex-1 items-center gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:p-10">
        {/* text column — right in RTL */}
        <div className="flex flex-col justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <Eyebrow className="text-bone/80">מערכת הצילום למגרש · פאדל &amp; טניס</Eyebrow>
            <h1 className="mt-5 font-display text-5xl font-black leading-[0.98] tracking-tight text-bone sm:text-7xl lg:text-7xl">
              צלם כל נקודה.
              <br />
              שחק חכם יותר.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone/80">
              תושבת שמתלבשת בשניות על רשת המגרש ומצלמת בזווית גבוהה ויציבה — לתוכן, לשיפור
              הטכניקה ולהכרעת כל ויכוח על קו.
            </p>
            <div className="mt-6">
              <OrdersCounter />
            </div>
          </motion.div>

          {/* glass insight card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex w-full flex-col justify-between gap-6 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:max-w-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-bone/50 line-through">₪119.90</span>
                  <span className="font-display text-xl font-black text-ball">₪89</span>
                </div>
                <div className="text-xs font-medium text-bone/80">מחיר מבצע · משלוח חינם</div>
              </div>
              <a href="/pay" className="group">
                <ArrowChip />
              </a>
            </div>
          </motion.div>
        </div>

        {/* product column — left in RTL */}
        <ProductSpin />
      </div>
    </div>
  </section>
);

/* ================================================================== */
/*  Features                                                          */
/* ================================================================== */

const features = [
  {
    tag: 'תוכן',
    title: 'תוכן שנראה מקצועי',
    desc: 'זווית גבוהה ויציבה שמפיקה סרטונים איכותיים לאינסטגרם או לטיקטוק.',
  },
  {
    tag: 'עין הנץ',
    title: 'השופט החדש שלכם',
    desc: 'הכדור בפנים או בחוץ? מריצים אחורה את ההקלטה ורואים בדיוק איפה נחת. הכרעה, לא ויכוח.',
  },
  {
    tag: 'טכניקה',
    title: 'ניתוח ושיפור משחק',
    desc: 'צופים במשחק מהצד, מזהים טעויות בתנועה ובחבטה, ומשתפרים מנקודה לנקודה.',
  },
  {
    tag: 'מבנה',
    title: 'התקנה מהירה ויציבות',
    desc: 'אחיזה קשיחה שמתלבשת על הרשת בשניות ושומרת על זווית צילום יציבה גם בזמן משחק אינטנסיבי.',
  },
];

const Features = () => (
  <section id="features" className="bg-bone px-5 py-20 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <Reveal className="max-w-2xl">
        <Eyebrow className="text-moss">למה זה נכנס לתיק המחבט</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
          כלי אחד. כל משחק נשמר, נבדק ומשתפר.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 4) * 0.07}>
            <div className="group flex h-full flex-col justify-between rounded-3xl bg-chalk p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:ring-ink/15">
              <div className="mb-10 flex items-center justify-between">
                <span className="rounded-full bg-ball/70 px-3 py-1 text-xs font-semibold text-ink">
                  {f.tag}
                </span>
                <ArrowUpLeft
                  size={18}
                  className="text-stone transition-colors group-hover:text-ink"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{f.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6">
        <div className="overflow-hidden rounded-3xl ring-1 ring-ink/5">
          <img
            src="/feature.png"
            alt="תושבת CourtCheck ננעלת על עמוד הרשת ומצלמת משחק פאדל"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/*  How it works — 3 steps                                           */
/* ================================================================== */

const steps = [
  {
    n: '01',
    title: 'מחברים',
    desc: 'מחברים את COURTCHECK לרשת.',
  },
  {
    n: '02',
    title: 'מצלמים',
    desc: 'מכניסים את הטלפון ומתחילים להקליט.',
  },
  {
    n: '03',
    title: 'משחקים',
    desc: 'משחקים. יכולים לצפות במידה ויש מחלוקת על המהלך או סתם נקודה מדהימה.',
  },
];

const Steps = () => (
  <section id="how" className="bg-bone2 px-5 py-20 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <Reveal className="max-w-2xl">
        <Eyebrow className="text-moss">איך זה עובד</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
          שלושה שלבים. פחות מדקה.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={(i % 3) * 0.08}>
            <div className="group flex h-full flex-col rounded-3xl bg-chalk p-7 ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:ring-ink/15">
              <span className="font-display text-5xl font-black leading-none text-ball">
                {s.n}
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ================================================================== */
/*  Product showcase — real photo of the mount on the net            */
/*  Drop the image at public/STUND.png                                */
/* ================================================================== */

const Showcase = () => (
  <section id="product" className="bg-ink px-5 py-20 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <Reveal className="max-w-2xl">
        <Eyebrow className="text-ball">המוצר בפעולה</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-bone sm:text-5xl">
          מתלבש על הרשת. מצלם מלמעלה.
        </h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-bone/70">
          אחיזה קשיחה שננעלת על עמוד הרשת תוך שניות ומחזיקה את הטלפון בזווית גבוהה
          ויציבה — בדיוק מהמקום שממנו רואים כל נקודה.
        </p>
      </Reveal>

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-3xl bg-pine ring-1 ring-white/10">
          <img
            src="/STUND.png"
            alt="תושבת CourtCheck ננעלת על עמוד הרשת ומחזיקה את הטלפון"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/*  Hawk-Eye band                                                     */
/* ================================================================== */

const HawkEye = () => (
  <section id="hawkeye" className="bg-court px-5 py-20 sm:px-8 sm:py-28">
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <Reveal>
        <h2 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-bone sm:text-6xl">
          הכדור היה על הקו.
          <br />
          <span className="text-ball">עכשיו יש הוכחה.</span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-bone/75">
          במקום לריב על סנטימטרים, פשוט מריצים את ההקלטה אחורה. הזווית הגבוהה והיציבה
          של COURTCHECK הופכת כל נקודה שנויה במחלוקת להכרעה של שנייה.
        </p>
        <a
          href="/pay"
          className="group mt-9 inline-flex items-center gap-3 rounded-full bg-ball py-2 pl-2 pr-6 font-semibold text-ink transition-colors hover:bg-white"
        >
          לרכישה מהירה
          <ArrowChip className="!bg-ink !text-ball" />
        </a>
      </Reveal>

      {/* minimalist court-corner proof graphic (static, clean) */}
      <Reveal delay={0.12}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-pine/50 ring-1 ring-white/10">
          <div className="absolute inset-6">
            {/* baseline + sideline */}
            <div className="absolute bottom-8 right-0 left-0 h-[3px] rounded bg-bone/80" />
            <div className="absolute bottom-8 right-24 top-0 w-[3px] rounded bg-bone/80" />
            {/* ball just inside the line */}
            <div className="absolute bottom-[2.4rem] right-14 h-8 w-8 rounded-full bg-ball shadow-lg ring-2 ring-ink/20" />
            {/* verdict tag */}
            <div className="absolute right-6 top-4 flex items-center gap-2">
              <span className="rounded-full bg-ball px-3 py-1 text-sm font-bold text-ink">
                בפנים
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-bone/50">Hawk-Eye</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================== */
/*  Reviews / testimonials                                            */
/* ================================================================== */

const reviews = [
  {
    name: 'דניאל כהן',
    role: 'שחקן פאדל, תל אביב',
    initials: 'ד״כ',
    text: 'סוף סוף אין יותר ויכוחים על הקווים. מריצים אחורה ורואים בדיוק איפה נחת הכדור. שווה כל שקל.',
  },
  {
    name: 'מאיה לוי',
    role: 'מאמנת טניס',
    initials: 'מ״ל',
    text: 'אני מצלמת את כל האימונים מלמעלה ומראה לשחקנים בדיוק מה לתקן. ההתקנה על הרשת לוקחת שתי שניות.',
  },
  {
    name: 'איתי ברק',
    role: 'חובב פאדל',
    initials: 'א״ב',
    text: 'הסרטונים יוצאים ברמה של שידור. כל הקבוצה שלנו כבר קנתה. יציב לגמרי גם בראלי אגרסיבי.',
  },
];

const Stars = () => (
  <div className="flex gap-0.5" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-ball">★</span>
    ))}
  </div>
);

const Reviews = () => (
  <section id="reviews" className="bg-bone px-5 py-20 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <Reveal className="max-w-2xl">
        <Eyebrow className="text-moss">מה אומרים על המגרש</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
          שחקנים כבר לא משחקים בלי זה.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.name} delay={(i % 3) * 0.08}>
            <figure className="flex h-full flex-col justify-between rounded-3xl bg-chalk p-6 ring-1 ring-ink/5">
              <div>
                <Stars />
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink/70">
                  “{r.text}”
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ball text-sm font-black text-ink">
                  {r.initials}
                </span>
                <span>
                  <span className="block font-display font-bold text-ink">{r.name}</span>
                  <span className="block text-xs text-ink/50">{r.role}</span>
                </span>
              </figcaption>
            </figure>
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
  {
    q: 'ממה עשוי המתקן?',
    a: 'המתקן מיוצר מ‑PLA 100% — חומר עמיד וחזק, שמתאים לשימוש בכל מזג אוויר.',
  },
  {
    q: 'לאיזה פלאפון מתאים המכשיר?',
    a: 'התאמה אוניברסלית: המתקן מתאים למגוון רחב של סמארטפונים ומצלמות, לצילום חי או לתיעוד אימונים.',
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="overflow-hidden rounded-3xl bg-chalk ring-1 ring-ink/5">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-right"
    >
      <span className="font-display text-lg font-bold text-ink sm:text-xl">{item.q}</span>
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ball/70"
      >
        <Plus size={18} className="text-ink" strokeWidth={2.5} />
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
          <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink/60">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-bone2 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Eyebrow className="text-moss">שאלות נפוצות</Eyebrow>
          <h2 className="mb-10 mt-4 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            כל מה שרציתם לדעת.
          </h2>
        </Reveal>
        <div className="space-y-3">
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

const terms = [
  {
    h: 'הגבלת אחריות',
    p: 'החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה, נזק למכשיר הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה מהשימוש במוצר. השימוש במוצר, ברשת ובסביבת המגרש הינו באחריות המלאה של המשתמש בלבד.',
  },
  {
    h: 'שימוש נכון',
    p: 'על המשתמש לוודא כי המוצר מותקן כראוי ומאובטח לפני כל שימוש, ולפעול בזהירות בהתאם לתנאי המגרש. אין להשאיר את המכשיר ללא השגחה ואין להשתמש במוצר באופן החורג מייעודו.',
  },
  {
    h: 'ביטול עסקה',
    p: 'בהתאם לחוק הגנת הצרכן, התשמ"א‑1981, ניתן לבטל את העסקה תוך 14 ימים מיום קבלת המוצר, ובלבד שהמוצר מוחזר באריזתו המקורית ולא נעשה בו שימוש. החזר כספי יינתן בהתאם להוראות החוק.',
  },
  {
    h: 'משלוחים',
    p: 'אספקת המוצר מתבצעת לנקודת איסוף/לוקר תוך 7–12 ימי עסקים ממועד ביצוע ההזמנה, בכפוף לזמינות מלאי ולתנאי חברת השילוח.',
  },
];

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
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-panel bg-chalk p-7 text-ink/80 shadow-2xl sm:p-9"
        >
          <button
            onClick={onClose}
            className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-bone2 text-ink transition-colors hover:bg-ball"
            aria-label="סגור"
          >
            <X size={18} />
          </button>
          <h3 className="mb-6 font-display text-3xl font-black text-ink">תקנון ותנאי שימוש</h3>
          <div className="space-y-5 text-sm leading-relaxed">
            {terms.map((t, i) => (
              <section key={t.h}>
                <h4 className="mb-1.5 font-display font-bold text-ink">
                  {String(i + 1).padStart(2, '0')} · {t.h}
                </h4>
                <p>{t.p}</p>
              </section>
            ))}
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
  <footer className="bg-ink px-5 py-16 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-2xl bg-bone px-4 py-3">
            <img src="/LOGO-removebg-preview.png" alt="CourtCheck" className="h-11 w-auto" />
          </span>

          <p className="mt-3 max-w-sm text-lg text-bone/70">
            עין הנץ שלך על המגרש. צלם, נתח והכרע.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={onOpenTerms}
            className="font-medium text-ball underline-offset-4 transition-colors hover:underline"
          >
            תקנון ותנאי שימוש
          </button>
          <a href="#top" className="text-bone/60 transition-colors hover:text-bone">
            חזרה למעלה ↑
          </a>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-bone/45">
        החברה/האתר אינם נושאים בכל אחריות לנזק ישיר או עקיף, כולל שבר, נפילה, נזק למכשיר
        הסלולרי, לגוף או לרכוש צד שלישי שנגרם במהלך או כתוצאה מהשימוש במוצר. השימוש במוצר,
        ברשת ובסביבת המגרש הינו באחריות המלאה של המשתמש בלבד. ביטול עסקה בהתאם לחוק הגנת
        הצרכן, התשמ"א‑1981 — תוך 14 ימים מקבלת המוצר, באריזתו המקורית וללא שימוש.
      </p>
      <div className="mt-6 text-xs text-bone/40">© 2026 COURTCHECK · כל הזכויות שמורות</div>
    </div>
  </footer>
);

/* ================================================================== */
/*  Sticky mobile buy bar                                             */
/* ================================================================== */

const StickyBar = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
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
          className="fixed inset-x-3 bottom-3 z-[70] rounded-full border border-white/10 bg-ink/95 px-3 py-2.5 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 pr-2 text-right">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-bone/50 line-through">₪119.90</span>
                <span className="font-display text-lg font-black leading-none text-bone">₪89</span>
              </div>
              <div className="mt-0.5 text-[0.6rem] text-ball">מחיר מבצע · משלוח חינם</div>
            </div>
            <motion.a
              href="/pay"
              whileTap={{ scale: 0.98 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ball py-3 text-sm font-bold text-ink"
            >
              הזמן עכשיו <ArrowUpLeft size={16} strokeWidth={2.5} />
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
    <div dir="rtl" className="min-h-screen bg-olive p-2.5 font-sans text-ink sm:p-4">
      <div className="overflow-hidden rounded-panel bg-bone">
        <Hero />
        <Features />
        <Steps />
        <Showcase />
        <HawkEye />
        <Reviews />
        <Faq />
        <Footer onOpenTerms={() => setTermsOpen(true)} />
      </div>
      <StickyBar />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
