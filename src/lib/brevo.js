const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const APP_URL = import.meta.env.VITE_APP_URL || "https://loop-edx-mu5f.vercel.app";

async function sendEmail({ to, subject, htmlContent }) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ to: Array.isArray(to) ? to : [to], subject, html: htmlContent }),
    });
    if (!res.ok) { const err = await res.json(); console.error("Email error:", err); return false; }
    return true;
  } catch (err) { console.error("Email send error:", err); return false; }
}

async function getAdminEmails(supabase) {
  const { data } = await supabase.from("admins").select("email, name");
  return data || [];
}

function baseTemplate({ headerBg, badge, badgeColor, icon, title, subtitle, bodyContent }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: ${headerBg}; padding: 36px 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; }
  .badge { display: inline-block; background: ${badgeColor || "#fff"}; color: ${badgeColor ? "#fff" : "#1E40AF"}; padding: 4px 16px; border-radius: 20px; font-size: 13px; font-weight: 800; margin-top: 10px; }
  .body { padding: 36px 32px; }
  .info-card { background: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748B; }
  .value { color: #0F172A; font-weight: 700; }
  .btn { display: inline-block; background: linear-gradient(135deg, #1E40AF, #2563EB); color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 700; }
  .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; color: #94A3B8; font-size: 13px; border-top: 1px solid #E2E8F0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <div style="font-size:48px; margin-bottom:12px;">${icon}</div>
    <h1>${title}</h1>
    ${badge ? `<div class="badge">${badge}</div>` : ""}
    ${subtitle ? `<p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">${subtitle}</p>` : ""}
  </div>
  <div class="body">${bodyContent}</div>
  <div class="footer">© ${new Date().getFullYear()} LoopEDX — جميع الحقوق محفوظة</div>
</div>
</body></html>`;
}

export async function sendWelcomeEmail({ email, name, role }) {
  const isInstructor = role === "instructor";
  return sendEmail({
    to: [email],
    subject: `أهلاً بك في LoopEDX يا ${name}! 🎉`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #1E40AF, #2563EB)",
      icon: isInstructor ? "👨‍🏫" : "🎒",
      title: "أهلاً بك في LoopEDX!",
      subtitle: isInstructor ? "منصتك لمشاركة معرفتك مع الطلاب" : "ابدأ رحلتك التعليمية اليوم",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 12px;">مرحباً ${name}! 🎉</h2>
        <p style="color:#64748B; font-size:15px; line-height:1.7; margin:0 0 20px;">
          ${isInstructor ? "يسعدنا انضمامك كمعلم في LoopEDX!" : "يسعدنا انضمامك إلى مجتمع LoopEDX!"}
        </p>
        <div class="info-card">
          ${isInstructor ? `
          <div class="info-row"><span class="label">✅</span><span class="value">أنشئ أول دورة لك</span></div>
          <div class="info-row"><span class="label">✅</span><span class="value">أضف محتواك التعليمي</span></div>
          <div class="info-row"><span class="label">✅</span><span class="value">تواصل مع طلابك</span></div>
          ` : `
          <div class="info-row"><span class="label">✅</span><span class="value">استكشف الدورات المتاحة</span></div>
          <div class="info-row"><span class="label">✅</span><span class="value">سجل في دورتك الأولى</span></div>
          <div class="info-row"><span class="label">✅</span><span class="value">ابدأ التعلم مع زكي المساعد الذكي</span></div>
          `}
        </div>
        <div style="text-align:center; margin-top:28px;">
          <a href="${APP_URL}/${isInstructor ? "instructor/dashboard" : "courses"}" class="btn">
            ${isInstructor ? "اذهب للوحة المعلم 🚀" : "استكشف الدورات 🚀"}
          </a>
        </div>`,
    }),
  });
}

