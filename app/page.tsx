import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'קורס אקסל למתחילים — לשלוט באקסל זה לשלוט בעבודה שלך',
  description: 'קורס פרקטי שמלמד אותך לעבוד נכון עם Excel בעולם האמיתי. מוקלט, מלווה, עם גישה לכל החיים.',
};

const PAINS = [
  { emoji: '⏰', text: 'אני עובד הרבה יותר מדי זמן על קבצים שיכולתי לסיים בחצי השעה' },
  { emoji: '🤯', text: 'אני מסתבך עם נוסחאות ולא מבין מה עשיתי ולמה זה לא עובד' },
  { emoji: '😟', text: 'אני מרגיש לא מקצועי כשכולם מסביבי שולטים ב-Excel ואני לא' },
  { emoji: '📊', text: 'אני לא יודע איך להציג נתונים בצורה שנראית ברורה ומשכנעת' },
];

const BENEFITS = [
  { icon: '⚡', title: 'חוסך שעות כל שבוע', desc: 'נוסחאות ושורטקאטים שהופכים עבודה של שעתיים לרבע שעה' },
  { icon: '🎯', title: 'שליטה מלאה בנתונים', desc: 'תדע לסנן, למיין ולנתח כל גיליון אלקטרוני בדיוק כמו שצריך' },
  { icon: '💼', title: 'נראה מקצועי יותר', desc: 'בנה דוחות ותרשימים שגורמים לך להיראות כמו מומחה' },
  { icon: '🧠', title: 'לומד אחת ומשתמש לכל החיים', desc: 'הכלים שתלמד רלוונטיים בכל תחום ובכל עבודה' },
];

const CURRICULUM = [
  { num: '01', title: 'מבוא ויסודות', lessons: 6, desc: 'ממשק Excel, ניווט, הזנת נתונים, שמירה' },
  { num: '02', title: 'נוסחאות בסיסיות', lessons: 8, desc: 'SUM, AVERAGE, IF, COUNT ועוד' },
  { num: '03', title: 'עיצוב ותצוגה', lessons: 4, desc: 'פורמט תאים, צבעים, הגנה על גיליון' },
  { num: '04', title: 'מיון, סינון וחיפוש', lessons: 6, desc: 'AutoFilter, VLOOKUP, מוצא נתון בשניות' },
  { num: '05', title: 'תרשימים וגרפים', lessons: 5, desc: 'עמודות, עוגה, קווים — מה מתי ואיך' },
  { num: '06', title: 'פרויקט מסכם', lessons: 3, desc: 'בונים גיליון ניהול תקציב מלא מאפס' },
];

const TESTIMONIALS = [
  { name: 'מיכל כהן', title: 'מנהלת חשבונות', text: 'הייתי מבזבזת שעות על קבצים. היום אני עושה את אותה עבודה ב-20 דקות. ישורון מסביר ברור ופשוט.', stars: 5 },
  { name: 'דוד לוי', title: 'מנהל פרויקטים', text: 'לבסוף הבנתי איך VLOOKUP עובד! אחרי שנים שהתביישתי לשאול. ההסברים ממש מחזיקים את היד.', stars: 5 },
  { name: 'שרית אברהם', title: 'בעלת עסק עצמאי', text: 'קניתי את שני הקורסים. השקעה שחוזרת אליי כל יום. עכשיו אני בונה דוחות שהייתי משלמת לרואה חשבון.', stars: 5 },
  { name: 'רחל מזרחי', title: 'מזכירה בכירה', text: 'פחדתי מאקסל שנים. ישורון גרם לזה להיות פשוט ומהנה. סיימתי את כל הקורס תוך שבועיים.', stars: 5 },
];

