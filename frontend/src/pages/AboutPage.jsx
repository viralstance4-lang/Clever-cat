import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Doodles from '../components/ui/Doodles'

const VALUES = [
  { icon: '📚', title: 'Curated, Not Copied',   desc: 'Every book and activity kit is hand-picked and age-tagged — nothing added just to pad the catalogue.' },
  { icon: '🎨', title: 'Built to Last',          desc: 'Sturdy pages, safe materials, and colours that survive real play, not just a photo shoot.' },
  { icon: '🌟', title: 'Age-Appropriate',        desc: 'From board books for toddlers to brain-boosters for tweens — everything is sorted by the age it suits.' },
  { icon: '💛', title: 'Parents First',          desc: 'Clear age labels, honest descriptions, and a support team that actually answers.' },
]

const TEAM = [
  { name: 'Aditi Rao', role: 'Founder & Curator', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
  { name: 'Rohan Mehta', role: 'Head of Product Selection', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-forest-900 py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1512253022256-7999e0e73a37?w=1200')] bg-cover bg-center" />
        <Doodles items={[
          { icon: 'star', className: 'top-8 left-[8%]', size: 20, delay: '0s', tone: 'white' },
          { icon: 'sparkles', className: 'top-14 right-[10%]', size: 16, delay: '0.5s' },
          { icon: 'book', className: 'bottom-10 left-[16%]', size: 22, delay: '0.9s', tone: 'white' },
          { icon: 'heart', className: 'bottom-8 right-[18%]', size: 16, delay: '1.3s' },
        ]} />
        <div className="relative">
          <span className="badge-gold mb-4 inline-block">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>
            Big Ideas for<br />Little Minds
          </h1>
          <p className="text-forest-300 max-w-2xl mx-auto text-lg">
            Clever Cat was founded with one mission — to make beautifully designed books and learning products easy for every parent to find and trust.
          </p>
        </div>
      </div>

      {/* Our story */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-green mb-4 inline-block">The Beginning</span>
            <h2 className="section-title mb-5">Why We Started Clever Cat</h2>
            <div className="space-y-4 text-forest-600 leading-relaxed">
              <p>Clever Cat started with a simple frustration — shopping for children's books online meant scrolling through hundreds of listings with no real way to tell what suited a 3-year-old versus an 8-year-old.</p>
              <p>We set out to build a store where every product is chosen deliberately, tagged by age, and organised the way a parent actually shops — not just an endless catalogue.</p>
              <p>Today, Clever Cat brings together story books, activity books, puzzles, flash cards and craft kits — all in one colourful, easy-to-browse place.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600" alt="Children reading" className="rounded-2xl w-full h-80 object-cover" />
            <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600" alt="Storybook collection" className="rounded-2xl w-full h-80 object-cover mt-6" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest-900 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '500+',  label: 'Books & Products' },
            { num: '4.8★',  label: 'Average Rating' },
            { num: '6',     label: 'Age Groups Covered' },
            { num: '100%',  label: 'Original Products' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-gold-accent mb-1" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>{s.num}</p>
              <p className="text-forest-300 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge-gold mb-3 inline-block">Our Values</span>
          <h2 className="section-title">What We Stand For</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(v => (
            <div key={v.title} className="card p-6 text-center">
              <div className="text-4xl mb-4">{v.icon}</div>
              <h3 className="font-semibold text-forest-900 mb-2">{v.title}</h3>
              <p className="text-forest-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How we pick products */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="badge-green mb-3 inline-block">Our Process</span>
          <h2 className="section-title">How a Product Makes the Cut</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Age-Appropriate', desc: 'We only list products with a clear, honest age recommendation' },
            { step: '02', title: 'Quality Check', desc: 'Materials, print quality and durability are checked before listing' },
            { step: '03', title: 'Parent Reviewed', desc: 'Where possible, products are tried and reviewed by real parents' },
            { step: '04', title: 'Gift-Ready', desc: 'Every order can be gift-wrapped at checkout for a small fee' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold"
                style={{ background: 'linear-gradient(135deg,#4F29A3,#1D1538)' }}>
                {s.step}
              </div>
              <h4 className="font-semibold text-forest-900 mb-2 text-sm">{s.title}</h4>
              <p className="text-forest-500 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <span className="badge-gold mb-3 inline-block">Meet the Team</span>
        <h2 className="section-title mb-10">The People Behind Clever Cat</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {TEAM.map(m => (
            <div key={m.name} className="text-center">
              <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-forest-100" />
              <p className="font-semibold text-forest-900">{m.name}</p>
              <p className="text-forest-500 text-sm">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-forest-900 text-center">
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>
          Ready to Explore Clever Cat?
        </h2>
        <p className="text-forest-300 mb-8 max-w-lg mx-auto">Browse books, puzzles and activity kits chosen for every age and stage</p>
        <Link to="/shop" className="btn-gold text-base px-8 py-4">
          Shop Now <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