export async function notifyAdminsNewStudent({ supabase, studentName, studentEmail, registeredAt }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;
  const html = baseTemplate({
    headerBg: "linear-gradient(135deg, #0F172A, #1E3A8A)",
    icon: "👤",
    title: "LoopEDX — إشعار إداري",
    badge: "طالب جديد",
    badgeColor: "#10B981",
    bodyContent: `
      <h2 style="color:#0F172A; margin:0 0 8px;">انضم طالب جديد للمنصة 🎉</h2>
      <div class="info-card">
        <div class="info-row"><span class="label">الاسم</span><span class="value">${studentName}</span></div>
        <div class="info-row"><span class="label">البريد</span><span class="value">${studentEmail}</span></div>
        <div class="info-row"><span class="label">تاريخ التسجيل</span><span class="value">${new Date(registeredAt).toLocaleString("ar-SA")}</span></div>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <a href="${APP_URL}/admin/users" class="btn">عرض في لوحة الإدارة</a>
      </div>`,
  });
  for (const admin of admins) {
    await sendEmail({ to: [admin.email], subject: `طالب جديد: ${studentName} — LoopEDX`, htmlContent: html });
  }
}

export async function notifyAdminsNewInstructor({ supabase, instructorName, instructorEmail, registeredAt }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;
  const html = baseTemplate({
    headerBg: "linear-gradient(135deg, #0F172A, #1E3A8A)",
    icon: "👨‍🏫",
    title: "LoopEDX — إشعار إداري",
    badge: "معلم جديد — يحتاج موافقة",
    badgeColor: "#8B5CF6",
    bodyContent: `
      <h2 style="color:#0F172A; margin:0 0 8px;">طلب انضمام معلم جديد 👨‍🏫</h2>
      <div class="info-card">
        <div class="info-row"><span class="label">الاسم</span><span class="value">${instructorName}</span></div>
        <div class="info-row"><span class="label">البريد</span><span class="value">${instructorEmail}</span></div>
        <div class="info-row"><span class="label">تاريخ التسجيل</span><span class="value">${new Date(registeredAt).toLocaleString("ar-SA")}</span></div>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <a href="${APP_URL}/admin/users" class="btn">مراجعة الطلب في لوحة الإدارة</a>
      </div>`,
  });
  for (const admin of admins) {
    await sendEmail({ to: [admin.email], subject: `معلم جديد يحتاج موافقة: ${instructorName} — LoopEDX`, htmlContent: html });
  }
}

export async function sendInstructorApproval({ email, name }) {
  return sendEmail({
    to: [email],
    subject: "🎉 تمت الموافقة على حسابك كمعلم — LoopEDX",
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #064E3B, #10B981)",
      icon: "✅",
      title: "تمت الموافقة على حسابك!",
      subtitle: "أنت الآن معلم معتمد على LoopEDX",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 12px;">مبروك يا ${name}! 🎉</h2>
        <p style="color:#64748B; font-size:15px; line-height:1.7; margin:0 0 20px;">تمت مراجعة حسابك والموافقة عليه.</p>
        <div style="text-align:center; margin-top:28px;">
          <a href="${APP_URL}/instructor/dashboard" class="btn">ابدأ الآن 🚀</a>
        </div>`,
    }),
  });
}

export async function sendPurchaseConfirmation({ studentEmail, studentName, courseName, courseSlug, amount, paymentMethod, orderId }) {
  return sendEmail({
    to: [studentEmail],
    subject: `تم الشراء بنجاح: ${courseName} — LoopEDX`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #1E40AF, #2563EB)",
      icon: "✅",
      title: "تم الدفع بنجاح!",
      subtitle: "يمكنك البدء بالتعلم الآن",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 8px;">أهلاً ${studentName}! 🎉</h2>
        <div style="font-size:32px; font-weight:900; color:#10B981; text-align:center; margin:16px 0;">${amount} ريال سعودي</div>
        <div class="info-card">
          <div class="info-row"><span class="label">الدورة</span><span class="value">${courseName}</span></div>
          <div class="info-row"><span class="label">رقم الطلب</span><span class="value">${orderId}</span></div>
          <div class="info-row"><span class="label">طريقة الدفع</span><span class="value">${paymentMethod}</span></div>
          <div class="info-row"><span class="label">تاريخ الشراء</span><span class="value">${new Date().toLocaleString("ar-SA")}</span></div>
        </div>
        <div style="text-align:center; margin-top:28px;">
          <a href="${APP_URL}/student/courses/${courseSlug}/learn" class="btn">ابدأ التعلم الآن 🚀</a>
        </div>`,
    }),
  });
}

