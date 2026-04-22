'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  className?: string;
}

export default function BuyButton({ courseId, courseTitle, price, className = '' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('נא להזין שם מלא'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, customerName: name, customerPhone: phone }),
      });
      const data = await res.json();

      if (res.status === 401) {
        // Not logged in — redirect to register with return URL
        router.push(`/register?redirect=/courses/${window.location.pathname.split('/').pop()}`);
        return;
      }
      if (res.status === 409) {
        // Already enrolled
        router.push('/dashboard');
        return;
      }
      if (!res.ok) { setError(data.error || 'שגיאה, נסה שוב'); return; }

      // Redirect to payment provider
      if (data.payment?.redirectUrl) {
        window.location.href = data.payment.redirectUrl;
      }
    } catch {
      setError('שגיאת חיבור, נסה שוב');
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className={`btn-primary ${className}`}
      >
        הצטרף עכשיו — ₪{price}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">{error}</div>
      )}
      <form onSubmit={handleBuy} className="space-y-3">
        <div>
          <input
            type="text"
            className="input text-sm"
            placeholder="שם מלא *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="tel"
            className="input text-sm"
            placeholder="טלפון (אופציונלי)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`btn-primary ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              מעבד...
            </span>
          ) : `לתשלום — ₪${price}`}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
        >
          ביטול
        </button>
      </form>
    </div>
  );
}
