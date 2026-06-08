// ─── Payment Success Page ────────────────────────────
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import { sendPurchaseConfirmation, notifyAdminsNewPayment } from "../../lib/brevo";
import { CheckCircle, Loader, BookOpen } from "lucide-react";

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | success | error
  const [courseSlug, setCourseSlug] = useState("");

  const orderId = searchParams.get("order");
  const method  = searchParams.get("method");

  useEffect(() => {
    if (orderId && user) processPayment();
  }, [orderId, user]);

  const processPayment = async () => {
    try {
      // 1. جيب بيانات الـ Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`*, courses(id, title, slug, instructor_id)`)
        .eq("id", orderId)
        .single();

      if (orderError || !order) throw new Error("الطلب غير موجود");

      // 2. حدّث الـ Order لـ paid
      await supabase
        .from("orders")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", orderId);

      // 3. أضف الطالب في enrollments
      await supabase
        .from("enrollments")
        .upsert({
          user_id: user.id,
          course_id: order.courses.id,
          enrolled_at: new Date().toISOString(),
          progress: 0,
        });

      // 4. بعت إيميل تأكيد للطالب
      await sendPurchaseConfirmation({
        studentEmail: profile.email,
        studentName: profile.name,
        courseName: order.courses.title,
        courseSlug: order.courses.slug,
        amount: order.amount,
        paymentMethod: method === "tabby" ? "تابي" : "DirectPay",
        orderId,
      });

      // 5. بعت إشعار للأدمن
      await notifyAdminsNewPayment({
        supabase,
        studentName: profile.name,
        studentEmail: profile.email,
        courseName: order.courses.title,
        amount: order.amount,
        paymentMethod: method === "tabby" ? "تابي" : "DirectPay",
        orderId,
      });

      setCourseSlug(order.courses.slug);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0FFF4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 480, width: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.1)", margin: 16 }}>
        {status === "processing" && (
          <>
            <Loader size={64} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 20 }} />
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "#0F172A", margin: "0 0 8px" }}>جاري تأكيد الدفع...</h2>
            <p style={{ color: "#64748B", fontSize: 15 }}>يرجى الانتظار، لا تغلق هذه الصفحة</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={44} color="#10B981" />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 26, color: "#0F172A", margin: "0 0 10px" }}>تم الدفع بنجاح! 🎉</h2>
            <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 32px" }}>تم تسجيلك في الدورة. تم إرسال تأكيد على بريدك الإلكتروني.</p>
            <button
              onClick={() => navigate(`/courses/${courseSlug}/learn`)}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(37,99,235,0.3)", marginBottom: 10 }}>
              <BookOpen size={18} /> ابدأ التعلم الآن
            </button>
            <button onClick={() => navigate("/student/my-courses")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
              الذهاب لدوراتي
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
            <h2 style={{ fontWeight: 900, fontSize: 24, color: "#0F172A", margin: "0 0 10px" }}>حدث خطأ</h2>
            <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 28px" }}>لم نتمكن من تأكيد الدفع. تواصل معنا إذا تم خصم المبلغ.</p>
            <button onClick={() => navigate("/courses")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              العودة للدورات
            </button>
          </>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Payment Failed Page ─────────────────────────────
export function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order");

  useEffect(() => {
    if (orderId) {
      supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    }
  }, [orderId]);

  return (
    <div style={{ minHeight: "100vh", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 440, width: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.1)", margin: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <span style={{ fontSize: 44 }}>❌</span>
        </div>
        <h2 style={{ fontWeight: 900, fontSize: 26, color: "#0F172A", margin: "0 0 10px" }}>فشلت عملية الدفع</h2>
        <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 8px" }}>لم يتم خصم أي مبلغ من حسابك.</p>
        <p style={{ color: "#94A3B8", fontSize: 13, margin: "0 0 32px" }}>رقم الطلب: {orderId}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", marginBottom: 10 }}>
          حاول مجدداً
        </button>
        <button onClick={() => navigate("/courses")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          العودة للدورات
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap');`}</style>
    </div>
  );
}

// ─── Payment Cancel Page ─────────────────────────────
export function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 440, width: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.08)", margin: 16 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🚫</div>
        <h2 style={{ fontWeight: 900, fontSize: 26, color: "#0F172A", margin: "0 0 10px" }}>تم إلغاء الدفع</h2>
        <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 32px" }}>ألغيت عملية الدفع. يمكنك المحاولة مجدداً في أي وقت.</p>
        <button onClick={() => navigate(-1)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
          العودة للدورة
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap');`}</style>
    </div>
  );
}
