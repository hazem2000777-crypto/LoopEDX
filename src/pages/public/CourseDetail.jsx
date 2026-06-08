import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import { createTabbySession, loadTabbyWidget } from "../../lib/tabby";
import { createDirectPaySession } from "../../lib/directpay";
import { sendPurchaseConfirmation, notifyAdminsNewPayment } from "../../lib/brevo";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Star, Users, Clock, Play, CheckCircle, BookOpen,
  Lock, ChevronDown, ChevronUp, Award, Globe,
  CreditCard, ShoppingCart, AlertCircle, Loader
} from "lucide-react";

function Stars({ rating = 5, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? "#F59E0B" : "none"} color={i <= rating ? "#F59E0B" : "#D1D5DB"} />
      ))}
    </div>
  );
}

function SectionAccordion({ section, index }) {
  const [open, setOpen] = useState(index === 0);
  const totalMin = section.lessons?.reduce((t, l) => t + (l.duration || 0), 0) || 0;
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: open ? "#F8FAFC" : "#fff", border: "none", cursor: "pointer", textAlign: "right", fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {open ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{section.title}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 13, color: "#64748B" }}>{section.lessons?.length || 0} محاضرة</span>
          <span style={{ fontSize: 13, color: "#64748B" }}>{totalMin} دقيقة</span>
        </div>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9" }}>
          {section.lessons?.map((lesson, i) => (
            <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < section.lessons.length - 1 ? "1px solid #F8FAFC" : "none", background: "#fff" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: lesson.is_free ? "#DCFCE7" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {lesson.is_free ? <Play size={13} color="#10B981" fill="#10B981" /> : <Lock size={12} color="#94A3B8" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#374151", fontWeight: 500 }}>{lesson.title}</div>
                {lesson.description && <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{lesson.description}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {lesson.is_free && <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#DCFCE7", padding: "2px 8px", borderRadius: 12 }}>مجاني</span>}
                {lesson.duration > 0 && <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {lesson.duration} د</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentModal({ course, onClose, onSuccess }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const finalPrice = couponData
    ? couponData.type === "percent"
      ? course.price - (course.price * couponData.value / 100)
      : Math.max(0, course.price - couponData.value)
    : course.price;

  const checkCoupon = async () => {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    const { data, error } = await supabase.from("coupons").select("*").eq("code", coupon.toUpperCase().trim()).eq("is_active", true).single();
    if (error || !data) { setCouponError("الكوبون غير صحيح أو منتهي الصلاحية"); setCouponData(null); }
    else setCouponData(data);
    setCheckingCoupon(false);
  };

  const handlePay = async () => {
    if (!method) return;
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        id: orderId, student_id: user.id, course_id: course.id,
        amount: finalPrice, currency: "SAR", status: "pending",
        payment_method: method, coupon_code: couponData?.code || null,
      }).select().single();
      if (orderError) throw orderError;

      if (method === "tabby") {
        const res = await createTabbySession({ amount: finalPrice, studentName: profile.name, studentEmail: profile.email, studentPhone: profile.phone || "", courseTitle: course.title, courseSlug: course.slug, orderId });
        if (res.success && res.paymentUrl) { window.location.href = res.paymentUrl; }
        else throw new Error(res.error || "فشل إنشاء جلسة تابي");
      }
      if (method === "directpay") {
        const res = await createDirectPaySession({ amount: finalPrice, orderId, courseTitle: course.title, studentEmail: profile.email, studentName: profile.name });
        if (res.success && res.paymentUrl) { window.location.href = res.paymentUrl; }
        else throw new Error(res.error || "فشل إنشاء جلسة DirectPay");
      }
    } catch (err) {
      alert("حدث خطأ: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, overflow: "hidden", boxShadow: "0 24px 64px rgba(15,23,42,0.2)", animation: "slideUp 0.25s ease" }}>
        <div style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)", padding: "24px 28px" }}>
          <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 20, color: "#fff", margin: 0 }}>إتمام الشراء</h2>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>{course.title}</p>
        </div>
        <div style={{ padding: 28 }}>
          <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A", margin: "0 0 14px" }}>اختر طريقة الدفع</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { id: "tabby", label: "تابي", desc: "4 أقساط بدون فوائد", color: "#3D33FF", icon: <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>T</span> },
              { id: "directpay", label: "DirectPay", desc: "mada — فيزا — ماستركارد — STC Pay", color: "linear-gradient(135deg,#1E40AF,#2563EB)", icon: <CreditCard size={20} color="#fff" /> },
            ].map(opt => (
              <button key={opt.id} onClick={() => setMethod(opt.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${method === opt.id ? "#1E40AF" : "#E2E8F0"}`, background: method === opt.id ? "#EFF6FF" : "#fff", cursor: "pointer", textAlign: "right" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: opt.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{opt.label}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{opt.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${method === opt.id ? "#1E40AF" : "#CBD5E1"}`, background: method === opt.id ? "#1E40AF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {method === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", display: "block", marginBottom: 8 }}>كوبون الخصم (اختياري)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponData(null); setCouponError(""); }} placeholder="LOOP20"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${couponError ? "#EF4444" : couponData ? "#10B981" : "#E2E8F0"}`, fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: "none", direction: "ltr", textAlign: "center", letterSpacing: 2, fontWeight: 700 }} />
              <button onClick={checkCoupon} disabled={checkingCoupon || !coupon.trim()}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#EFF6FF", color: "#1E40AF", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
                {checkingCoupon ? "..." : "تطبيق"}
              </button>
            </div>
            {couponError && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#EF4444", margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={12} />{couponError}</p>}
            {couponData && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#10B981", margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={12} />تم تطبيق خصم {couponData.type === "percent" ? `${couponData.value}%` : `${couponData.value} ريال`}</p>}
          </div>

          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
            {couponData && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>السعر الأصلي</span>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", textDecoration: "line-through" }}>{course.price} ريال</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#10B981" }}>الخصم</span>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#10B981", fontWeight: 700 }}>-{couponData.type === "percent" ? `${course.price * couponData.value / 100}` : couponData.value} ريال</span>
                </div>
                <div style={{ height: 1, background: "#E2E8F0", margin: "10px 0" }} />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A" }}>الإجمالي</span>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#1E40AF" }}>{finalPrice} ريال</span>
            </div>
          </div>

          <button onClick={handlePay} disabled={!method || loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: method ? "linear-gradient(135deg,#1E40AF,#2563EB)" : "#E2E8F0", color: method ? "#fff" : "#94A3B8", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 16, cursor: method ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: method ? "0 8px 24px rgba(37,99,235,0.3)" : "none", opacity: loading ? 0.8 : 1 }}>
            {loading ? <Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> : <ShoppingCart size={18} />}
            {loading ? "جاري التحويل..." : `ادفع ${finalPrice} ريال`}
          </button>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", textAlign: "center", margin: "12px 0 0" }}>دفع آمن ومشفر — ضمان استرداد خلال 7 أيام</p>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => { fetchCourse(); }, [slug]);

  useEffect(() => {
    if (course && course.price > 0) loadTabbyWidget(course.price);
  }, [course]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data: courseData } = await supabase.from("courses").select(`*, profiles(name, avatar_url, bio)`).eq("slug", slug).in("status", ["published", "pending", "draft"]).single();
      if (!courseData) { navigate("/courses"); return; }
      setCourse(courseData);
      const { data: sectionsData } = await supabase.from("sections").select(`*, lessons(*)`).eq("course_id", courseData.id).order("order_num");
      setSections(sectionsData || []);
      if (user) {
        const { data: enrollment } = await supabase.from("enrollments").select("id").eq("student_id", user.id).eq("course_id", courseData.id).single();
        setIsEnrolled(!!enrollment);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleEnrollFree = async () => {
    if (!user) { navigate("/login"); return; }
    setEnrolling(true);
    try {
      await supabase.from("enrollments").upsert({
        student_id: user.id,
        course_id: course.id,
        enrolled_at: new Date().toISOString(),
        progress: 0,
      });
      setIsEnrolled(true);
    } catch (err) {
      alert("حدث خطأ: " + err.message);
    }
    setEnrolling(false);
  };

  const totalLessons = sections.reduce((t, s) => t + (s.lessons?.length || 0), 0);
  const totalMinutes = sections.reduce((t, s) => t + (s.lessons?.reduce((tt, l) => tt + (l.duration || 0), 0) || 0), 0);
  const freeLessons  = sections.reduce((t, s) => t + (s.lessons?.filter(l => l.is_free).length || 0), 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <Loader size={32} color="#2563EB" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!course) return null;
  const instructor = course.profiles;

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1E40AF 100%)", paddingTop: 90 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>
          <div>
            <span style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#93C5FD", fontWeight: 700, fontSize: 13, padding: "4px 14px", borderRadius: 20, marginBottom: 16 }}>{course.category}</span>
            <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(24px,4vw,40px)", color: "#fff", margin: "0 0 16px", lineHeight: 1.3 }}>{course.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 580 }}>{course.description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars rating={Math.round(course.avg_rating || 5)} size={15} />
                <span style={{ color: "#FDE68A", fontWeight: 700 }}>{course.avg_rating || "5.0"}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>({course.review_count || 0} تقييم)</span>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.8)", fontSize: 14 }}><Users size={14} /> {course.enrollments_count || 0} طالب</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.8)", fontSize: 14 }}><BookOpen size={14} /> {totalLessons} محاضرة</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.8)", fontSize: 14 }}><Clock size={14} /> {Math.floor(totalMinutes / 60)}س {totalMinutes % 60}د</span>
            </div>
            {instructor && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, overflow: "hidden" }}>
                  {instructor.avatar_url ? <img src={instructor.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : instructor.name?.[0]}
                </div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>المعلم</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{instructor.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* بطاقة الشراء */}
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(15,23,42,0.25)", position: "sticky", top: 90 }}>
            <div style={{ paddingTop: "56%", position: "relative", background: "#0F172A" }}>
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={64} color="rgba(255,255,255,0.2)" /></div>
              }
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                {course.price === 0
                  ? <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 32, color: "#10B981" }}>مجاني</div>
                  : <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 34, color: "#1E40AF" }}>{course.price} <span style={{ fontSize: 18, fontWeight: 600, color: "#64748B" }}>ريال</span></div>
                }
                {course.price > 0 && <div id="tabby-promo-snippet" style={{ marginTop: 8 }} />}
              </div>

              {isEnrolled ? (
                <button onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>
                  <Play size={18} fill="#fff" /> متابعة التعلم
                </button>
              ) : course.price === 0 ? (
                <button onClick={handleEnrollFree} disabled={enrolling}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(16,185,129,0.3)", marginBottom: 10, opacity: enrolling ? 0.7 : 1 }}>
                  <CheckCircle size={18} /> {enrolling ? "جاري التسجيل..." : "سجّل مجاناً"}
                </button>
              ) : (
                <button onClick={() => user ? setShowPayment(true) : navigate("/login")}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(37,99,235,0.35)", marginBottom: 10 }}>
                  <ShoppingCart size={18} /> اشتر الآن
                </button>
              )}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: <CheckCircle size={15} color="#10B981" />, text: "وصول مدى الحياة" },
                  { icon: <Award size={15} color="#F59E0B" />, text: "شهادة إتمام معتمدة" },
                  { icon: <Globe size={15} color="#2563EB" />, text: "تعلّم من أي مكان" },
                  { icon: <Lock size={15} color="#8B5CF6" />, text: "ضمان استرداد 7 أيام" },
                ].map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#374151" }}>{g.icon} {g.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48 }}>
          <div>
            {course.what_you_learn?.filter(Boolean).length > 0 && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28, marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: "0 0 20px" }}>ماذا ستتعلم؟</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {course.what_you_learn.filter(Boolean).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: 0 }}>محتوى الدورة</h2>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{sections.length} فصل</span>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{totalLessons} محاضرة</span>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{Math.floor(totalMinutes / 60)}س {totalMinutes % 60}د</span>
                </div>
              </div>
              {sections.map((section, i) => <SectionAccordion key={section.id} section={section} index={i} />)}
              {freeLessons > 0 && (
                <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#10B981", margin: "12px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
                  <Play size={13} fill="#10B981" /> {freeLessons} محاضرة مجانية يمكن مشاهدتها بدون تسجيل
                </p>
              )}
            </div>

            {instructor && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: "0 0 20px" }}>عن المعلم</h2>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                    {instructor.avatar_url ? <img src={instructor.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : instructor.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 4 }}>{instructor.name}</div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{instructor.bio || "معلم متخصص على منصة LoopEDX"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div />
        </div>
      </div>

      <Footer />

      {showPayment && (
        <PaymentModal course={course} onClose={() => setShowPayment(false)} onSuccess={() => { setShowPayment(false); setIsEnrolled(true); }} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}