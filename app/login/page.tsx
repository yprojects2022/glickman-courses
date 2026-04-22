'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(redirect);
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
          <h1 className="text-xl font-semibold text-gray-700 mt-2">כניסה לחשבון</h1>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">אימייל</label>
              <input type="email" className="input" placeholder="your@email.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">סיסמה</label>
              <input type="password" className="input" placeholder="••••••••" required minLength={6}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 justify-center">
              {loading ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">הרשמה</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
