import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import InstructorLayout from "./InstructorLayout";
import { Search, Users, BookOpen, Calendar, Mail, Star, Filter } from "lucide-react";

export default function InstructorStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [courses, setCourses] = useState([]);

 useEffect(() => {
  if (user) fetchData();
  }, [user]);
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch instructor courses
      const { data: coursesData } = await supabase.from("courses").select("id, title").eq("instructor_id", user.id);
      setCourses(coursesData || []);

      if (coursesData?.length > 0) {
        const courseIds = coursesData.map(c => c.id);
        const { data: enrollData } = await supabase
          .from("enrollments")
          .select(`*, profiles(name, email, avatar_url), courses(title)`)
          .in("course_id", courseIds)
          .order("enrolled_at", { ascending: false });
        setStudents(enrollData || []);
      }
    } catch {
      // Mock data
      setStudents([
        { id: 1, enrolled_at: "2025-12-20", progress: 72, profiles: { name: "ريان المطيري", email: "ryan@example.com", avatar_url: null }, courses: { title: "اختبار القدرات الشامل" } },
        { id: 2, enrolled_at: "2025-12-19", progress: 45, profiles: { name: "دانا الشمري", email: "dana@example.com", avatar_url: null }, courses: { title: "رياضيات ثانوي" } },
        { id: 3, enrolled_at: "2025-12-18", progress: 100, profiles: { name: "عمر الغامدي", email: "omar@example.com", avatar_url: null }, courses: { title: "اختبار القدرات الشامل" } },
        { id: 4, enrolled_at: "2025-12-17", progress: 20, profiles: { name: "نورة السالم", email: "noura@example.com", avatar_url: null }, courses: { title: "IELTS من الصفر" } },
        { id: 5, enrolled_at: "2025-12-16", progress: 88, profiles: { name: "فيصل الحربي", email: "faisal@example.com", avatar_url: null }, courses: { title: "اختبار القدرات الشامل" } },
        { id: 6, enrolled_at: "2025-12-15", progress: 60, profiles: { name: "لجين العمري", email: "lujain@example.com", avatar_url: null }, courses: { title: "رياضيات ثانوي" } },
      ]);
      setCourses([
        { id: 1, title: "اختبار القدرات الشامل" },
        { id: 2, title: "رياضيات ثانوي" },
        { id: 3, title: "IELTS من الصفر" },
      ]);
    }
    setLoading(false);
  };

  const filtered = students.filter(s => {
    const name = s.profiles?.name?.toLowerCase() || "";
    const email = s.profiles?.email?.toLowerCase() || "";
    const matchSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchCourse = filterCourse === "all" || s.courses?.title === filterCourse;
    return matchSearch && matchCourse;
  });

  const getProgressColor = (p) => p >= 80 ? "#10B981" : p >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <InstructorLayout active="students">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>طلابي</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>{students.length} طالب مسجّل في دوراتك</p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "إجمالي الطلاب", value: students.length, color: "#2563EB" },
            { label: "أتموا الدورة", value: students.filter(s => s.progress >= 100).length, color: "#10B981" },
            { label: "نشطون", value: students.filter(s => s.progress > 0 && s.progress < 100).length, color: "#F59E0B" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: stat.color }}>{stat.value}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب أو الإيميل..."
            style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 14, background: "#fff", color: "#0F172A", outline: "none", direction: "rtl" }}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>
        <div style={{ position: "relative" }}>
          <Filter size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            style={{ padding: "10px 36px 10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 14, background: "#fff", color: "#0F172A", outline: "none", direction: "rtl", cursor: "pointer" }}
          >
            <option value="all">كل الدورات</option>
            {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["الطالب", "الدورة", "التقدم", "تاريخ التسجيل", "الحالة", ""].map(h => (
                  <th key={h} style={{ padding: "14px 18px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map(j => (
                      <td key={j} style={{ padding: "14px 18px" }}>
                        <div style={{ height: 14, background: "#F1F5F9", borderRadius: 6 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Student */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1E40AF, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {s.profiles?.name?.[0] || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{s.profiles?.name}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.profiles?.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Course */}
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{s.courses?.title}</span>
                  </td>
                  {/* Progress */}
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden", minWidth: 80 }}>
                        <div style={{ height: "100%", width: `${s.progress}%`, background: getProgressColor(s.progress), borderRadius: 3, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: getProgressColor(s.progress), minWidth: 32 }}>{s.progress}%</span>
                    </div>
                  </td>
                  {/* Date */}
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: 13, color: "#64748B" }}>
                      {new Date(s.enrolled_at).toLocaleDateString("ar-SA")}
                    </span>
                  </td>
                  {/* Status */}
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      padding: "3px 10px", borderRadius: 20,
                      background: s.progress >= 100 ? "#DCFCE7" : s.progress > 0 ? "#FEF9C3" : "#F1F5F9",
                      color: s.progress >= 100 ? "#10B981" : s.progress > 0 ? "#D97706" : "#94A3B8",
                    }}>
                      {s.progress >= 100 ? "✓ أتم الدورة" : s.progress > 0 ? "يتعلم" : "لم يبدأ"}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: "14px 18px" }}>
                    <button
                      onClick={() => window.open(`mailto:${s.profiles?.email}`)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", transition: "all 0.15s" }}
                      title="إرسال إيميل"
                      onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.borderColor = "#2563EB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                    >
                      <Mail size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Users size={48} color="#E2E8F0" style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#94A3B8" }}>لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; } select { appearance: none; }`}</style>
    </InstructorLayout>
  );
}