export async function notifyInstructorNewStudent({ instructorEmail, instructorName, studentName, courseName, enrolledAt }) {
  return sendEmail({
    to: [instructorEmail],
    subject: `طالب جديد في دورتك: ${courseName} — LoopEDX`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #1E40AF, #2563EB)",
      icon: "🎒",
      title: "طالب جديد انضم لدورتك!",
      badge: "تسجيل جديد",
      badgeColor: "#10B981",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 8px;">مبروك يا ${instructorName}! 🎉</h2>
        <div class="info-card">
          <div class="info-row"><span class="label">اسم الطالب</span><span class="value">${studentName}</span></div>
          <div class="info-row"><span class="label">الدورة</span><span class="value">${courseName}</span></div>
          <div class="info-row"><span class="label">تاريخ التسجيل</span><span class="value">${new Date(enrolledAt).toLocaleString("ar-SA")}</span></div>
        </div>
        <div style="text-align:center; margin-top:24px;">
          <a href="${APP_URL}/instructor/students" class="btn">عرض الطلاب</a>
        </div>`,
    }),
  });
}

export async function notifyAdminsNewPayment({ supabase, studentName, studentEmail, courseName, amount, paymentMethod, orderId }) {
  const admins = await getAdminEmails(supabase);
  if (!admins.length) return;
  const html = baseTemplate({
    headerBg: "linear-gradient(135deg, #064E3B, #10B981)",
    icon: "💰",
    title: "دفعة جديدة!",
    badge: "عملية ناجحة",
    badgeColor: "#1E40AF",
    bodyContent: `
      <div style="font-size:36px; font-weight:900; color:#10B981; text-align:center; margin:16px 0;">${amount} ريال</div>
      <div class="info-card">
        <div class="info-row"><span class="label">الطالب</span><span class="value">${studentName}</span></div>
        <div class="info-row"><span class="label">البريد</span><span class="value">${studentEmail}</span></div>
        <div class="info-row"><span class="label">الدورة</span><span class="value">${courseName}</span></div>
        <div class="info-row"><span class="label">طريقة الدفع</span><span class="value">${paymentMethod}</span></div>
        <div class="info-row"><span class="label">رقم الطلب</span><span class="value">${orderId}</span></div>
        <div class="info-row"><span class="label">التاريخ</span><span class="value">${new Date().toLocaleString("ar-SA")}</span></div>
      </div>
      <div style="text-align:center; margin-top:24px;">
        <a href="${APP_URL}/admin/transactions" class="btn">عرض المعاملات</a>
      </div>`,
  });
  for (const admin of admins) {
    await sendEmail({ to: [admin.email], subject: `💰 دفعة جديدة: ${amount} ريال — ${studentName}`, htmlContent: html });
  }
}

export async function sendSessionReminderStudent({ studentEmail, studentName, instructorName, sessionTitle, sessionDate, sessionTime, sessionLink }) {
  return sendEmail({
    to: [studentEmail],
    subject: `تذكير: حصتك مع ${instructorName} غداً — LoopEDX`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
      icon: "📅",
      title: "تذكير بموعد حصتك",
      subtitle: "حصتك الخصوصية غداً",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 8px;">أهلاً ${studentName}! 👋</h2>
        <div class="info-card">
          <div class="info-row"><span class="label">الحصة</span><span class="value">${sessionTitle}</span></div>
          <div class="info-row"><span class="label">المعلم</span><span class="value">${instructorName}</span></div>
          <div class="info-row"><span class="label">التاريخ</span><span class="value">${sessionDate}</span></div>
          <div class="info-row"><span class="label">الوقت</span><span class="value">${sessionTime}</span></div>
        </div>
        ${sessionLink ? `<div style="text-align:center; margin-top:24px;"><a href="${sessionLink}" class="btn">انضم للحصة 📹</a></div>` : ""}`,
    }),
  });
}

