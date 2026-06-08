import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import InstructorLayout from "./InstructorLayout";
import {
  CheckCircle, ChevronRight, ChevronLeft, BookOpen, Plus, Trash2,
  GripVertical, Video, FileText, DollarSign, Globe, AlertCircle,
  Save, Upload, File, X, Eye, EyeOff
} from "lucide-react";

const STEPS = [
  { id: 1, title: "المعلومات الأساسية", icon: <FileText size={16} /> },
  { id: 2, title: "المحتوى والفصول",    icon: <BookOpen size={16} /> },
  { id: 3, title: "التسعير والنشر",     icon: <DollarSign size={16} /> },
];
const CATEGORIES = ["قياس","قدرات","تحصيلي","IELTS","STEP","رياضيات","علوم","عربي","إنجليزي","عام"];
const LEVELS = [
  { value: "beginner",     label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced",     label: "متقدم" },
];

function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url?.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractDriveId(url) {
  const m = url?.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function VideoPreview({ url, type }) {
  if (!url) return null;
  if (type === "youtube") {
    const id = extractYoutubeId(url);
    if (!id) return null;
    return (
      <div style={{ borderRadius: 10, overflow: "hidden", marginTop: 10, background: "#000", aspectRatio: "16/9", position: "relative" }}>
        <iframe
          src={`https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&color=white&controls=1`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen title="preview"
        />
        <div style={{ position: "absolute", top: 0, right: 0, width: "25%", height: "15%", background: "#000", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18%", background: "linear-gradient(transparent, #000)", pointerEvents: "none" }} />
      </div>
    );
  }
  if (type === "drive") {
    const id = extractDriveId(url);
    if (!id) return null;
    return (
      <div style={{ borderRadius: 10, overflow: "hidden", marginTop: 10, background: "#000", aspectRatio: "16/9" }}>
        <iframe src={`https://drive.google.com/file/d/${id}/preview`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay" title="preview" />
      </div>
    );
  }
  return null;
}

function LessonEditor({ lesson, sectionId, onUpdate, onRemove, canRemove }) {
  const [videoMode, setVideoMode] = useState(lesson.video_type || "youtube");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef();
  const pdfRef = useRef();

  const update = (key, val) => onUpdate(sectionId, lesson.id, key, val);

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const ext = file.name.split(".").pop();
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      setUploadProgress(30);
      const { error } = await supabase.storage.from("course-videos").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      setUploadProgress(80);
      const { data: urlData } = supabase.storage.from("course-videos").getPublicUrl(path);
      update("video_url", urlData.publicUrl);
      update("video_type", "upload");
      setUploadProgress(100);
    } catch (err) {
      alert("خطأ في رفع الفيديو: " + err.message);
    }
    setUploading(false);
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    try {
      const path = `pdfs/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("course-pdfs").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("course-pdfs").getPublicUrl(path);
      update("pdf_url", urlData.publicUrl);
      update("pdf_name", file.name);
    } catch (err) {
      alert("خطأ في رفع الملف: " + err.message);
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 10, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#F8FAFC", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10 }}>
        <GripVertical size={15} color="#CBD5E1" style={{ cursor: "grab", flexShrink: 0 }} />
        <Video size={14} color="#64748B" style={{ flexShrink: 0 }} />
        <input value={lesson.title} onChange={e => update("title", e.target.value)} placeholder="عنوان المحاضرة..."
          style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#0F172A", outline: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F1F5F9", borderRadius: 7, padding: "4px 10px" }}>
          <input type="number" min="0" value={lesson.duration} onChange={e => update("duration", e.target.value)} placeholder="0"
            style={{ width: 40, border: "none", background: "transparent", fontFamily: "'Cairo', sans-serif", fontSize: 13, textAlign: "center", outline: "none", color: "#374151" }} />
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>دقيقة</span>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={lesson.is_free} onChange={e => update("is_free", e.target.checked)} style={{ width: 14, height: 14, cursor: "pointer" }} />
          مجاني
        </label>
        {canRemove && (
          <button onClick={() => onRemove(sectionId, lesson.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div style={{ padding: "14px 16px" }}>
        <textarea value={lesson.description || ""} onChange={e => update("description", e.target.value)} placeholder="وصف مختصر للمحاضرة..."
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#374151", outline: "none", resize: "none", minHeight: 60, direction: "rtl", marginBottom: 14, boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />

        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { id: "youtube", label: "يوتيوب" },
            { id: "drive",   label: "Google Drive" },
            { id: "upload",  label: "رفع فيديو" },
            { id: "direct",  label: "رابط مباشر" },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setVideoMode(tab.id); update("video_type", tab.id); update("video_url", ""); }}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid", borderColor: videoMode === tab.id ? "#2563EB" : "#E2E8F0", background: videoMode === tab.id ? "#EFF6FF" : "#fff", color: videoMode === tab.id ? "#1E40AF" : "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {(videoMode === "youtube" || videoMode === "drive") && (
          <div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={lesson.video_url || ""} onChange={e => update("video_url", e.target.value)}
                placeholder={videoMode === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://drive.google.com/file/d/..."}
                dir="ltr" style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "monospace", fontSize: 13, outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              {lesson.video_url && (
                <button onClick={() => setShowPreview(!showPreview)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#374151" }}>
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} {showPreview ? "إخفاء" : "معاينة"}
                </button>
              )}
            </div>
            {videoMode === "youtube" && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", margin: "5px 0 0" }}>سيُعرض بدون لوجو يوتيوب</p>}
            {videoMode === "drive" && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#94A3B8", margin: "5px 0 0" }}>تأكد إن المشاركة "أي شخص لديه الرابط"</p>}
            {showPreview && lesson.video_url && <VideoPreview url={lesson.video_url} type={videoMode} />}
          </div>
        )}

        {videoMode === "upload" && (
          <div>
            {!lesson.video_url ? (
              <div onClick={() => fileRef.current?.click()}
                style={{ border: "2px dashed #BFDBFE", borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: "#F8FAFC" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#EFF6FF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.background = "#F8FAFC"; }}>
                <Upload size={28} color="#2563EB" style={{ marginBottom: 8 }} />
                <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#1E40AF", margin: 0 }}>اضغط لرفع الفيديو</p>
                <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", margin: "4px 0 0" }}>MP4, MOV — حتى 2GB</p>
                <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleVideoUpload(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#DCFCE7", borderRadius: 10, border: "1px solid #BBF7D0" }}>
                <CheckCircle size={18} color="#10B981" />
                <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#065F46", flex: 1 }}>تم رفع الفيديو بنجاح</span>
                <button onClick={() => update("video_url", "")} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", display: "flex" }}><X size={14} /></button>
              </div>
            )}
            {uploading && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#64748B" }}>جاري الرفع...</span>
                  <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#2563EB", fontWeight: 700 }}>{uploadProgress}%</span>
                </div>
                <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#1E40AF,#2563EB)", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {videoMode === "direct" && (
          <input value={lesson.video_url || ""} onChange={e => update("video_url", e.target.value)}
            placeholder="https://example.com/video.mp4" dir="ltr"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontFamily: "monospace", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
        )}

        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              <File size={14} color="#64748B" /> مرفق PDF
            </span>
            {!lesson.pdf_url && (
              <button onClick={() => pdfRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "1px dashed #CBD5E1", background: "#FAFAFA", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontSize: 12, cursor: "pointer" }}>
                <Plus size={12} /> إضافة PDF
              </button>
            )}
            <input ref={pdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handlePdfUpload(e.target.files[0])} />
          </div>
          {lesson.pdf_url && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#FEF9C3", borderRadius: 8, border: "1px solid #FDE68A" }}>
              <File size={16} color="#D97706" />
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#92400E", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.pdf_name || "ملف PDF"}</span>
              <a href={lesson.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none", fontFamily: "'Cairo', sans-serif" }}>عرض</a>
              <button onClick={() => { update("pdf_url", ""); update("pdf_name", ""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", display: "flex" }}><X size={13} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((step, i) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: current > step.id ? "#10B981" : current === step.id ? "linear-gradient(135deg,#1E40AF,#2563EB)" : "#F1F5F9", color: current >= step.id ? "#fff" : "#94A3B8", fontWeight: 700, boxShadow: current === step.id ? "0 4px 14px rgba(37,99,235,0.35)" : "none" }}>
              {current > step.id ? <CheckCircle size={18} /> : step.icon}
            </div>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: current === step.id ? 700 : 500, color: current === step.id ? "#1E40AF" : current > step.id ? "#10B981" : "#94A3B8", whiteSpace: "nowrap" }}>{step.title}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: current > step.id ? "#10B981" : "#E2E8F0", margin: "0 8px", marginBottom: 22 }} />}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: "block", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", margin: "6px 0 0" }}>{hint}</p>}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#0F172A", outline: "none", direction: "rtl", background: "#fff", transition: "border-color 0.2s ease", boxSizing: "border-box" };

export default function CourseEditor() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    title: "", slug: "", description: "", category: "", level: "beginner",
    thumbnail_url: "", what_you_learn: ["", "", "", ""], price: "", is_free: false,
  });

  const [sections, setSections] = useState([{
    id: Date.now(), title: "الفصل الأول",
    lessons: [{ id: Date.now() + 1, title: "", description: "", duration: "", video_url: "", video_type: "youtube", is_free: false, pdf_url: "", pdf_name: "" }],
  }]);

  // جيب بيانات الدورة لو edit mode
  useEffect(() => {
    if (isEdit) fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("courses")
      .select(`*, sections(*, lessons(*))`)
      .eq("id", id)
      .single();

    if (data) {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        category: data.category || "",
        level: data.level || "beginner",
        thumbnail_url: data.thumbnail_url || "",
        what_you_learn: data.what_you_learn?.length ? data.what_you_learn : ["", "", "", ""],
        price: data.price || "",
        is_free: data.price === 0,
      });

      if (data.sections?.length > 0) {
        setSections(data.sections
          .sort((a, b) => a.order_num - b.order_num)
          .map(s => ({
            id: s.id,
            title: s.title,
            lessons: (s.lessons || [])
              .sort((a, b) => a.order_num - b.order_num)
              .map(l => ({
                id: l.id,
                title: l.title || "",
                description: l.description || "",
                duration: l.duration || "",
                video_url: l.video_url || "",
                video_type: l.video_type || "youtube",
                is_free: l.is_free || false,
                pdf_url: l.pdf_url || "",
                pdf_name: l.pdf_name || "",
              })),
          }))
        );
      }
    }
    setLoading(false);
  };

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const generateSlug = t => t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `thumbnails/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("course-thumbnails").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
      setField("thumbnail_url", data.publicUrl);
    } catch (err) {
      alert("خطأ في رفع الصورة: " + err.message);
    }
    setUploadingThumb(false);
  };

  const addSection = () => setSections(p => [...p, { id: Date.now(), title: `الفصل ${p.length + 1}`, lessons: [{ id: Date.now() + 1, title: "", description: "", duration: "", video_url: "", video_type: "youtube", is_free: false, pdf_url: "", pdf_name: "" }] }]);
  const removeSection = id => setSections(p => p.filter(s => s.id !== id));
  const updateSection = (id, title) => setSections(p => p.map(s => s.id === id ? { ...s, title } : s));
  const addLesson = sId => setSections(p => p.map(s => s.id === sId ? { ...s, lessons: [...s.lessons, { id: Date.now(), title: "", description: "", duration: "", video_url: "", video_type: "youtube", is_free: false, pdf_url: "", pdf_name: "" }] } : s));
  const removeLesson = (sId, lId) => setSections(p => p.map(s => s.id === sId ? { ...s, lessons: s.lessons.filter(l => l.id !== lId) } : s));
  const updateLesson = (sId, lId, key, val) => setSections(p => p.map(s => s.id === sId ? { ...s, lessons: s.lessons.map(l => l.id === lId ? { ...l, [key]: val } : l) } : s));

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.title.trim()) e.title = "العنوان مطلوب";
      if (!form.category) e.category = "التصنيف مطلوب";
      if (!form.description.trim()) e.description = "الوصف مطلوب";
    }
    if (step === 3 && !form.is_free && !form.price) e.price = "السعر مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(s => s + 1); };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    try {
      let courseId = id;

      if (isEdit) {
        // تعديل دورة موجودة
        await supabase.from("courses").update({
          title: form.title, slug, description: form.description,
          price: form.is_free ? 0 : Number(form.price),
          category: form.category,
          status: publish ? "pending" : "draft",
          thumbnail_url: form.thumbnail_url || null,
        }).eq("id", id);

        // حذف الفصول والدروس القديمة وإعادة إنشاءها
        await supabase.from("sections").delete().eq("course_id", id);
      } else {
        // إنشاء دورة جديدة
        const { data: course, error } = await supabase.from("courses").insert({
          title: form.title, slug, description: form.description,
          instructor_id: user.id,
          price: form.is_free ? 0 : Number(form.price),
          category: form.category,
          status: publish ? "pending" : "draft",
          thumbnail_url: form.thumbnail_url || null,
        }).select().single();
        if (error) throw error;
        courseId = course.id;
      }

      // إضافة الفصول والدروس
      for (let si = 0; si < sections.length; si++) {
        const s = sections[si];
        const { data: sec, error: secError } = await supabase.from("sections").insert({ course_id: courseId, title: s.title, order_num: si + 1 }).select().single();
        console.log("Section insert:", sec, secError);
        if (sec) {
          for (let li = 0; li < s.lessons.length; li++) {
            const l = s.lessons[li];
            console.log("Lesson title check:", l.title);
            if (l.title) {
              const { data: lessonData, error: lessonError } = await supabase.from("lessons").insert({
                section_id: sec.id, title: l.title, description: l.description || null,
                video_url: l.video_url || null, video_type: l.video_type || "youtube",
                pdf_url: l.pdf_url || null, pdf_name: l.pdf_name || null,
                duration: Number(l.duration) || 0, order_num: li + 1, is_free: l.is_free,
              }).select().single();
              console.log("Lesson insert result:", lessonData, lessonError);
            }
          }
        }
      }
      navigate("/instructor/courses");
    } catch (err) {
      alert("خطأ: " + err.message);
    }
    setSaving(false);
  };

  const totalLessons = sections.reduce((t, s) => t + s.lessons.length, 0);

  if (loading) return (
    <InstructorLayout active="courses">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </InstructorLayout>
  );

  return (
    <InstructorLayout active={isEdit ? "courses" : "new-course"}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, fontSize: 24, color: "#0F172A", margin: 0 }}>
            {isEdit ? "تعديل الدورة" : "إنشاء دورة جديدة"}
          </h1>
          <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B", margin: "4px 0 0" }}>أكمل الخطوات الثلاث لنشر دورتك</p>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: 32, boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19, color: "#0F172A", margin: "0 0 24px" }}>المعلومات الأساسية</h2>

              <FormField label="عنوان الدورة" required hint="اجعله واضحاً وجذاباً">
                <input style={{ ...inputStyle, borderColor: errors.title ? "#EF4444" : "#E2E8F0" }} value={form.title}
                  onChange={e => { setField("title", e.target.value); if (!isEdit) setField("slug", generateSlug(e.target.value)); }}
                  placeholder="مثال: اختبار القدرات الشامل — من الصفر إلى 95+"
                  onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = errors.title ? "#EF4444" : "#E2E8F0"} />
                {errors.title && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#EF4444", margin: "5px 0 0" }}>{errors.title}</p>}
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <FormField label="التصنيف" required>
                  <select style={{ ...inputStyle, borderColor: errors.category ? "#EF4444" : "#E2E8F0" }} value={form.category} onChange={e => setField("category", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}>
                    <option value="">اختر التصنيف</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="المستوى">
                  <select style={inputStyle} value={form.level} onChange={e => setField("level", e.target.value)} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}>
                    {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="وصف الدورة" required>
                <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical", borderColor: errors.description ? "#EF4444" : "#E2E8F0" }} value={form.description} onChange={e => setField("description", e.target.value)} placeholder="اشرح ما ستتعلمه ولماذا هذه الدورة مميزة..." onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = errors.description ? "#EF4444" : "#E2E8F0"} />
                {errors.description && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#EF4444", margin: "5px 0 0" }}>{errors.description}</p>}
              </FormField>

              <FormField label="ماذا سيتعلم الطلاب؟">
                {form.what_you_learn.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <CheckCircle size={16} color="#10B981" style={{ marginTop: 13, flexShrink: 0 }} />
                    <input style={inputStyle} value={item} onChange={e => { const a = [...form.what_you_learn]; a[i] = e.target.value; setField("what_you_learn", a); }} placeholder={`النقطة ${i + 1}...`} onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                  </div>
                ))}
                <button onClick={() => setField("what_you_learn", [...form.what_you_learn, ""])} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <Plus size={13} /> إضافة نقطة
                </button>
              </FormField>

              <FormField label="صورة الكورس">
                <div>
                  {form.thumbnail_url ? (
                    <div style={{ position: "relative", marginBottom: 10 }}>
                      <img src={form.thumbnail_url} alt="thumbnail" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 10, border: "1px solid #E2E8F0" }} />
                      <button onClick={() => setField("thumbnail_url", "")} style={{ position: "absolute", top: 8, left: 8, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => document.getElementById("thumbnail-upload").click()}
                      style={{ border: "2px dashed #BFDBFE", borderRadius: 10, padding: "32px 16px", textAlign: "center", cursor: "pointer", background: uploadingThumb ? "#EFF6FF" : "#F8FAFC" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#EFF6FF"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.background = "#F8FAFC"; }}>
                      <Upload size={32} color="#2563EB" style={{ marginBottom: 10 }} />
                      <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#1E40AF", margin: 0 }}>{uploadingThumb ? "جاري الرفع..." : "اضغط لرفع صورة الكورس"}</p>
                      <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8", margin: "4px 0 0" }}>JPG, PNG — يفضل 1280×720</p>
                    </div>
                  )}
                  <input id="thumbnail-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleThumbnailUpload(e.target.files[0])} />
                </div>
              </FormField>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19, color: "#0F172A", margin: 0 }}>المحتوى والفصول</h2>
                <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B", background: "#F1F5F9", padding: "4px 12px", borderRadius: 20 }}>{sections.length} فصل — {totalLessons} محاضرة</span>
              </div>
              {sections.map((section) => (
                <div key={section.id} style={{ background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0", marginBottom: 20, overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
                    <GripVertical size={16} color="#CBD5E1" />
                    <input value={section.title} onChange={e => updateSection(section.id, e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 15, color: "#0F172A", outline: "none" }} />
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#94A3B8" }}>{section.lessons.length} محاضرة</span>
                    {sections.length > 1 && (
                      <button onClick={() => removeSection(section.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    {section.lessons.map(lesson => (
                      <LessonEditor key={lesson.id} lesson={lesson} sectionId={section.id} onUpdate={updateLesson} onRemove={removeLesson} canRemove={section.lessons.length > 1} />
                    ))}
                    <button onClick={() => addLesson(section.id)}
                      style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1.5px dashed #CBD5E1", background: "transparent", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#1E40AF"; e.currentTarget.style.background = "#EFF6FF"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#64748B"; e.currentTarget.style.background = "transparent"; }}>
                      <Plus size={14} /> إضافة محاضرة
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addSection}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px dashed #BFDBFE", background: "#EFF6FF", color: "#2563EB", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}>
                <Plus size={16} /> إضافة فصل جديد
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19, color: "#0F172A", margin: "0 0 24px" }}>التسعير والنشر</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                {[
                  { val: false, label: "دورة مدفوعة", icon: <DollarSign size={22} />, desc: "حدد سعراً للدورة", color: "#2563EB" },
                  { val: true,  label: "دورة مجانية", icon: <Globe size={22} />,     desc: "متاحة للجميع",   color: "#10B981" },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setField("is_free", opt.val)}
                    style={{ padding: 20, borderRadius: 14, border: `2px solid ${form.is_free === opt.val ? opt.color : "#E2E8F0"}`, background: form.is_free === opt.val ? `${opt.color}08` : "#fff", cursor: "pointer", textAlign: "right", transition: "all 0.2s" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${opt.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: opt.color, marginBottom: 12 }}>{opt.icon}</div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#64748B" }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {!form.is_free && (
                <FormField label="السعر (ريال سعودي)" required>
                  <div style={{ position: "relative" }}>
                    <input type="number" min="0" style={{ ...inputStyle, paddingLeft: 60, borderColor: errors.price ? "#EF4444" : "#E2E8F0" }} value={form.price} onChange={e => setField("price", e.target.value)} placeholder="149" dir="ltr" onFocus={e => e.target.style.borderColor = "#2563EB"} onBlur={e => e.target.style.borderColor = errors.price ? "#EF4444" : "#E2E8F0"} />
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, color: "#94A3B8" }}>ريال</span>
                  </div>
                  {errors.price && <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 12, color: "#EF4444", margin: "5px 0 0" }}>{errors.price}</p>}
                </FormField>
              )}
              <div style={{ background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0", padding: 20, marginTop: 16 }}>
                <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: "0 0 16px" }}>ملخص الدورة</h3>
                {[
                  { label: "العنوان", value: form.title || "—" },
                  { label: "التصنيف", value: form.category || "—" },
                  { label: "عدد الفصول", value: `${sections.length} فصل` },
                  { label: "عدد المحاضرات", value: `${totalLessons} محاضرة` },
                  { label: "السعر", value: form.is_free ? "مجاني" : `${form.price || 0} ريال` },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, color: "#64748B" }}>{item.label}</span>
                    <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FEF9C3", borderRadius: 10, padding: "12px 16px", marginTop: 16, display: "flex", gap: 10 }}>
                <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, color: "#92400E", margin: 0, lineHeight: 1.6 }}>عند النشر ستخضع الدورة لمراجعة الأدمن قبل ظهورها للطلاب.</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <button onClick={() => navigate("/instructor/courses")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>إلغاء</button>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <ChevronRight size={16} /> السابق
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                التالي <ChevronLeft size={16} />
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: "#374151", fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <Save size={15} /> حفظ مسودة
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1E40AF,#2563EB)", color: "#fff", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "نشر الدورة"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; } select { appearance: none; } @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </InstructorLayout>
  );
}