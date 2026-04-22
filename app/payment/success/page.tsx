import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'תשלום הצליח!' };

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        <div className="card p-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">תשלום הצליח!</h1>
          <p className="text-gray-600 mb-2">ברכות! הקורס שלך מוכן.</p>
          <p className="text-gray-500 text-sm mb-8">שלחנו לך אימייל אישור עם פרטי הרכישה.</p>
          <Link href="/dashboard" className="btn-primary w-full justify-center py-3.5">
            לקורסים שלי →
          </Link>
        </div>
      </div>
    </div>
  );
}
