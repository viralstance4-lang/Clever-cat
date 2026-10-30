import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Doodles from '../components/ui/Doodles'
import { cldOptimize } from '../utils/cloudinary'

const VALUES = [
  { iconImg: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790766943/clevercat/media/j5hvocgmmoyn706hbhfc.png', title: 'Curiosity',   desc: 'We create products that inspire children to explore, discover and ask questions.' },
  { iconImg: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790767181/clevercat/media/ahojzkyjvqgvh0kgzc99.png', title: 'Creativity',  desc: 'We bring imagination and originality to everything we create.' },
  { iconImg: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790767181/clevercat/media/zu3dimc6awxg2x1w4hey.png', title: 'Quality',     desc: 'We strive for high standards in every book and product we create.' },
  { iconImg: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790767369/clevercat/media/kyqeltg8jhhldrt0vox7.png', title: 'Innovation',  desc: 'We continuously explore better ideas, formats and ways to engage young learners.' },
]

const TEAM = [
  { name: 'Dilpreet Batra', role: 'Founder and Curator', img: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790582008/clevercat/media/wofwzybnryfirc4bbhxn.webp' },
  { name: 'Prabhdit Batra', role: 'Managing Director', img: 'https://res.cloudinary.com/eob3oguc/image/upload/v1790582008/clevercat/media/jkduildtcwvirfadgj3l.webp' },
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
           From printing stories to creating our own.
          </h1>
          <p className="text-forest-300 max-w-2xl mx-auto text-lg">
            To create and bring international-quality books and learning products to children across India.
          </p>
        </div>
      </div>

      {/* Our story */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-green mb-4 inline-block">About Us</span>
            <h2 className="section-title mb-5">Born from experience. Created for India.</h2>
            <div className="space-y-4 text-forest-600 leading-relaxed">
              <p>Established in 1955, Batra Art Press has grown over seven decades into a diverse print and publishing business with expertise across the print ecosystem.</p>
              <p className="font-semibold text-forest-900">Our International Experience</p>
              <p>For more than a decade, we have been creating children's books and content for international markets.</p>
              <p>Our children's titles have reached 30+ countries, with a portfolio of 1,000+ titles sold internationally. Some of our best-selling titles have sold over 100,000 copies, giving us first-hand experience of creating products for different markets and audiences.</p>
            </div>
          </div>
          <div>
            <img src={cldOptimize('https://res.cloudinary.com/eob3oguc/image/upload/v1791184254/clevercat/media/solshj5qmuoj84rws6k2.png', 700)} alt="Clever Cat with children" loading="lazy" className="rounded-2xl w-full h-auto object-contain" />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-4 bg-forest-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img src={cldOptimize('https://res.cloudinary.com/eob3oguc/image/upload/v1790582008/clevercat/media/wofwzybnryfirc4bbhxn.webp', 700)} alt="Dilpreet Batra, Founder and Curator" loading="lazy" className="rounded-2xl w-full h-96 object-cover object-top" />
          <div>
            <span className="badge-green mb-4 inline-block">The Vision</span>
            <h2 className="section-title mb-5">The Vision Behind Clever Cat</h2>
            <div className="space-y-4 text-forest-600 leading-relaxed">
              <p>Clever Cat is conceived and led by Dilpreet Batra, Founder and Curator, whose publishing experience and understanding of international children's markets shape the vision behind the brand.</p>
              <p>At Clever Cat, we envision learning experiences that nurture curiosity, allow creativity to flourish and build confidence in every child.</p>
              <p>At the heart of Clever Cat is a simple belief: <strong>every child is clever in their own way.</strong> Each child has individual interests, ideas and ways of making sense of the world. We believe children's learning products should celebrate these differences, giving every child the freedom to explore, create and learn in their own way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center">
        <span className="badge-gold mb-3 inline-block">Our Expertise</span>
        <h2 className="section-title mb-6">A Rare Combination</h2>
        <div className="space-y-4 text-forest-600 leading-relaxed">
          <p>What makes Clever Cat unique is the combination of print expertise and creative expertise.</p>
          <p>Decades of experience in print and publishing give us deep knowledge of formats, materials and production techniques, while our team knows how to develop great content and design and bring innovative ideas to life on the page.</p>
          <p>Understanding not only how to develop great content and design, but also how to bring innovative ideas to life through print, formats, materials and production techniques — that combination is what sets us apart.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-10 max-w-2xl mx-auto">
          <video src="https://res.cloudinary.com/eob3oguc/video/upload/v1791188085/clevercat/media/wfq1kabpbhkec5bywcle.mp4"
            className="w-full rounded-2xl" controls autoPlay muted loop playsInline />
          <video src="https://res.cloudinary.com/eob3oguc/video/upload/v1791188092/clevercat/media/anw2hivdjttoeyafhfby.mp4"
            className="w-full rounded-2xl" controls autoPlay muted loop playsInline />
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 bg-forest-50 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="badge-gold mb-4 inline-block">What Drives Us</span>
          <h2 className="section-title mb-5">Our Mission</h2>
          <div className="space-y-4 text-forest-600 leading-relaxed">
            <p>To bring thoughtfully curated, international-quality children's learning products to children across India.</p>
            <p>We believe every child deserves access to exceptional learning experiences through products that inspire exploration, nurture imagination and make discovery a joy.</p>
          </div>
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
              <div className="mb-4 flex justify-center">
                {v.iconImg ? <img src={cldOptimize(v.iconImg, 128)} alt={v.title} loading="lazy" className="w-16 h-16 object-contain" /> : <span className="text-4xl">{v.icon}</span>}
              </div>
              <h3 className="font-semibold text-forest-900 mb-2">{v.title}</h3>
              <p className="text-forest-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest-900 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '1000+',  label: 'Books & Products' },
            { num: '4.8★',  label: 'Average Rating' },
            { num: '0-10',     label: 'Age Groups Covered' },
            { num: '100%',  label: 'Original Products' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-gold-accent mb-1" style={{ fontFamily: "'PP Pangram Sans Rounded',sans-serif" }}>{s.num}</p>
              <p className="text-forest-300 text-sm">{s.label}</p>
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
              <img src={cldOptimize(m.img, 320)} alt={m.name} loading="lazy" className="w-64 h-64 rounded-full object-cover object-top mx-auto mb-4 border-4 border-forest-100" />
              <p className="font-semibold text-forest-900">{m.name}</p>
              <p className="text-forest-500 text-sm">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Looking Ahead */}
      <section className="py-16 px-4 bg-forest-50 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="badge-green mb-4 inline-block">Looking Ahead</span>
          <h2 className="section-title mb-5">Beyond Books</h2>
          <div className="space-y-4 text-forest-600 leading-relaxed">
            <p>Clever Cat is growing beyond books into a wider world of children's products and experiences.</p>
            <p>Our journey is about continually discovering new ideas, creating better products and bringing international-quality children's content to more families across India.</p>
          </div>
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
