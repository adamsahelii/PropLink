import Navbar           from '../components/Navbar'
import Hero             from '../components/Hero'
import SearchBar        from '../components/SearchBar'
import PropertyCarousel from '../components/PropertyCarousel'
import WhyPropLink      from '../components/WhyPropLink'
import Testimonials     from '../components/Testimonials'
import CTASection       from '../components/CTASection'
import Footer           from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SearchBar />
      <PropertyCarousel />
      <WhyPropLink />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  )
}
