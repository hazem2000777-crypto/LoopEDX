import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Search, Star, Users, Clock, BookOpen, X, Play } from "lucide-react";

function Stars({ rating = 5, size = 13 }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? "#F59E0B" : "none"} color={i <= rating ? "#F59E0B" : "#D1D5DB"} />
      ))}
    </div>
  );
}

function CourseCard({ course }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${course.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #E2E8F0", cursor: "pointer",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(15,23,42,0.12)" : "0 2px 8px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ position: "relative", paddingTop: "56%", background: "#EFF6FF", overflow: "hidden" }}>
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={48} color="#BFDBFE" />
            </div>
        }
        {course.price === 0 && (
          <span style={{ position: "absolute", top: 10, right: 10, background: "#10B981", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>مجاني</span>
        )}
        {hovered && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={20} color="#1E40AF" fill="#1E40AF" />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>
            {course.category || "عام"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars rating={Math.round(course.avg_rating || 5)} />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>({course.review_count || 0})</span>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", margin: "0 0 6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.title}
        </h3>

        <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", margin: "0 0 14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {course.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 12, color: "#94A3B8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={12} /> {course.enrollments_count || 0}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {course.total_duration || 0} د</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BookOpen size={12} /> {course.lessons_count || 0} محاضرة</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 11 }}>
              {course.instructor_name?.[0] || "م"}
            </div>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{course.instructor_name || "المعلم"}</span>
          </div>
          <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: course.price === 0 ? "#10B981" : "#1E40AF" }}>
            {course.price === 0 ? "مجاني" : `${course.price} ريال`}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0" }}>
      <div style={{ paddingTop: "56%", background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200%" }} />
      <div style={{ padding: 18 }}>
        <div style={{ height: 12, background: "#F1F5F9", borderRadius: 6, marginBottom: 10, width: "40%" }} />
        <div style={{ height: 18, background: "#F1F5F9", borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 18, background: "#F1F5F9", borderRadius: 6, marginBottom: 16, width: "80%" }} />
        <div style={{ height: 12, background: "#F1F5F9", borderRadius: 6, width: "60%" }} />
      </div>
    </div>
  );
}

const CATEGORIES = ["الكل", "قياس", "قدرات", "تحصيلي", "IELTS", "STEP", "رياضيات", "علوم", "عربي", "إنجليزي", "عام"];
const LEVELS     = ["الكل", "مبتدئ", "متوسط", "متقدم"];
const SORT_OPTIONS = [
  { value: "newest",     label: "الأحدث" },
  { value: "popular",    label: "الأكثر طلباً" },
  { value: "rating",     label: "الأعلى تقييماً" },
  { value: "price_low",  label: "السعر: الأقل" },
  { value: "price_high", label: "السعر: الأعلى" },
];

export default function Courses() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [error, setError]     = useState("");

  const [search,   setSearch]   = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "الكل");
  const [level,    setLevel]    = useState("الكل");
  const [sort,     setSort]     = useState("newest");
  const [onlyFree, setOnlyFree] = useState(false);
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 12;

  useEffect(() => { fetchCourses(); }, [category, level, sort, onlyFree, page]);

  useEffect(() => {
    const t = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase
        .from("courses_with_instructor")
        .select("*", { count: "exact" });

      if (search.trim())        query = query.ilike("title", `%${search}%`);
      if (category !== "الكل") query = query.eq("category", category);
      if (level !== "الكل") {
        const lvlMap = { "مبتدئ": "beginner", "متوسط": "intermediate", "متقدم": "advanced" };
        query = query.eq("level", lvlMap[level]);
      }
      if (onlyFree) query = query.eq("price", 0);

      if (sort === "newest")     query = query.order("created_at", { ascending: false });
      if (sort === "popular")    query = query.order("enrollments_count", { ascending: false });
      if (sort === "rating")     query = query.order("avg_rating", { ascending: false });
      if (sort === "price_low")  query = query.order("price", { ascending: true });
      if (sort === "price_high") query = query.order("price", { ascending: false });

      query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      setCourses(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError("حدث خطأ في تحميل الدورات");
      setCourses([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSearch(""); setCategory("الكل"); setLevel("الكل");
    setSort("newest"); setOnlyFree(false); setPage(1);
  };

  const hasFilters = search || category !== "الكل" || level !== "الكل" || onlyFree;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0F172A, #1E3A8A)", paddingTop: 90 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(26px,4vw,42px)", color: "#fff", margin: "0 0 14px" }}>
            استكشف الدورات
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, margin: "0 0 32px" }}>
            {total > 0 ? `${total} دورة متاحة` : "ابحث عن دورتك المناسبة"}
          </p>
          <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="ابحث عن دورة..."
              style={{
                width: "100%", padding: "14px 48px 14px 16px",
                borderRadius: 12, border: "none",
                fontFamily: "'Cairo', sans-serif", fontSize: 15,
                outline: "none", direction: "rtl",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* Category Chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              style={{
                padding: "8px 18px", borderRadius: 50, border: "1.5px solid",
                borderColor: category === cat ? "#2563EB" : "#E2E8F0",
                background: category === cat ? "#EFF6FF" : "#fff",
                color: category === cat ? "#1E40AF" : "#374151",
                fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease",
                boxShadow: category === cat ? "0 4px 12px rgba(37,99,235,0.15)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>
              {loading ? "جاري التحميل..." : `${total} نتيجة`}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#EF4444", fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <X size={12} /> مسح الفلاتر
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }}
              style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, background: "#fff", color: "#374151", outline: "none", cursor: "pointer" }}>
              {LEVELS.map(l => <option key={l} value={l}>{l === "الكل" ? "كل المستويات" : l}</option>)}
            </select>

            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, background: "#fff", color: "#374151", outline: "none", cursor: "pointer" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${onlyFree ? "#10B981" : "#E2E8F0"}`, background: onlyFree ? "#F0FFF4" : "#fff", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 13, color: onlyFree ? "#10B981" : "#374151", fontWeight: onlyFree ? 700 : 400, transition: "all 0.2s" }}>
              <input type="checkbox" checked={onlyFree} onChange={e => { setOnlyFree(e.target.checked); setPage(1); }} style={{ display: "none" }} />
              {onlyFree ? "✓" : ""} مجاني فقط
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "20px", background: "#FEF2F2", borderRadius: 12, marginBottom: 24, color: "#EF4444", fontFamily: "'Cairo', sans-serif", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <BookOpen size={64} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 20, color: "#94A3B8", margin: "0 0 8px" }}>لا توجد دورات</h3>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#CBD5E1", margin: "0 0 24px" }}>
              {hasFilters ? "جرب تغيير الفلاتر أو كلمة البحث" : "لا توجد دورات منشورة حتى الآن"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid #E2E8F0", background: "#fff", color: page === 1 ? "#CBD5E1" : "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: page === 1 ? "not-allowed" : "pointer" }}>
              السابق
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 38, height: 38, borderRadius: 9, border: "1.5px solid", borderColor: page === p ? "#2563EB" : "#E2E8F0", background: page === p ? "#EFF6FF" : "#fff", color: page === p ? "#1E40AF" : "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid #E2E8F0", background: "#fff", color: page === totalPages ? "#CBD5E1" : "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
              التالي
            </button>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        select { appearance: none; }
        @media (max-width: 1024px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}