import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box", transition: "border-color 0.2s" };

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A8A)", padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(24px,4vw,44px)", color: "#fff", margin: "0 0 12px" }}>تواصل معنا</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0 }}>نسعد بسماعك ومساعدتك</p>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, alignItems: "start" }}>
          {/* Info */}
          <div>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 22, color: "#0F172A", margin: "0 0 24px" }}>بياناتنا</h2>
            {[
              { icon: <Mail size={20} />, label: "البريد الإلكتروني", value: "support@loopedx.com", color: "#2563EB" },
              { icon: <Phone size={20} />, label: "الهاتف", value: "+966 5x xxx xxxx", color: "#10B981" },
              { icon: <MapPin size={20} />, label: "الموقع", value: "المملكة العربية السعودية", color: "#F59E0B" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <CheckCircle size={56} color="#10B981" style={{ marginBottom: 16 }} />
                <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: "0 0 8px" }}>تم إرسال رسالتك!</h3>
                <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>سنرد عليك خلال 24 ساعة</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: 0 }}>أرسل رسالة</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>الاسم *</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="اسمك الكامل" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>البريد الإلكتروني *</label>
                    <input style={inputStyle} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" dir="ltr" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>الموضوع</label>
                  <input style={inputStyle} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="موضوع رسالتك" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>الرسالة *</label>
                  <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="اكتب رسالتك هنا..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                </div>
                <button onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: (sending || !form.name || !form.email || !form.message) ? 0.7 : 1, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                  <Send size={16} /> {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <style>{`* { box-sizing: border-box; } @media(max-width:768px){ div[style*="grid-template-columns: 1fr 1.5fr"]{grid-template-columns:1fr!important} div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important} }`}</style>
    </div>
  );
}
