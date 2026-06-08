import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Save, Plus, Trash2, CheckCircle } from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Hero Section", icon: "🎯" },
  { id: "stats", label: "الإحصائيات", icon: "📊" },
  { id: "features", label: "المميزات", icon: "⭐" },
  { id: "how_it_works", label: "كيف تعمل", icon: "⚙️" },
  { id: "testimonials", label: "آراء الطلاب", icon: "💬" },
  { id: "cta_banner", label: "CTA Banner", icon: "🚀" },
];

export default function AdminHomepage() {
  const { user } = useAuth();
  const [sections, setSections] = useState({});
  const [activeSection, setActiveSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    setLoading(true);
    const { data } = await supabase.from("homepage_content").select("*");
    const map = {};
    (data || []).forEach(row => { map[row.section] = { ...row, content: typeof row.content === "string" ? JSON.parse(row.content) : row.content }; });
    setSections(map);
    setLoading(false);
  };

  const updateField = (path, value) => {
    setSections(prev => {
      const updated = { ...prev };
      const sec = JSON.parse(JSON.stringify(updated[activeSection] || { content: {} }));
      const keys = path.split(".");
      let obj = sec.content;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      updated[activeSection] = sec;
      return updated;
    });
  };

  const saveSection = async () => {
    setSaving(true);
    const sec = sections[activeSection];
    if (sec?.id) {
      await supabase.from("homepage_content").update({ content: sec.content, updated_at: new Date().toISOString() }).eq("id", sec.id);
    } else {
      await supabase.from("homepage_content").upsert({ section: activeSection, content: sec?.content || {} });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const content = sections[activeSection]?.content || {};
  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <AdminLayout active="homepage">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>الصفحة الرئيسية</h1>
        <button onClick={saveSection} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: saved ? "#10B981" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saved ? <><CheckCircle size={14} /> تم الحفظ</> : <><Save size={14} /> {saving ? "جاري..." : "حفظ التغييرات"}</>}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        {/* Sections Menu */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 8, height: "fit-content" }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: activeSection === s.id ? "#EFF6FF" : "transparent", color: activeSection === s.id ? "#1E40AF" : "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: activeSection === s.id ? 700 : 500, fontSize: 13, marginBottom: 2, textAlign: "right" }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Section Editor */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>
          {loading ? <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>جاري التحميل...</div> : (
            <>
              {activeSection === "hero" && (
                <div>
                  <Field label="Badge النص الصغير">
                    <input style={inputStyle} value={content.badge || ""} onChange={e => updateField("badge", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </Field>
                  <Field label="العنوان الرئيسي">
                    <input style={inputStyle} value={content.title || ""} onChange={e => updateField("title", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </Field>
                  <Field label="النص الفرعي">
                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={content.subtitle || ""} onChange={e => updateField("subtitle", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="نص زر CTA الرئيسي">
                      <input style={inputStyle} value={content.cta_primary?.text || ""} onChange={e => updateField("cta_primary.text", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                    <Field label="رابط زر CTA الرئيسي">
                      <input style={{ ...inputStyle, direction: "ltr" }} value={content.cta_primary?.url || ""} onChange={e => updateField("cta_primary.url", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                    <Field label="نص زر CTA الثانوي">
                      <input style={inputStyle} value={content.cta_secondary?.text || ""} onChange={e => updateField("cta_secondary.text", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                    <Field label="رابط زر CTA الثانوي">
                      <input style={{ ...inputStyle, direction: "ltr" }} value={content.cta_secondary?.url || ""} onChange={e => updateField("cta_secondary.url", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                  </div>
                  <Field label="صورة Hero (URL)">
                    <input style={{ ...inputStyle, direction: "ltr" }} value={content.image_url || ""} onChange={e => updateField("image_url", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </Field>
                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16, marginTop: 4 }}>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>الإحصائيات السريعة</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(content.stats || []).map((stat, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input style={{ ...inputStyle, width: 80, flexShrink: 0 }} value={stat.value} onChange={e => { const s = [...(content.stats || [])]; s[i] = { ...s[i], value: e.target.value }; updateField("stats", s); }} placeholder="قيمة" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                          <input style={inputStyle} value={stat.label} onChange={e => { const s = [...(content.stats || [])]; s[i] = { ...s[i], label: e.target.value }; updateField("stats", s); }} placeholder="تسمية" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "stats" && (
                <div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 16 }}>عناصر الإحصائيات</div>
                  {(content.items || []).map((item, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10, padding: 12, background: "#F8FAFC", borderRadius: 9 }}>
                      <input style={inputStyle} value={item.value} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], value: e.target.value }; updateField("items", s); }} placeholder="القيمة (مثال: 10,000+)" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <input style={inputStyle} value={item.label} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], label: e.target.value }; updateField("items", s); }} placeholder="التسمية" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <button onClick={() => { const s = (content.items || []).filter((_, j) => j !== i); updateField("items", s); }} style={{ borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField("items", [...(content.items || []), { value: "", label: "", icon: "star" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    <Plus size={13} /> إضافة عنصر
                  </button>
                </div>
              )}

              {activeSection === "features" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <Field label="عنوان القسم">
                      <input style={inputStyle} value={content.title || ""} onChange={e => updateField("title", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                    <Field label="النص الفرعي">
                      <input style={inputStyle} value={content.subtitle || ""} onChange={e => updateField("subtitle", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                    </Field>
                  </div>
                  {(content.items || []).map((item, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 40px", gap: 10, marginBottom: 10, padding: 12, background: "#F8FAFC", borderRadius: 9, alignItems: "center" }}>
                      <input style={inputStyle} value={item.icon} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], icon: e.target.value }; updateField("items", s); }} placeholder="🎯" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <input style={inputStyle} value={item.title} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], title: e.target.value }; updateField("items", s); }} placeholder="العنوان" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <input style={inputStyle} value={item.desc} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], desc: e.target.value }; updateField("items", s); }} placeholder="الوصف" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <button onClick={() => { const s = (content.items || []).filter((_, j) => j !== i); updateField("items", s); }} style={{ borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField("items", [...(content.items || []), { icon: "⭐", title: "", desc: "" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    <Plus size={13} /> إضافة ميزة
                  </button>
                </div>
              )}

              {activeSection === "testimonials" && (
                <div>
                  <Field label="عنوان القسم">
                    <input style={inputStyle} value={content.title || ""} onChange={e => updateField("title", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </Field>
                  {(content.items || []).map((item, i) => (
                    <div key={i} style={{ padding: 14, background: "#F8FAFC", borderRadius: 10, marginBottom: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <input style={inputStyle} value={item.name} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], name: e.target.value }; updateField("items", s); }} placeholder="الاسم" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                        <input style={inputStyle} value={item.role} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], role: e.target.value }; updateField("items", s); }} placeholder="الدور (طالب جامعي...)" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      </div>
                      <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical", marginBottom: 10 }} value={item.text} onChange={e => { const s = [...(content.items || [])]; s[i] = { ...s[i], text: e.target.value }; updateField("items", s); }} placeholder="نص الشهادة..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <button onClick={() => { const s = (content.items || []).filter((_, j) => j !== i); updateField("items", s); }} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 12 }}>حذف</button>
                    </div>
                  ))}
                  <button onClick={() => updateField("items", [...(content.items || []), { name: "", role: "", text: "", rating: 5, avatar: "؟" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    <Plus size={13} /> إضافة شهادة
                  </button>
                </div>
              )}

              {activeSection === "cta_banner" && (
                <div>
                  <Field label="عنوان البانر"><input style={inputStyle} value={content.title || ""} onChange={e => updateField("title", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                  <Field label="النص الفرعي"><input style={inputStyle} value={content.subtitle || ""} onChange={e => updateField("subtitle", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="نص الزر"><input style={inputStyle} value={content.cta_text || ""} onChange={e => updateField("cta_text", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                    <Field label="رابط الزر"><input style={{ ...inputStyle, direction: "ltr" }} value={content.cta_url || ""} onChange={e => updateField("cta_url", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                  </div>
                  <Field label="Gradient الخلفية"><input style={{ ...inputStyle, direction: "ltr" }} value={content.bg_gradient || ""} onChange={e => updateField("bg_gradient", e.target.value)} placeholder="linear-gradient(135deg, #1E40AF, #7C3AED)" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                </div>
              )}

              {activeSection === "how_it_works" && (
                <div>
                  <Field label="عنوان القسم"><input style={inputStyle} value={content.title || ""} onChange={e => updateField("title", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} /></Field>
                  {(content.steps || []).map((step, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 40px", gap: 10, marginBottom: 10, padding: 12, background: "#F8FAFC", borderRadius: 9, alignItems: "center" }}>
                      <input style={inputStyle} value={step.num} onChange={e => { const s = [...(content.steps || [])]; s[i] = { ...s[i], num: e.target.value }; updateField("steps", s); }} placeholder="1" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <input style={inputStyle} value={step.title} onChange={e => { const s = [...(content.steps || [])]; s[i] = { ...s[i], title: e.target.value }; updateField("steps", s); }} placeholder="العنوان" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <input style={inputStyle} value={step.desc} onChange={e => { const s = [...(content.steps || [])]; s[i] = { ...s[i], desc: e.target.value }; updateField("steps", s); }} placeholder="الوصف" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                      <button onClick={() => { const s = (content.steps || []).filter((_, j) => j !== i); updateField("steps", s); }} style={{ borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField("steps", [...(content.steps || []), { num: String((content.steps?.length || 0) + 1), title: "", desc: "" }])} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    <Plus size={13} /> إضافة خطوة
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
