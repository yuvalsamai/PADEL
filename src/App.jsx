import React, { useState } from 'react';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';

export default function App() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-600 selection:text-white" dir="rtl">

      {/* 1. Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-emerald-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            COURTSNAP
          </div>
          <a
            href="#buy"
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
          >
            הזמן עכשיו
          </a>
        </div>
      </header>

      {/* 2. Hero Section with 3D Model & Value Prop */}
      <section className="pt-12 pb-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Text & CTA */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            <Zap size={14} /> המהפכה של שחקני הפאדל בישראל
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            צלם כל נקודה. <br />
            <span className="text-emerald-800">שדרג את המשחק שלך.</span>
          </h1>

          <p className="text-lg text-slate-600">
            תושבת חכמה המותאמת במיוחד לרשת הפאדל או הטניס. מתלבשת בשניות, שומרת על יציבות מוחלטת גם ברעשי ראלי אינטנסיביים, ומאפשרת לך לצלם זוויות מושלמות ל-Reels ולניתוח אישי.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <div className="text-3xl font-black text-slate-900">₪89</div>
            <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg font-medium">
              משלוח מהיר לנקודת איסוף / לוקר כלול
            </div>
          </div>

          <div className="pt-4">
            <a
              id="buy"
              href="#checkout"
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-emerald-800 hover:bg-emerald-900 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/10 transition-all"
            >
              לרכישה מהירה <ArrowRight size={20} className="rotate-180" />
            </a>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-700" /> מתאים לכל סוגי הסמארטפונים</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-700" /> התקנה תוך 3 שניות</div>
          </div>
        </div>

        {/* Right Side: 3D Model Interactive View */}
        <div className="relative bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[400px] shadow-inner">
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-100">
            תצוגת מוצר תלת-ממדית
          </div>

          {/* model-viewer נטען ב-index.html. החלף את ה-src במודל glb/gltf אמיתי של המוצר. */}
          <model-viewer
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
            alt="Padel Phone Mount 3D View"
            auto-rotate
            camera-controls
            style={{ width: '100%', height: '350px', backgroundColor: 'transparent' }}
          >
          </model-viewer>

          <span className="text-xs text-slate-400 mt-2">ניתן לגרור ולסובב את המוצר חופשי</span>
        </div>

      </section>

      {/* 3. Value Proposition & Features Grid */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-slate-900 mb-12">
            למה שחקני פאדל חייבים את זה בתיק?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">01</div>
              <h3 className="font-bold text-lg text-slate-900">התקנה על רשת הפאדל</h3>
              <p className="text-sm text-slate-600">מתלבש בקלות ובמהירות על רשת הברזל של המגרש מבלי לפגוע במהלך המשחק.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">02</div>
              <h3 className="font-bold text-lg text-slate-900">יציבות ברמת ראלי</h3>
              <p className="text-sm text-slate-600">מבנה בולם זעזועים ששומר על הטלפון יציב לחלוטין גם כשהכדור פוגע בעוצמה ברשת.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">03</div>
              <h3 className="font-bold text-lg text-slate-900">תאימות מלאה לטלפונים</h3>
              <p className="text-sm text-slate-600">תומך בכל סוגי המכשירים והכיסויים, עם אחיזה חזקה שלא משתחררת תוך כדי תנועה.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">04</div>
              <h3 className="font-bold text-lg text-slate-900">קומפקטי לתיק המחבט</h3>
              <p className="text-sm text-slate-600">שוקל מעט מאוד ותופס נפח מינימלי – זורקים לתיק ונכנסים למגרש.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-slate-900 mb-8">
          שאלות נפוצות
        </h2>

        <div className="space-y-4">
          {[
            { q: "תוך כמה זמן המשלוח מגיע?", a: "המשלוח נשלח ישירות לנקודת האיסוף או הלוקר הקרובים לביתך ומגיע תוך 7–12 ימי עסקים." },
            { q: "האם זה מתאים לכל סוגי המגרשים?", a: "כן, התושבת מותאמת במיוחד לרשתות הברזל המקובלות בכל מגרשי הפאדל והטניס בארץ." },
            { q: "האם הטלפון יכול ליפול אם כדור פוגע ברשת?", a: "המנגנון תוכנן במיוחד לעמוד בפגיעות כדורים ולשמור על המכשיר נעול ובטוח במקום." }
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-right font-semibold flex justify-between items-center text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-center text-sm">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <div className="font-bold text-white text-lg tracking-wider">COURTSNAP</div>
          <p>הכלי המושלם לתיעוד משחקי פאדל וטניס בישראל.</p>
          <div className="text-xs text-slate-600 pt-4">© 2026 כל הזכויות שמורות.</div>
        </div>
      </footer>

    </div>
  );
}