function Stars({ n }: { n: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: n }).map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>;
}

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden" dir="rtl">
      <Navbar transparent />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-32 pt-40">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            קורס מוקלט | גישה מיידית | ₪497 בלבד
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-up">
            לשלוט באקסל<br />
            <span className="text-yellow-400">זה לשלוט בעבודה שלך</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 animate-fade-up delay-100">
            קורס פרקטי שמלמד אותך לעבוד נכון עם Excel בעולם האמיתי — מאפס, צעד אחר צעד
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-200">
            <a href="#pricing" className="btn-primary text-lg py-4 px-8 bg-yellow-400 hover:bg-yellow-300 text-blue-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              הצטרף עכשיו — ₪497
            </a>
            <a href="#curriculum" className="btn-secondary text-lg py-4 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
              מה נלמד? ↓
            </a>
          </div>

          {/* Social proof bar */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-blue-200 animate-fade-up delay-300">
            <div className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-xl">500+</span> תלמידים</div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-xl">32</span> שיעורים</div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2"><Stars n={5} /><span>4.9/5</span></div>
            <div className="w-px h-6 bg-white/20" />
            <div>גישה לכל החיים</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ── PAIN ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">אולי אתה מרגיש ככה...</p>
            <h2 className="section-title">אם זה נשמע מוכר —<br />הקורס הזה בשבילך</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PAINS.map((p, i) => (
              <div key={i} className="card p-6 flex items-start gap-4 hover:border-blue-200 transition-colors">
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <p className="text-gray-700 text-lg leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / BENEFITS ──────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">הפתרון</p>
            <h2 className="section-title">מה תקבל מהקורס</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTRUCTOR ───────────────────────────────── */}
      <section id="about" className="py-20 bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-300 font-semibold text-sm uppercase tracking-wide mb-4">המרצה</p>
              <h2 className="font-display text-4xl font-bold mb-6">ישורון גליקמן</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                איש כספים וניהול עם ניסיון עשיר בעולם העסקי. שימש בתפקידי הובלה פיננסית בארגונים עסקיים ומרצה בתחומי כלים פיננסיים וניהול מעשי.
              </p>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                הגישה שלו: <strong className="text-white">חשיבה פרקטית</strong>, שליטה בנתונים, וקבלת החלטות מבוססת מידע — עם כלים פשוטים שניתן ליישם מחר בבוקר.
              </p>
              <div className="flex flex-wrap gap-3">
                {['ניהול פיננסי', 'Excel מתקדם', 'קבלת החלטות', 'ניתוח נתונים'].map((tag) => (
                  <span key={tag} className="badge bg-blue-800 text-blue-100">{tag}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-blue-800 rounded-2xl p-8 border border-blue-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">י</div>
                  <div>
                    <div className="font-bold text-lg">ישורון גליקמן</div>
                    <div className="text-blue-300 text-sm">מרצה ויועץ עסקי</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['500+', 'תלמידים'], ['10+', 'שנות ניסיון'], ['4.9', 'דירוג ממוצע'], ['32', 'שיעורים']].map(([v, l]) => (
                    <div key={l} className="bg-blue-700/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{v}</div>
                      <div className="text-blue-200 text-sm mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ───────────────────────────────── */}
      <section id="curriculum" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">תוכן הקורס</p>
            <h2 className="section-title">מה נלמד</h2>
            <p className="text-gray-500 mt-4">32 שיעורים מוקלטים · 6 מודולים · גישה לכל החיים</p>
          </div>
          <div className="space-y-3">
            {CURRICULUM.map((m) => (
              <details key={m.num} className="card p-0 overflow-hidden group">
                <summary className="flex items-center gap-4 p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                  <span className="text-blue-600 font-bold text-sm w-8 flex-shrink-0">{m.num}</span>
                  <span className="font-semibold text-gray-900 flex-1">{m.title}</span>
                  <span className="text-gray-400 text-sm">{m.lessons} שיעורים</span>
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-gray-600 text-sm border-t border-gray-100">{m.desc}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">עדויות תלמידים</p>
            <h2 className="section-title">מה אומרים עלינו</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <Stars n={t.stars} />
                <p className="text-gray-700 mt-4 mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">מחיר והרשמה</p>
            <h2 className="section-title">תתחיל היום</h2>
          </div>

          <div className="card p-8 border-2 border-blue-500 relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="badge bg-blue-500 text-white text-xs px-4 py-1.5">הכי פופולרי</span>
            </div>

            <h3 className="font-display text-2xl font-bold text-center text-gray-900 mb-1">קורס אקסל למתחילים</h3>
            <p className="text-center text-gray-500 text-sm mb-6">גישה מלאה + עדכונים לכל החיים</p>

            <div className="text-center mb-8">
              <div className="text-gray-400 line-through text-lg">₪797</div>
              <div className="text-5xl font-bold text-gray-900 my-1">₪497</div>
              <div className="text-green-600 font-semibold text-sm">חיסכון של ₪300 — מחיר השקה</div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                '32 שיעורים מוקלטים באיכות HD',
                'גישה מיידית לאחר הרכישה',
                'גישה לכל החיים כולל עדכונים',
                'תרגילים ודפי עבודה להורדה',
                'תמיכה בקהילת הלומדים',
                'אחריות 14 יום — כסף חזרה',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/courses/excel-beginners/buy" className="btn-primary w-full text-lg py-4 justify-center block text-center bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              הצטרף עכשיו — ₪497
            </Link>

            <p className="text-center text-gray-400 text-xs mt-4">
              תשלום מאובטח · 14 יום החזר כסף · ללא סיכון
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="section-title text-center mb-10">שאלות נפוצות</h2>
          <div className="space-y-3">
            {[
              { q: 'האם הקורס מתאים למי שאף פעם לא השתמש ב-Excel?', a: 'בהחלט. הקורס מתחיל מהבסיס המוחלט וצועד בקצב נוח. אין צורך בידע קודם.' },
              { q: 'כמה זמן יש לי גישה לקורס?', a: 'גישה לכל החיים, כולל כל העדכונים העתידיים שנוסיף לקורס.' },
              { q: 'מה אם הקורס לא מתאים לי?', a: 'אנו מציעים אחריות מלאה של 14 יום. אם לא מרוצה — מחזירים את הכסף, ללא שאלות.' },
              { q: 'האם יש תמיכה אם אני תקוע?', a: 'כן. יש לנו קהילת תלמידים פעילה שבה ניתן לשאול שאלות, ואנחנו מגיבים לכל שאלה.' },
              { q: 'על איזה גרסה של Excel הקורס מתבסס?', a: 'הקורס מלמד על Excel 365/2021, אבל 99% מהתכנים רלוונטיים לכל גרסה מ-2013 ואילך.' },
            ].map((faq, i) => (
              <details key={i} className="card p-0 overflow-hidden">
                <summary className="p-5 cursor-pointer list-none font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-gray-600 border-t border-gray-100">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold mb-4">מוכן להתחיל?</h2>
          <p className="text-blue-100 text-xl mb-8">הצטרף ל-500+ תלמידים שכבר שולטים ב-Excel</p>
          <a href="#pricing" className="btn-primary text-xl py-5 px-10 bg-yellow-400 hover:bg-yellow-300 text-blue-900 shadow-2xl hover:-translate-y-1 transition-all">
            הצטרף עכשיו — ₪497
          </a>
          <p className="text-blue-300 text-sm mt-4">אחריות 14 יום · גישה מיידית · ללא סיכון</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <p>© {new Date().getFullYear()} ישורון גליקמן · כל הזכויות שמורות</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-white transition-colors">פרטיות</Link>
          <Link href="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link>
          <Link href="/contact" className="hover:text-white transition-colors">צור קשר</Link>
        </div>
      </footer>
    </main>
  );
}
