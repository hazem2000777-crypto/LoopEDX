import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Search, CheckCircle, XCircle, Eye, Trash2, Filter } from "lucide-react";

const STATUS_MAP = {
  published: { label: "منشور", color: "#10B981", bg: "#DCFCE7" },
  pending:   { label: "قيد المراجعة", color: "#F59E0B", bg: "#FEF9C3" },
  draft:     { label: "مسودة", color: "#64748B", bg: "#F1F5F9" },
  rejected:  { label: "مرفوض", color: "#EF4444", bg: "#FEF2F2" },
};

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data } = await supabase.from("courses").select("*, profiles(name, email)").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("courses").update({ status }).eq("id", id);
    setCourses(p => p.map(c => c.id === id ? { ...c, status } : c));
  };

  const deleteCourse = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("courses").delete().eq("id", id);
    setCourses(p => p.filter(c => c.id !== id));
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.profiles?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout active="courses">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>إدارة الدورات</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ padding: "8px 32px 8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl" }} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl", cursor: "pointer" }}>
            <option value="all">الكل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["الدورة", "المعلم", "التصنيف", "السعر", "الحالة", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} style={{ padding: "14px" }}><div style={{ height: 12, background: "#F1F5F9", borderRadius: 6 }} /></td>)}</tr>
                ))
              ) : filtered.map((c, i) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
                return (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px", maxWidth: 240 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{c.profiles?.name || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 10 }}>{c.category || "عام"}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: c.price === 0 ? "#10B981" : "#1E40AF", whiteSpace: "nowrap" }}>
                      {c.price === 0 ? "مجاني" : `${c.price} ر`}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 8, border: `1px solid ${st.color}50`, background: st.bg, color: st.color, fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", outline: "none" }}>
                        <option value="published">منشور</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="draft">مسودة</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => window.open(`/courses/${c.slug}`, "_blank")} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}><Eye size={13} /></button>
                        <button onClick={() => deleteCourse(c.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, fontFamily: "'Cairo', sans-serif", color: "#94A3B8" }}>لا توجد نتائج</div>
        )}
      </div>
    </AdminLayout>
  );
}
