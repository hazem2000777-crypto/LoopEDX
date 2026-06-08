import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Save, CheckCircle } from "lucide-react";

const PAGES = [
  { id: "home", label: "الصفحة الرئيسية", url: "/" },
  { id: "courses", label: "صفحة الدورات", url: "/courses" },
  { id: "about", label: "عن المنصة", url: "/about" },
  { id: "contact", label: "تواصل معنا", url: "/contact" },
  { id: "faq", label: "الأسئلة الشائعة", url: "/faq" },
  { id: "blog", label: "المدونة", url: "/blog" },
  { id: "login", label: "تسجيل الدخول", url: "/login" },
  { id: "register", label: "إنشاء حساب", url: "/register" },
];

export default function AdminSEO() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("home");
  const [pages, setPages] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSEO(); }, []);

  const fetchSEO = async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_pages").select("*");
    const map = {};
    (data || []).forEach(row => { map[row.page] = row; });
    setPages(map);
    setLoading(false);
  };

  const savePage = async () => {
    setSaving(true);
    const current = pages[activePage] || {};
    await supabase.from("seo_pages").upsert({ ...current, page: activePage, updated_at: new Date().toISOString() }, { onConflict: "page" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const updateField = (key, value) => {
    setPages(prev => ({ ...prev, [activePage]: { ...(prev[activePage] || {}), [key]: value } }));
  };

  const current = pages[activePage] || {};
  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };
  const Field = ({ label, hint, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );

  return (
    <AdminLayout active="seo">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>إعدادات SEO</h1>
        <button onClick={savePage} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: saved ? "#10B981" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saved ? <><CheckCircle size={14} /> تم الحفظ</> : <><Save size={14} /> {saving ? "جاري..." : "حفظ"}</>}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 8, height: "fit-content" }}>
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setActivePage(p.id)}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: activePage === p.id ? "#EFF6FF" : "transparent", marginBottom: 2, textAlign: "right" }}>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: activePage === p.id ? 700 : 500, fontSize: 13, color: activePage === p.id ? "#1E40AF" : "#374151" }}>{p.label}</span>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", direction: "ltr" }}>{p.url}</span>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>
          {/* Google Preview */}
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid #E2E8F0" }}>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>معاينة في جوجل</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, color: "#1a0dab", fontWeight: 600 }}>{current.title || "عنوان الصفحة"}</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#006621", margin: "2px 0" }}>loopedx.com{PAGES.find(p => p.id === activePage)?.url}</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#545454" }}>{current.description || "وصف الصفحة يظهر هنا..."}</div>
          </div>

          <Field label="عنوان SEO" hint={`${(current.title?.length || 0)} / 60 حرف — الحد الأمثل 50-60`}>
            <input style={inputStyle} value={current.title || ""} onChange={e => updateField("title", e.target.value)} placeholder="عنوان الصفحة في محركات البحث" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </Field>
          <Field label="وصف SEO" hint={`${(current.description?.length || 0)} / 160 حرف — الحد الأمثل 150-160`}>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={current.description || ""} onChange={e => updateField("description", e.target.value)} placeholder="وصف الصفحة في محركات البحث" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </Field>
          <Field label="صورة Open Graph (og:image)">
            <input style={{ ...inputStyle, direction: "ltr" }} value={current.og_image || ""} onChange={e => updateField("og_image", e.target.value)} placeholder="https://loopedx.com/og-image.jpg" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            {current.og_image && <img src={current.og_image} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = "none"} />}
          </Field>
        </div>
      </div>
    </AdminLayout>
  );
}
