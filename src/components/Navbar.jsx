import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { Menu, X, BookMarked, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState({
    logo_text: "LoopEDX",
    logo_url: "",
    nav_links: [
      { label: "الدورات", url: "/courses" },
      { label: "المعلمون", url: "/instructors" },
      { label: "المدونة", url: "/blog" },
      { label: "عن المنصة", url: "/about" },
    ],
    cta_text: "ابدأ الآن",
    cta_url: "/register",
  });

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    fetchSettings();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: headerData } = await supabase
        .from("header_settings")
        .select("*")
        .limit(1)
        .single();

      const { data: siteLogoData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "site_logo")
        .single();

      if (headerData) {
        setSettings({
          ...headerData,
          logo_url: headerData.logo_url || siteLogoData?.value || "",
          nav_links:
            typeof headerData.nav_links === "string"
              ? JSON.parse(headerData.nav_links)
              : headerData.nav_links || [
                  { label: "الدورات", url: "/courses" },
                  { label: "المعلمون", url: "/instructors" },
                  { label: "المدونة", url: "/blog" },
                  { label: "عن المنصة", url: "/about" },
                ],
        });
      } else if (siteLogoData?.value) {
        setSettings(prev => ({ ...prev, logo_url: siteLogoData.value }));
      }
      setSettingsLoaded(true);
    } catch {
      setSettingsLoaded(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setUserMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (profile?.role === "instructor") return "/instructor/dashboard";
    return "/student/dashboard";
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: scrolled ? "0 2px 20px rgba(15,23,42,0.08)" : "none",
        transition: "all 0.3s ease",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 68, display: "flex", alignItems: "center", gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, visibility: settingsLoaded ? "visible" : "hidden" }}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.logo_text || "LoopEDX"} style={{ height: 90, objectFit: "contain" }} />
            ) : (
              <>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookMarked size={17} color="#fff" />
                </div>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#0F172A" }}>
                  {settings.logo_text?.slice(0, -3) || "Loop"}
                  <span style={{ color: "#2563EB" }}>{settings.logo_text?.slice(-3) || "EDX"}</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
            {(settings.nav_links || []).map((link, i) => (
              <Link key={i} to={link.url} style={{ padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, color: "#374151", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#1E40AF"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "6px 12px 6px 8px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#2563EB"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                    {profile?.name?.[0] || "؟"}
                  </div>
                  <span className="hide-mobile" style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: "#374151" }}>{profile?.name?.split(" ")[0]}</span>
                  <ChevronDown size={13} color="#94A3B8" />
                </button>
                {userMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.1)", minWidth: 180, overflow: "hidden", zIndex: 100 }}>
                    <Link to={getDashboardPath()} onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", padding: "11px 16px", textDecoration: "none", color: "#374151", fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      لوحة التحكم
                    </Link>
                    {profile?.role === "instructor" && (
                      <Link to="/instructor/settings" onClick={() => setUserMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", padding: "11px 16px", textDecoration: "none", color: "#374151", fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        الإعدادات
                      </Link>
                    )}
                    <div style={{ height: 1, background: "#F1F5F9" }} />
                    <button onClick={handleSignOut}
                      style={{ width: "100%", display: "flex", alignItems: "center", padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer", color: "#EF4444", fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 600, textAlign: "right" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hide-mobile"
                  style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#1E40AF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; }}>
                  تسجيل الدخول
                </Link>
                <Link to={settings.cta_url || "/register"}
                  style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"}>
                  {settings.cta_text || "ابدأ الآن"}
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", color: "#374151" }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ background: "#fff", borderTop: "1px solid #F1F5F9", padding: "12px 20px 20px" }}>
            {(settings.nav_links || []).map((link, i) => (
              <Link key={i} to={link.url} onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "12px 0", borderBottom: "1px solid #F8FAFC", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 15, color: "#374151" }}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1px solid #E2E8F0", textAlign: "center", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: "#374151" }}>
                  تسجيل الدخول
                </Link>
                <Link to={settings.cta_url || "/register"} onClick={() => setMobileOpen(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 9, background: "linear-gradient(135deg,#1E40AF,#2563EB)", textAlign: "center", textDecoration: "none", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                  {settings.cta_text || "ابدأ الآن"}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}