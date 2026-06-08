// ─── Tabby Payment Integration ─────────────────────────
// تابي — اشتري الآن وادفع لاحقاً

const TABBY_PUBLIC_KEY    = import.meta.env.VITE_TABBY_PUBLIC_KEY;
const TABBY_SECRET_KEY    = import.meta.env.VITE_TABBY_SECRET_KEY;
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE;
const TABBY_API_URL       = "https://api.tabby.ai/api/v2";

// ─── إنشاء جلسة دفع تابي ───
export async function createTabbySession({ amount, currency = "SAR", studentName, studentEmail, studentPhone = "", courseTitle, courseSlug, orderId }) {
  try {
    const res = await fetch(`${TABBY_API_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TABBY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        payment: {
          amount: amount.toString(),
          currency,
          description: courseTitle,
          buyer: {
            phone: studentPhone || "0500000000",
            email: studentEmail,
            name: studentName,
          },
          buyer_history: {
            registered_since: new Date().toISOString(),
            loyalty_level: 0,
          },
          order: {
            tax_amount: "0.00",
            shipping_amount: "0.00",
            discount_amount: "0.00",
            updated_at: new Date().toISOString(),
            reference_id: orderId,
            items: [{
              title: courseTitle,
              description: `دورة: ${courseTitle}`,
              quantity: 1,
              unit_price: amount.toString(),
              discount_amount: "0.00",
              reference_id: courseSlug,
              image_url: "",
              product_url: `${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/courses/${courseSlug}`,
              category: "education",
            }],
          },
          shipping_address: {
            city: "Riyadh",
            address: "Saudi Arabia",
            zip: "12345",
          },
        },
        lang: "ar",
        merchant_code: TABBY_MERCHANT_CODE,
        merchant_urls: {
          success: `${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/payment/success?method=tabby&order=${orderId}`,
          cancel:  `${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/payment/cancel?order=${orderId}`,
          failure: `${import.meta.env.VITE_APP_URL || "https://loop-edx.com"}/payment/failed?order=${orderId}`,
        },
      }),
    });

    const data = await res.json();

    if (data.status === "created") {
      // رابط الدفع
      const paymentUrl = data.configuration?.available_products?.installments?.[0]?.web_url
        || data.configuration?.available_products?.pay_later?.[0]?.web_url;
      return { success: true, paymentUrl, sessionId: data.id };
    }

    return { success: false, error: data.error || "فشل إنشاء جلسة تابي" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── التحقق من حالة الدفع ───
export async function verifyTabbyPayment(paymentId) {
  try {
    const res = await fetch(`${TABBY_API_URL}/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${TABBY_SECRET_KEY}` },
    });
    const data = await res.json();
    return {
      success: data.status === "CLOSED" || data.status === "AUTHORIZED",
      status: data.status,
      data,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Tabby Promo Widget (يُضاف في صفحة الدورة) ───
export function loadTabbyWidget(price, currency = "SAR") {
  // بيحمّل الـ widget اللي بيعرض "4 أقساط بدون فوائد"
  if (typeof window === "undefined") return;

  const script = document.createElement("script");
  script.src = "https://checkout.tabby.ai/tabby-promo.js";
  script.async = true;
  script.onload = () => {
    if (window.TabbyPromo) {
      new window.TabbyPromo({
        selector: "#tabby-promo-snippet",
        currency,
        price: price.toString(),
        size: "narrow",
        theme: "default",
        lang: "ar",
        publicKey: TABBY_PUBLIC_KEY,
        source: "product",
      });
    }
  };
  document.head.appendChild(script);
}
