import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "./AdminLayout";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function AdminTransactions() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, count: 0 });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select(`*, profiles(name, email), courses(title)`).order("created_at", { ascending: false });
    const orders = data || [];
    setOrders(orders);
    setStats({
      total: orders.filter(o => o.status === "paid").reduce((t, o) => t + (o.amount || 0), 0),
      paid: orders.filter(o => o.status === "paid").length,
      pending: orders.filter(o => o.status === "pending").length,
      count: orders.length,
    });
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <AdminLayout active="transactions">
      <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: "0 0 20px" }}>المعاملات المالية</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "إجمالي الإيرادات", value: `${stats.total.toLocaleString()} ر`, icon: <DollarSign size={18} />, color: "#10B981" },
          { label: "مدفوعة", value: stats.paid, icon: <CheckCircle size={18} />, color: "#2563EB" },
          { label: "معلقة", value: stats.pending, icon: <Clock size={18} />, color: "#F59E0B" },
          { label: "إجمالي العمليات", value: stats.count, icon: <TrendingUp size={18} />, color: "#8B5CF6" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 18, color: "#0F172A" }}>{loading ? "..." : s.value}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#64748B" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "الكل"], ["paid", "مدفوعة"], ["pending", "معلقة"], ["failed", "فاشلة"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid", borderColor: filter === v ? "#2563EB" : "#E2E8F0", background: filter === v ? "#EFF6FF" : "#fff", color: filter === v ? "#1E40AF" : "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["رقم الطلب", "الطالب", "الدورة", "المبلغ", "طريقة الدفع", "التاريخ", "الحالة"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "right", fontWeight: 700, fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} style={{ padding: 14 }}><div style={{ height: 12, background: "#F1F5F9", borderRadius: 6 }} /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", fontFamily: "'Cairo', sans-serif", color: "#94A3B8" }}>لا توجد معاملات</td></tr>
              ) : filtered.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <code style={{ fontSize: 11, color: "#94A3B8" }}>{String(o.id).slice(0, 8)}...</code>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{o.profiles?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{o.profiles?.email}</div>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.courses?.title || "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "#10B981" }}>{o.amount} ر</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748B" }}>{o.payment_method || "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>{new Date(o.created_at).toLocaleDateString("ar-SA")}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", outline: "none", background: o.status === "paid" ? "#DCFCE7" : o.status === "pending" ? "#FEF9C3" : "#FEF2F2", color: o.status === "paid" ? "#10B981" : o.status === "pending" ? "#D97706" : "#EF4444" }}>
                      <option value="paid">مدفوع</option>
                      <option value="pending">معلق</option>
                      <option value="failed">فاشل</option>
                      <option value="refunded">مسترجع</option>
                    </select>
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
