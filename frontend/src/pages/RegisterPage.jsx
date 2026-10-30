import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import api from '../api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import Doodles from '../components/ui/Doodles'

export default function RegisterPage() {
  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.user, data.token)
      toast.success(`Welcome to Clever Cat, ${data.user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg,#FCF8F0,#D5C8EA)' }}>
      <Doodles items={[
        { icon: 'pencil', className: 'top-[12%] left-[10%]', size: 18, delay: '0.2s' },
        { icon: 'star', className: 'top-[18%] right-[10%]', size: 18, delay: '0.7s' },
        { icon: 'heart', className: 'bottom-[18%] left-[8%]', size: 16, delay: '1.1s' },
        { icon: 'book', className: 'bottom-[14%] right-[12%]', size: 22, delay: '0.4s' },
      ]} />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <img src="/logo.png" alt="Clever Cat" className="h-20 w-20 object-contain mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-forest-900" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>Create Account</h1>
          <p className="text-forest-500 text-sm mt-1">Join Clever Cat for exclusive wellness benefits</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-forest-800 font-medium text-sm mb-2">Full Name</label>
              <input type="text" required placeholder="Your full name"
                className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-forest-800 font-medium text-sm mb-2">Email Address</label>
              <input type="email" required placeholder="you@example.com"
                className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="block text-forest-800 font-medium text-sm mb-2">Phone Number <span className="text-forest-400">(optional)</span></label>
              <input type="tel" placeholder="+91 9999999999"
                className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="block text-forest-800 font-medium text-sm mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required placeholder="Min 6 characters"
                  className="input pr-12" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-3.5 text-forest-400 hover:text-forest-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-4 text-base">
              {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-forest-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-forest-800 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-forest-400 mt-6">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline">Terms</Link> and{' '}
          <Link to="/privacy-policy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
