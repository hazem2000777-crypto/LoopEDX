import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Plus, Trash2, Edit, Eye, Save, X, ChevronLeft, Search } from "lucide-react";

const TABS = ["المحتوى", "SEO", "Open Graph", "Twitter Card", "متقدم"];

function ArticleEditor({ article, onSave, onCancel }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    title: "", slug: "", content: "", excerpt: "", thumbnail_url: "", category: "عام", status: "draft", tags: "",
    meta_title: "", meta_description: "", meta_keywords: "", canonical_url: "", no_index: false, schema_markup: "",
    og_title: "", og_description: "", og_image: "", og_type: "article",
    twitter_title: "", twitter_description: "", twitter_image: "",
    ...article,
  });

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };
  const Field = ({ label, children, hint }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );

  const generateSlug = (t) => t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: 0 }}>{article?.id ? "تعديل المقال" : "مقال جديد"}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 12, outline: "none" }}>
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
          </select>
          <button onClick={() => onSave(form)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Save size={13} /> حفظ</button>
          <button onClick={onCancel} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}><X size={14} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E2E8F0", padding: "0 20px" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: "10px 14px", border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: tab === i ? "#1E40AF" : "#64748B", borderBottom: tab === i ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        {tab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <Field label="عنوان المقال *">
                <input style={inputStyle} value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) })); }} placeholder="عنوان المقال..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
              <Field label="المحتوى">
                <textarea style={{ ...inputStyle, minHeight: 300, resize: "vertical" }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="اكتب محتوى المقال هنا..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
              <Field label="مقتطف">
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="ملخص قصير للمقال..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            </div>
            <div>
              <Field label="رابط المقال (Slug)">
                <input style={{ ...inputStyle, direction: "ltr" }} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="article-slug" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
              <Field label="التصنيف">
                <input style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="عام" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
              <Field label="الوسوم (مفصولة بفواصل)">
                <input style={inputStyle} value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="تعليم، قدرات، ielts" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
              <Field label="صورة المقال (URL)">
                <input style={{ ...inputStyle, direction: "ltr" }} value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                {form.thumbnail_url && <img src={form.thumbnail_url} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = "none"} />}
              </Field>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>معاينة في جوجل</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, color: "#1a0dab", fontWeight: 600 }}>{form.meta_title || form.title || "عنوان الصفحة"}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#006621", margin: "2px 0" }}>loopedx.com/{form.slug || "article"}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#545454" }}>{form.meta_description || form.excerpt || "وصف الصفحة يظهر هنا..."}</div>
            </div>
            <Field label="عنوان SEO" hint="الحد الأمثل 50-60 حرف">
              <input style={inputStyle} value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} placeholder={form.title} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: form.meta_title?.length > 60 ? "#EF4444" : "#94A3B8", marginTop: 4 }}>{form.meta_title?.length || 0} / 60 حرف</div>
            </Field>
            <Field label="وصف SEO" hint="الحد الأمثل 150-160 حرف">
              <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} placeholder={form.excerpt} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: form.meta_description?.length > 160 ? "#EF4444" : "#94A3B8", marginTop: 4 }}>{form.meta_description?.length || 0} / 160 حرف</div>
            </Field>
            <Field label="كلمات مفتاحية">
              <input style={inputStyle} value={form.meta_keywords} onChange={e => setForm(p => ({ ...p, meta_keywords: e.target.value }))} placeholder="كلمة1، كلمة2، كلمة3" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="Canonical URL">
              <input style={{ ...inputStyle, direction: "ltr" }} value={form.canonical_url} onChange={e => setForm(p => ({ ...p, canonical_url: e.target.value }))} placeholder="https://loopedx.com/blog/..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#374151" }}>
              <input type="checkbox" checked={form.no_index} onChange={e => setForm(p => ({ ...p, no_index: e.target.checked }))} />
              إخفاء الصفحة من محركات البحث (noindex)
            </label>
          </div>
        )}

        {tab === 2 && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>معاينة Open Graph (فيسبوك/واتساب)</div>
              {form.og_image && <img src={form.og_image} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{form.og_title || form.meta_title || form.title}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", marginTop: 4 }}>{form.og_description || form.meta_description}</div>
            </div>
            {[
              { label: "OG Title", key: "og_title", placeholder: form.title },
              { label: "OG Description", key: "og_description", placeholder: form.excerpt },
              { label: "OG Image URL", key: "og_image", placeholder: "https://...", ltr: true },
              { label: "OG Type", key: "og_type", placeholder: "article" },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <input style={{ ...inputStyle, direction: f.ltr ? "ltr" : "rtl" }} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ background: "#000", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#64748B", marginBottom: 8 }}>معاينة Twitter Card</div>
              {form.twitter_image && <img src={form.twitter_image} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>{form.twitter_title || form.og_title || form.title}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{form.twitter_description || form.og_description}</div>
            </div>
            {[
              { label: "Twitter Title", key: "twitter_title" },
              { label: "Twitter Description", key: "twitter_description" },
              { label: "Twitter Image URL", key: "twitter_image", ltr: true },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <input style={{ ...inputStyle, direction: f.ltr ? "ltr" : "rtl" }} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            ))}
          </div>
        )}

        {tab === 4 && (
          <div style={{ maxWidth: 640 }}>
            <Field label="Schema Markup (JSON-LD)" hint="أضف Schema مخصص للصفحة">
              <textarea style={{ ...inputStyle, minHeight: 200, resize: "vertical", direction: "ltr", fontFamily: "monospace", fontSize: 12 }} value={form.schema_markup} onChange={e => setForm(p => ({ ...p, schema_markup: e.target.value }))} placeholder='{"@context": "https://schema.org", "@type": "Article", ...}' onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from("articles").select("id, title, slug, status, category, created_at, thumbnail_url").order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const saveArticle = async (form) => {
    const payload = { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [], updated_at: new Date().toISOString() };
    if (editing?.id) {
      await supabase.from("articles").update(payload).eq("id", editing.id);
      setArticles(p => p.map(a => a.id === editing.id ? { ...a, ...payload } : a));
    } else {
      const { data } = await supabase.from("articles").insert({ ...payload, author_id: user.id }).select("id, title, slug, status, category, created_at").single();
      if (data) setArticles(p => [data, ...p]);
    }
    setEditing(null);
  };

  const deleteArticle = async (id) => {
    if (!confirm("حذف المقال؟")) return;
    await supabase.from("articles").delete().eq("id", id);
    setArticles(p => p.filter(a => a.id !== id));
  };

  const filtered = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  if (editing !== null) return <AdminLayout active="articles"><ArticleEditor article={editing} onSave={saveArticle} onCancel={() => setEditing(null)} /></AdminLayout>;

  return (
    <AdminLayout active="articles">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>المقالات</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ padding: "8px 32px 8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl" }} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
          <button onClick={() => setEditing({})} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus size={15} /> مقال جديد
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {loading ? [1,2,3].map(i => <div key={i} style={{ height: 200, background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0" }} />) :
        filtered.map(a => (
          <div key={a.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <div style={{ height: 130, background: a.thumbnail_url ? "none" : "linear-gradient(135deg,#EFF6FF,#DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {a.thumbnail_url ? <img src={a.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 32 }}>📝</span>}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 8 }}>{a.category}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: a.status === "published" ? "#DCFCE7" : "#F1F5F9", color: a.status === "published" ? "#10B981" : "#64748B" }}>{a.status === "published" ? "منشور" : "مسودة"}</span>
              </div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.title}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(a)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Edit size={12} /> تعديل</button>
                <button onClick={() => window.open(`/blog/${a.slug}`, "_blank")} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}><Eye size={13} /></button>
                <button onClick={() => deleteArticle(a.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
