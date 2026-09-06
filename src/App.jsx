import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Package,
  Star,
  ChevronDown,
  Truck,
  Magnet,
  Feather,
  Play,
  ShoppingCart,
  Menu,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                               */
/* ------------------------------------------------------------------ */

const GlassCard = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl ${className}`}
    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
  >
    {children}
  </div>
)

const VoltButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-volt px-7 py-3.5 text-base font-bold text-charcoal shadow-volt transition-shadow hover:shadow-[0_0_60px_-6px_rgba(0,255,102,0.7)] ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)

const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="mx-auto mb-14 max-w-2xl text-center">
    {eyebrow && (
      <span className="mb-3 inline-block rounded-full border border-volt/30 bg-volt/10 px-4 py-1 text-xs font-bold tracking-wide text-volt">
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
      {title}
    </h2>
    {subtitle && <p className="mt-4 text-lg text-slateGray">{subtitle}</p>}
  </div>
)

/* Ambient neon grid + glow background */
const Backdrop = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[#0A120D]" />
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,255,102,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
      }}
    />
    <div className="absolute -top-40 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-volt/20 blur-[140px]" />
    <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-lime/10 blur-[130px]" />
  </div>
)

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/5 bg-charcoal/70 backdrop-blur-xl' : ''
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-volt shadow-volt">
            <Smartphone className="h-5 w-5 text-charcoal" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            PADEL<span className="text-volt">MOUNT</span>
            <span className="mr-1.5 hidden text-xs font-medium text-slateGray sm:inline">
              / COURT SNAP
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <VoltButton className="px-5 py-2.5 text-sm">
            <ShoppingCart className="h-4 w-4" />
            הזמן עכשיו
          </VoltButton>
          <button className="text-slateGray sm:hidden" aria-label="תפריט">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}

/* ------------------------------------------------------------------ */
/*  Simulated 3D mount viewer                                         */
/* ------------------------------------------------------------------ */

const MountViewer = () => {
  return (
    <div
      className="relative mx-auto flex h-[340px] w-[340px] items-center justify-center sm:h-[420px] sm:w-[420px]"
      style={{ perspective: '1200px' }}
    >
      {/* rotating glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, transparent, rgba(0,255,102,0.35), transparent 40%)',
          filter: 'blur(30px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* auto-rotating device */}
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [-18, 18, -18], rotateX: [6, -4, 6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* phone body */}
        <div
          className="relative h-[300px] w-[150px] rounded-[26px] border border-white/15 bg-gradient-to-b from-[#12201a] to-[#0b1510] p-2 shadow-2xl sm:h-[340px] sm:w-[170px]"
          style={{ transform: 'translateZ(40px)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8)' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[20px] bg-gradient-to-br from-volt/20 via-charcoal2 to-charcoal">
            <div className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/50" />
            <Smartphone className="h-10 w-10 text-volt/80" strokeWidth={1.5} />
            <span className="mt-3 text-[10px] font-bold tracking-widest text-slateGray">
              COURT SNAP
            </span>
          </div>
        </div>

        {/* mount clip behind */}
        <div
          className="absolute -bottom-6 left-1/2 h-24 w-28 -translate-x-1/2 rounded-b-[30px] border-x-2 border-b-2 border-volt/40 bg-white/[0.03]"
          style={{ transform: 'translateZ(-30px)' }}
        />
      </motion.div>

      {/* reflection */}
      <div className="absolute -bottom-4 left-1/2 h-8 w-52 -translate-x-1/2 rounded-full bg-volt/20 blur-2xl" />
    </div>
  )
}

const Hotspot = ({ label, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className={`absolute z-20 ${className}`}
  >
    <div className="float-slow">
      <GlassCard className="flex items-center gap-2 px-3 py-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-volt" />
        </span>
        <span className="whitespace-nowrap text-xs font-semibold text-white">{label}</span>
      </GlassCard>
    </div>
  </motion.div>
)

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

const Hero = () => (
  <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:pt-40">
    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
      {/* copy + buy box */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="order-2 text-center lg:order-1 lg:text-right"
      >
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-1.5 text-sm font-bold text-volt">
          <Zap className="h-4 w-4" /> הדור החדש של צילום פאדל
        </span>

        <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-5xl md:text-6xl">
          צלם כל נקודה.
          <br />
          <span className="bg-gradient-to-l from-volt to-lime bg-clip-text text-transparent">
            שדרג את המשחק.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-lg text-slateGray lg:mr-0">
          התושבת שנצמדת לגדר או לזכוכית המגרש, מחזיקה את הטלפון יציב לחלוטין —
          ומקליטה כל חבטה ברזולוציה מלאה.
        </p>

        {/* buy box */}
        <GlassCard className="mx-auto mt-8 max-w-md p-5 lg:mr-0">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">₪89</span>
                <span className="text-lg text-slateGray line-through">₪119</span>
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                מלאי מוגבל בישראל
              </span>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-volt/10">
              <Truck className="h-7 w-7 text-volt" />
            </div>
          </div>

          <VoltButton className="mt-5 w-full py-4 text-lg">
            <ShoppingCart className="h-5 w-5" />
            לרכישה מהירה (משלוח ללוקר)
          </VoltButton>
          <p className="mt-3 text-center text-xs text-slateGray">
            ⚡ אחריות 30 יום · תשלום מאובטח · משלוח לכל הארץ
          </p>
        </GlassCard>
      </motion.div>

      {/* 3D viewer + hotspots */}
      <div className="relative order-1 lg:order-2">
        <Hotspot
          label="תפוסה מחוזקת לגדר וזכוכית"
          className="right-0 top-6 sm:right-4"
          delay={0.4}
        />
        <Hotspot
          label="חיבור MagSafe עוצמתי"
          className="left-0 top-1/3 sm:left-2"
          delay={0.7}
        />
        <Hotspot
          label="משקל אפסי – 160 גרם בלבד"
          className="bottom-8 right-6"
          delay={1}
        />
        <MountViewer />
      </div>
    </div>
  </section>
)

/* ------------------------------------------------------------------ */
/*  Features grid                                                     */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Zap,
    title: 'התקנה ב-3 שניות',
    desc: 'קליפס קפיצי מתוחכם המתלבש על גדר המגרש או נצמד לזכוכית.',
  },
  {
    icon: ShieldCheck,
    title: 'יציבות מוחלטת',
    desc: 'מנגנון בולם זעזועים ששומר על הזווית גם כשהכדור פוגע ברשת.',
  },
  {
    icon: Smartphone,
    title: 'תאימות מלאה',
    desc: 'מתאים לכל סוגי האייפונים והסמארטפונים (כולל כיסויים קשיחים).',
  },
  {
    icon: Package,
    title: 'קומפקטי וקל',
    desc: 'נכנס בקלות לתיק המחבט בלי לתפוס מקום.',
  },
]

const Features = () => (
  <section className="px-5 py-24">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="למה COURT SNAP"
        title="הנדסה לרמת הפרו"
        subtitle="כל פרט תוכנן כדי שהמצלמה תישאר יציבה — ואתה תישאר במשחק."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassCard className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-volt/40 hover:bg-volt/[0.06]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-volt/10 text-volt transition-colors group-hover:bg-volt group-hover:text-charcoal">
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slateGray">{f.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

/* ------------------------------------------------------------------ */
/*  Video + social proof                                              */
/* ------------------------------------------------------------------ */

const reviews = [
  { name: 'דניאל כ.', badge: 'שחקן פאדל', text: 'סוף סוף אני מצלם את המשחקים בלי לבקש טובות. היציבות מטורפת.', stars: 5 },
  { name: 'מאיה ל.', badge: 'מאמנת טניס', text: 'משתמשת בזה לניתוח טכניקה של השחקנים שלי. מתקין תוך שניות.', stars: 5 },
  { name: 'עומר ש.', badge: 'שחקן חובב', text: 'הכדור פגע ברשת ממש לידו והטלפון לא זז מילימטר. שווה כל שקל.', stars: 5 },
]

const VideoSocial = () => (
  <section className="px-5 py-24">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="בשטח"
        title="רואים את זה בפעולה"
        subtitle="לקוחות אמיתיים, מגרשים אמיתיים, נקודות שאסור לפספס."
      />

      {/* vertical video grid */}
      <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#12201a] to-charcoal"
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 30%, rgba(0,255,102,0.4), transparent 60%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-volt/90 text-charcoal shadow-volt"
              >
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              </motion.div>
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              0:{15 + i * 7}
            </div>
          </motion.div>
        ))}
      </div>

      {/* reviews */}
      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassCard className="h-full p-6">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 text-volt" fill="currentColor" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-white/90">“{r.text}”</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-volt/15 text-sm font-black text-volt">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{r.name}</div>
                  <div className="text-xs text-slateGray">{r.badge}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

/* ------------------------------------------------------------------ */
/*  FAQ                                                               */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: 'תוך כמה זמן המשלוח מגיע?',
    a: '7–12 ימי עסקים לנקודת איסוף / לוקר קרוב לביתך. תקבל מספר מעקב ברגע שההזמנה יוצאת.',
  },
  {
    q: 'האם התושבת מתאימה גם לזכוכית וגם לגדר ברזל?',
    a: 'בהחלט. הקליפס הקפיצי מתלבש בקלות על גדר המגרש, והמנגנון הנצמד עם ואקום עובד מצוין על משטחי זכוכית חלקים.',
  },
  {
    q: 'האם הטלפון יכול ליפול במידה והכדור פוגע ברשת?',
    a: 'לא. מנגנון בולם הזעזועים והאחיזה המחוזקת שומרים על הטלפון יציב לחלוטין גם בפגיעות חזקות ברשת או בגדר.',
  },
]

const FaqItem = ({ item, isOpen, onToggle }) => (
  <GlassCard className="overflow-hidden">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 p-5 text-right"
    >
      <span className="text-base font-bold text-white sm:text-lg">{item.q}</span>
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <ChevronDown className={`h-5 w-5 ${isOpen ? 'text-volt' : 'text-slateGray'}`} />
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
          <p className="px-5 pb-5 text-sm leading-relaxed text-slateGray">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </GlassCard>
)

const Faq = () => {
  const [open, setOpen] = useState(0)
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="שאלות נפוצות" title="כל מה שרצית לדעת" />
        <div className="space-y-4">
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
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

const Footer = () => (
  <footer className="border-t border-white/5 px-5 py-12 pb-28 sm:pb-12">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-volt">
          <Smartphone className="h-4 w-4 text-charcoal" strokeWidth={2.5} />
        </div>
        <span className="font-black text-white">
          PADEL<span className="text-volt">MOUNT</span>
        </span>
      </div>
      <div className="flex gap-6 text-sm text-slateGray">
        <a href="#" className="hover:text-volt">תקנון</a>
        <a href="#" className="hover:text-volt">משלוחים</a>
        <a href="#" className="hover:text-volt">צור קשר</a>
      </div>
      <p className="text-xs text-slateGray">© 2026 PADELMOUNT · כל הזכויות שמורות</p>
    </div>
  </footer>
)

/* ------------------------------------------------------------------ */
/*  Sticky mobile buy bar                                             */
/* ------------------------------------------------------------------ */

const StickyBar = () => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-charcoal/90 p-3 backdrop-blur-xl sm:hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-right">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">₪89</span>
                <span className="text-sm text-slateGray line-through">₪119</span>
              </div>
              <span className="text-[11px] font-semibold text-red-300">מלאי מוגבל</span>
            </div>
            <VoltButton className="flex-1 py-3.5">
              <ShoppingCart className="h-5 w-5" />
              הזמן עכשיו
            </VoltButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden text-white">
      <Backdrop />
      <Header />
      <main>
        <Hero />
        <Features />
        <VideoSocial />
        <Faq />
      </main>
      <Footer />
      <StickyBar />
    </div>
  )
}
