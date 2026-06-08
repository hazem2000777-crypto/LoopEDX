import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Play, Star, Users, BookOpen, Award, CheckCircle,
  TrendingUp, Shield, Clock, Zap, Target, BarChart2, Mic
} from "lucide-react";

function Stars({ rating = 5, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => <Star key={i} size={size} fill={i <= rating ? "#F59E0B" : "none"} color={i <= rating ? "#F59E0B" : "#D1D5DB"} />)}
    </div>
  );
}

function CourseCard({ course }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/courses/${course.slug}`)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", cursor: "pointer", transition: "all 0.3s ease", transform: hovered ? "translateY(-6px)" : "translateY(0)", boxShadow: hovered ? "0 20px 40px rgba(15,23,42,0.12)" : "0 2px 8px rgba(15,23,42,0.05)" }}>
      <div style={{ position: "relative", paddingTop: "56%", background: "#E2E8F0", overflow: "hidden" }}>
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
          : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1E40AF20,#2563EB30)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={48} color="#2563EB" style={{ opacity: 0.4 }} /></div>
        }
        {course.price === 0 && <span style={{ position: "absolute", top: 12, right: 12, background: "#10B981", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>مجاني</span>}
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>{course.category || "عام"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars rating={Math.round(course.avg_rating || 5)} size={12} />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>({course.review_count || 0})</span>
          </div>
        </div>
        <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A", margin: "0 0 6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.title}</h3>
        <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", margin: "0 0 14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{course.profiles?.name || "المعلم"}</span>
          <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: course.price === 0 ? "#10B981" : "#1E40AF" }}>
            {course.price === 0 ? "مجاني" : `${course.price} ريال`}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", textAlign: "center", border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color }}>{icon}</div>
      <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 32, color: "#0F172A", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: `1px solid ${hovered ? color + "40" : "#E2E8F0"}`, boxShadow: hovered ? `0 12px 32px ${color}18` : "0 2px 8px rgba(15,23,42,0.04)", transition: "all 0.3s ease", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: hovered ? color : `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: hovered ? "#fff" : color, transition: "all 0.3s ease" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 17, color: "#0F172A", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [content, setContent] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // جلب الدورات من Supabase
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*, profiles(name)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (coursesData?.length > 0) {
        setCourses(coursesData);
        // استخراج الكاتيجوريز من الدورات
        const cats = ["الكل", ...new Set(coursesData.map(c => c.category).filter(Boolean))];
        setCategories(cats.map(label => ({ label, icon: getCatIcon(label) })));
      }

      // جلب محتوى الصفحة الرئيسية
      const { data: homepageData } = await supabase.from("homepage_content").select("*");
      if (homepageData) {
        const map = {};
        homepageData.forEach(row => {
          map[row.section] = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
        });
        setContent(map);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getCatIcon = (cat) => {
    const icons = { "الكل": "🎯", "قياس": "📊", "IELTS": "🇬🇧", "STEP": "📝", "رياضيات": "➗", "علوم": "🔬", "تحصيلي": "📚" };
    return icons[cat] || "📖";
  };

  const hero = content.hero || {};
  const stats = content.stats?.items || [];
  const features = content.features?.items || [];
  const testimonials = content.testimonials?.items || [];
  const ctaBanner = content.cta_banner || {};
  const howItWorks = content.how_it_works || {};

  const filteredCourses = activeCategory === "الكل" ? courses : courses.filter(c => c.category === activeCategory);

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC" }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, background: "linear-gradient(160deg,#F0F6FF 0%,#FFFFFF 50%,#F0F6FF 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,#2563EB12,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              {hero.badge && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EFF6FF", borderRadius: 50, padding: "6px 16px", marginBottom: 24, border: "1px solid #BFDBFE" }}>
                  <Zap size={14} color="#2563EB" fill="#2563EB" />
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, color: "#1E40AF" }}>{hero.badge}</span>
                </div>
              )}
              <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,52px)", color: "#0F172A", lineHeight: 1.25, margin: "0 0 20px" }}>
                {hero.title ? (
                  <>
                    {hero.title.split("،")[0]}،{" "}
                    <span style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {hero.title.split("،")[1]}
                    </span>
                  </>
                ) : (
                  <>تعلّم بذكاء،{" "}<span style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>انجح بثقة</span></>
                )}
              </h1>
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, color: "#64748B", lineHeight: 1.8, margin: "0 0 36px", maxWidth: 480 }}>{hero.subtitle}</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
                <button onClick={() => navigate(hero.cta_primary?.url || "/courses")}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, boxShadow: "0 8px 24px rgba(37,99,235,0.35)", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                  {hero.cta_primary?.text || "ابدأ التعلم الآن"}
                  <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
                </button>
                {hero.cta_secondary?.text && (
                  <button onClick={() => navigate(hero.cta_secondary?.url || "/courses")}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 12, background: "#fff", color: "#374151", border: "1.5px solid #E2E8F0", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 16, transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#1E40AF"; e.currentTarget.style.background = "#EFF6FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; }}>
                    <Play size={16} />
                    {hero.cta_secondary.text}
                  </button>
                )}
              </div>
              {/* Stats سريعة */}
              {hero.stats?.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                  {hero.stats.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 15, color: "#1E40AF" }}>{s.value}</span>
                      <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hero Visual */}
            <div style={{ position: "relative" }}>
              {hero.image_url ? (
                <img src={hero.image_url} alt="" style={{ width: "100%", borderRadius: 24, boxShadow: "0 24px 64px rgba(15,23,42,0.12)" }} />
              ) : (
                <div style={{ background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 24px 64px rgba(15,23,42,0.12)", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Target size={24} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>دورة اختبار القدرات</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>أ. محمد الأحمدي</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>تقدمك في الدورة</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB" }}>72%</span>
                    </div>
                    <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "72%", background: "linear-gradient(90deg,#1E40AF,#2563EB)", borderRadius: 4 }} />
                    </div>
                  </div>
                  {["الفهم والاستيعاب", "الاستنتاج المنطقي", "الأنماط العددية", "الاختبار التجريبي"].map((lesson, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 6, background: i === 2 ? "#EFF6FF" : "transparent", border: i === 2 ? "1px solid #BFDBFE" : "1px solid transparent" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: i < 2 ? "#10B981" : i === 2 ? "#2563EB" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {i < 2 && <CheckCircle size={14} color="#fff" />}
                        {i === 2 && <Play size={10} color="#fff" fill="#fff" />}
                      </div>
                      <span style={{ fontSize: 14, color: i === 2 ? "#1E40AF" : i < 2 ? "#64748B" : "#374151", fontWeight: i === 2 ? 700 : 500, textDecoration: i < 2 ? "line-through" : "none" }}>{lesson}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ position: "absolute", top: -20, left: -20, background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10, animation: "float 3s ease-in-out infinite" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Star size={18} color="#F59E0B" fill="#F59E0B" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>تقييم الطلاب</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>4.9 / 5.0 ⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      {stats.length > 0 && (
        <section style={{ padding: "60px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 20 }}>
              {stats.map((s, i) => (
                <StatCard key={i} icon={<BarChart2 size={24} />} value={s.value} label={s.label} color={["#2563EB","#10B981","#F59E0B","#8B5CF6"][i % 4]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── COURSES ─── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", borderRadius: 50, padding: "5px 14px", marginBottom: 12 }}>
                <TrendingUp size={14} color="#2563EB" />
                <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 12, color: "#2563EB" }}>الأكثر مشاهدة</span>
              </div>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 32, color: "#0F172A", margin: 0 }}>أبرز الدورات</h2>
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 16, color: "#64748B", margin: "8px 0 0" }}>اختار الدورة المناسبة وابدأ رحلتك نحو النجاح</p>
            </div>
            <Link to="/courses" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#2563EB", padding: "10px 20px", borderRadius: 10, border: "1.5px solid #BFDBFE", background: "#EFF6FF", transition: "all 0.2s ease" }}>
              عرض كل الدورات <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 36, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map(cat => (
                <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 50, border: activeCategory === cat.label ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0", background: activeCategory === cat.label ? "#EFF6FF" : "#fff", color: activeCategory === cat.label ? "#1E40AF" : "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
                  <span>{cat.icon}</span><span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #E2E8F0" }}>
                  <div style={{ paddingTop: "56%", background: "#F1F5F9" }} />
                  <div style={{ padding: 18 }}>
                    <div style={{ height: 14, background: "#F1F5F9", borderRadius: 6, marginBottom: 10, width: "60%" }} />
                    <div style={{ height: 20, background: "#F1F5F9", borderRadius: 6, marginBottom: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <BookOpen size={56} color="#E2E8F0" style={{ marginBottom: 16 }} />
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 16, color: "#94A3B8" }}>لا توجد دورات منشورة بعد</p>
              <Link to="/courses" style={{ color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>تصفح كل الدورات</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      {features.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 36, color: "#0F172A", margin: "0 0 12px" }}>{content.features?.title || "لماذا LoopEDX؟"}</h2>
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, color: "#64748B", margin: 0 }}>{content.features?.subtitle}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {features.map((f, i) => (
                <FeatureCard key={i} icon={<span style={{ fontSize: 24 }}>{f.icon}</span>} title={f.title} description={f.desc} color={["#2563EB","#10B981","#F59E0B","#8B5CF6","#EF4444","#06B6D4"][i % 6]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      {howItWorks.steps?.length > 0 && (
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 36, color: "#0F172A", margin: 0 }}>{howItWorks.title || "كيف تعمل المنصة؟"}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(howItWorks.steps.length, 4)},1fr)`, gap: 24 }}>
              {howItWorks.steps.map((step, i) => (
                <div key={i} style={{ textAlign: "center", padding: "28px 20px", background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff", fontWeight: 900, fontSize: 20 }}>{step.num}</div>
                  <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A", margin: "0 0 8px" }}>{step.title}</h3>
                  <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 36, color: "#0F172A", margin: 0 }}>{content.testimonials?.title || "ماذا قال طلابنا؟"}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(15,23,42,0.06)", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.06)"; }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}><Stars rating={t.rating || 5} /></div>
                  <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#374151", lineHeight: 1.75, margin: "0 0 20px" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid #F1F5F9" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>{t.avatar || t.name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA BANNER ─── */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: ctaBanner.bg_gradient || "linear-gradient(160deg,#EFF6FF,#DBEAFE)", borderRadius: 24, padding: "64px 40px", border: "1px solid #BFDBFE" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 36, color: ctaBanner.bg_gradient ? "#fff" : "#0F172A", margin: "0 0 14px" }}>
              {ctaBanner.title || "ابدأ رحلتك اليوم"}
            </h2>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, color: ctaBanner.bg_gradient ? "rgba(255,255,255,0.8)" : "#475569", margin: "0 0 36px", lineHeight: 1.7 }}>
              {ctaBanner.subtitle || "انضم لآلاف الطلاب على LoopEDX"}
            </p>
            <button onClick={() => navigate(ctaBanner.cta_url || (user ? "/courses" : "/register"))}
              style={{ padding: "14px 32px", borderRadius: 12, background: ctaBanner.bg_gradient ? "#fff" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: ctaBanner.bg_gradient ? "#1E40AF" : "#fff", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, boxShadow: "0 8px 24px rgba(37,99,235,0.35)", transition: "all 0.2s ease" }}>
              {ctaBanner.cta_text || "أنشئ حساباً مجانياً"}
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @media(max-width:1024px){
          section>div>div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
          section>div>div[style*="repeat(3"]{grid-template-columns:repeat(2,1fr)!important}
          section>div>div[style*="repeat(4"]{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:640px){
          section>div>div[style*="repeat(2"]{grid-template-columns:1fr!important}
          section>div>div[style*="repeat(3"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}