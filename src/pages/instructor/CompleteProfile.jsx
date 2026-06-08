import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

function CompleteProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [form, setForm] = useState({
    phone: '',
    bio: '',
    years_experience: '',
    teaching_locations: '',
    previous_platforms: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleAvatar(e) {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function uploadFile(file, folder) {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${user.id}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }
    setLoading(true)
    setError('')

    try {
      const updateData = {
        phone: form.phone,
        bio: form.bio,
        years_experience: parseInt(form.years_experience) || 0,
        teaching_locations: form.teaching_locations,
        previous_platforms: form.previous_platforms,
        role: 'instructor',
        is_approved: false,
      }

      if (avatarFile) {
        updateData.avatar_url = await uploadFile(avatarFile, 'avatars')
      }

      if (cvFile) {
        updateData.cv_url = await uploadFile(cvFile, 'cvs')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)

    } catch (err) {
      setError('حدث خطأ: ' + err.message)
    }

    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E2E8F0', borderRadius: '8px',
    fontSize: '14px', fontFamily: 'Cairo, Arial',
    outline: 'none', boxSizing: 'border-box', background: 'white',
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#374151', marginBottom: '6px',
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, Arial' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748B', marginBottom: '16px' }}>يجب تسجيل الدخول أولاً</p>
          <a href="/login" style={{ color: '#2563EB', fontWeight: '700' }}>تسجيل الدخول</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Cairo, Arial', direction: 'rtl',
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '48px',
          textAlign: 'center', maxWidth: '440px', width: '100%',
          border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '12px' }}>
            تم إرسال طلبك بنجاح!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.8, marginBottom: '28px' }}>
            سيقوم فريق Loop-EDX بمراجعة بياناتك وتفعيل حسابك خلال 24-48 ساعة.
          </p>
          <div style={{
            background: '#EFF6FF', border: '1px solid #DBEAFE',
            borderRadius: '10px', padding: '16px', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '600' }}>
              📧 تحقق من بريدك الإلكتروني بانتظام
            </p>
          </div>
          <button onClick={() => navigate('/instructor/dashboard')} style={{
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '15px', fontWeight: '700', fontFamily: 'Cairo, Arial', cursor: 'pointer',
          }}>الذهاب للوحة التحكم</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      fontFamily: 'Cairo, Arial', direction: 'rtl', padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👨‍🏫</div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
            أكمل بروفايلك كمعلم
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            سيتم مراجعة بياناتك من فريق Loop-EDX قبل تفعيل حسابك
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #E2E8F0', padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '12px 16px',
              color: '#DC2626', fontSize: '13px', marginBottom: '20px',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Avatar */}
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <div
                onClick={() => document.getElementById('avatarInput').click()}
                style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: '#EFF6FF', border: '3px dashed #DBEAFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', overflow: 'hidden', cursor: 'pointer',
                }}>
                {avatarPreview
                  ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                  : <span style={{ fontSize: '32px' }}>📷</span>
                }
              </div>
              <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
              <button type="button"
                onClick={() => document.getElementById('avatarInput').click()}
                style={{
                  background: 'none', border: '1px solid #DBEAFE', borderRadius: '6px',
                  padding: '6px 16px', color: '#2563EB', fontSize: '13px',
                  fontWeight: '600', fontFamily: 'Cairo, Arial', cursor: 'pointer',
                }}>
                {avatarPreview ? 'تغيير الصورة' : 'رفع صورة شخصية'}
              </button>
            </div>

            {/* Phone + Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>رقم الهاتف</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="05xxxxxxxx" required
                  style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label style={labelStyle}>سنوات الخبرة</label>
                <input type="number" name="years_experience" value={form.years_experience}
                  onChange={handleChange} placeholder="5" required min="0" max="50"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>نبذة عنك</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} required
                placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك التعليمية..." rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>

            {/* Teaching Locations */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>أماكن التدريس السابقة</label>
              <input type="text" name="teaching_locations" value={form.teaching_locations}
                onChange={handleChange} placeholder="مثال: مدرسة الرياض الدولية، معهد القدرات..."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>

            {/* Previous Platforms */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>هل لديك خبرة في منصات أونلاين؟</label>
              <input type="text" name="previous_platforms" value={form.previous_platforms}
                onChange={handleChange} placeholder="مثال: يوديمي، كورسيرا... أو لا يوجد"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>

            {/* CV Upload */}
            <div style={{
              marginBottom: '28px', padding: '20px',
              border: '2px dashed #DBEAFE', borderRadius: '10px',
              background: '#F8FAFC', textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                رفع السيرة الذاتية (CV)
              </p>
              <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                PDF أو Word — حجم أقصى 5MB
              </p>
              <input id="cvInput" type="file" accept=".pdf,.doc,.docx"
                onChange={e => setCvFile(e.target.files[0])} style={{ display: 'none' }} />
              <button type="button"
                onClick={() => document.getElementById('cvInput').click()}
                style={{
                  background: 'white', border: '1.5px solid #DBEAFE', borderRadius: '8px',
                  padding: '8px 20px', color: '#2563EB', fontSize: '13px',
                  fontWeight: '600', fontFamily: 'Cairo, Arial', cursor: 'pointer',
                }}>
                {cvFile ? `✅ ${cvFile.name}` : 'اختر الملف'}
              </button>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1E40AF, #2563EB)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: '700', fontFamily: 'Cairo, Arial',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(30,64,175,0.3)',
            }}>
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب للمراجعة ←'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfile