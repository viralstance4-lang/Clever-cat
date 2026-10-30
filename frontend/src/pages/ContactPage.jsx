import { useState } from 'react'
import { Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import Doodles from '../components/ui/Doodles'

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Could not send message. Please try calling us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-forest-900 py-14 px-4 text-center">
        <Doodles items={[
          { icon: 'plane', className: 'top-6 left-[12%]', size: 18, delay: '0s', tone: 'white' },
          { icon: 'star', className: 'top-8 right-[14%]', size: 16, delay: '0.5s' },
          { icon: 'heart', className: 'bottom-6 left-[20%]', size: 14, delay: '0.9s' },
          { icon: 'sparkles', className: 'bottom-5 right-[10%]', size: 16, delay: '1.3s', tone: 'white' },
        ]} />
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>Get in Touch</h1>
        <p className="text-forest-300">We're here to help with your order or any questions</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Contact info */}
          <div className="space-y-6">
            <div className="card p-5 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-forest-800" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-900 mb-1">Call / WhatsApp</h3>
                <a href="tel:+919218171625" className="text-forest-600 hover:text-forest-800 text-sm block">+91 92181 71625</a>
                <p className="text-xs text-forest-400 mt-1">Mon–Sat, 10 AM – 7 PM</p>
              </div>
            </div>
            <div className="card p-5 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-900 mb-1">Email Us</h3>
                <a href="mailto:coordination@theclevercat.in" className="text-forest-600 hover:text-forest-800 text-sm block">coordination@theclevercat.in</a>
                <p className="text-xs text-forest-400 mt-1">Response within 24 hours</p>
              </div>
            </div>
            <div className="card p-5 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-900 mb-1">Business Hours</h3>
                <p className="text-forest-600 text-sm">Monday – Saturday</p>
                <p className="text-forest-600 text-sm">10:00 AM – 7:00 PM IST</p>
              </div>
            </div>
            <div className="card p-5 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-900 mb-1">WhatsApp Chat</h3>
                <a href="https://wa.me/919218171625" target="_blank" rel="noreferrer"
                  className="text-forest-600 hover:text-green-600 text-sm">Chat with us on WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="font-serif text-2xl font-bold text-forest-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-forest-700 text-sm font-medium mb-2">Your Name *</label>
                    <input type="text" required className="input" placeholder="Full name" value={form.name} onChange={set('name')} />
                  </div>
                  <div>
                    <label className="block text-forest-700 text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" className="input" placeholder="+91 9999999999" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
                <div>
                  <label className="block text-forest-700 text-sm font-medium mb-2">Email Address *</label>
                  <input type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="block text-forest-700 text-sm font-medium mb-2">Subject</label>
                  <select className="input" value={form.subject} onChange={set('subject')}>
                    <option value="">Select a topic</option>
                    <option>Order related query</option>
                    <option>Product information</option>
                    <option>Return / Refund request</option>
                    <option>Bulk / Wholesale inquiry</option>
                    <option>General query</option>
                  </select>
                </div>
                <div>
                  <label className="block text-forest-700 text-sm font-medium mb-2">Message *</label>
                  <textarea required rows={5} className="input resize-none" placeholder="Describe your query in detail..."
                    value={form.message} onChange={set('message')} />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-4 text-base">
                  {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
