import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";
import { Plus, Trash2, Edit, Save, X, GripVertical } from "lucide-react";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("faqs").select("*").order("order_num");
    if (!error) setFaqs(data || []);
    setLoading(false);
  };

  const addFAQ = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    setSaving(true);
    const { data, error } = await supabase.from("faqs").insert({
      question: newFaq.question,
      answer: newFaq.answer,
      order_num: faqs.length + 1,
      is_active: true
    }).select().single();
    if (!error && data) {
      setFaqs(p => [...p, data]);
      setNewFaq({ question: "", answer: "" });
      setShowAdd(false);
    }
    setSaving(false);
  };

  const updateFAQ = async (id) => {
    setSaving(true);
    const { error } = await supabase.from("faqs").update({ question: editForm.question, answer: editForm.answer }).eq("id", id);
    if (!error) setFaqs(p => p.map(f => f.id === id ? { ...f, ...editForm } : f));
    setEditId(null);
    setSaving(false);
  };

  const toggleActive = async (id, val) => {
    await supabase.from("faqs").update({ is_active: val }).eq("id", id);
    setFaqs(p => p.map(f => f.id === id ? { ...f, is_active: val } : f));
  };

  const deleteFAQ = async (id) => {
    if (!confirm("حذف هذا السؤال؟")) return;
    await supabase.from("faqs").delete().eq("id", id);
    setFaqs(p => p.filter(f => f.id !== id));
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };

  return (
    <AdminLayout active="faqs">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>الأسئلة الشائعة</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>{faqs.length} سؤال</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> إضافة سؤال
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", margin: "0 0 16px" }}>سؤال جديد</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input style={inputStyle} value={newFaq.question} onChange={e => setNewFaq(p => ({ ...p, question: e.target.value }))} placeholder="السؤال..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={newFaq.answer} onChange={e => setNewFaq(p => ({ ...p, answer: e.target.value }))} placeholder="الإجابة..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addFAQ} disabled={saving || !newFaq.question || !newFaq.answer} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "#1E40AF", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: (!newFaq.question || !newFaq.answer) ? 0.5 : 1 }}>{saving ? "جاري..." : "إضافة"}</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</div>
      ) : faqs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8", fontFamily: "'Cairo', sans-serif", background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0" }}>
          لا توجد أسئلة بعد — اضغط "إضافة سؤال" للبدء
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map(faq => (
            <div key={faq.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {editId === faq.id ? (
                <div style={{ padding: 16 }}>
                  <input style={{ ...inputStyle, marginBottom: 10 }} value={editForm.question} onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", marginBottom: 10 }} value={editForm.answer} onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateFAQ(faq.id)} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "none", background: "#1E40AF", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Save size={13} /> حفظ</button>
                    <button onClick={() => setEditId(null)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}><X size={13} /> إلغاء</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <GripVertical size={16} color="#CBD5E1" style={{ flexShrink: 0, marginTop: 2, cursor: "grab" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>{faq.question}</div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{faq.answer}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleActive(faq.id, !faq.is_active)} style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 11, background: faq.is_active ? "#DCFCE7" : "#F1F5F9", color: faq.is_active ? "#10B981" : "#94A3B8" }}>
                      {faq.is_active ? "فعّال" : "مخفي"}
                    </button>
                    <button onClick={() => { setEditId(faq.id); setEditForm({ question: faq.question, answer: faq.answer }); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}><Edit size={13} /></button>
                    <button onClick={() => deleteFAQ(faq.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`* { box-sizing: border-box; }`}</style>
    </AdminLayout>
  );
}
