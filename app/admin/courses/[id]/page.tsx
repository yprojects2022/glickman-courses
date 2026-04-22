'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson { id: string; title: string; video_url: string; video_duration_seconds: number; sort_order: number; is_preview: boolean; module_title: string; }
interface Module { id: string; title: string; sort_order: number; }

export default function AdminCourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const [course, setCourse] = useState({ slug: '', title: '', subtitle: '', description: '', price: '', originalPrice: '', level: 'beginner', isPublished: false, thumbnailUrl: '', promoVideoUrl: '', metaTitle: '', metaDescription: '' });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'info' | 'lessons'>('info');

  // New lesson form
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', videoUrl: '', videoDurationSeconds: '', sortOrder: '0', isPreview: false });

  useEffect(() => {
    if (isNew) return;
    Promise.all([
      fetch(`/api/admin/courses`).then(r => r.json()),
      fetch(`/api/admin/lessons?courseId=${id}`).then(r => r.json()),
    ]).then(([cd, ld]) => {
      const c = (cd.courses || []).find((c: any) => c.id === id);
      if (c) setCourse({ slug: c.slug, title: c.title, subtitle: c.subtitle || '', description: c.description || '', price: c.price, originalPrice: c.original_price || '', level: c.level, isPublished: c.is_published, thumbnailUrl: c.thumbnail_url || '', promoVideoUrl: c.promo_video_url || '', metaTitle: c.meta_title || '', metaDescription: c.meta_description || '' });
      setLessons(ld.lessons || []);
    });
    fetch(`/api/courses/${id}`).then(r => r.json()).then(d => setModules(d.modules || []));
  }, [id, isNew]);

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const body = { ...course, price: Number(course.price), originalPrice: course.originalPrice ? Number(course.originalPrice) : undefined };
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/courses' : `/api/admin/courses/${id}`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        setMsg('✓ נשמר בהצלחה');
        if (isNew && data.course?.id) router.push(`/admin/courses/${data.course.id}`);
      } else {
        setMsg(`שגיאה: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!newLesson.moduleId || !newLesson.title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLesson, courseId: id, videoDurationSeconds: Number(newLesson.videoDurationSeconds) || 0, sortOrder: Number(newLesson.sortOrder) }),
    });
    if (res.ok) {
      const data = await res.json();
      setLessons(prev => [...prev, data.lesson]);
      setNewLesson({ moduleId: '', title: '', videoUrl: '', videoDurationSeconds: '', sortOrder: '0', isPreview: false });
    }
  }

  async function updateLessonVideo(lessonId: string, videoUrl: string) {
    await fetch('/api/admin/lessons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lessonId, videoUrl }) });
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, video_url: videoUrl } : l));
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setCourse(c => ({ ...c, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 text-sm">← ניהול</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">{isNew ? 'קורס חדש' : course.title || 'עריכת קורס'}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
          {(['info', 'lessons'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'info' ? 'פרטי קורס' : `שיעורים (${lessons.length})`}
            </button>
          ))}
        </div>

        {/* COURSE INFO */}
        {tab === 'info' && (
          <form onSubmit={saveCourse} className="space-y-6">
            {msg && <div className={`rounded-xl px-4 py-3 text-sm ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

            <div className="card p-6 space-y-5">
              <h2 className="font-bold text-gray-900">מידע בסיסי</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">כותרת</label><input className="input" value={course.title} onChange={set('title')} required /></div>
                <div><label className="label">Slug (URL)</label><input className="input" value={course.slug} onChange={set('slug')} placeholder="excel-beginners" required /></div>
              </div>
              <div><label className="label">כותרת משנה</label><input className="input" value={course.subtitle} onChange={set('subtitle')} /></div>
              <div><label className="label">תיאור מלא</label><textarea className="input min-h-[120px] resize-y" value={course.description} onChange={set('description')} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="label">מחיר (₪)</label><input type="number" className="input" value={course.price} onChange={set('price')} required /></div>
                <div><label className="label">מחיר מקורי (₪)</label><input type="number" className="input" value={course.originalPrice} onChange={set('originalPrice')} placeholder="לפני הנחה" /></div>
                <div>
                  <label className="label">רמה</label>
                  <select className="input" value={course.level} onChange={set('level')}>
                    <option value="beginner">מתחילים</option>
                    <option value="advanced">מתקדמים</option>
                    <option value="all">כל הרמות</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={course.isPublished} onChange={set('isPublished')} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">פורסם (גלוי לקהל)</span>
              </label>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-gray-900">מדיה</h2>
              <div><label className="label">URL תמונת שער</label><input className="input" type="url" value={course.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="https://..." /></div>
              <div><label className="label">URL וידאו פרומו</label><input className="input" type="url" value={course.promoVideoUrl} onChange={set('promoVideoUrl')} placeholder="https://..." /></div>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-gray-900">SEO</h2>
              <div><label className="label">Title tag</label><input className="input" value={course.metaTitle} onChange={set('metaTitle')} /></div>
              <div><label className="label">Meta description</label><textarea className="input" value={course.metaDescription} onChange={set('metaDescription')} rows={2} /></div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary py-3 px-8">
              {saving ? 'שומר...' : 'שמור קורס'}
            </button>
          </form>
        )}

        {/* LESSONS */}
        {tab === 'lessons' && (
          <div className="space-y-6">
            {/* Add lesson form */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">הוסף שיעור חדש</h2>
              <form onSubmit={addLesson} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">מודול</label>
                    <select className="input" value={newLesson.moduleId} onChange={e => setNewLesson(l => ({ ...l, moduleId: e.target.value }))} required>
                      <option value="">בחר מודול</option>
                      {modules.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                  <div><label className="label">כותרת שיעור</label><input className="input" value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} required /></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2"><label className="label">URL וידאו</label><input className="input" type="url" value={newLesson.videoUrl} onChange={e => setNewLesson(l => ({ ...l, videoUrl: e.target.value }))} placeholder="https://..." /></div>
                  <div><label className="label">משך (שניות)</label><input type="number" className="input" value={newLesson.videoDurationSeconds} onChange={e => setNewLesson(l => ({ ...l, videoDurationSeconds: e.target.value }))} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={newLesson.isPreview} onChange={e => setNewLesson(l => ({ ...l, isPreview: e.target.checked }))} className="w-4 h-4" />
                    תצוגה מקדימה חינמית
                  </label>
                  <button type="submit" className="btn-primary text-sm py-2 px-4">+ הוסף שיעור</button>
                </div>
              </form>
            </div>

            {/* Lessons list */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">שיעורים ({lessons.length})</h2>
              </div>
              {lessons.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400">עדיין אין שיעורים בקורס זה</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {lessons.map((l, i) => (
                    <div key={l.id} className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                        <span className="font-medium text-gray-900 flex-1">{l.title}</span>
                        <span className="text-gray-400 text-xs">{l.module_title}</span>
                        {l.is_preview && <span className="badge bg-blue-50 text-blue-600 text-xs">תצוגה מקדימה</span>}
                      </div>
                      <div className="flex gap-2 mr-9">
                        <input
                          className="input text-xs py-1.5 flex-1"
                          placeholder="URL וידאו"
                          defaultValue={l.video_url || ''}
                          onBlur={e => { if (e.target.value !== l.video_url) updateLessonVideo(l.id, e.target.value); }}
                        />
                        <span className="text-gray-400 text-xs flex items-center">{Math.floor((l.video_duration_seconds || 0) / 60)}:{String((l.video_duration_seconds || 0) % 60).padStart(2, '0')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
