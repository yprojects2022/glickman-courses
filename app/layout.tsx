import type { Metadata } from 'next';
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

const frank = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-frank',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ישורון גליקמן | קורסים דיגיטליים', template: '%s | ישורון גליקמן' },
  description: 'קורסי Excel פרקטיים שמלמדים אותך לעבוד נכון עם נתונים בעולם האמיתי.',
  keywords: ['קורס אקסל', 'Excel', 'למידה מקוונת', 'ישורון גליקמן', 'ניהול פיננסי'],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'ישורון גליקמן | קורסים',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${frank.variable}`}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
