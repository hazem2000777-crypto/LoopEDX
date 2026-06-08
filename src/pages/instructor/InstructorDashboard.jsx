import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  BookOpen, Users, DollarSign, TrendingUp, Star, Plus,
  Eye, Clock, ChevronRight, ArrowUp, ArrowDown,
  BarChart2, Calendar, Bell, Award, Play
} from "lucide-react";
import InstructorLayout from "./InstructorLayout";

function StatCard({ icon, title, value, change, changeType, color, suffix = "" }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
        {change && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: changeType === "up" ? "#DCFCE7" : "#FEF2F2", color: changeType === "up" ? "#10B981" : "#EF4444", fontSize: 12, fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>
            {changeType === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 30, color: "#0F172A", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 16, fontWeight: 600, color: "#64748B" }}>{suffix}</span>
      </div>
      <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", marginTop: 4 }}>{title}</div>
    </div>
  );
}

export default function InstructorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const recentCourses = [
    { id: 1, title: "اختبار القدرات الشامل", students: 248, rating: 4.9, revenue: 12450, status: "منشور", lessons: 24 },
    { id: 2, title: "رياضيات ثانوي — الفصل الأول", students: 135, rating: 4.7, revenue: 6750, status: "منشور", lessons: 18 },
    { id: 3, title: "IELTS من الصفر", students: 42, rating: 4.8, revenue: 2100, status: "مسودة", lessons: 8 },
  ];

  const recentEnrollments = [
    { name: "ريان المطيري", course: "اختبار القدرات الشامل", date: "منذ ساعتين", avatar: "ر" },
    { name: "دانا الشمري", course: "رياضيات ثانوي", date: "منذ 4 ساعات", avatar: "د" },
    { name: "خالد العمري", course: "اختبار القدرات الشامل", date: "منذ 6 ساعات", avatar: "خ" },
    { name: "نورة السالم", course: "IELTS من الصفر", date: "أمس", avatar: "ن" },
  ];

  return (
    <InstructorLayout active="dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 26, color: "#0F172A", margin: 0 }}>
          أهلاً، {profile?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 15, color: "#64748B", margin: "6px 0 0" }}>
          إليك ملخص أداء دوراتك اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard icon={<DollarSign size={22} />} title="إجمالي الإيرادات" value="21,300" suffix=" ريال" change="+12%" changeType="up" color="#10B981" />
        <StatCard icon={<Users size={22} />} title="إجمالي الطلاب" value="425" change="+8 هذا الأسبوع" changeType="up" color="#2563EB" />
        <StatCard icon={<BookOpen size={22} />} title="الدورات المنشورة" value="3" color="#8B5CF6" />
        <StatCard icon={<Star size={22} />} title="متوسط التقييم" value="4.8" suffix="/5" change="+0.1" changeType="up" color="#F59E0B" />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* Courses Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: 0 }}>دوراتي</h2>
            <Link to="/instructor/courses" style={{ textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#2563EB", display: "flex", alignItems: "center", gap: 4 }}>
              عرض الكل <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>
          <div>
            {recentCourses.map((course, i) => (
              <div key={course.id} style={{
                padding: "16px 24px",
                borderBottom: i < recentCourses.length - 1 ? "1px solid #F8FAFC" : "none",
                display: "flex", alignItems: "center", gap: 16,
                transition: "background 0.2s ease",
                cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #1E40AF20, #2563EB30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen size={20} color="#2563EB" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {course.title}
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={11} /> {course.students} طالب
                    </span>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" /> {course.rating}
                    </span>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                      <Play size={11} /> {course.lessons} درس
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "left", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#10B981" }}>{course.revenue.toLocaleString()} ر</div>
                  <span style={{
                    fontFamily: "'Cairo', sans-serif", fontSize: 11, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 10,
                    background: course.status === "منشور" ? "#DCFCE7" : "#F1F5F9",
                    color: course.status === "منشور" ? "#10B981" : "#64748B",
                  }}>
                    {course.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: "1px solid #F1F5F9" }}>
            <button
              onClick={() => navigate("/instructor/courses/new")}
              style={{
                width: "100%", padding: "10px", borderRadius: 10,
                background: "#EFF6FF", border: "1.5px dashed #BFDBFE",
                color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#DBEAFE"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#EFF6FF"; }}
            >
              <Plus size={16} /> إضافة دورة جديدة
            </button>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: 0 }}>آخر الاشتراكات</h2>
            <Link to="/instructor/students" style={{ textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, color: "#2563EB", display: "flex", alignItems: "center", gap: 4 }}>
              عرض الكل <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>
          <div>
            {recentEnrollments.map((enroll, i) => (
              <div key={i} style={{
                padding: "14px 24px",
                borderBottom: i < recentEnrollments.length - 1 ? "1px solid #F8FAFC" : "none",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1E40AF, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {enroll.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{enroll.name}</div>
                  <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {enroll.course}
                  </div>
                </div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{enroll.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
        <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, color: "#0F172A", margin: "0 0 20px" }}>إجراءات سريعة</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { icon: <Plus size={20} />, label: "إنشاء دورة", desc: "ابدأ دورة جديدة", color: "#2563EB", path: "/instructor/courses/new" },
            { icon: <Users size={20} />, label: "طلابي", desc: "عرض كل الطلاب", color: "#10B981", path: "/instructor/students" },
            { icon: <BarChart2 size={20} />, label: "الإيرادات", desc: "تقرير مفصل", color: "#F59E0B", path: "/instructor/earnings" },
            { icon: <Calendar size={20} />, label: "جدول الحصص", desc: "المعلم الخصوصي", color: "#8B5CF6", path: "/instructor/schedule" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                background: `${action.color}0C`,
                border: `1px solid ${action.color}30`,
                borderRadius: 12, padding: "18px 16px",
                cursor: "pointer", textAlign: "right",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${action.color}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${action.color}0C`; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, marginBottom: 12 }}>
                {action.icon}
              </div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 2 }}>{action.label}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>{action.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </InstructorLayout>
  );
}
