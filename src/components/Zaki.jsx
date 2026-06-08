import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { useLocation } from "react-router-dom";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const BASE_PROMPT = `أنت "زكي"، مساعد ذكي على منصة LoopEDX التعليمية السعودية.

🎯 معلومات المنصة:
- منصة سعودية لطلاب المرحلة الثانوية
- متخصصة في:
  • القدرات الكمي
  • القدرات اللفظي
  • التحصيلي — وله 4 فروع فقط: تحصيلي كيمياء، تحصيلي فيزياء، تحصيلي أحياء، تحصيلي رياضيات
  • مهم: دايماً اذكر اسم الفرع كامل "تحصيلي كيمياء" مش "كيمياء" بس

أسلوبك:
- تكلم بالعربية البسيطة أو العامية السعودية
- كن ودوداً ومشجعاً
- استخدم الإيموجي باعتدال
- إجاباتك مختصرة وواضحة`;

const ROLE_PROMPTS = {
  student: `
أنت تتكلم مع طالب. مهمتك:
- اشرح وبسّط المفاهيم الدراسية
- اختبر الطالب بأسئلة على غرار اختبار القياس
- شجعه وحفزه دائماً
- قدم ألعاب تعليمية: اختيار من متعدد، صح أم خطأ، تحديات وقت`,

  instructor: `
أنت تتكلم مع معلم. مهمتك:
- ساعده يفهم إحصائيات دوراته وطلابه وإيراداته
- ساعده يرفع دوراته خطوة بخطوة
- نبهه لأي مشاكل في دوراته`,

  admin: `
أنت تتكلم مع أدمن المنصة. مهمتك:
- أجب على أسئلته عن إحصائيات المنصة
- ساعده في إدارة المستخدمين والدورات`,
};

const PAGE_CONTEXTS = {
  "/": "المستخدم في الصفحة الرئيسية",
  "/courses": "المستخدم يتصفح قائمة الدورات",
  "/student/dashboard": "الطالب في لوحة التحكم الخاصة به",
  "/instructor/dashboard": "المعلم في لوحة التحكم الخاصة به",
  "/instructor/courses": "المعلم يتصفح دوراته",
  "/instructor/courses/new": "المعلم يرفع دورة جديدة — ساعده خطوة بخطوة",
  "/admin": "الأدمن في لوحة التحكم الرئيسية",
};

const AUTO_MESSAGES = {
  "/instructor/courses/new": "لاحظت إنك بتضيف دورة جديدة 🎉 تحتاج مساعدة في أي خطوة؟",
  "/courses": "أهلاً! أنا زكي 😊 أقدر أساعدك تختار الدورة المناسبة ليك.",
  "/student/dashboard": "أهلاً بعودتك! 👋 عايز تذاكر اليوم؟",
};

