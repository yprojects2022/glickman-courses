import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BuyButton from './BuyButton';

interface Props { params: { slug: string } }

async function getCourse(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCourse(params.slug);
  if (!data) return { title: 'קורס לא נמצא' };
  return {
    title: data.course.meta_title || data.course.title,
    description: data.course.meta_description || data.course.subtitle,
  };
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}

const LEVEL_LABELS: Record<string, string> = { beginner: 'מתחילים', advanced: 'מתקדמים', all: 'כל הרמות' };
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default async function CoursePage({ params }: Props) {
  const data = await getCourse(params.slug);
  if (!data) notFound();

  const { course, modules = [], testimonials = [], isEnrolled } = data;
  const allLessons = modules.flatMap((m: any) => m.lessons || []);
  const totalMinutes = Math.round(allLessons.reduce((s: number, l: any) => s + (l.video_duration_seconds || 0), 0) / 60);

  return (
    <div dir="rtl">
      <Navbar />
      <div className="pt-16">

        {/* ── HERO ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/courses" className="text-blue-300 text-sm hover:text-white">קורסים</Link>
                <span className="text-blue-500">›</span>
                <span className="text-blue-200 text-sm">{course.title}</span>
              </div>
              <span className="badge bg-yellow-400 text-yellow-900 mb-4">{LEVEL_LABELS[course.level]}</span>
              <h1 className="font-display text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-blue-100 text-xl mb-6">{course.subtitle}</p>

              <div className="flex flex-wrap gap-6 text-sm text-blue-200">
                <span className="flex items-center gap-1.5">📹 {course.total_lessons} שיעורים</span>
                <span className="flex items-center gap-1.5">⏱ {totalMinutes} דקות</span>
                <span className="flex items-center gap-1.5">🎓 {course.instructor_name}</span>
                <span className="flex items-center gap-1.5">♾ גישה לכל החיים</span>
              </div>
            </div>

            {/* Sticky purchase card – desktop */}
            <div className="hidden lg:block">
              <PurchaseCard course={course} isEnrolled={isEnrolled} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            {/* What you'll learn */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">מה תלמד בקורס</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  'לבנות גיליונות אלקטרוניים מאפס',
                  'להשתמש בנוסחאות מרכזיות',
                  'לסנן, למיין ולנתח נתונים',
                  'ליצור תרשימים ודוחות ויזואליים',
                  'לחסוך שעות עבודה בכל שבוע',
                  'להרגיש בטוח ומקצועי עם Excel',
                ].map(item => <CheckItem key={item} text={item} />)}
              </ul>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">תוכן הקורס</h2>
              <p className="text-gray-500 text-sm mb-6">{modules.length} מודולים · {course.total_lessons} שיעורים · {totalMinutes} דקות</p>
              <div className="space-y-2">
                {modules.map((m: any) => (
                  <details key={m.id} className="border border-gray-200 rounded-xl overflow-hidden group">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="font-semibold text-gray-900">{m.title}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{(m.lessons || []).length} שיעורים</span>
                    </summary>
                    <div className="border-t border-gray-100">
                      {(m.lessons || []).map((l: any, i: number) => (
                        <div key={l.id} className={`flex items-center gap-3 px-5 py-3 text-sm ${i < (m.lessons.length - 1) ? 'border-b border-gray-50' : ''}`}>
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs flex-shrink-0">
                            {l.is_preview ? '▶' : '🔒'}
                          </span>
                          <span className={`flex-1 ${l.is_preview ? 'text-blue-600' : 'text-gray-600'}`}>{l.title}</span>
                          <span className="text-gray-400">{fmtDur(l.video_duration_seconds || 0)}</span>
                          {l.is_preview && <span className="badge bg-blue-50 text-blue-600 text-xs">תצוגה מקדימה</span>}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">על המרצה</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">י</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{course.instructor_name}</h3>
                  <p className="text-gray-500 text-sm mb-3">מרצה, יועץ פיננסי ועסקי</p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    איש כספים וניהול עם ניסיון עשיר בעולם העסקי. מרצה בתחומי כלים פיננסיים וניהול מעשי.
                    הגישה שלו: חשיבה פרקטית, שליטה בנתונים, וקבלת החלטות מבוססת מידע.
                  </p>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">מה אומרים הלומדים</h2>
                <div className="space-y-4">
                  {testimonials.map((t: any, i: number) => (
                    <div key={i} className="card p-5">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.rating || 5 }).map((_, j) => (
                          <span key={j} className="text-yellow-400 text-sm">★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">"{t.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{t.name[0]}</div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                          {t.title && <div className="text-gray-400 text-xs">{t.title}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar purchase card – desktop sticky */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PurchaseCard course={course} isEnrolled={isEnrolled} />
            </div>
          </div>
        </div>

        {/* Mobile purchase bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              {course.original_price && <div className="text-gray-400 line-through text-sm">₪{course.original_price}</div>}
              <div className="text-2xl font-bold text-gray-900">₪{course.price}</div>
            </div>
            {isEnrolled ? (
              <Link href={`/courses/watch/${course.slug}`} className="btn-primary flex-1 justify-center">המשך ללמוד</Link>
            ) : (
              <BuyButton courseId={course.id} courseTitle={course.title} price={course.price} className="flex-1 justify-center" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ course, isEnrolled }: { course: any; isEnrolled: boolean }) {
  return (
    <div className="card p-6 border-gray-200">
      <div className="aspect-video bg-gray-100 rounded-xl mb-5 flex items-center justify-center overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">📊</span>
        )}
      </div>

      <div className="mb-5">
        {course.original_price && (
          <div className="text-gray-400 line-through text-base">₪{course.original_price}</div>
        )}
        <div className="text-4xl font-bold text-gray-900">₪{course.price}</div>
        {course.original_price && (
          <div className="text-green-600 text-sm font-medium mt-1">
            חיסכון של ₪{course.original_price - course.price}
          </div>
        )}
      </div>

      {isEnrolled ? (
        <Link href={`/courses/watch/${course.slug}`} className="btn-primary w-full justify-center py-3.5 block text-center mb-4">
          ✓ המשך ללמוד
        </Link>
      ) : (
        <BuyButton courseId={course.id} courseTitle={course.title} price={course.price} className="w-full justify-center py-3.5 mb-4" />
      )}

      <p className="text-center text-gray-400 text-xs mb-5">14 יום אחריות · ללא סיכון</p>

      <ul className="space-y-2.5 text-sm text-gray-600">
        {[
          `${course.total_lessons} שיעורים מוקלטים`,
          'גישה מיידית לאחר הרכישה',
          'גישה לכל החיים + עדכונים',
          'דפי עבודה להורדה',
          'תמיכה בקהילת הלומדים',
        ].map(item => (
          <li key={item} className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
