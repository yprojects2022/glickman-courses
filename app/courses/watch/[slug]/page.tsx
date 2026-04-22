'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

interface Lesson { id: string; title: string; video_duration_seconds: number; sort_order: number; is_preview: boolean; }
interface Module { id: string; title: string; lessons: Lesson[]; }
interface Progress { [lessonId: string]: { is_completed: boolean; watch_seconds: number; } }

export default function WatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const qp = useSearchParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(qp.get('lesson'));
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${slug}`).then(r => r.json()).then(d => {
      setCourse(d.course);
      setModules(d.modules || []);
      if (!activeLessonId && d.modules?.[0]?.lessons?.[0]) {
        setActiveLessonId(d.modules[0].lessons[0].id);
      }
    });
  }, [slug]);

  useEffect(() => {
    if (!course) return;
    fetch(`/api/progress?courseId=${course.id}`).then(r => r.json()).then(d => {
      const map: Progress = {};
      (d.progress || []).forEach((p: any) => { map[p.lesson_id] = p; });
      setProgress(map);
    });
  }, [course]);

  useEffect(() => {
    if (!activeLessonId || !modules.length) return;
    for (const m of modules) {
      const l = m.lessons?.find(l => l.id === activeLessonId);
      if (l) { setActiveLesson(l); break; }
    }
  }, [activeLessonId, modules]);

  const markComplete = useCallback(async (lessonId: string) => {
    if (!course) return;
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, courseId: course.id, watchSeconds: 0, isCompleted: true }),
    });
    setProgress(p => ({ ...p, [lessonId]: { ...p[lessonId], is_completed: true, watch_seconds: 0 } }));
  }, [course]);

  const allLessons = modules.flatMap(m => m.lessons || []);
  const currentIdx = allLessons.findIndex(l => l.id === activeLessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const completedCount = Object.values(progress).filter(p => p.is_completed).length;

  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center"><div className="text-4xl mb-4 animate-spin">⏳</div><p>טוען...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col" dir="rtl">
      {/* Top bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-4 flex-shrink-0">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
          ← חזרה
        </Link>
        <div className="w-px h-5 bg-gray-700" />
        <h1 className="font-semibold text-sm truncate flex-1">{course.title}</h1>
        <div className="text-sm text-gray-400">{completedCount}/{allLessons.length} שיעורים</div>
        <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-400 hover:text-white text-sm hidden md:block">
          {sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video area */}
          <div className="bg-black video-wrapper w-full">
            {activeLesson ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* In production this would be a real video player */}
                <div className="text-center p-10">
                  <div className="text-6xl mb-4">▶️</div>
                  <p className="text-white text-xl font-semibold">{activeLesson.title}</p>
                  <p className="text-gray-400 mt-2 text-sm">משך: {fmtDur(activeLesson.video_duration_seconds || 0)}</p>
                  <p className="text-gray-500 mt-4 text-xs">חבר קישור וידאו ב-Admin Panel</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">בחר שיעור</div>
            )}
          </div>

          {/* Lesson info + nav */}
          <div className="p-6 max-w-3xl">
            {activeLesson && (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeLesson.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">{fmtDur(activeLesson.video_duration_seconds || 0)}</p>
                  </div>
                  {!progress[activeLesson.id]?.is_completed && (
                    <button onClick={() => markComplete(activeLesson.id)}
                      className="btn-secondary text-sm py-2 px-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex-shrink-0">
                      ✓ סמן כהושלם
                    </button>
                  )}
                  {progress[activeLesson.id]?.is_completed && (
                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      הושלם
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  {prevLesson && (
                    <button onClick={() => setActiveLessonId(prevLesson.id)}
                      className="btn-secondary text-sm py-2 px-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                      ← שיעור קודם
                    </button>
                  )}
                  {nextLesson && (
                    <button onClick={() => setActiveLessonId(nextLesson.id)}
                      className="btn-primary text-sm py-2 px-4">
                      שיעור הבא →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar - curriculum */}
        {sidebarOpen && (
          <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0 hidden md:block">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold text-sm text-gray-200">תוכן הקורס</h3>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full">
                <div className="h-full bg-blue-500 rounded-full progress-bar"
                  style={{ width: `${allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{completedCount}/{allLessons.length} שיעורים הושלמו</p>
            </div>

            {modules.map(m => (
              <div key={m.id}>
                <div className="px-4 py-3 bg-gray-750 border-b border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{m.title}</p>
                </div>
                {(m.lessons || []).map(l => {
                  const done = progress[l.id]?.is_completed;
                  const active = l.id === activeLessonId;
                  return (
                    <button key={l.id} onClick={() => setActiveLessonId(l.id)}
                      className={`w-full text-right px-4 py-3 flex items-center gap-3 text-sm border-b border-gray-700/50 transition-colors
                        ${active ? 'bg-blue-900/40 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                        ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                        {done ? '✓' : l.sort_order}
                      </span>
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className="text-gray-500 text-xs flex-shrink-0">{fmtDur(l.video_duration_seconds || 0)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