export default function Zaki() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [platformData, setPlatformData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "أهلاً! أنا زكي 🤖✨\n\nأقدر أساعدك في:\n📚 الشرح والتلخيص والاختبار\n🎯 أسئلة القدرات والتحصيلي\n📊 بيانات المنصة والدورات\n⚡ أي سؤال عن المنصة\n\nبماذا تريد أن تبدأ؟"
    }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const autoShownRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { fetchPlatformData(); }, [user]);

  useEffect(() => {
    const autoMsg = AUTO_MESSAGES[location.pathname];
    if (autoMsg && !autoShownRef.current) {
      const timer = setTimeout(() => {
        autoShownRef.current = true;
        setOpen(true);
        setMessages(prev => [...prev, { role: "assistant", content: autoMsg }]);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (open && !minimized) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized && !isMobile) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized, isMobile]);

  const fetchPlatformData = async () => {
    try {
      const role = profile?.role || "student";
      let data = {};

      const { data: courses } = await supabase
        .from("courses_with_instructor")
        .select("title, category, price, avg_rating, enrollments_count")
        .limit(20);
      data.courses = courses || [];

      if (role === "instructor" && user) {
        const { data: myCourses } = await supabase
          .from("courses")
          .select("id, title, status, price, enrollments_count, avg_rating")
          .eq("instructor_id", user.id);
        data.myCourses = myCourses || [];
        const { data: orders } = await supabase
          .from("orders").select("amount")
          .in("course_id", (myCourses || []).map(c => c.id));
        data.totalEarnings = (orders || []).reduce((sum, o) => sum + (o.amount || 0), 0);
        data.totalStudents = (myCourses || []).reduce((sum, c) => sum + (c.enrollments_count || 0), 0);
      } else if (role === "admin") {
        const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const { count: coursesCount } = await supabase.from("courses").select("*", { count: "exact", head: true });
        const { data: orders } = await supabase.from("orders").select("amount");
        data.usersCount = usersCount || 0;
        data.coursesCount = coursesCount || 0;
        data.totalRevenue = (orders || []).reduce((sum, o) => sum + (o.amount || 0), 0);
      } else if (role === "student" && user) {
        const { data: enrollments } = await supabase
          .from("enrollments").select("courses(title, category)")
          .eq("student_id", user.id);
        data.myEnrollments = (enrollments || []).map(e => e.courses);
      }

      setPlatformData(data);
    } catch (err) {
      console.error("Zaki fetch error:", err);
    }
  };

  const buildSystemPrompt = () => {
    const role = profile?.role || "student";
    const pageContext = PAGE_CONTEXTS[location.pathname] || `المستخدم في صفحة ${location.pathname}`;
    let prompt = BASE_PROMPT;
    prompt += ROLE_PROMPTS[role] || ROLE_PROMPTS.student;
    prompt += `\n\n📍 السياق الحالي: ${pageContext}`;
    prompt += `\n👤 المستخدم: ${profile?.name || "زائر"} — دوره: ${role === "student" ? "طالب" : role === "instructor" ? "معلم" : role === "admin" ? "أدمن" : "زائر"}`;

    if (platformData) {
      prompt += `\n\n📊 بيانات المنصة:`;
      if (platformData.courses?.length > 0) {
        prompt += `\nالدورات المتاحة: ${platformData.courses.map(c => `${c.title} (${c.category} - ${c.price === 0 ? "مجاني" : c.price + " ريال"})`).join(" | ")}`;
      }
      if (role === "instructor") {
        if (platformData.myCourses?.length > 0) {
          prompt += `\nدوراتي: ${platformData.myCourses.map(c => `${c.title} (${c.status} - ${c.enrollments_count || 0} طالب)`).join(" | ")}`;
        }
        prompt += `\nإجمالي إيراداتي: ${platformData.totalEarnings || 0} ريال`;
        prompt += `\nإجمالي طلابي: ${platformData.totalStudents || 0} طالب`;
      }
      if (role === "admin") {
        prompt += `\nإجمالي المستخدمين: ${platformData.usersCount}`;
        prompt += `\nإجمالي الدورات: ${platformData.coursesCount}`;
        prompt += `\nإجمالي إيرادات المنصة: ${platformData.totalRevenue} ريال`;
      }
      if (role === "student" && platformData.myEnrollments?.length > 0) {
        prompt += `\nدوراتي المسجلة: ${platformData.myEnrollments.map(e => e?.title).join(" | ")}`;
      }
    }
    return prompt;
  };

  const sendMessage = async (customMsg) => {
    const userMessage = (customMsg || input).trim();
    if (!userMessage || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "عذراً، حدث خطأ. حاول مرة أخرى.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ في الاتصال." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getQuickActions = () => {
    const role = profile?.role || "student";
    if (role === "instructor") return [
      { label: "إيراداتي 💰", msg: "كم إيراداتي الإجمالية؟" },
      { label: "طلابي 👥", msg: "كم عدد طلابي؟" },
      { label: "دوراتي 📚", msg: "اعرض لي دوراتي وحالتها" },
      { label: "كيف أرفع دورة؟ 🆕", msg: "ساعدني أرفع دورة جديدة" },
    ];
    if (role === "admin") return [
      { label: "إحصائيات 📊", msg: "اعرض لي إحصائيات المنصة" },
      { label: "الإيرادات 💰", msg: "كم إجمالي إيرادات المنصة؟" },
      { label: "المستخدمين 👥", msg: "كم عدد المستخدمين؟" },
    ];
    return [
      { label: "القدرات الكمي 🔢", msg: "اختبرني بسؤال من القدرات الكمي" },
      { label: "القدرات اللفظي 📖", msg: "اختبرني بسؤال من القدرات اللفظي" },
      { label: "تحصيلي كيمياء 🧪", msg: "اختبرني بسؤال تحصيلي كيمياء" },
      { label: "تحصيلي فيزياء ⚡", msg: "اختبرني بسؤال تحصيلي فيزياء" },
      { label: "تحصيلي أحياء 🌿", msg: "اختبرني بسؤال تحصيلي أحياء" },
      { label: "تحصيلي رياضيات 📐", msg: "اختبرني بسؤال تحصيلي رياضيات" },
    ];
  };

  // ── Styles حسب الحجم ──
  const chatWidth = isMobile ? "100vw" : "390px";
  const chatBottom = isMobile ? "0" : "28px";
  const chatLeft = isMobile ? "0" : "28px";
  const chatRight = isMobile ? "0" : "auto";
  const chatBorderRadius = isMobile ? "20px 20px 0 0" : "20px";
  const msgHeight = isMobile ? "calc(100vh - 220px)" : "380px";

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 28, left: 28, zIndex: 9999,
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #1E40AF, #2563EB)",
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "zakiPulse 2s infinite",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 26 }}>🤖</span>
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 18, height: 18, borderRadius: "50%",
            background: "#10B981", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#fff", fontWeight: 900,
            fontFamily: "'Cairo', sans-serif",
          }}>ز</div>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: chatBottom,
          left: chatLeft,
          right: chatRight,
          zIndex: 9999,
          width: chatWidth,
          borderRadius: chatBorderRadius,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
          fontFamily: "'Cairo', sans-serif",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          direction: "rtl",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1E40AF, #2563EB)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>زكي</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
                  {profile?.role === "instructor" ? "مساعد المعلمين" : profile?.role === "admin" ? "مساعد الإدارة" : "مساعدك التعليمي"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!isMobile && (
                <button onClick={() => setMinimized(!minimized)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Minimize2 size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ height: msgHeight, overflowY: "auto", padding: 16, background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg,#1E40AF,#2563EB)" : "#fff", border: msg.role === "assistant" ? "1px solid #E2E8F0" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "assistant" ? 16 : 12, color: msg.role === "user" ? "#fff" : undefined }}>
                      {msg.role === "assistant" ? "🤖" : <User size={14} />}
                    </div>
                    <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg,#1E40AF,#2563EB)" : "#fff", color: msg.role === "user" ? "#fff" : "#0F172A", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: 13, lineHeight: 1.7, border: msg.role === "assistant" ? "1px solid #E2E8F0" : "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", whiteSpace: "pre-wrap", direction: "rtl" }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                    <div style={{ background: "#fff", border: "1px solid #E2E8F0", padding: "12px 16px", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563EB", animation: `zakiBounce 1s ${i * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div style={{ padding: "10px 12px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {getQuickActions().map((a, i) => (
                    <button key={i} onClick={() => sendMessage(a.msg)}
                      style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #2563EB", background: "#EFF6FF", color: "#1E40AF", fontFamily: "'Cairo', sans-serif", fontSize: isMobile ? 12 : 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.color = "#1E40AF"; }}
                    >{a.label}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #E2E8F0", display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  rows={1}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: "none", direction: "rtl", resize: "none", maxHeight: 100, overflow: "auto", lineHeight: 1.5, boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#2563EB"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: loading || !input.trim() ? "#E2E8F0" : "linear-gradient(135deg,#1E40AF,#2563EB)", color: loading || !input.trim() ? "#94A3B8" : "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes zakiPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(37,99,235,0.4); }
          50% { box-shadow: 0 8px 32px rgba(37,99,235,0.7), 0 0 0 10px rgba(37,99,235,0.1); }
        }
        @keyframes zakiBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}