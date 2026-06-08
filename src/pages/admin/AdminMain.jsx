import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { BookOpen, Users, DollarSign, Clock, CheckCircle, XCircle, Eye, TrendingUp, ArrowUp } from "lucide-react";

export default function AdminMain() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, users: 0, pending: 0, revenue: 0, published: 0 });
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: courses }, { data: users }, { data: orders }] = await Promise.all([
        supabase.from("courses").select("id, title, status, slug, profiles(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id"),
        supabase.from("orders").select("amount").eq("status", "paid"),
      ]);
      const revenue = (orders || []).reduce((t, o) => t + (o.amount || 0), 0);
      const pending = (courses || []).filter(c => c.status === "pending");
      setStats({ courses: (courses || []).length, users: (users || []).length, pending: pending.length, revenue, published: (courses || []).filter(c => c.status === "published").length });
      setPendingCourses(pending.slice(0, 5));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const approve = async (id) => {
    await supabase.from("courses").update({ status: "published" }).eq("id", id);
    setPendingCourses(p => p.filter(c => c.id !== id));
    setStats(s => ({ ...s, pending: s.pending - 1, published: s.published + 1 }));
  };

  const reject = async (id) => {
    await supabase.from("courses").update({ status: "rejected" }).eq("id", id);
    setPendingCourses(p => p.filter(c => c.id !== id));
    setStats(s => ({ ...s, pending: s.pending - 1 }));
  };

  return (
    <AdminLayout active="dashboard">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>لوحة التحكم</h1>
        <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>مرحباً بك في لوحة أدمن LoopEDX</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "إجمالي الدورات", value: stats.courses, icon: <BookOpen size={20} />, color: "#2563EB" },
          { label: "المستخدمون", value: stats.users, icon: <Users size={20} />, color: "#10B981" },
          { label: "قيد المراجعة", value: stats.pending, icon: <Clock size={20} />, color: "#F59E0B" },
          { label: "الإيرادات", value: `${stats.revenue.toLocaleString()} ر`, icon: <DollarSign size={20} />, color: "#8B5CF6" },
          { label: "منشورة", value: stats.published, icon: <TrendingUp size={20} />, color: "#10B981" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", lineHeight: 1 }}>{loading ? "..." : s.value}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {pendingCourses.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: 0 }}>دورات تنتظر الموافقة</h2>
            <span style={{ background: "#FEF3C7", color: "#D97706", fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{stats.pending} دورة</span>
          </div>
          {pendingCourses.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < pendingCourses.length - 1 ? "1px solid #F8FAFC" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{c.title}</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{c.profiles?.name}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => window.open(`/courses/${c.slug}`, "_blank")} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}><Eye size={14} /></button>
                <button onClick={() => approve(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: "#DCFCE7", color: "#10B981", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13 }}><CheckCircle size={13} /> قبول</button>
                <button onClick={() => reject(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13 }}><XCircle size={13} /> رفض</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
