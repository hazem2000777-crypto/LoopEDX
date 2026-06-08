import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { BookOpen, Users, Award, Globe, Target, Heart } from "lucide-react";

export default function About() {
  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", background: "#fff" }}>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A8A,#1E40AF)", padding: "80px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(28px,5vw,52px)", color: "#fff", margin: "0 0 20px" }}>
            عن <span style={{ color: "#60A5FA" }}>LoopEDX</span>
          </h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, color: "rgba(255,255,255,0.8)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>
            منصة تعليمية سعودية تهدف إلى تمكين الطلاب من تحقيق أهدافهم الأكاديمية بأفضل المعلمين وأحدث الأساليب
          </p>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 60 }}>
            {[
              { value: "10,000+", label: "طالب مسجّل", icon: <Users size={28} />, color: "#2563EB" },
              { value: "500+", label: "دورة متاحة", icon: <BookOpen size={28} />, color: "#10B981" },
              { value: "200+", label: "معلم متخصص", icon: <Award size={28} />, color: "#F59E0B" },
              { value: "95%", label: "نسبة رضا الطلاب", icon: <Heart size={28} />, color: "#EF4444" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 16, padding: "28px 20px", textAlign: "center", border: "1px solid #E2E8F0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, margin: "0 auto 14px" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 32, color: "#0F172A" }}>{s.value}</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", marginBottom: 60 }}>
            <div>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "4px 12px", borderRadius: 20 }}>رسالتنا</span>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,36px)", color: "#0F172A", margin: "16px 0 16px" }}>نؤمن بأن التعليم حق للجميع</h2>
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#64748B", lineHeight: 1.8, margin: "0 0 20px" }}>
                أُسّست LoopEDX لتكون المنصة التعليمية الأولى في المملكة العربية السعودية، نجمع أفضل المعلمين مع أحوج الطلاب في بيئة تعليمية تفاعلية ومتطورة.
              </p>
              <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#64748B", lineHeight: 1.8 }}>
                نهدف إلى دعم الطلاب في التحضير لاختبارات القدرات والتحصيل والـ IELTS وغيرها، من خلال دورات مُعدّة بعناية تضمن أعلى نتائج.
              </p>
            </div>
            <div style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", borderRadius: 20, padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
              <div style={{ textAlign: "center" }}>
                <Target size={64} color="#2563EB" style={{ marginBottom: 16 }} />
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#1E40AF" }}>هدفنا الأول</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#64748B", marginTop: 8 }}>نجاحك الأكاديمي</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: "clamp(22px,3vw,36px)", color: "#0F172A", margin: "0 0 40px" }}>قيمنا</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              {[
                { icon: "🎯", title: "التميز", desc: "نلتزم بأعلى معايير الجودة في كل دورة" },
                { icon: "🤝", title: "الشراكة", desc: "نبني علاقات حقيقية بين المعلم والطالب" },
                { icon: "💡", title: "الابتكار", desc: "نستخدم أحدث تقنيات التعليم الإلكتروني" },
                { icon: "🌟", title: "النتائج", desc: "نقيس نجاحنا بنجاح طلابنا" },
              ].map((v, i) => (
                <div key={i} style={{ background: "#F8FAFC", borderRadius: 14, padding: "28px 20px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{v.icon}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", marginBottom: 8 }}>{v.title}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`* { box-sizing: border-box; } @media(max-width:768px){ div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important} }`}</style>
    </div>
  );
}
