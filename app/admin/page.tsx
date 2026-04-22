import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — ניהול' };

async function getAdminStats() {
  const [users, orders, enrollments, revenue] = await Promise.all([
    query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']),
    query("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'"),
    query('SELECT COUNT(*) as count FROM enrollments WHERE is_active = true'),
    query("SELECT COALESCE(SUM(amount),0) as total FROM orders WHERE status = 'paid'"),
  ]);

  const recentOrders = await query(`
    SELECT o.order_number, o.amount, o.status, o.created_at, o.payment_provider,
           u.email, u.first_name, u.last_name, c.title as course_title
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    JOIN courses c ON c.id = o.course_id
    ORDER BY o.created_at DESC LIMIT 20
  `);

  const allCourses = await query('SELECT id, slug, title, price, is_published, total_lessons, created_at FROM courses ORDER BY created_at DESC');
  const allUsers = await query('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 50');

  return {
    stats: {
      users: Number((users[0] as any).count),
      orders: Number((orders[0] as any).count),
      enrollments: Number((enrollments[0] as any).count),
      revenue: Number((revenue[0] as any).total),
    },
    recentOrders,
    allCourses,
    allUsers,
  };
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-2xl p-6 ${color}`}>
      <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const STATUS_HE: Record<string, string> = { paid: 'שולם', pending: 'ממתין', failed: 'נכשל', refunded: 'הוחזר' };

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'admin') redirect('/dashboard');

  const { stats, recentOrders, allCourses, allUsers } = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl font-bold text-gray-900">ישורון גליקמן</Link>
            <span className="badge bg-blue-100 text-blue-700">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">דשבורד</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">אתר</Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="section-title mb-8">לוח בקרה</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="תלמידים" value={stats.users.toLocaleString()} color="bg-blue-600 text-white" />
          <StatCard label="הזמנות שולמו" value={stats.orders.toLocaleString()} color="bg-green-600 text-white" />
          <StatCard label="רישומים פעילים" value={stats.enrollments.toLocaleString()} color="bg-purple-600 text-white" />
          <StatCard label="הכנסות (₪)" value={`₪${Number(stats.revenue).toLocaleString()}`} color="bg-amber-500 text-white" />
        </div>

        {/* Recent Orders */}
        <section className="card mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">הזמנות אחרונות</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['מספר הזמנה', 'לקוח', 'קורס', 'סכום', 'ספק', 'סטטוס', 'תאריך'].map(h => (
                    <th key={h} className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o: any) => (
                  <tr key={o.order_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{o.first_name} {o.last_name}</div>
                      <div className="text-gray-400 text-xs">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{o.course_title}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₪{o.amount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.payment_provider || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${STATUS_CLASSES[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_HE[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('he-IL')}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">אין הזמנות עדיין</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Courses */}
          <section className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">קורסים</h2>
              <Link href="/admin/courses/new" className="btn-primary text-xs py-1.5 px-3">+ קורס חדש</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {allCourses.map((c: any) => (
                <div key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{c.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{c.total_lessons} שיעורים · ₪{c.price}</div>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_published ? 'פורסם' : 'טיוטה'}
                  </span>
                  <Link href={`/admin/courses/${c.id}`} className="text-blue-600 text-xs hover:underline flex-shrink-0">עריכה</Link>
                </div>
              ))}
            </div>
          </section>

          {/* Users */}
          <section className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">משתמשים אחרונים</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {allUsers.map((u: any) => (
                <div key={u.id} className="px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {u.first_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-400 truncate">{u.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {u.role === 'admin' && <span className="badge bg-blue-100 text-blue-700 text-xs">אדמין</span>}
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(u.created_at).toLocaleDateString('he-IL')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
