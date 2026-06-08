import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  LayoutDashboard, BookOpen, Users, DollarSign, Settings,
  FileText, HelpCircle, Globe, Image, Tag, Bell,
  LogOut, Menu, X, BookMarked, ChevronDown, Search,
  Home, Mail, BarChart2
} from "lucide-react";

const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { label: "لوحة التحكم", icon: <LayoutDashboard size={16} />, id: "dashboard", path: "/admin" },
    ]
  },
  {
    label: "المحتوى",
    items: [
      { label: "الصفحة الرئيسية", icon: <Home size={16} />, id: "homepage", path: "/admin/homepage" },
      { label: "الهيدر والفوتر", icon: <Globe size={16} />, id: "header-footer", path: "/admin/header-footer" },
      { label: "المقالات", icon: <FileText size={16} />, id: "articles", path: "/admin/articles" },
      { label: "الأسئلة الشائعة", icon: <HelpCircle size={16} />, id: "faqs", path: "/admin/faqs" },
    ]
  },
  {
    label: "الدورات",
    items: [
      { label: "إدارة الدورات", icon: <BookOpen size={16} />, id: "courses", path: "/admin/courses" },
      { label: "أكواد الخصم", icon: <Tag size={16} />, id: "coupons", path: "/admin/coupons" },
    ]
  },
  {
    label: "المستخدمون",
    items: [
      { label: "المستخدمون", icon: <Users size={16} />, id: "users", path: "/admin/users" },
    ]
  },
  {
    label: "المالية",
    items: [
      { label: "المعاملات", icon: <DollarSign size={16} />, id: "transactions", path: "/admin/transactions" },
    ]
  },
  {
    label: "الإعدادات",
    items: [
      { label: "إعدادات المنصة", icon: <Settings size={16} />, id: "settings", path: "/admin/settings" },
      { label: "SEO", icon: <BarChart2 size={16} />, id: "seo", path: "/admin/seo" },
      { label: "الإيميلات", icon: <Mail size={16} />, id: "emails", path: "/admin/emails" },
    ]
  },
];

export default function AdminLayout({ children, active }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 998 }} />}

      <aside className={`admin-layout-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookMarked size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Loop<span style={{ color: "#60A5FA" }}>EDX</span></div>
              <div style={{ fontSize: 10, color: "#475569" }}>لوحة الأدمن</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="admin-layout-close"
            style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 7, display: "none", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {navGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 10, fontWeight: 700, color: "#334155", padding: "10px 10px 4px", textTransform: "uppercase", letterSpacing: 1 }}>
                {group.label}
              </div>
              {group.items.map(item => (
                <Link key={item.id} to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 9, marginBottom: 1,
                    textDecoration: "none",
                    color: active === item.id ? "#fff" : "#94A3B8",
                    background: active === item.id ? "rgba(37,99,235,0.25)" : "transparent",
                    fontFamily: "'Cairo', sans-serif", fontWeight: active === item.id ? 700 : 500, fontSize: 13,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ color: active === item.id ? "#60A5FA" : "inherit", flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <button onClick={async () => { await signOut(); navigate("/"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 13 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}>
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} className="admin-layout-hamburger"
            style={{ width: 34, height: 34, borderRadius: 8, background: "#F1F5F9", border: "none", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", color: "#374151", flexShrink: 0 }}>
            <Menu size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#374151", flex: 1 }}>
            {navGroups.flatMap(g => g.items).find(n => n.id === active)?.label || "لوحة الأدمن"}
          </span>
          <Link to="/" target="_blank" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Cairo', sans-serif" }}>
            <Globe size={13} /> عرض الموقع
          </Link>
        </header>
        <main style={{ flex: 1, padding: "24px 20px", overflow: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        .admin-layout-sidebar {
          width: 220px; background: #0F172A; display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; z-index: 999; flex-shrink: 0; overflow: hidden;
        }
        @media (max-width: 768px) {
          .admin-layout-sidebar { position: fixed !important; right: 0; top: 0; height: 100vh !important; transform: translateX(110%); transition: transform 0.3s ease; }
          .admin-layout-sidebar.open { transform: translateX(0) !important; }
          .admin-layout-hamburger { display: flex !important; }
          .admin-layout-close { display: flex !important; }
        }
        * { box-sizing: border-box; }
        aside::-webkit-scrollbar { width: 3px; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
    </div>
  );
}
