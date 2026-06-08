import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { Search, Trash2, Shield, User, BookOpen } from "lucide-react";
import { sendInstructorApproval } from "../../lib/brevo";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const updateRole = async (id, newRole) => {
    const userToUpdate = users.find(u => u.id === id);
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    setUsers(p => p.map(u => u.id === id ? { ...u, role: newRole } : u));

    // ✅ لو الأدمن غير الدور لـ instructor → بعت إيميل موافقة
    if (newRole === "instructor" && userToUpdate) {
      await sendInstructorApproval({
        email: userToUpdate.email,
        name: userToUpdate.name || "المعلم",
      });
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("profiles").delete().eq("id", id);
    setUsers(p => p.filter(u => u.id !== id));
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout active="users">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>إدارة المستخدمين</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ padding: "8px 32px 8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl" }} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl", cursor: "pointer" }}>
            <option value="all">الكل</option>
            <option value="student">طلاب</option>
            <option value="instructor">معلمون</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "إجمالي المستخدمين", value: users.length, color: "#2563EB", icon: <User size={18} /> },
          { label: "الطلاب", value: users.filter(u => u.role === "student" || !u.role).length, color: "#10B981", icon: <BookOpen size={18} /> },
          { label: "المعلمون", value: users.filter(u => u.role === "instructor").length, color: "#8B5CF6", icon: <Shield size={18} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A" }}>{s.value}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["المستخدم", "البريد", "الدور", "تاريخ التسجيل", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} style={{ padding: 14 }}><div style={{ height: 12, background: "#F1F5F9", borderRadius: 6 }} /></td>)}</tr>)
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {u.name?.[0] || "؟"}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{u.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748B" }}>{u.email}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <select value={u.role || "student"} onChange={e => updateRole(u.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", outline: "none", background: u.role === "instructor" ? "#EEF2FF" : "#F0FFF4", color: u.role === "instructor" ? "#6366F1" : "#10B981" }}>
                      <option value="student">طالب</option>
                      <option value="instructor">معلم</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748B" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("ar-SA") : "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => deleteUser(u.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}><Trash2 size={13} /></button>
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