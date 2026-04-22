import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const [
    overview,
    revenueByMonth,
    revenueByProvider,
    topCourses,
    recentActivity,
  ] = await Promise.all([
    // Overview counts
    query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM orders WHERE status = 'paid') as total_paid_orders,
        (SELECT COALESCE(SUM(amount),0) FROM orders WHERE status = 'paid') as total_revenue,
        (SELECT COUNT(*) FROM enrollments WHERE is_active = true) as total_enrollments,
        (SELECT COUNT(*) FROM orders WHERE status = 'paid' AND created_at > NOW() - INTERVAL '30 days') as orders_last_30d,
        (SELECT COALESCE(SUM(amount),0) FROM orders WHERE status = 'paid' AND created_at > NOW() - INTERVAL '30 days') as revenue_last_30d
    `),

    // Revenue by month (last 12 months)
    query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') as month,
        COUNT(*) as orders,
        SUM(amount) as revenue
      FROM orders
      WHERE status = 'paid' AND paid_at > NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', paid_at)
      ORDER BY month
    `),

    // Revenue by provider
    query(`
      SELECT payment_provider, COUNT(*) as orders, SUM(amount) as revenue
      FROM orders WHERE status = 'paid'
      GROUP BY payment_provider
    `),

    // Top courses by revenue
    query(`
      SELECT c.title, COUNT(o.id) as orders, SUM(o.amount) as revenue
      FROM courses c
      LEFT JOIN orders o ON o.course_id = c.id AND o.status = 'paid'
      GROUP BY c.id, c.title
      ORDER BY revenue DESC NULLS LAST
    `),

    // Recent activity
    query(`
      SELECT
        'order' as type,
        o.created_at as timestamp,
        u.email,
        c.title as detail,
        o.amount::text as value,
        o.status
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN courses c ON c.id = o.course_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `),
  ]);

  return NextResponse.json({
    overview: overview[0],
    revenueByMonth,
    revenueByProvider,
    topCourses,
    recentActivity,
  });
}
