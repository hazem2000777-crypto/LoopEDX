import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import {
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, Circle, Play, Lock, File,
  BookOpen, Clock, Award, List, StickyNote, Save, Home, X
} from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url?.match(p);
    if (m) return m[1];
  }
  return null;
}

function getDriveId(url) {
  const m = url?.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function VideoPlayer({ lesson }) {
  if (!lesson?.video_url) {
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", background: "#0F172A", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <Play size={48} color="rgba(255,255,255,0.2)" />
        <p style={{ fontFamily: "'Cairo', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: 15 }}>لا يوجد فيديو لهذه المحاضرة</p>
      </div>
    );
  }
  const type = lesson.video_type || "youtube";
  if (type === "youtube") {
    const id = getYoutubeId(lesson.video_url);
    if (!id) return null;
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000", position: "relative" }}>
        <iframe src={`https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&color=white&controls=1`}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen title={lesson.title} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "22%", height: "14%", background: "#000", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "16%", background: "linear-gradient(transparent, #000)", pointerEvents: "none" }} />
      </div>
    );
  }
  if (type === "drive") {
    const id = getDriveId(lesson.video_url);
    if (!id) return null;
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe src={`https://drive.google.com/file/d/${id}/preview`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay" title={lesson.title} />
      </div>
    );
  }
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
      <video src={lesson.video_url} controls style={{ width: "100%", height: "100%" }} controlsList="nodownload" />
    </div>
  );
}