export async function sendSessionReminderInstructor({ instructorEmail, instructorName, studentName, sessionTitle, sessionDate, sessionTime }) {
  return sendEmail({
    to: [instructorEmail],
    subject: `تذكير: حصتك مع ${studentName} غداً — LoopEDX`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
      icon: "📅",
      title: "تذكير بموعد حصتك",
      subtitle: "حصتك الخصوصية غداً",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 8px;">أهلاً ${instructorName}! 👋</h2>
        <div class="info-card">
          <div class="info-row"><span class="label">الحصة</span><span class="value">${sessionTitle}</span></div>
          <div class="info-row"><span class="label">الطالب</span><span class="value">${studentName}</span></div>
          <div class="info-row"><span class="label">التاريخ</span><span class="value">${sessionDate}</span></div>
          <div class="info-row"><span class="label">الوقت</span><span class="value">${sessionTime}</span></div>
        </div>
        <div style="text-align:center; margin-top:24px;">
          <a href="${APP_URL}/instructor/schedule" class="btn">عرض جدول الحصص</a>
        </div>`,
    }),
  });
}

export async function sendPromoEmail({ email, name, promoTitle, promoDescription, discountPercent, couponCode, expiryDate, ctaUrl }) {
  return sendEmail({
    to: [email],
    subject: `🎁 ${promoTitle} — LoopEDX`,
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #DC2626, #EF4444)",
      icon: "🎁",
      title: promoTitle,
      subtitle: promoDescription,
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 8px;">أهلاً ${name}! 🎉</h2>
        <p style="color:#64748B; font-size:15px; margin:0 0 20px;">${promoDescription}</p>
        ${discountPercent ? `
        <div style="background:#FEF2F2; border:2px dashed #EF4444; border-radius:12px; padding:24px; text-align:center; margin:20px 0;">
          <div style="font-size:48px; font-weight:900; color:#DC2626;">${discountPercent}%</div>
          ${couponCode ? `<div style="font-size:20px; font-weight:900; color:#DC2626; letter-spacing:3px; margin-top:12px;">${couponCode}</div>` : ""}
          ${expiryDate ? `<div style="color:#94A3B8; font-size:13px; margin-top:12px;">ينتهي العرض: ${expiryDate}</div>` : ""}
        </div>` : ""}
        <div style="text-align:center; margin-top:28px;">
          <a href="${ctaUrl || APP_URL + "/courses"}" style="display:inline-block; background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; text-decoration:none; padding:14px 36px; border-radius:10px; font-size:15px; font-weight:700;">استفد من العرض الآن 🚀</a>
        </div>`,
    }),
  });
}

export async function sendVerificationEmail({ email, name, confirmUrl }) {
  return sendEmail({
    to: [email],
    subject: "أكّد بريدك الإلكتروني — LoopEDX",
    htmlContent: baseTemplate({
      headerBg: "linear-gradient(135deg, #1E40AF, #2563EB)",
      icon: "✉️",
      title: "تأكيد البريد الإلكتروني",
      subtitle: "خطوة واحدة تفصلك عن عالم المعرفة",
      bodyContent: `
        <h2 style="color:#0F172A; margin:0 0 12px;">أهلاً ${name}! 👋</h2>
        <p style="color:#64748B; font-size:15px; line-height:1.7; margin:0 0 28px;">شكراً لتسجيلك في LoopEDX. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني.</p>
        <div style="text-align:center; margin:32px 0;">
          <a href="${confirmUrl}" class="btn">تأكيد البريد الإلكتروني ✉️</a>
        </div>
        <p style="font-size:13px; color:#94A3B8; text-align:center;">الرابط صالح لمدة 24 ساعة.</p>`,
    }),
  });
}