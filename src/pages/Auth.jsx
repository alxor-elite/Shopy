import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
      const { error: signUpError } = await signUp(form.email, form.password, form.name)
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSignupSuccess(true)
      }
    } else {
      const { error: signInError } = await signIn(form.email, form.password)
      if (signInError) {
        setError(signInError.message)
      } else {
        navigate('/account')
      }
    }
    setLoading(false)
  }

  if (signupSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass-strong p-10 max-w-md w-full text-center" style={{ borderRadius: 24 }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display text-2xl mb-2">Account Created!</h2>
          <p className="text-[#6B6663] text-sm mb-6">Check your email to confirm your account, then sign in.</p>
          <button onClick={() => { setMode('login'); setSignupSuccess(false); setForm({ name: '', email: '', password: '', confirmPassword: '' }) }}
            className="bg-[#1C1B1A] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#333] tr" style={{ borderRadius: 12 }}>
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="glass-strong p-8 md:p-10 max-w-md w-full" style={{ borderRadius: 24 }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[#1C1B1A] mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#6B6663] text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'Join SHOPY Street today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                className="w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"
                style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
            </div>
          )}

          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required
              className="w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required
              className="w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required
                className="w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"
                style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5" style={{ borderRadius: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1C1B1A] text-white py-3 text-[14px] font-semibold hover:bg-[#333] tr disabled:opacity-50"
            style={{ borderRadius: 12 }}>
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <p className="text-[13px] text-[#6B6663]">
              Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError('') }} className="text-[#1C1B1A] font-semibold hover:underline">
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-[13px] text-[#6B6663]">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-[#1C1B1A] font-semibold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-[12px] text-[#6B6663] hover:text-[#1C1B1A] tr">
            &larr; Back to shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
