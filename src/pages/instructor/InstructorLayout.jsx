import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  LayoutDashboard, BookOpen, Users, DollarSign, Calendar,
  Settings, LogOut, Menu, X, Bell, ChevronDown, Plus, BookMarked
} from "lucide-react";

const navItems = [
  { label: "الرئيسية",    icon: <LayoutDashboard size={18} />, path: "/instructor/dashboard",  id: "dashboard" },
  { label: "دوراتي",      icon: <BookOpen size={18} />,        path: "/instructor/courses",    id: "courses" },
  { label: "إنشاء دورة", icon: <Plus size={18} />,            path: "/instructor/courses/new",id: "new-course", sub: true },
  { label: "طلابي",       icon: <Users size={18} />,           path: "/instructor/students",   id: "students" },
  { label: "الإيرادات",  icon: <DollarSign size={18} />,      path: "/instructor/earnings",   id: "earnings" },
  { label: "جدول الحصص", icon: <Calendar size={18} />,        path: "/instructor/schedule",   id: "schedule" },
  { label: "الإعدادات",  icon: <Settings size={18} />,        path: "/instructor/settings",   id: "settings" },
];

export default function InstructorLayout({ children, active }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="sidebar-overlay" />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`instructor-sidebar ${sidebarOpen ? "open" : ""}`}>

        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <BookMarked size={16} color="#fff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>Loop</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#60A5FA" }}>EDX</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="sidebar-close">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
              {profile?.name?.[0] || "م"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.name}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>معلم • LoopEDX</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <Link key={item.id} to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, marginBottom: 2,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "#94A3B8",
                  background: isActive ? "rgba(37,99,235,0.25)" : "transparent",
                  border: isActive ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  marginRight: item.sub ? 12 : 0,
                }}>
                <span style={{ flexShrink: 0, color: isActive ? "#60A5FA" : "inherit" }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}>{item.label}</span>
                {isActive && <span style={{ marginRight: "auto", width: 6, height: 6, borderRadius: "50%", background: "#60A5FA" }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <button onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", width: "100%", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}>
            <LogOut size={18} />
            <span style={{ fontSize: 14 }}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <header style={{ height: 64, background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.06)", flexShrink: 0 }}>

          <button onClick={() => setSidebarOpen(true)} className="hamburger-btn">
            <Menu size={18} />
          </button>

          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#374151" }}>
              {navItems.find(n => n.id === active)?.label || "لوحة المعلم"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ width: 36, height: 36, borderRadius: 8, background: "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", position: "relative" }}>
              <Bell size={16} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>

            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "5px 10px 5px 8px", cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                  {profile?.name?.[0] || "م"}
                </div>
                <span className="hide-on-mobile" style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: "#374151" }}>{profile?.name?.split(" ")[0]}</span>
                <ChevronDown size={13} color="#94A3B8" />
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.1)", minWidth: 160, overflow: "hidden", zIndex: 200 }}>
                  <button onClick={() => { setUserMenuOpen(false); navigate("/instructor/settings"); }}
                    style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#374151", textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Settings size={14} /> الإعدادات
                  </button>
                  <button onClick={handleSignOut}
                    style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#EF4444", textAlign: "right", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #F1F5F9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <LogOut size={14} /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="instructor-main-content">
          {children}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .instructor-sidebar {
          width: 260px;
          background: #0F172A;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 999;
        }

        .sidebar-close { display: none; }
        .sidebar-overlay { display: none; }
        .hamburger-btn { display: none; }

        .instructor-main-content {
          flex: 1;
          padding: 28px;
          overflow: auto;
        }

        @media (max-width: 768px) {
          .instructor-sidebar {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            height: 100vh !important;
            transform: translateX(110%) !important;
            transition: transform 0.3s ease !important;
            box-shadow: none !important;
          }

          .instructor-sidebar.open {
            transform: translateX(0) !important;
            box-shadow: -8px 0 32px rgba(0,0,0,0.3) !important;
          }

          .sidebar-close {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: rgba(255,255,255,0.08);
            border: none;
            cursor: pointer;
            color: #94A3B8;
          }

          .sidebar-overlay {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 998;
          }

          .hamburger-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #F1F5F9;
            border: none;
            cursor: pointer;
            color: #374151;
            flex-shrink: 0;
          }

          .hide-on-mobile { display: none !important; }

          .instructor-main-content {
            padding: 16px 12px !important;
          }
        }

        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}