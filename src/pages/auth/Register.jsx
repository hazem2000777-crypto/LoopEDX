import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { sendWelcomeEmail, sendVerificationEmail, notifyAdminsNewStudent, notifyAdminsNewInstructor } from '../../lib/brevo'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logo, setLogo] = useState({ url: '', text: 'LoopEDX' })
  const [logoLoaded, setLogoLoaded] = useState(false)

  useEffect(() => { fetchLogo() }, [])

  const fetchLogo = async () => {
    try {
      const { data: headerData } = await supabase
        .from('header_settings')
        .select('logo_url, logo_text')
        .limit(1)
        .single()
      const { data: siteLogoData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_logo')
        .single()
      setLogo({
        url: headerData?.logo_url || siteLogoData?.value || '',
        text: headerData?.logo_text || 'LoopEDX',
      })
    } catch {
    } finally {
      setLogoLoaded(true)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // ✅ بعت إيميل ترحيب من Brevo
    await sendWelcomeEmail({ email, name, role })

    // ✅ بعت إشعار للأدمن
    if (role === 'instructor') {
      await notifyAdminsNewInstructor({
        supabase,
        instructorName: name,
        instructorEmail: email,
        registeredAt: new Date().toISOString(),
      })
    } else {
      await notifyAdminsNewStudent({
        supabase,
        studentName: name,
        studentEmail: email,
        registeredAt: new Date().toISOString(),
      })
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (role === 'instructor') navigate('/instructor/complete-profile')
    else navigate('/student/dashboard')
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E2E8F0', borderRadius: '8px',
    fontSize: '14px', fontFamily: 'Cairo, Arial',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cairo, Arial', direction: 'rtl', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', visibility: logoLoaded ? 'visible' : 'hidden' }}>
            {logo.url ? (
              <img src={logo.url} alt={logo.text} style={{ height: 56, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
            ) : (
              <>
                <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>🎓</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>
                  {logo.text.slice(0, -3)}<span style={{ color: '#2563EB' }}>{logo.text.slice(-3)}</span>
                </div>
              </>
            )}
          </Link>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>أنشئ حسابك وابدأ رحلتك التعليمية</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '24px' }}>إنشاء حساب جديد</h2>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '13px', marginBottom: '20px' }}>{error}</div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>أنا...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'student', emoji: '🎒', label: 'طالب', desc: 'أريد التعلم' },
                { value: 'instructor', emoji: '👨‍🏫', label: 'معلم', desc: 'أريد التدريس' },
              ].map(r => (
                <div key={r.value} onClick={() => setRole(r.value)} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: `2px solid ${role === r.value ? '#2563EB' : '#E2E8F0'}`, background: role === r.value ? '#EFF6FF' : 'white', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: role === r.value ? '#1E40AF' : '#374151' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>الاسم الكامل</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>على الأقل 6 أحرف</p>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1E40AF, #2563EB)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', fontFamily: 'Cairo, Arial', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(30,64,175,0.3)' }}>
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748B' }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register