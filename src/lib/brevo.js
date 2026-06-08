// ─── Brevo Email Service ───────────────────────────────
// كل الإيميلات بتمر من هنا

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const SENDER_EMAIL  = import.meta.env.VITE_BREVO_SENDER_EMAIL;
const SENDER_NAME   = import.meta.env.VITE_BREVO_SENDER_NAME || "LoopEDX";
const API_URL       = "https://api.brevo.com/v3/smtp/email";

// ─── دالة الإرسال الأساسية ───
async function sendEmail({ to, subject, htmlContent }) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to,
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("Brevo error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Brevo send error:", err);
    return false;
  }
}

// ─── جيب الأدمن من Supabase ───
async function getAdminEmails(supabase) {
  const { data } = await supabase
    .from("admins")
    .select("email, name")
    .eq("receive_notifications", true);
  return data || [];
}

// ══════════════════════════════════════════════════════
// 1. تأكيد الإيميل عند التسجيل
// (Supabase بيبعته تلقائياً — بس لو عايز custom template)
// ══════════════════════════════════════════════════════
export async function sendVerificationEmail({ email, name, confirmUrl }) {
  return sendEmail({
    to: [{ email, name }],
    subject: "أكّد بريدك الإلكتروني — LoopEDX",
    htmlContent: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1E40AF, #2563EB); padding: 40px 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 800; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; }
  .body { padding: 40px 32px; }
  .body h2 { color: #0F172A; font-size: 22px; margin: 0 0 12px; }
  .body p { color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #1E40AF, #2563EB); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 16px; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 LoopEDX</h1>
    <p>منصة التعليم الإلكتروني</p>
  </div>
  <div class="body">
    <h2>أهلاً ${name}! 👋</h2>
    <p>شكراً لتسجيلك في LoopEDX. خطوة واحدة تفصلك عن عالم من المعرفة — أكّد بريدك الإلكتروني للبدء.</p>
    <div style="text-align:center; margin: 32px 0;">
      <a href="${confirmUrl}" class="btn">تأكيد البريد الإلكتروني ✉️</a>
    </div>
    <p style="font-size:13px; color:#94A3B8;">الرابط صالح لمدة 24 ساعة. إذا لم تقم بإنشاء هذا الحساب، تجاهل هذا الإيميل.</p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — جميع الحقوق محفوظة</div>
</div>
</body></html>`,
  });
}

// ══════════════════════════════════════════════════════
// 2. إشعار الأدمن — طالب جديد
// ══════════════════════════════════════════════════════
export async function notifyAdminsNewStudent({ supabase, studentName, studentEmail, registeredAt }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0F172A, #1E3A8A); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; }
  .badge { display: inline-block; background: #10B981; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-top: 10px; }
  .body { padding: 32px; }
  .info-card { background: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748B; }
  .value { color: #0F172A; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 LoopEDX — إشعار إداري</h1>
    <div class="badge">طالب جديد</div>
  </div>
  <div class="body">
    <h2 style="color:#0F172A; margin:0 0 8px;">انضم طالب جديد للمنصة 🎉</h2>
    <p style="color:#64748B; font-size:15px; margin:0 0 20px;">تم تسجيل حساب طالب جديد على LoopEDX</p>
    <div class="info-card">
      <div class="info-row"><span class="label">الاسم</span><span class="value">${studentName}</span></div>
      <div class="info-row"><span class="label">البريد الإلكتروني</span><span class="value">${studentEmail}</span></div>
      <div class="info-row"><span class="label">تاريخ التسجيل</span><span class="value">${new Date(registeredAt).toLocaleString("ar-SA")}</span></div>
      <div class="info-row"><span class="label">النوع</span><span class="value">طالب</span></div>
    </div>
  </div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — لوحة الإدارة</div>
</div>
</body></html>`;

  for (const admin of admins) {
    await sendEmail({
      to: [{ email: admin.email, name: admin.name }],
      subject: `طالب جديد: ${studentName} — LoopEDX`,
      htmlContent: html,
    });
  }
}

// ══════════════════════════════════════════════════════
// 3. إشعار الأدمن — معلم جديد
// ══════════════════════════════════════════════════════
export async function notifyAdminsNewInstructor({ supabase, instructorName, instructorEmail, registeredAt }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0F172A, #1E3A8A); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; }
  .badge { display: inline-block; background: #8B5CF6; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-top: 10px; }
  .body { padding: 32px; }
  .info-card { background: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748B; }
  .value { color: #0F172A; font-weight: 700; }
  .btn { display: inline-block; background: linear-gradient(135deg, #1E40AF, #2563EB); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 LoopEDX — إشعار إداري</h1>
    <div class="badge">معلم جديد — يحتاج موافقة</div>
  </div>
  <div class="body">
    <h2 style="color:#0F172A; margin:0 0 8px;">طلب انضمام معلم جديد 👨‍🏫</h2>
    <p style="color:#64748B; font-size:15px; margin:0 0 20px;">تم تسجيل حساب معلم جديد ويحتاج مراجعة وموافقة</p>
    <div class="info-card">
      <div class="info-row"><span class="label">الاسم</span><span class="value">${instructorName}</span></div>
      <div class="info-row"><span class="label">البريد الإلكتروني</span><span class="value">${instructorEmail}</span></div>
      <div class="info-row"><span class="label">تاريخ التسجيل</span><span class="value">${new Date(registeredAt).toLocaleString("ar-SA")}</span></div>
      <div class="info-row"><span class="label">النوع</span><span class="value">معلم</span></div>
    </div>
    <div style="text-align:center; margin-top:24px;">
      <a href="${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/admin/users" class="btn">مراجعة الطلب في لوحة الإدارة</a>
    </div>
  </div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — لوحة الإدارة</div>
</div>
</body></html>`;

  for (const admin of admins) {
    await sendEmail({
      to: [{ email: admin.email, name: admin.name }],
      subject: `معلم جديد يحتاج موافقة: ${instructorName} — LoopEDX`,
      htmlContent: html,
    });
  }
}

// ══════════════════════════════════════════════════════
// 4. تأكيد الشراء للطالب
// ══════════════════════════════════════════════════════
export async function sendPurchaseConfirmation({ studentEmail, studentName, courseName, courseSlug, amount, paymentMethod, orderId }) {
  return sendEmail({
    to: [{ email: studentEmail, name: studentName }],
    subject: `تم الشراء بنجاح: ${courseName} — LoopEDX`,
    htmlContent: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1E40AF, #2563EB); padding: 40px 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 800; }
  .success-icon { font-size: 56px; display: block; margin-bottom: 12px; }
  .body { padding: 36px 32px; }
  .order-card { background: #F0FFF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #D1FAE5; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #065F46; }
  .value { color: #064E3B; font-weight: 700; }
  .amount { font-size: 28px; font-weight: 900; color: #10B981; text-align: center; margin: 20px 0; }
  .btn { display: inline-block; background: linear-gradient(135deg, #1E40AF, #2563EB); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 16px; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <span class="success-icon">✅</span>
    <h1>تم الدفع بنجاح!</h1>
  </div>
  <div class="body">
    <h2 style="color:#0F172A; margin:0 0 8px;">أهلاً ${studentName}! 🎉</h2>
    <p style="color:#64748B; font-size:15px; margin:0 0 20px;">تم تأكيد اشتراكك في الدورة بنجاح. يمكنك البدء بالتعلم الآن!</p>
    <div class="amount">${amount} ريال سعودي</div>
    <div class="order-card">
      <div class="info-row"><span class="label">الدورة</span><span class="value">${courseName}</span></div>
      <div class="info-row"><span class="label">رقم الطلب</span><span class="value">${orderId}</span></div>
      <div class="info-row"><span class="label">طريقة الدفع</span><span class="value">${paymentMethod}</span></div>
      <div class="info-row"><span class="label">تاريخ الشراء</span><span class="value">${new Date().toLocaleString("ar-SA")}</span></div>
    </div>
    <div style="text-align:center; margin-top:28px;">
      <a href="${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/courses/${courseSlug}/learn" class="btn">ابدأ التعلم الآن 🚀</a>
    </div>
  </div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — جميع الحقوق محفوظة</div>
</div>
</body></html>`,
  });
}

// ══════════════════════════════════════════════════════
// 5. إشعار الأدمن — عملية دفع جديدة
// ══════════════════════════════════════════════════════
export async function notifyAdminsNewPayment({ supabase, studentName, studentEmail, courseName, amount, paymentMethod, orderId }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #064E3B, #10B981); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; }
  .badge { display: inline-block; background: #fff; color: #10B981; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-top: 10px; }
  .body { padding: 32px; }
  .amount { font-size: 36px; font-weight: 900; color: #10B981; text-align: center; margin: 16px 0; }
  .info-card { background: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748B; }
  .value { color: #0F172A; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>💰 LoopEDX — إشعار دفع جديد</h1>
    <div class="badge">عملية ناجحة</div>
  </div>
  <div class="body">
    <h2 style="color:#0F172A; margin:0 0 4px; text-align:center;">تم استلام دفعة جديدة!</h2>
    <div class="amount">${amount} ريال</div>
    <div class="info-card">
      <div class="info-row"><span class="label">الطالب</span><span class="value">${studentName}</span></div>
      <div class="info-row"><span class="label">البريد</span><span class="value">${studentEmail}</span></div>
      <div class="info-row"><span class="label">الدورة</span><span class="value">${courseName}</span></div>
      <div class="info-row"><span class="label">طريقة الدفع</span><span class="value">${paymentMethod}</span></div>
      <div class="info-row"><span class="label">رقم الطلب</span><span class="value">${orderId}</span></div>
      <div class="info-row"><span class="label">التاريخ</span><span class="value">${new Date().toLocaleString("ar-SA")}</span></div>
    </div>
  </div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — لوحة الإدارة</div>
</div>
</body></html>`;

  for (const admin of admins) {
    await sendEmail({
      to: [{ email: admin.email, name: admin.name }],
      subject: `💰 دفعة جديدة: ${amount} ريال — ${studentName}`,
      htmlContent: html,
    });
  }
}
