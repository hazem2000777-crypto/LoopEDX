import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";
import { Save, Plus, Trash2, CheckCircle, Upload, X } from "lucide-react";

export default function AdminHeaderFooter() {
  const [tab, setTab] = useState("header");
  const [header, setHeader] = useState({ logo_text: "LoopEDX", logo_url: "", nav_links: [], cta_text: "ابدأ الآن", cta_url: "/register", is_sticky: true });
  const [footer, setFooter] = useState({ description: "", columns: [], social_links: { facebook: "", twitter: "", instagram: "", youtube: "", whatsapp: "" }, copyright_text: "", bg_color: "#0F172A" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: h }, { data: f }] = await Promise.all([
        supabase.from("header_settings").select("*").limit(1).single(),
        supabase.from("footer_settings").select("*").limit(1).single(),
      ]);
      if (h) setHeader({ ...h, nav_links: typeof h.nav_links === "string" ? JSON.parse(h.nav_links) : (h.nav_links || []) });
      if (f) setFooter({ ...f, columns: typeof f.columns === "string" ? JSON.parse(f.columns) : (f.columns || []), social_links: typeof f.social_links === "string" ? JSON.parse(f.social_links) : (f.social_links || {}) });
    } catch {}
    setLoading(false);
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("course-thumbnails").upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
      setHeader(p => ({ ...p, logo_url: data.publicUrl }));
    } catch (err) { alert("خطأ في رفع الشعار: " + err.message); }
    setUploadingLogo(false);
  };

  const save = async () => {
    setSaving(true);
    if (tab === "header") {
      await supabase.from("header_settings").upsert({ ...header, updated_at: new Date().toISOString() });
    } else {
      await supabase.from("footer_settings").upsert({ ...footer, updated_at: new Date().toISOString() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <AdminLayout active="header-footer">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>الهيدر والفوتر</h1>
        <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: saved ? "#10B981" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saved ? <><CheckCircle size={14} /> تم الحفظ</> : <><Save size={14} /> {saving ? "جاري..." : "حفظ"}</>}
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 20 }}>
        {[["header", "الهيدر"], ["footer", "الفوتر"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 20px", border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: tab === id ? "#1E40AF" : "#64748B", borderBottom: tab === id ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {!loading && tab === "header" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>

          {/* Logo Upload */}
          <Field label="شعار الموقع">
            <div>
              {header.logo_url ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                  <img src={header.logo_url} alt="logo" style={{ height: 40, maxWidth: 160, objectFit: "contain" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>تم رفع الشعار بنجاح</div>
                  </div>
                  <button onClick={() => setHeader(p => ({ ...p, logo_url: "" }))} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                </div>
              ) : null}
              <div onClick={() => logoRef.current?.click()}
                style={{ border: "2px dashed #BFDBFE", borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: uploadingLogo ? "#EFF6FF" : "#F8FAFC" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#EFF6FF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.background = "#F8FAFC"; }}>
                <Upload size={24} color="#2563EB" style={{ marginBottom: 6 }} />
                <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#1E40AF", margin: 0 }}>{uploadingLogo ? "جاري الرفع..." : "اضغط لرفع الشعار"}</p>
                <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", margin: "4px 0 0" }}>PNG, SVG, JPG — يفضل خلفية شفافة</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadLogo(e.target.files[0])} />
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Field label="اسم الموقع (نص بديل للشعار)">
              <input style={inputStyle} value={header.logo_text} onChange={e => setHeader(p => ({ ...p, logo_text: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="نص زر CTA">
              <input style={inputStyle} value={header.cta_text} onChange={e => setHeader(p => ({ ...p, cta_text: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="رابط زر CTA">
              <input style={{ ...inputStyle, direction: "ltr" }} value={header.cta_url} onChange={e => setHeader(p => ({ ...p, cta_url: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
          </div>

          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>روابط التنقل</div>
          {(header.nav_links || []).map((link, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} value={link.label} onChange={e => { const l = [...header.nav_links]; l[i] = { ...l[i], label: e.target.value }; setHeader(p => ({ ...p, nav_links: l })); }} placeholder="الاسم" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              <input style={{ ...inputStyle, direction: "ltr" }} value={link.url} onChange={e => { const l = [...header.nav_links]; l[i] = { ...l[i], url: e.target.value }; setHeader(p => ({ ...p, nav_links: l })); }} placeholder="/courses" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              <button onClick={() => setHeader(p => ({ ...p, nav_links: p.nav_links.filter((_, j) => j !== i) }))} style={{ borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => setHeader(p => ({ ...p, nav_links: [...(p.nav_links || []), { label: "", url: "" }] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={13} /> إضافة رابط
          </button>
        </div>
      )}

      {!loading && tab === "footer" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>
          <Field label="وصف الموقع">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={footer.description} onChange={e => setFooter(p => ({ ...p, description: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </Field>
          <Field label="نص حقوق النشر">
            <input style={inputStyle} value={footer.copyright_text} onChange={e => setFooter(p => ({ ...p, copyright_text: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </Field>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", margin: "16px 0 12px" }}>روابط السوشيال ميديا</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["facebook", "twitter", "instagram", "youtube", "whatsapp"].map(platform => (
              <Field key={platform} label={platform}>
                <input style={{ ...inputStyle, direction: "ltr" }} value={footer.social_links?.[platform] || ""} onChange={e => setFooter(p => ({ ...p, social_links: { ...p.social_links, [platform]: e.target.value } }))} placeholder="https://..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            ))}
          </div>
          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", margin: "16px 0 12px" }}>أعمدة الفوتر</div>
          {(footer.columns || []).map((col, ci) => (
            <div key={ci} style={{ background: "#F8FAFC", borderRadius: 10, padding: 14, marginBottom: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <input style={{ ...inputStyle, maxWidth: 200 }} value={col.title} onChange={e => { const c = [...(footer.columns || [])]; c[ci] = { ...c[ci], title: e.target.value }; setFooter(p => ({ ...p, columns: c })); }} placeholder="عنوان العمود" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                <button onClick={() => setFooter(p => ({ ...p, columns: p.columns.filter((_, i) => i !== ci) }))} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 12 }}>حذف العمود</button>
              </div>
              {(col.links || []).map((link, li) => (
                <div key={li} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px", gap: 8, marginBottom: 8 }}>
                  <input style={inputStyle} value={link.label} onChange={e => { const c = [...(footer.columns || [])]; c[ci].links[li] = { ...c[ci].links[li], label: e.target.value }; setFooter(p => ({ ...p, columns: c })); }} placeholder="اسم الرابط" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  <input style={{ ...inputStyle, direction: "ltr" }} value={link.url} onChange={e => { const c = [...(footer.columns || [])]; c[ci].links[li] = { ...c[ci].links[li], url: e.target.value }; setFooter(p => ({ ...p, columns: c })); }} placeholder="/page" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  <button onClick={() => { const c = [...(footer.columns || [])]; c[ci].links = c[ci].links.filter((_, i) => i !== li); setFooter(p => ({ ...p, columns: c })); }} style={{ borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
                </div>
              ))}
              <button onClick={() => { const c = [...(footer.columns || [])]; c[ci].links = [...(c[ci].links || []), { label: "", url: "" }]; setFooter(p => ({ ...p, columns: c })); }} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", padding: 0 }}>+ إضافة رابط</button>
            </div>
          ))}
          <button onClick={() => setFooter(p => ({ ...p, columns: [...(p.columns || []), { title: "", links: [] }] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Plus size={13} /> إضافة عمود
          </button>
        </div>
      )}
      <style>{`* { box-sizing: border-box; }`}</style>
    </AdminLayout>
  );
}
