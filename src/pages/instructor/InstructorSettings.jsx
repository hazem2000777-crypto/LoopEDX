import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import InstructorLayout from "./InstructorLayout";
import { User, Mail, Phone, Lock, Camera, CheckCircle, AlertCircle, Save } from "lucide-react";

export default function InstructorSettings() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "", phone: "", avatar_url: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    if (profile) setForm({ name: profile.name || "", bio: profile.bio || "", phone: profile.phone || "", avatar_url: profile.avatar_url || "" });
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name: form.name, bio: form.bio, phone: form.phone, avatar_url: form.avatar_url }).eq("id", user.id);
    setMsg(error ? { type: "error", text: "حدث خطأ أثناء الحفظ" } : { type: "success", text: "تم حفظ البيانات بنجاح" });
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { setMsg({ type: "error", text: "كلمتا المرور غير متطابقتين" }); return; }
    if (passwords.newPass.length < 6) { setMsg({ type: "error", text: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
    setMsg(error ? { type: "error", text: error.message } : { type: "success", text: "تم تغيير كلمة المرور" });
    setPasswords({ current: "", newPass: "", confirm: "" });
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", boxSizing: "border-box" };

  return (
    <InstructorLayout active="settings">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>الإعدادات</h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>إدارة بيانات حسابك</p>
        </div>

        {msg && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, marginBottom: 20, background: msg.type === "success" ? "#DCFCE7" : "#FEF2F2", border: `1px solid ${msg.type === "success" ? "#BBF7D0" : "#FECACA"}` }}>
            {msg.type === "success" ? <CheckCircle size={16} color="#10B981" /> : <AlertCircle size={16} color="#EF4444" />}
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: msg.type === "success" ? "#065F46" : "#991B1B" }}>{msg.text}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 24 }}>
          {[["profile", "الملف الشخصي"], ["password", "كلمة المرور"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "10px 20px", border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, color: tab === id ? "#1E40AF" : "#64748B", borderBottom: tab === id ? "2px solid #2563EB" : "2px solid transparent", marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,#1E40AF,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 28, overflow: "hidden" }}>
                  {form.avatar_url ? <img src={form.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : form.name?.[0] || "م"}
                </div>
                <button style={{ position: "absolute", bottom: -4, left: -4, width: 26, height: 26, borderRadius: "50%", background: "#2563EB", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={12} color="#fff" />
                </button>
              </div>
              <div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A" }}>{form.name}</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>الاسم الكامل</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="اسمك الكامل" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>رقم الجوال</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966 5x xxx xxxx" dir="ltr" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>نبذة شخصية</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="اكتب نبذة عنك وعن خبراتك..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>رابط الصورة الشخصية</label>
                <input style={inputStyle} value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://..." dir="ltr" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                <Save size={16} /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "كلمة المرور الجديدة", key: "newPass", placeholder: "••••••••" },
                { label: "تأكيد كلمة المرور", key: "confirm", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>{f.label}</label>
                  <input type="password" style={inputStyle} value={passwords[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} dir="ltr" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                </div>
              ))}
              <button onClick={changePassword} disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                <Lock size={16} /> {saving ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; }`}</style>
    </InstructorLayout>
  );
}
