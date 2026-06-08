import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";
import { Save, CheckCircle, Upload, Image } from "lucide-react";

const SETTING_GROUPS = [
  { label: "المنصة", keys: ["site_name", "site_logo", "site_description", "contact_email", "contact_phone"] },
  { label: "السوشيال ميديا", keys: ["facebook_url", "twitter_url", "instagram_url", "youtube_url", "whatsapp_number"] },
  { label: "بوابات الدفع", keys: ["tabby_enabled", "directpay_enabled", "tabby_public_key", "tabby_secret_key", "directpay_merchant_id", "directpay_token"] },
  { label: "المالية", keys: ["platform_fee", "min_withdrawal", "currency"] },
];

const SETTING_META = {
  site_name: { label: "اسم الموقع", type: "text" },
  site_logo: { label: "شعار الموقع", type: "logo_upload" },
  site_description: { label: "وصف الموقع", type: "textarea" },
  contact_email: { label: "البريد الإلكتروني", type: "email" },
  contact_phone: { label: "رقم الهاتف", type: "text" },
  facebook_url: { label: "Facebook", type: "url" },
  twitter_url: { label: "Twitter/X", type: "url" },
  instagram_url: { label: "Instagram", type: "url" },
  youtube_url: { label: "YouTube", type: "url" },
  whatsapp_number: { label: "واتساب", type: "text" },
  tabby_enabled: { label: "تفعيل تابي", type: "toggle" },
  directpay_enabled: { label: "تفعيل DirectPay", type: "toggle" },
  tabby_public_key: { label: "Tabby Public Key", type: "text", secret: true },
  tabby_secret_key: { label: "Tabby Secret Key", type: "password", secret: true },
  directpay_merchant_id: { label: "DirectPay Merchant ID", type: "text", secret: true },
  directpay_token: { label: "DirectPay Token", type: "password", secret: true },
  platform_fee: { label: "عمولة المنصة (%)", type: "number" },
  min_withdrawal: { label: "الحد الأدنى للسحب (ريال)", type: "number" },
  currency: { label: "العملة", type: "text" },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("key, value");
    const map = {};
    (data || []).forEach(s => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    // بيعمل upsert لكل key على حدة بشكل آمن
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("الملف لازم يكون صورة (PNG, JPG, SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("حجم الصورة لا يتجاوز 2MB");
      return;
    }
    setLogoError("");
    setLogoUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `site-logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("course-thumbnails")
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setLogoError("فشل الرفع: " + uploadError.message);
      setLogoUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // ✅ بيحدث site_logo بس في settings من غير ما يمس أي حاجة تانية
    await supabase
      .from("settings")
      .update({ value: publicUrl, updated_at: new Date().toISOString() })
      .eq("key", "site_logo");

    // ✅ بيحدث logo_url في header_settings في الـ row الأولى بس
    await supabase
      .from("header_settings")
      .update({ logo_url: publicUrl })
      .eq("id", (await supabase.from("header_settings").select("id").limit(1).single()).data?.id);

    // ✅ بيحدث الـ state بس من غير ما يعمل refetch كامل
    setSettings(p => ({ ...p, site_logo: publicUrl }));
    setLogoUploading(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
    borderRadius: 9, fontFamily: "'Cairo', sans-serif", fontSize: 13,
    color: "#0F172A", outline: "none", direction: "rtl",
    background: "#fff", boxSizing: "border-box"
  };

  const renderField = (key) => {
    const meta = SETTING_META[key] || { label: key, type: "text" };

    if (meta.type === "logo_upload") {
      return (
        <div key={key}>
          <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 8 }}>
            {meta.label}
          </label>
          <div style={{
            width: "100%", height: 110, borderRadius: 10, border: "2px dashed #CBD5E1",
            background: "#F8FAFC", display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 10, overflow: "hidden", position: "relative"
          }}>
            {settings.site_logo ? (
              <>
                <img
                  src={settings.site_logo}
                  alt="شعار الموقع"
                  style={{ maxHeight: 90, maxWidth: "90%", objectFit: "contain" }}
                />
                <button
                  onClick={() => setSettings(p => ({ ...p, site_logo: "" }))}
                  style={{
                    position: "absolute", top: 6, left: 6, background: "#EF4444",
                    color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22,
                    fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>×</button>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "#94A3B8" }}>
                <Image size={28} style={{ marginBottom: 6 }} />
                <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12 }}>لا يوجد شعار</div>
              </div>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => handleLogoUpload(e.target.files[0])}
          />
          <button
            onClick={() => logoInputRef.current.click()}
            disabled={logoUploading}
            style={{
              width: "100%", padding: "9px 0", borderRadius: 9, border: "1.5px solid #2563EB",
              background: logoUploading ? "#EFF6FF" : "#fff", color: "#2563EB",
              fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: logoUploading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7
            }}>
            <Upload size={14} />
            {logoUploading ? "جاري الرفع..." : "ارفع شعار جديد"}
          </button>
          {logoError && (
            <div style={{ marginTop: 6, color: "#EF4444", fontSize: 12, fontFamily: "'Cairo', sans-serif" }}>
              {logoError}
            </div>
          )}
          <div style={{ marginTop: 5, color: "#94A3B8", fontSize: 11, fontFamily: "'Cairo', sans-serif" }}>
            PNG, JPG, SVG — بحد أقصى 2MB
          </div>
        </div>
      );
    }

    if (meta.type === "toggle") {
      return (
        <div key={key}>
          <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{meta.label}</label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setSettings(p => ({ ...p, [key]: p[key] === "true" ? "false" : "true" }))}
              style={{ width: 44, height: 24, borderRadius: 12, background: settings[key] === "true" ? "#2563EB" : "#CBD5E1", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: settings[key] === "true" ? 2 : 22, transition: "right 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#374151" }}>
              {settings[key] === "true" ? "مفعّل" : "معطّل"}
            </span>
          </label>
        </div>
      );
    }

    if (meta.type === "textarea") {
      return (
        <div key={key}>
          <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{meta.label}</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={settings[key] || ""}
            onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>
      );
    }

    return (
      <div key={key}>
        <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 6 }}>{meta.label}</label>
        <input
          type={meta.type === "password" ? "password" : "text"}
          style={{ ...inputStyle, direction: meta.type === "url" || meta.type === "email" ? "ltr" : "rtl" }}
          value={settings[key] || ""}
          onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = "#E2E8F0"}
        />
      </div>
    );
  };

  return (
    <AdminLayout active="settings">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 22, color: "#0F172A", margin: 0 }}>إعدادات المنصة</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: saved ? "#10B981" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saved ? <><CheckCircle size={14} /> تم الحفظ</> : <><Save size={14} /> {saving ? "جاري..." : "حفظ الإعدادات"}</>}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>جاري التحميل...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SETTING_GROUPS.map(group => (
            <div key={group.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
                <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 15, color: "#0F172A", margin: 0 }}>{group.label}</h3>
              </div>
              <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {group.keys.map(key => renderField(key))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}