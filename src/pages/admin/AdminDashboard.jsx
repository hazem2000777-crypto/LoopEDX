import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import {
  LayoutDashboard, BookOpen, Users, DollarSign, Settings,
  CheckCircle, XCircle, Clock, Eye, LogOut, Menu, X,
  BookMarked, Bell, ChevronDown, Search, Filter
} from "lucide-react";

const navItems = [
  { label: "الرئيسية",  icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "الدورات",   icon: <BookOpen size={18} />,        id: "courses" },
  { label: "المستخدمون",icon: <Users size={18} />,           id: "users" },
  { label: "الإيرادات", icon: <DollarSign size={18} />,      id: "earnings" },
  { label: "الإعدادات", icon: <Settings size={18} />,        id: "settings" },
];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("courses");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ courses: 0, users: 0, pending: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: coursesData }, { data: usersData }, { data: ordersData }] = await Promise.all([
        supabase.from("courses").select(`*, profiles(name, email)`).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("amount").eq("status", "paid"),
      ]);
      setCourses(coursesData || []);
      setUsers(usersData || []);
      const totalRevenue = (ordersData || []).reduce((t, o) => t + (o.amount || 0), 0);
      setStats({
        courses: (coursesData || []).length,
        users: (usersData || []).length,
        pending: (coursesData || []).filter(c => c.status === "pending").length,
        revenue: totalRevenue,
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateCourseStatus = async (courseId, status) => {
    await supabase.from("courses").update({ status }).eq("id", courseId);
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status } : c));
    setStats(prev => ({ ...prev, pending: prev.pending - (status !== "pending" ? 1 : 0) }));
  };

  const deleteUser = async (userId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await supabase.from("profiles").delete().eq("id", userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const filteredCourses = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const statusMap = {
    published: { label: "منشور", color: "#10B981", bg: "#DCFCE7" },
    pending:   { label: "قيد المراجعة", color: "#6366F1", bg: "#EEF2FF" },
    draft:     { label: "مسودة", color: "#F59E0B", bg: "#FEF9C3" },
    rejected:  { label: "مرفوض", color: "#EF4444", bg: "#FEF2F2" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 998 }} />}

      {/* Sidebar */}
      <aside style={{ width: 240, background: "#0F172A", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", zIndex: 999, flexShrink: 0 }}
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookMarked size={15} color="#fff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Loop</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#60A5FA" }}>EDX</span>
              <span style={{ display: "block", fontSize: 10, color: "#475569" }}>لوحة الأدمن</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="admin-close-btn"
            style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 7, display: "none", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
            <X size={14} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, marginBottom: 2, border: "none", cursor: "pointer", background: tab === item.id ? "rgba(37,99,235,0.25)" : "transparent", color: tab === item.id ? "#fff" : "#94A3B8", fontFamily: "'Cairo', sans-serif", fontWeight: tab === item.id ? 700 : 500, fontSize: 14, textAlign: "right" }}>
              <span style={{ color: tab === item.id ? "#60A5FA" : "inherit" }}>{item.icon}</span>
              {item.label}
              {item.id === "courses" && stats.pending > 0 && (
                <span style={{ marginRight: "auto", background: "#EF4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{stats.pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={async () => { await signOut(); navigate("/"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 14 }}>
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 60, background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(true)} className="admin-hamburger"
            style={{ width: 34, height: 34, borderRadius: 8, background: "#F1F5F9", border: "none", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", color: "#374151" }}>
            <Menu size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#374151", flex: 1 }}>
            {navItems.find(n => n.id === tab)?.label || "لوحة الأدمن"}
          </span>
          {stats.pending > 0 && (
            <span style={{ background: "#FEF2F2", color: "#EF4444", fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>
              {stats.pending} دورة تنتظر الموافقة
            </span>
          )}
        </header>

        <main style={{ flex: 1, padding: "24px 20px", overflow: "auto" }}>

          {/* Dashboard Tab */}
          {tab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "إجمالي الدورات", value: stats.courses, icon: <BookOpen size={20} />, color: "#2563EB" },
                  { label: "المستخدمون", value: stats.users, icon: <Users size={20} />, color: "#10B981" },
                  { label: "قيد المراجعة", value: stats.pending, icon: <Clock size={20} />, color: "#F59E0B" },
                  { label: "الإيرادات", value: `${stats.revenue.toLocaleString()} ر`, icon: <DollarSign size={20} />, color: "#8B5CF6" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", marginTop: 3 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              {stats.pending > 0 && (
                <div style={{ background: "#FEF9C3", borderRadius: 12, padding: "14px 18px", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#92400E", fontWeight: 600 }}>
                    ⚠️ يوجد {stats.pending} دورة تنتظر موافقتك
                  </span>
                  <button onClick={() => setTab("courses")}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#D97706", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    مراجعة الدورات
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {tab === "courses" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: 0 }}>إدارة الدورات</h2>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ padding: "8px 34px 8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl", width: 200 }} />
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                        {["الدورة", "المعلم", "السعر", "الحالة", "إجراءات"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} style={{ padding: "14px 16px" }}><div style={{ height: 14, background: "#F1F5F9", borderRadius: 6 }} /></td>)}</tr>)
                      ) : filteredCourses.map((c, i) => {
                        const st = statusMap[c.status] || statusMap.draft;
                        return (
                          <tr key={c.id} style={{ borderBottom: i < filteredCourses.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{c.category}</div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{c.profiles?.name || "—"}</td>
                            <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: c.price === 0 ? "#10B981" : "#1E40AF" }}>{c.price === 0 ? "مجاني" : `${c.price} ر`}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {c.status === "pending" && (
                                  <>
                                    <button onClick={() => updateCourseStatus(c.id, "published")}
                                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: "none", background: "#DCFCE7", color: "#10B981", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12 }}>
                                      <CheckCircle size={12} /> قبول
                                    </button>
                                    <button onClick={() => updateCourseStatus(c.id, "rejected")}
                                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12 }}>
                                      <XCircle size={12} /> رفض
                                    </button>
                                  </>
                                )}
                                <button onClick={() => window.open(`/courses/${c.slug}`, "_blank")}
                                  style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                                  <Eye size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 20, color: "#0F172A", margin: 0 }}>إدارة المستخدمين</h2>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ padding: "8px 34px 8px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, outline: "none", direction: "rtl", width: 200 }} />
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                        {["المستخدم", "الدور", "تاريخ التسجيل", "إجراءات"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#64748B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                {u.name?.[0] || "؟"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: "#94A3B8" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: u.role === "instructor" ? "#EEF2FF" : "#F0FFF4", color: u.role === "instructor" ? "#6366F1" : "#10B981" }}>
                              {u.role === "instructor" ? "معلم" : "طالب"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748B" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("ar-SA") : "—"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <button onClick={() => deleteUser(u.id)}
                              style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12 }}>
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(tab === "earnings" || tab === "settings") && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 20, color: "#94A3B8" }}>قريباً</h2>
            </div>
          )}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        .admin-sidebar { position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed !important; right: 0; top: 0; height: 100vh !important; transform: translateX(110%); transition: transform 0.3s ease; z-index: 999; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-hamburger { display: flex !important; }
          .admin-close-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
