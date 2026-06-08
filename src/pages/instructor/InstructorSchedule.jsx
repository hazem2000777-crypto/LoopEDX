import { useState } from "react";
import InstructorLayout from "./InstructorLayout";
import { Calendar, Clock, Plus, Check, X, ChevronRight, ChevronLeft, Users } from "lucide-react";

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm

const STATUS_COLORS = {
  booked: { bg: "#DBEAFE", color: "#1E40AF", label: "محجوز" },
  available: { bg: "#DCFCE7", color: "#10B981", label: "متاح" },
  cancelled: { bg: "#FEF2F2", color: "#EF4444", label: "ملغى" },
};

export default function InstructorSchedule() {
  const [viewMode, setViewMode] = useState("week"); // week | bookings
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [availability, setAvailability] = useState({
    "الأحد-9": "available",
    "الأحد-10": "available",
    "الاثنين-14": "booked",
    "الاثنين-15": "booked",
    "الثلاثاء-10": "available",
    "الثلاثاء-11": "available",
    "الأربعاء-9": "available",
    "الخميس-16": "booked",
  });

  const upcomingBookings = [
    { id: 1, student: "ريان المطيري", subject: "رياضيات — المتتاليات", date: "الاثنين 23 ديسمبر", time: "2:00 م - 3:00 م", status: "booked", avatar: "ر", price: 80 },
    { id: 2, student: "دانا الشمري", subject: "إنجليزي — IELTS Writing", date: "الاثنين 23 ديسمبر", time: "3:00 م - 4:00 م", status: "booked", avatar: "د", price: 80 },
    { id: 3, student: "عمر الغامدي", subject: "رياضيات — المشتقات", date: "الخميس 26 ديسمبر", time: "4:00 م - 5:00 م", status: "booked", avatar: "ع", price: 80 },
  ];

  const toggleSlot = (day, hour) => {
    const key = `${day}-${hour}`;
    const current = availability[key];
    if (!current) {
      setAvailability(prev => ({ ...prev, [key]: "available" }));
    } else if (current === "available") {
      setAvailability(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
    // "booked" slots can't be toggled
  };

  return (
    <InstructorLayout active="schedule">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>جدول الحصص الخصوصية</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>حدد أوقات توفرك واستقبل الحجوزات</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["week", "جدول الأسبوع"], ["bookings", "الحجوزات"]].map(([v, l]) => (
            <button key={v} onClick={() => setViewMode(v)} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: viewMode === v ? "linear-gradient(135deg, #1E40AF, #2563EB)" : "#F1F5F9", color: viewMode === v ? "#fff" : "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "حجوزات هذا الأسبوع", value: "3", icon: <Calendar size={18} />, color: "#2563EB" },
          { label: "ساعات متاحة", value: "8", icon: <Clock size={18} />, color: "#10B981" },
          { label: "إجمالي الطلاب", value: "12", icon: <Users size={18} />, color: "#8B5CF6" },
          { label: "إيرادات الأسبوع", value: "240 ر", icon: <Check size={18} />, color: "#F59E0B" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 20, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {viewMode === "week" ? (
        /* ─── WEEKLY GRID ─── */
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          {/* Week Navigation */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setCurrentWeekOffset(p => p - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                <ChevronRight size={16} />
              </button>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>أسبوع ديسمبر 22 – 28</span>
              <button onClick={() => setCurrentWeekOffset(p => p + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                <ChevronLeft size={16} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: val.bg, border: `1px solid ${val.color}40` }} />
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{val.label}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
                <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>غير متاح</span>
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Cairo', sans-serif", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 60, padding: "10px 12px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>الوقت</th>
                  {DAYS.map(d => (
                    <th key={d} style={{ padding: "10px 8px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: 13, color: "#374151", fontWeight: 700, textAlign: "center" }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "6px 12px", textAlign: "center", fontSize: 12, color: "#94A3B8", borderLeft: "1px solid #F1F5F9", background: "#FAFAFA", whiteSpace: "nowrap" }}>
                      {hour > 12 ? `${hour - 12}:00 م` : `${hour}:00 ص`}
                    </td>
                    {DAYS.map(day => {
                      const key = `${day}-${hour}`;
                      const status = availability[key];
                      const sc = STATUS_COLORS[status];
                      return (
                        <td
                          key={day}
                          onClick={() => status !== "booked" && toggleSlot(day, hour)}
                          style={{
                            padding: "4px 6px",
                            textAlign: "center",
                            cursor: status === "booked" ? "default" : "pointer",
                          }}
                        >
                          {status ? (
                            <div style={{
                              background: sc.bg,
                              borderRadius: 6,
                              padding: "5px 4px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: sc.color,
                              border: `1px solid ${sc.color}30`,
                              transition: "all 0.15s ease",
                            }}>
                              {status === "booked" ? "محجوز" : "✓"}
                            </div>
                          ) : (
                            <div style={{
                              borderRadius: 6,
                              padding: "5px 4px",
                              fontSize: 11,
                              color: "#E2E8F0",
                              transition: "all 0.15s ease",
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#F0FFF4"; e.currentTarget.style.color = "#10B981"; e.currentTarget.style.border = "1px dashed #10B981"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E2E8F0"; e.currentTarget.style.border = "none"; }}
                            >
                              +
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "14px 24px", background: "#FFFBEB", borderTop: "1px solid #FEF3C7", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={14} color="#D97706" />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#92400E" }}>
              انقر على أي خانة فارغة لتفعيلها كوقت متاح — انقر مجدداً لإلغاء التفعيل
            </span>
          </div>
        </div>
      ) : (
        /* ─── BOOKINGS LIST ─── */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "18px 24px" }}>
            <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: "0 0 16px" }}>حجوزات هذا الأسبوع</h3>
            {upcomingBookings.map(booking => (
              <div key={booking.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 18px", background: "#F8FAFC",
                borderRadius: 12, marginBottom: 10, border: "1px solid #E2E8F0",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #1E40AF, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {booking.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 3 }}>{booking.student}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{booking.subject}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: "#374151" }}>{booking.date}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8" }}>{booking.time}</div>
                </div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#10B981", minWidth: 60, textAlign: "center" }}>
                  {booking.price} ر
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "#DCFCE7", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={15} />
                  </button>
                  <button style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`* { box-sizing: border-box; }`}</style>
    </InstructorLayout>
  );
}
