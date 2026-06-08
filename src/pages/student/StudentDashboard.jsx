import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { BookOpen, Award, Clock, Play, CheckCircle, Star, ShoppingBag, ChevronLeft, Loader } from "lucide-react";

function ProgressRing({ percent, size = 60, stroke = 6, color = "#2563EB" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("courses");
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: enrollData } = await supabase
        .from("enrollments")
        .select(`*, courses(id, title, thumbnail_url, category, instructor_id, slug, profiles(name))`)
        .eq("student_id", user.id)
        .order("enrolled_at", { ascending: false });
      setEnrollments(enrollData || []);

      const { data: orderData } = await supabase
        .from("orders")
        .select(`*, courses(title, thumbnail_url)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(orderData || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const completedCourses = enrollments.filter(e => e.progress >= 100);
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100);

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 20px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 26, color: "#0F172A", margin: 0 }}>
            أهلاً، {profile?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#64748B", margin: "6px 0 0" }}>تابع تقدمك ودوراتك من هنا</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "دوراتي", value: enrollments.length, icon: <BookOpen size={20} />, color: "#2563EB" },
            { label: "قيد التعلم", value: inProgressCourses.length, icon: <Clock size={20} />, color: "#F59E0B" },
            { label: "أتممتها", value: completedCourses.length, icon: <CheckCircle size={20} />, color: "#10B981" },
            { label: "شهاداتي", value: completedCourses.length, icon: <Award size={20} />, color: "#8B5CF6" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 24 }}>
          {[["courses", "دوراتي"], ["certificates", "شهاداتي"], ["orders", "مشترياتي"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "10px 20px", border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: tab === id ? "#1E40AF" : "#64748B", borderBottom: tab === id ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
            <Loader size={28} color="#2563EB" style={{ animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Courses Tab */}
            {tab === "courses" && (
              <div>
                {enrollments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <BookOpen size={56} color="#E2E8F0" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#94A3B8", margin: "0 0 8px" }}>لم تسجل في أي دورة بعد</h3>
                    <Link to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, marginTop: 12 }}>
                      استكشف الدورات <ChevronLeft size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {enrollments.map(e => (
                      <div key={e.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", transition: "box-shadow 0.2s" }}
                        onMouseEnter={ev => ev.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.1)"}
                        onMouseLeave={ev => ev.currentTarget.style.boxShadow = "none"}>
                        <div style={{ height: 140, background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          {e.courses?.thumbnail_url
                            ? <img src={e.courses.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <BookOpen size={44} color="#BFDBFE" />
                          }
                          <div style={{ position: "absolute", bottom: 10, left: 10 }}>
                            <ProgressRing percent={e.progress || 0} size={44} stroke={5} color={e.progress >= 100 ? "#10B981" : "#2563EB"} />
                          </div>
                        </div>
                        <div style={{ padding: 16 }}>
                          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 10 }}>{e.courses?.category}</span>
                          <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", margin: "8px 0 4px", lineHeight: 1.4 }}>{e.courses?.title}</h3>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>
                              {e.progress >= 100 ? "✅ أتممت الدورة" : `${e.progress || 0}% مكتمل`}
                            </div>
                            <button onClick={() => navigate(`/student/courses/${e.courses?.id}/learn`)}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: e.progress >= 100 ? "#DCFCE7" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: e.progress >= 100 ? "#10B981" : "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                              <Play size={13} fill="currentColor" /> {e.progress >= 100 ? "مراجعة" : "متابعة"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certificates Tab */}
            {tab === "certificates" && (
              <div>
                {completedCourses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Award size={56} color="#E2E8F0" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#94A3B8", margin: 0 }}>أتمم دورة للحصول على شهادة</h3>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                    {completedCourses.map(e => (
                      <div key={e.id} style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)", borderRadius: 14, padding: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                        <Award size={32} color="#FCD34D" style={{ marginBottom: 12 }} />
                        <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>شهادة إتمام</div>
                        <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 4, lineHeight: 1.4 }}>{e.courses?.title}</div>
                        <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>{profile?.name}</div>
                        <button style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          تحميل الشهادة
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                {orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <ShoppingBag size={56} color="#E2E8F0" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#94A3B8", margin: 0 }}>لا توجد مشتريات بعد</h3>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                        {["الدورة", "المبلغ", "طريقة الدفع", "التاريخ", "الحالة"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#64748B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                          <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.courses?.title}</td>
                          <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#10B981" }}>{o.amount} ريال</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{o.payment_method || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{new Date(o.created_at).toLocaleDateString("ar-SA")}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: o.status === "paid" ? "#DCFCE7" : "#FEF9C3", color: o.status === "paid" ? "#10B981" : "#D97706" }}>
                              {o.status === "paid" ? "مدفوع" : "معلق"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  );
}
