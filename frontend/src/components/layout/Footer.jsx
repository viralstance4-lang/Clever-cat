import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Heart, Star, BookOpen, PenLine, Send } from 'lucide-react'
import api from '../../api'
import { VisaIcon, MastercardIcon, UpiIcon, RazorpayIcon, CodIcon } from '../ui/PaymentIcons'

const InstagramIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>

export default function Footer() {
  const [policies, setPolicies] = useState([])

  useEffect(() => {
    api.get('/policies')
      .then(({ data }) => setPolicies(data.policies || []))
      .catch(() => setPolicies([]))
  }, [])

  return (
    <footer className="relative bg-forest-900 text-white/80 pt-8 md:pt-12">
      {/* Wavy top edge — same color as the footer, so it reads as the footer's own wavy top boundary */}
      <svg className="absolute top-0 left-0 w-full h-14 md:h-24 text-forest-900 -translate-y-full block" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="currentColor">
        <path d="M0,60 C240,110 480,10 720,55 C960,100 1200,10 1440,60 L1440,120 L0,120 Z" />
      </svg>

      {/* Decorative doodle icons — playful accents scattered across the footer */}
      <Heart size={22} className="hidden sm:block absolute top-6 left-4 lg:left-8 text-white/15 animate-twinkle" />
      <Star size={16} className="absolute top-10 left-[38%] text-gold-accent/40 fill-gold-accent/40 animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <BookOpen size={26} className="hidden md:block absolute top-8 right-8 lg:right-16 text-white/15 animate-twinkle" style={{ animationDelay: '0.9s' }} />
      <PenLine size={18} className="hidden sm:block absolute bottom-24 left-[12%] text-white/10 animate-twinkle" style={{ animationDelay: '1.4s' }} />
      <Send size={18} className="absolute bottom-28 right-[8%] text-gold-accent/30 animate-twinkle" style={{ animationDelay: '0.2s' }} />

      <div className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src="/logo-white.png" alt="Clever Cat" className="h-28 w-28 object-contain" />
          </div>
          <p className="text-sm leading-relaxed text-white/70 mb-5">
            Beautifully designed children's books, activity books, puzzles and learning products that spark creativity and learning.
          </p>
          <div className="flex gap-3">
            {/* TODO: replace with Clever Cat's real social links */}
            {[
              { icon: <InstagramIcon />, href: '#' },
              { icon: <FacebookIcon />, href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-gold-accent hover:text-gold-accent transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-5 font-serif text-lg">Quick Links</h4>
          <ul className="space-y-3">
            {[
              { to: '/shop', label: 'Shop All Products' },
              { to: '/about', label: 'About Us' },
              { to: '/blog', label: 'Blog' },
              { to: '/contact', label: 'Contact Us' },
            ].map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm hover:text-gold-accent transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white font-semibold mb-5 font-serif text-lg">Policies</h4>
          <ul className="space-y-3">
            {policies.map(p => (
              <li key={p.slug}>
                <Link to={`/policy/${p.slug}`} className="text-sm hover:text-gold-accent transition-colors">{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-5 font-serif text-lg">Get in Touch</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-gold-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 mb-0.5">Call / WhatsApp</p>
                <a href="tel:+919876543210" className="text-sm hover:text-gold-accent">+91 98765 43210</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-gold-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 mb-0.5">Email</p>
                <a href="mailto:clevercat@gmail.com" className="text-sm hover:text-gold-accent">clevercat@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gold-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 mb-0.5">Delivery</p>
                <p className="text-sm">Pan India — 3 to 5 Business Days</p>
              </div>
            </div>
          </div>

          {/* Payment icons */}
          <div className="mt-6">
            <p className="text-xs text-white/50 mb-3">Secure Payment</p>
            <div className="flex flex-wrap gap-2">
              {[<UpiIcon key="upi" />, <VisaIcon key="visa" />, <MastercardIcon key="mc" />, <RazorpayIcon key="rzp" />, <CodIcon key="cod" />].map((icon, i) => (
                <div key={i} className="rounded-md overflow-hidden border border-white/15 leading-none">
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 px-4 text-center">
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} Clever Cat. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
