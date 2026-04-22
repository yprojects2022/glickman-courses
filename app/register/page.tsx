'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('שגיאת חיבור, נסה שוב');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-gray-900">ישורון גליקמן</Link>
          <h1 className="text-xl font-semibold text-gray-700 mt-2">יצירת חשבון</h1>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">שם פרטי</label>
                <input type="text" className="input" placeholder="ישראל" required value={form.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className="label">שם משפחה</label>
                <input type="text" className="input" placeholder="ישראלי" required value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div>
              <label className="label">אימייל</label>
              <input type="email" className="input" placeholder="your@email.com" required value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">סיסמה (לפחות 6 תווים)</label>
              <input type="password" className="input" placeholder="••••••••" required minLength={6} value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="label">טלפון (אופציונלי)</label>
              <input type="tel" className="input" placeholder="050-0000000" value={form.phone} onChange={set('phone')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 justify-center mt-2">
              {loading ? 'יוצר חשבון...' : 'הרשמה'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">כניסה</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