export default function LearnCourse() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [expandedSections, setExpandedSections] = useState(new Set([0]));

  useEffect(() => { fetchCourseData(); }, [id]);
  useEffect(() => { if (currentLesson) loadNote(currentLesson.id); }, [currentLesson]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const { data: enrollment } = await supabase.from("enrollments").select("*").eq("student_id", user.id).eq("course_id", id).single();
      if (!enrollment) { navigate("/courses"); return; }

      const { data: courseData } = await supabase.from("courses").select("*").eq("id", id).single();
      setCourse(courseData);

      const { data: sectionsData } = await supabase.from("sections").select(`*, lessons(*)`).eq("course_id", id).order("order_num");
      if (sectionsData?.length > 0) {
        const sorted = sectionsData.map(s => ({ ...s, lessons: (s.lessons || []).sort((a, b) => a.order_num - b.order_num) }));
        setSections(sorted);

        const { data: progressData } = await supabase.from("progress").select("lesson_id").eq("user_id", user.id).eq("course_id", id);
        const completed = new Set(progressData?.map(p => p.lesson_id) || []);
        setCompletedLessons(completed);

        const allLessons = sorted.flatMap(s => s.lessons);
        const firstIncomplete = allLessons.find(l => !completed.has(l.id));
        setCurrentLesson(firstIncomplete || allLessons[0]);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const markComplete = async (lessonId) => {
    if (completedLessons.has(lessonId)) return;
    try {
      await supabase.from("progress").upsert({ user_id: user.id, course_id: id, lesson_id: lessonId, completed_at: new Date().toISOString() });
      const newCompleted = new Set([...completedLessons, lessonId]);
      setCompletedLessons(newCompleted);
      const allLessons = sections.flatMap(s => s.lessons);
      const progress = Math.round((newCompleted.size / allLessons.length) * 100);
      await supabase.from("enrollments").update({ progress }).eq("student_id", user.id).eq("course_id", id);
    } catch (err) { console.error(err); }
  };

  const goToNext = () => {
    const allLessons = sections.flatMap(s => s.lessons);
    const idx = allLessons.findIndex(l => l.id === currentLesson?.id);
    if (idx < allLessons.length - 1) setCurrentLesson(allLessons[idx + 1]);
  };

  const goToPrev = () => {
    const allLessons = sections.flatMap(s => s.lessons);
    const idx = allLessons.findIndex(l => l.id === currentLesson?.id);
    if (idx > 0) setCurrentLesson(allLessons[idx - 1]);
  };

  const loadNote = async (lessonId) => {
    try {
      const { data } = await supabase.from("notes").select("content").eq("user_id", user.id).eq("lesson_id", lessonId).single();
      setNote(data?.content || "");
    } catch { setNote(""); }
  };

  const saveNote = async () => {
    if (!currentLesson) return;
    await supabase.from("notes").upsert({ user_id: user.id, lesson_id: currentLesson.id, course_id: id, content: note, updated_at: new Date().toISOString() });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const allLessons = sections.flatMap(s => s.lessons);
  const currentIdx = allLessons.findIndex(l => l.id === currentLesson?.id);
  const totalProgress = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0F172A", direction: "rtl", fontFamily: "'Cairo', sans-serif", overflow: "hidden", position: "relative" }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998 }} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: 300,
        background: "#1E293B",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        right: 0,
        height: "100vh",
        zIndex: isMobile ? 999 : 1,
        transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
        flexShrink: 0,
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <BookOpen size={18} color="#60A5FA" />
              <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Loop<span style={{ color: "#60A5FA" }}>EDX</span></span>
            </Link>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                <X size={16} />
              </button>
            )}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: "0 0 10px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {course?.title}
          </h3>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>تقدمك</span>
              <span style={{ fontSize: 12, color: "#60A5FA", fontWeight: 700 }}>{totalProgress}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalProgress}%`, background: "linear-gradient(90deg,#1E40AF,#2563EB)", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{completedLessons.size} / {allLessons.length} محاضرة</div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {sections.map((section, si) => (
            <div key={section.id}>
              <button onClick={() => {
                const newExp = new Set(expandedSections);
                newExp.has(si) ? newExp.delete(si) : newExp.add(si);
                setExpandedSections(newExp);
              }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "right" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#CBD5E1" }}>{section.title}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#475569" }}>{section.lessons?.filter(l => completedLessons.has(l.id)).length}/{section.lessons?.length}</span>
                  {expandedSections.has(si) ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
                </div>
              </button>
              {expandedSections.has(si) && section.lessons?.map(lesson => {
                const isActive = currentLesson?.id === lesson.id;
                const isDone = completedLessons.has(lesson.id);
                return (
                  <button key={lesson.id} onClick={() => { setCurrentLesson(lesson); if (isMobile) setSidebarOpen(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 20px 10px 16px", background: isActive ? "rgba(37,99,235,0.15)" : "transparent", borderRight: isActive ? "3px solid #2563EB" : "3px solid transparent", border: "none", cursor: "pointer", textAlign: "right", transition: "all 0.15s ease" }}>
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      {isDone ? <CheckCircle size={16} color="#10B981" fill="#10B981" /> : isActive ? <Play size={16} color="#60A5FA" fill="#60A5FA" /> : <Circle size={16} color="#475569" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "#94A3B8", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {lesson.title}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        {lesson.duration > 0 && <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> {lesson.duration} د</span>}
                        {lesson.pdf_url && <span style={{ fontSize: 11, color: "#F59E0B", display: "flex", alignItems: "center", gap: 3 }}><File size={10} /> PDF</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {totalProgress === 100 && (
          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => navigate("/student/certificates")}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Award size={16} /> احصل على شهادتك
            </button>
          </div>
        )}
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ height: 56, background: "#1E293B", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", flexShrink: 0 }}>
            <List size={16} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sections.find(s => s.lessons?.some(l => l.id === currentLesson?.id))?.title}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentLesson?.title}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
            <button onClick={goToPrev} disabled={currentIdx <= 0}
              style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "none", cursor: currentIdx <= 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentIdx <= 0 ? "#334155" : "#94A3B8" }}>
              <ChevronRight size={14} />
            </button>
            <span style={{ fontSize: 12, color: "#475569" }}>{currentIdx + 1}/{allLessons.length}</span>
            <button onClick={goToNext} disabled={currentIdx >= allLessons.length - 1}
              style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "none", cursor: currentIdx >= allLessons.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentIdx >= allLessons.length - 1 ? "#334155" : "#94A3B8" }}>
              <ChevronLeft size={14} />
            </button>
            <Link to={`/courses/${course?.slug}`}
              style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", textDecoration: "none" }}>
              <Home size={14} />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <VideoPlayer lesson={currentLesson} />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontWeight: 800, fontSize: "clamp(16px,3vw,22px)", color: "#fff", margin: "0 0 6px" }}>{currentLesson?.title}</h1>
                {currentLesson?.description && <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.7 }}>{currentLesson.description}</p>}
              </div>
              <button
                onClick={() => { markComplete(currentLesson?.id); if (currentIdx < allLessons.length - 1) goToNext(); }}
                disabled={completedLessons.has(currentLesson?.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: completedLessons.has(currentLesson?.id) ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: completedLessons.has(currentLesson?.id) ? "#10B981" : "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: completedLessons.has(currentLesson?.id) ? "default" : "pointer", flexShrink: 0, boxShadow: completedLessons.has(currentLesson?.id) ? "none" : "0 4px 14px rgba(37,99,235,0.3)", whiteSpace: "nowrap" }}>
                <CheckCircle size={16} />
                {completedLessons.has(currentLesson?.id) ? "تم" : "إتمام والتالي"}
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginTop: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { id: "notes", label: "ملاحظاتي", icon: <StickyNote size={14} /> },
                ...(currentLesson?.pdf_url ? [{ id: "pdf", label: "PDF", icon: <File size={14} /> }] : []),
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(activeTab === tab.id ? "none" : tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", border: "none", cursor: "pointer", background: "transparent", color: activeTab === tab.id ? "#60A5FA" : "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, borderBottom: activeTab === tab.id ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1 }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "notes" && (
              <div style={{ marginTop: 16 }}>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="اكتب ملاحظاتك هنا..."
                  style={{ width: "100%", minHeight: 150, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontSize: 14, resize: "vertical", outline: "none", direction: "rtl", lineHeight: 1.7, boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button onClick={saveNote}
                  style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: savedNote ? "rgba(16,185,129,0.2)" : "rgba(37,99,235,0.2)", color: savedNote ? "#10B981" : "#60A5FA", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  <Save size={13} /> {savedNote ? "تم الحفظ ✓" : "حفظ"}
                </button>
              </div>
            )}

            {activeTab === "pdf" && currentLesson?.pdf_url && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "#94A3B8", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <File size={16} color="#F59E0B" /> {currentLesson.pdf_name || "ملف PDF"}
                  </span>
                  <a href={currentLesson.pdf_url} target="_blank" rel="noreferrer"
                    style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(245,158,11,0.15)", color: "#F59E0B", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13 }}>
                    فتح
                  </a>
                </div>
                <iframe src={currentLesson.pdf_url} style={{ width: "100%", height: 500, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} title="PDF" />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.04)", flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${totalProgress}%`, background: "linear-gradient(90deg,#1E40AF,#2563EB)", transition: "width 0.5s ease" }} />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        main div::-webkit-scrollbar { width: 4px; }
        main div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}