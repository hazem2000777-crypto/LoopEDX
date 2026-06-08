// ─── DirectPay Payment Integration ─────────────────────
// دايركت باي — بوابة الدفع السعودية

const MERCHANT_ID = import.meta.env.VITE_DIRECTPAY_MERCHANT_ID;
const AUTH_TOKEN  = import.meta.env.VITE_DIRECTPAY_TOKEN;
const PAY_URL     = "https://pay.directpay.sa/SmartRoutePaymentWeb/SRPayMsgHandler";
const INQ_URL     = "https://pay.directpay.sa/SmartRoutePaymentWeb/SRMsgHandler";
const APP_URL     = import.meta.env.VITE_APP_URL || "https://loop-edx.com";

// ─── إنشاء رابط الدفع ───
export async function createDirectPaySession({ amount, orderId, courseTitle, studentEmail, studentName }) {
  try {
    // DirectPay بيشتغل بـ form POST — نعمل form وnsubmit تلقائياً
    const amountHalala = Math.round(amount * 100); // تحويل للهللات

    const params = new URLSearchParams({
      MerchantID:    MERCHANT_ID,
      Amount:        amountHalala.toString(),
      Currency:      "SAR",
      MerchantRef:   orderId,
      ResponseURL:   `${APP_URL}/payment/success?method=directpay&order=${orderId}`,
      ErrorURL:      `${APP_URL}/payment/failed?order=${orderId}`,
      Lang:          "ar",
      TransactionHint: courseTitle,
      CustomerEmail: studentEmail,
      CustomerName:  studentName,
      Signature:     AUTH_TOKEN,
    });

    return {
      success: true,
      paymentUrl: `${PAY_URL}?${params.toString()}`,
      method: "redirect",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── التحقق من حالة الدفع (Inquiry) ───
export async function verifyDirectPayment(orderId) {
  try {
    const params = new URLSearchParams({
      MerchantID:  MERCHANT_ID,
      MerchantRef: orderId,
      Signature:   AUTH_TOKEN,
    });

    const res = await fetch(`${INQ_URL}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const text = await res.text();

    // DirectPay بيرجع XML أو query string
    const isSuccess = text.includes("SUCCESS") || text.includes("CAPTURED");
    return { success: isSuccess, raw: text };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
