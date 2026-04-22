import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">הדף לא נמצא</h1>
        <p className="text-gray-500 mb-8">הדף שחיפשת אינו קיים או הוסר.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">לדף הבית</Link>
          <Link href="/courses" className="btn-secondary">לקורסים</Link>
        </div>
      </div>
    </div>
  );
}
