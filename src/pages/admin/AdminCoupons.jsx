import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Plus, Trash2, Copy, Tag, CheckCircle } from "lucide-react";

export default function AdminCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", max_uses: "", expires_at: "", is_active: true, description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const saveCoupon = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    const { data, error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
      description: form.description || null,
    }).select().single();
    if (!error) {
      setCoupons(p => [data, ...p]);
      setForm({ code: "", type: "percent", value: "", max_uses: "", expires_at: "", is_active: true, description: "" });
      setShowForm(false);
    }
    setSaving(false);
  };

  const toggleActive = async (id, val) => {
    await supabase.from("coupons").update({ is_active: val }).eq("id", id);
    setCoupons(p => p.map(c => c.id === id ? { ...c, is_active: val } : c));
  };

  const deleteCoupon = async (id) => {
    if (!confirm("حذف الكوبون؟")) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(p => p.filter(c => c.id !== id));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };

  return (
    <AdminLayout active="coupons">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>أكواد الخصم</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> إنشاء كوبون
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: "0 0 20px" }}>كوبون جديد</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>كود الخصم *</label>
              <input style={{ ...inputStyle, textTransform: "uppercase", direction: "ltr" }} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="LOOP20" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>نوع الخصم *</label>
              <select style={inputStyle} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}>
                <option value="percent">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ريال)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>قيمة الخصم *</label>
              <input type="number" style={inputStyle} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === "percent" ? "20" : "50"} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>أقصى عدد استخدامات</label>
              <input type="number" style={inputStyle} value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} placeholder="100 (اتركه فارغاً للامحدود)" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>تاريخ الانتهاء</label>
              <input type="date" style={{ ...inputStyle, direction: "ltr" }} value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>وصف (اختياري)</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف الكوبون..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={saveCoupon} disabled={saving || !form.code || !form.value} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: (!form.code || !form.value) ? 0.5 : 1 }}>
              {saving ? "جاري الحفظ..." : "حفظ الكوبون"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["الكود", "نوع الخصم", "القيمة", "الاستخدامات", "الانتهاء", "الحالة", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "right", fontWeight: 700, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} style={{ padding: 14 }}><div style={{ height: 12, background: "#F1F5F9", borderRadius: 6 }} /></td>)}</tr>)
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", fontFamily: "'Cairo', sans-serif", color: "#94A3B8" }}>لا توجد أكواد خصم</td></tr>
              ) : coupons.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < coupons.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ fontWeight: 800, fontSize: 14, color: "#1E40AF", background: "#EFF6FF", padding: "2px 8px", borderRadius: 6, letterSpacing: 1 }}>{c.code}</code>
                      <button onClick={() => copyCode(c.code)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
                        {copied === c.code ? <CheckCircle size={13} color="#10B981" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{c.type === "percent" ? "نسبة مئوية" : "مبلغ ثابت"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#10B981" }}>{c.type === "percent" ? `${c.value}%` : `${c.value} ر`}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748B" }}>{c.used_count || 0} {c.max_uses ? `/ ${c.max_uses}` : ""}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748B" }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-SA") : "بلا انتهاء"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => toggleActive(c.id, !c.is_active)}
                      style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 12, background: c.is_active ? "#DCFCE7" : "#F1F5F9", color: c.is_active ? "#10B981" : "#94A3B8" }}>
                      {c.is_active ? "فعّال" : "معطّل"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => deleteCoupon(c.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
