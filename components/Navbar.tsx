'use client';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps { transparent?: boolean; }

export default function Navbar({ transparent }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100 shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`font-display text-xl font-bold ${transparent ? 'text-white' : 'text-gray-900'}`}>
          ישורון גליקמן
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/courses" className={`text-sm font-medium hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-gray-700'}`}>קורסים</Link>
          <Link href="/#about" className={`text-sm font-medium hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-gray-700'}`}>אודות</Link>
          <Link href="/login" className={`text-sm font-medium hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-gray-700'}`}>כניסה</Link>
          <Link href="/courses" className="btn-primary text-sm py-2 px-5">לקורסים</Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className={`md:hidden p-2 ${transparent ? 'text-white' : 'text-gray-700'}`} aria-label="תפריט">
          <div className="w-5 h-0.5 bg-current mb-1.5 transition-all" style={{ transform: open ? 'rotate(45deg) translate(0, 6px)' : '' }} />
          <div className="w-5 h-0.5 bg-current mb-1.5 transition-all" style={{ opacity: open ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-current transition-all" style={{ transform: open ? 'rotate(-45deg) translate(0, -6px)' : '' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4 shadow-lg">
          <Link href="/courses" className="text-gray-800 font-medium" onClick={() => setOpen(false)}>קורסים</Link>
          <Link href="/#about" className="text-gray-800 font-medium" onClick={() => setOpen(false)}>אודות</Link>
          <Link href="/login" className="text-gray-800 font-medium" onClick={() => setOpen(false)}>כניסה</Link>
          <Link href="/courses" className="btn-primary text-center" onClick={() => setOpen(false)}>לקורסים</Link>
        </div>
      )}
    </nav>
  );
}
