import { useState } from "react";
import InstructorLayout from "./InstructorLayout";
import { DollarSign, TrendingUp, ArrowUp, ArrowDown, Calendar, Download, CreditCard, Clock } from "lucide-react";

// Simple bar chart component
function BarChart({ data, maxVal }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 10, fontFamily: "'Cairo', sans-serif", color: "#94A3B8", textAlign: "center" }}>
              {item.value > 0 ? item.value.toLocaleString() : ""}
            </div>
            <div style={{ width: "100%", position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(pct * 1.1, pct > 0 ? 8 : 0)}px`,
                  background: item.current ? "linear-gradient(180deg, #2563EB, #1E40AF)" : "#E2E8F0",
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.5s ease",
                  minHeight: pct > 0 ? 8 : 0,
                }}
              />
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", color: item.current ? "#1E40AF" : "#94A3B8", fontWeight: item.current ? 700 : 400, textAlign: "center" }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InstructorEarnings() {
  const [period, setPeriod] = useState("month");

  const monthlyData = [
    { label: "يوليو", value: 3200, current: false },
    { label: "أغسطس", value: 4800, current: false },
    { label: "سبتمبر", value: 3900, current: false },
    { label: "أكتوبر", value: 6200, current: false },
    { label: "نوفمبر", value: 7100, current: false },
    { label: "ديسمبر", value: 5800, current: true },
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.value));

  const transactions = [
    { id: "TXN-001", student: "ريان المطيري", course: "اختبار القدرات الشامل", amount: 149, date: "2025-12-20", status: "مكتمل" },
    { id: "TXN-002", student: "دانا الشمري", course: "رياضيات ثانوي", amount: 99, date: "2025-12-19", status: "مكتمل" },
    { id: "TXN-003", student: "عمر الغامدي", course: "اختبار القدرات الشامل", amount: 149, date: "2025-12-18", status: "مكتمل" },
    { id: "TXN-004", student: "نورة السالم", course: "IELTS من الصفر", amount: 199, date: "2025-12-17", status: "مكتمل" },
    { id: "TXN-005", student: "فيصل الحربي", course: "اختبار القدرات الشامل", amount: 149, date: "2025-12-16", status: "معلق" },
  ];

  const totalEarnings = 21300;
  const platformFee = totalEarnings * 0.20;
  const netEarnings = totalEarnings - platformFee;

  return (
    <InstructorLayout active="earnings">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>الإيرادات</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>تقرير مالي مفصل لجميع دوراتك</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10,
          border: "1px solid #E2E8F0", background: "#fff",
          color: "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14,
          cursor: "pointer", transition: "all 0.2s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#1E40AF"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; }}
        >
          <Download size={15} /> تصدير التقرير
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 24 }}>
        {[
          { label: "إجمالي الإيرادات", value: `${totalEarnings.toLocaleString()} ر`, icon: <DollarSign size={20} />, color: "#10B981", change: "+12%", up: true },
          { label: "صافي الأرباح (80%)", value: `${netEarnings.toLocaleString()} ر`, icon: <TrendingUp size={20} />, color: "#2563EB", change: "+12%", up: true },
          { label: "هذا الشهر", value: "5,800 ر", icon: <Calendar size={20} />, color: "#F59E0B", change: "-18%", up: false },
          { label: "في انتظار التحويل", value: "3,200 ر", icon: <Clock size={20} />, color: "#8B5CF6" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
              {s.change && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontFamily: "'Cairo', sans-serif", fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: s.up ? "#DCFCE7" : "#FEF2F2", color: s.up ? "#10B981" : "#EF4444" }}>
                  {s.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {s.change}
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A" }}>{s.value}</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Chart */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: 0 }}>الإيرادات الشهرية</h2>
            <div style={{ display: "flex", gap: 4 }}>
              {[["month", "شهري"], ["quarter", "ربعي"]].map(([v, l]) => (
                <button key={v} onClick={() => setPeriod(v)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: period === v ? "#EFF6FF" : "transparent", color: period === v ? "#1E40AF" : "#94A3B8", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={monthlyData} maxVal={maxVal} />
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>مجموع الفترة</span>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
              {monthlyData.reduce((t, d) => t + d.value, 0).toLocaleString()} ريال
            </span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
          <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: "0 0 20px" }}>توزيع الإيرادات</h2>
          {[
            { label: "إجمالي المبيعات", value: totalEarnings, color: "#0F172A", bold: false },
            { label: "عمولة المنصة (20%)", value: `-${platformFee.toLocaleString()}`, color: "#EF4444", bold: false },
            { label: "صافي أرباحك", value: netEarnings.toLocaleString(), color: "#10B981", bold: true },
          ].map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0",
              borderBottom: i < 2 ? "1px solid #F1F5F9" : "none",
              borderTop: i === 2 ? "2px solid #E2E8F0" : "none",
            }}>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#374151" }}>{r.label}</span>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: r.bold ? 900 : 700, fontSize: r.bold ? 20 : 15, color: r.color }}>
                {typeof r.value === "number" ? r.value.toLocaleString() : r.value} ريال
              </span>
            </div>
          ))}

          <div style={{ marginTop: 24, background: "#F8FAFC", borderRadius: 12, padding: 18, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <CreditCard size={18} color="#2563EB" />
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>التحويل القادم</span>
            </div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#10B981", marginBottom: 4 }}>3,200 ريال</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>متوقع بتاريخ 1 يناير 2026</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: 0 }}>آخر المعاملات</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["رقم العملية", "الطالب", "الدورة", "المبلغ", "التاريخ", "الحالة"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id} style={{ borderTop: "1px solid #F8FAFC" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "#94A3B8", fontFamily: "monospace" }}>{t.id}</td>
                  <td style={{ padding: "13px 18px", fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{t.student}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "#374151" }}>{t.course}</td>
                  <td style={{ padding: "13px 18px", fontSize: 15, fontWeight: 800, color: "#10B981" }}>{t.amount} ر</td>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: "#64748B" }}>{new Date(t.date).toLocaleDateString("ar-SA")}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: t.status === "مكتمل" ? "#DCFCE7" : "#FEF9C3",
                      color: t.status === "مكتمل" ? "#10B981" : "#D97706",
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; }`}</style>
    </InstructorLayout>
  );
}
