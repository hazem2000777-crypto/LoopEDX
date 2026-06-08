import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import InstructorLayout from "./InstructorLayout";
import {
  Plus, BookOpen, Users, Star, Edit, Trash2, Eye,
  Search, Filter, MoreVertical, CheckCircle, Clock, XCircle
} from "lucide-react";

const STATUS_MAP = {
  published: { label: "منشور", color: "#10B981", bg: "#DCFCE7" },
  draft: { label: "مسودة", color: "#F59E0B", bg: "#FEF9C3" },
  pending: { label: "قيد المراجعة", color: "#6366F1", bg: "#EEF2FF" },
  rejected: { label: "مرفوض", color: "#EF4444", bg: "#FEF2F2" },
};

export default function InstructorCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [menuOpen, setMenuOpen] = useState(null);

 useEffect(() => {
  if (user) fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`*, enrollments(count)`)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setCourses(data || []);
    } catch (e) {
      // Use mock data as fallback
      setCourses([
        { id: 1, title: "اختبار القدرات الشامل", status: "published", price: 149, category: "قياس", created_at: "2025-12-01", enrollments: [{ count: 248 }] },
        { id: 2, title: "رياضيات ثانوي — الفصل الأول", status: "published", price: 99, category: "رياضيات", created_at: "2025-11-15", enrollments: [{ count: 135 }] },
        { id: 3, title: "IELTS من الصفر إلى Band 7", status: "draft", price: 199, category: "IELTS", created_at: "2025-12-20", enrollments: [{ count: 0 }] },
      ]);
    }
    setLoading(false);
  };

  const handleDelete = async (courseId) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (!error) setCourses(prev => prev.filter(c => c.id !== courseId));
    setMenuOpen(null);
  };

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <InstructorLayout active="courses">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>دوراتي</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>{courses.length} دورة إجمالاً</p>
        </div>
        <button
          onClick={() => navigate("/instructor/courses/new")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg, #1E40AF, #2563EB)",
            color: "#fff", border: "none", cursor: "pointer",
            fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.3)"; }}
        >
          <Plus size={16} /> إنشاء دورة جديدة
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث عن دورة..."
            style={{
              width: "100%", padding: "10px 40px 10px 14px",
              borderRadius: 10, border: "1px solid #E2E8F0",
              fontFamily: "'Cairo', sans-serif", fontSize: 14,
              background: "#fff", color: "#0F172A",
              outline: "none",
              direction: "rtl",
            }}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["all", "الكل"], ["published", "منشور"], ["draft", "مسودة"], ["pending", "قيد المراجعة"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
                borderColor: filterStatus === val ? "#2563EB" : "#E2E8F0",
                background: filterStatus === val ? "#EFF6FF" : "#fff",
                color: filterStatus === val ? "#1E40AF" : "#64748B",
                fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13,
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ height: 160, background: "#F1F5F9" }} />
              <div style={{ padding: 18 }}>
                <div style={{ height: 16, background: "#F1F5F9", borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 12, background: "#F1F5F9", borderRadius: 6, width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <BookOpen size={56} color="#E2E8F0" style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#94A3B8", margin: "0 0 8px" }}>لا توجد دورات</h3>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#CBD5E1", margin: "0 0 24px" }}>ابدأ بإنشاء دورتك الأولى</p>
          <button onClick={() => navigate("/instructor/courses/new")} style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} /> إنشاء دورة
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filteredCourses.map(course => {
            const status = STATUS_MAP[course.status] || STATUS_MAP.draft;
            const enrollCount = course.enrollments?.[0]?.count || 0;
            return (
              <div
                key={course.id}
                style={{
                  background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0",
                  overflow: "hidden", transition: "box-shadow 0.2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.1)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Thumbnail */}
                <div style={{ height: 150, background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <BookOpen size={48} color="#BFDBFE" />
                  )}
                  {/* Status badge */}
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: status.bg, color: status.color,
                    fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 11,
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    {status.label}
                  </span>
                  {/* Menu button */}
                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                      style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {menuOpen === course.id && (
                      <div style={{ position: "absolute", top: 32, left: 0, background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.1)", minWidth: 160, overflow: "hidden", zIndex: 10 }}>
                        <button onClick={() => { navigate(`/courses/${course.slug}`); setMenuOpen(null); }} style={menuItemStyle}>
                          <Eye size={14} /> معاينة
                        </button>
                        <button onClick={() => { navigate(`/instructor/courses/${course.id}/edit`); setMenuOpen(null); }} style={menuItemStyle}>
                          <Edit size={14} /> تعديل
                        </button>
                        <button onClick={() => handleDelete(course.id)} style={{ ...menuItemStyle, color: "#EF4444" }}>
                          <Trash2 size={14} /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 12 }}>
                    {course.category || "عام"}
                  </span>
                  <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", margin: "8px 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {course.title}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#64748B" }}>
                        <Users size={12} /> {enrollCount}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#64748B" }}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" /> {course.avg_rating || "—"}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 15, color: course.price === 0 ? "#10B981" : "#1E40AF" }}>
                      {course.price === 0 ? "مجاني" : `${course.price} ريال`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: "10px 16px", borderTop: "1px solid #F8FAFC", display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/instructor/courses/${course.id}/edit`, { state: { courseId: course.id } })} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#1E40AF"; e.currentTarget.style.background = "#EFF6FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; }}
                  >
                    <Edit size={13} /> تعديل
                  </button>
                  <button onClick={() => window.open(`/courses/${course.slug}`, '_blank')}style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#EFF6FF", color: "#1E40AF", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#DBEAFE"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#EFF6FF"; }}
                  >
                    <Eye size={13} /> معاينة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`* { box-sizing: border-box; }`}</style>
    </InstructorLayout>
  );
}

const menuItemStyle = {
  width: "100%", padding: "9px 14px",
  background: "transparent", border: "none", cursor: "pointer",
  fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#374151",
  textAlign: "right", display: "flex", alignItems: "center", gap: 8,
  transition: "background 0.15s ease",
};
