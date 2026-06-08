import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 10, overflow: "hidden", background: "#fff" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: open ? "#F8FAFC" : "#fff", border: "none", cursor: "pointer", textAlign: "right", fontFamily: "'Cairo', sans-serif" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{q}</span>
        {open ? <ChevronUp size={18} color="#2563EB" /> : <ChevronDown size={18} color="#64748B" />}
      </button>
      {open && <div style={{ padding: "0 20px 18px", fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", lineHeight: 1.8 }}>{a}</div>}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    const { data } = await supabase.from("faqs").select("*").eq("is_active", true).order("order_num");
    setFaqs(data || []);
    setLoading(false);
  };

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A8A)", padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(24px,4vw,44px)", color: "#fff", margin: "0 0 12px" }}>الأسئلة الشائعة</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0 }}>إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
          {loading ? (
            [1,2,3,4,5].map(i => <div key={i} style={{ height: 60, background: "#fff", borderRadius: 12, marginBottom: 10, border: "1px solid #E2E8F0" }} />)
          ) : faqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94A3B8", fontFamily: "'Cairo', sans-serif" }}>لا توجد أسئلة متاحة حالياً</div>
          ) : (
            faqs.map((f, i) => <FAQItem key={f.id || i} q={f.question} a={f.answer} />)
          )}
          <div style={{ background: "linear-gradient(135deg,#1E40AF,#2563EB)", borderRadius: 16, padding: "32px 28px", textAlign: "center", marginTop: 32 }}>
            <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", margin: "0 0 10px" }}>لم تجد إجابتك؟</h3>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.8)", margin: "0 0 20px" }}>تواصل معنا مباشرة وسنرد عليك خلال 24 ساعة</p>
            <a href="/contact" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 10, background: "#fff", color: "#1E40AF", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>تواصل معنا</a>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}
