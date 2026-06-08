import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') navigate('/admin')
    else if (profile?.role === 'instructor') navigate('/instructor/dashboard')
    else navigate('/student/dashboard')
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
              <img
                src={logo.url}
                alt={logo.text}
                style={{ height: 56, objectFit: 'contain', margin: '0 auto 12px', display: 'block' }}
              />
            ) : (
              <>
                <div style={{
                  width: '52px', height: '52px',
                  background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  borderRadius: '14px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px',
                }}>🎓</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>
                  {logo.text.slice(0, -3)}<span style={{ color: '#2563EB' }}>{logo.text.slice(-3)}</span>
                </div>
              </>
            )}
          </Link>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>
            أهلاً بعودتك! سجّل دخولك للمتابعة
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #E2E8F0', padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '24px' }}>
            تسجيل الدخول
          </h2>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '12px 16px',
              color: '#DC2626', fontSize: '13px', marginBottom: '20px',
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                البريد الإلكتروني
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com" required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #E2E8F0', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'Cairo, Arial',
                  outline: 'none', direction: 'ltr', textAlign: 'left',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none' }}>
                  نسيت كلمة المرور؟
                </Link>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  كلمة المرور
                </label>
              </div>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #E2E8F0', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'Cairo, Arial',
                  outline: 'none', direction: 'ltr', textAlign: 'left',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1E40AF, #2563EB)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '700', fontFamily: 'Cairo, Arial',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(30,64,175,0.3)',
            }}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748B' }}>
            ليس لديك حساب؟{' '}
            <Link to="/register" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login