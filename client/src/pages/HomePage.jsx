import Navbar           from '../components/Navbar'
import Hero             from '../components/Hero'
import PropertyCarousel from '../components/PropertyCarousel'
import WhyPropLink      from '../components/WhyPropLink'
import Testimonials     from '../components/Testimonials'
import Footer           from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <PropertyCarousel />
      <WhyPropLink />
      <Testimonials />
      <Footer />
    </div>
  )
}
