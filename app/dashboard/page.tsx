import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'הקורסים שלי' };

async function getDashboardData(userId: string) {
  const enrollments = await query(`
    SELECT
      c.id, c.slug, c.title, c.subtitle, c.thumbnail_url, c.total_lessons,
      e.enrolled_at,
      COUNT(p.id) FILTER (WHERE p.is_completed) as completed_lessons
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = c.id
    WHERE e.user_id = $1 AND e.is_active = true
    GROUP BY c.id, e.enrolled_at
    ORDER BY e.enrolled_at DESC
  `, [userId]);
  return { enrollments };
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) redirect('/login');

  const { enrollments } = await getDashboardData(payload.userId);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-gray-900">ישורון גליקמן</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">שלום, {payload.email}</span>
            {payload.role === 'admin' && (
              <Link href="/admin" className="text-sm text-blue-600 font-medium hover:underline">ניהול</Link>
            )}
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">יציאה</button>
            </form>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="section-title mb-2">הקורסים שלי</h1>
        <p className="text-gray-500 mb-8">{enrollments.length} קורסים פעילים</p>

        {enrollments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">עדיין אין קורסים</h2>
            <p className="text-gray-500 mb-6">רכוש קורס כדי להתחיל ללמוד</p>
            <Link href="/courses" className="btn-primary">לחנות הקורסים</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments.map((e: any) => {
              const pct = e.total_lessons > 0 ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0;
              return (
                <div key={e.id} className="card p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl flex-shrink-0">📊</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{e.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 truncate">{e.subtitle}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>{e.completed_lessons}/{e.total_lessons} שיעורים</span>
                      <span className="font-semibold text-blue-600">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <Link href={`/courses/watch/${e.slug}`} className="btn-primary justify-center py-2.5 text-sm">
                    {pct === 0 ? 'התחל ללמוד' : pct === 100 ? 'צפה שוב' : 'המשך ללמוד'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse more */}
        <div className="mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">רוצה להרחיב את הידע?</h3>
            <p className="text-gray-500 text-sm mt-1">גלה קורסים נוספים שיקחו אותך רמה</p>
          </div>
          <Link href="/courses" className="btn-primary text-sm py-2.5 px-5 flex-shrink-0">לכל הקורסים</Link>
        </div>
      </main>
    </div>
  );
}
