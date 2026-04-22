import Link from 'next/link';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'כל הקורסים',
  description: 'קורסי Excel מקיפים שיקחו אותך מרמת מתחיל לרמת מומחה.',
};

async function getCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

const LEVEL_LABELS: Record<string, string> = { beginner: 'מתחילים', advanced: 'מתקדמים', all: 'כל הרמות' };

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div dir="rtl">
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 py-12 mb-10">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="section-title mb-3">כל הקורסים</h1>
            <p className="text-gray-500 text-lg">קורסים פרקטיים שמלמדים אותך לעבוד נכון עם נתונים</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((c: any) => (
              <div key={c.id} className="card p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl flex-shrink-0">📊</div>
                  <div>
                    <span className="badge bg-blue-50 text-blue-600 mb-2 text-xs">{LEVEL_LABELS[c.level] || c.level}</span>
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">{c.title}</h2>
                    <p className="text-gray-500 text-sm mt-1">{c.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{c.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4 border-t border-gray-100 pt-4">
                  <span>📹 {c.total_lessons} שיעורים</span>
                  <span>👨‍🏫 {c.instructor_name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {c.original_price && <div className="text-gray-400 line-through text-sm">₪{c.original_price}</div>}
                    <div className="text-2xl font-bold text-gray-900">₪{c.price}</div>
                  </div>
                  <Link href={`/courses/${c.slug}`} className="btn-primary text-sm py-2.5 px-5">
                    לפרטים →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📚</div>
              <p>הקורסים יעלו בקרוב</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
