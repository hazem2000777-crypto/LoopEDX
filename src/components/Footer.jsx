import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { BookMarked } from "lucide-react";

const DEFAULT = {
  description: "منصة تعليمية سعودية تهدف إلى تمكين الطلاب من تحقيق أهدافهم الأكاديمية",
  copyright_text: "© 2025 LoopEDX. جميع الحقوق محفوظة.",
  social_links: { facebook: "", twitter: "", instagram: "", youtube: "", whatsapp: "" },
  columns: [
    { title: "الدورات", links: [{ label: "قياس", url: "/courses?cat=قياس" }, { label: "قدرات", url: "/courses?cat=قدرات" }, { label: "تحصيلي", url: "/courses?cat=تحصيلي" }, { label: "IELTS", url: "/courses?cat=IELTS" }] },
    { title: "المنصة", links: [{ label: "عن المنصة", url: "/about" }, { label: "المدونة", url: "/blog" }, { label: "تواصل معنا", url: "/contact" }] },
    { title: "الدعم", links: [{ label: "الأسئلة الشائعة", url: "/faq" }, { label: "سياسة الخصوصية", url: "/privacy" }, { label: "الشروط والأحكام", url: "/terms" }] },
  ],
};

const SOCIAL_ICONS = {
  facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", whatsapp: "📱",
};

export default function Footer() {
  const [data, setData] = useState(DEFAULT);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoText, setLogoText] = useState("LoopEDX");

  useEffect(() => {
    fetchFooter();
    fetchHeader();
  }, []);

  const fetchFooter = async () => {
    try {
      const { data: f } = await supabase.from("footer_settings").select("*").limit(1).single();
      if (f) setData({
        description: f.description || DEFAULT.description,
        copyright_text: f.copyright_text || DEFAULT.copyright_text,
        social_links: typeof f.social_links === "string" ? JSON.parse(f.social_links) : (f.social_links || DEFAULT.social_links),
        columns: typeof f.columns === "string" ? JSON.parse(f.columns) : (f.columns?.length ? f.columns : DEFAULT.columns),
      });
    } catch {}
  };

  const fetchHeader = async () => {
    try {
      const { data: h } = await supabase.from("header_settings").select("logo_url, logo_text").limit(1).single();
      if (h) { setLogoUrl(h.logo_url || ""); setLogoText(h.logo_text || "LoopEDX"); }
    } catch {}
  };

  const activeSocials = Object.entries(data.social_links || {}).filter(([_, url]) => url);

  return (
    <footer style={{ background: "#0F172A", direction: "rtl", fontFamily: "'Cairo', sans-serif", paddingTop: 48 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `1fr ${data.columns.map(() => "1fr").join(" ")}`, gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {logoUrl ? (
                <img src={logoUrl} alt={logoText} style={{ height: 36 }} />
              ) : (
                <>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookMarked size={15} color="#fff" />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>
                    {logoText?.slice(0, -3) || "Loop"}
                    <span style={{ color: "#60A5FA" }}>{logoText?.slice(-3) || "EDX"}</span>
                  </span>
                </>
              )}
            </Link>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.8, marginBottom: 20, maxWidth: 240 }}>{data.description}</p>
            {activeSocials.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                {activeSocials.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noreferrer"
                    style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 14, color: "#94A3B8", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.3)"; e.currentTarget.style.color = "#60A5FA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94A3B8"; }}>
                    {SOCIAL_ICONS[platform] || platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Columns */}
          {data.columns.map((col, i) => (
            <div key={i}>
              <h3 style={{ fontWeight: 800, fontSize: 14, color: "#fff", margin: "0 0 16px" }}>{col.title}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(col.links || []).map((link, j) => (
                  <Link key={j} to={link.url} style={{ fontSize: 13, color: "#64748B", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{data.copyright_text}</p>
          <div style={{ display: "flex", gap: 16 }}>
            {[{ label: "سياسة الخصوصية", url: "/privacy" }, { label: "الشروط والأحكام", url: "/terms" }].map(link => (
              <Link key={link.url} to={link.url} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
          footer > div > div:first-child > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
