import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { computeRecommendations } from '../data/cityProfiles'

// ── Quiz step definitions ─────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'budget',
    question: "What's your budget?",
    subtitle: 'This helps us match you with properties within your reach.',
    options: [
      { label: 'Under $100K',      value: 'under100k',  icon: '💰' },
      { label: '$100K – $250K',    value: 's100k250k',  icon: '🏠' },
      { label: '$250K – $500K',    value: 's250k500k',  icon: '🏡' },
      { label: '$500K+',           value: 's500kplus',  icon: '🏛️' },
    ],
  },
  {
    key: 'purpose',
    question: 'What are you looking for?',
    subtitle: 'Tell us your primary real estate goal.',
    options: [
      { label: 'Residence',      value: 'residence',  icon: '🏠' },
      { label: 'Investment',     value: 'investment', icon: '📈' },
      { label: 'Vacation Home',  value: 'vacation',   icon: '🌴' },
      { label: 'Land Purchase',  value: 'land',       icon: '🌿' },
    ],
  },
  {
    key: 'lifestyle',
    question: 'Which lifestyle fits you best?',
    subtitle: 'Your ideal day-to-day environment in Lebanon.',
    options: [
      { label: 'City Life',                value: 'city',       icon: '🏙️' },
      { label: 'Coastal Living',           value: 'coastal',    icon: '🌊' },
      { label: 'Mountain Escape',          value: 'mountain',   icon: '⛰️' },
      { label: 'Family Friendly',          value: 'family',     icon: '🏡' },
      { label: 'Nightlife & Entertainment',value: 'nightlife',  icon: '✨' },
      { label: 'Quiet Living',             value: 'quiet',      icon: '🌾' },
    ],
  },
  {
    key: 'priority',
    question: 'What matters most to you?',
    subtitle: 'Your single most important deciding factor.',
    options: [
      { label: 'Price',                value: 'price',          icon: '💵' },
      { label: 'Investment Potential', value: 'investment',     icon: '📊' },
      { label: 'Sea View',             value: 'seaView',        icon: '🌅' },
      { label: 'Privacy',              value: 'privacy',        icon: '🔒' },
      { label: 'Accessibility',        value: 'accessibility',  icon: '🛣️' },
      { label: 'Rental Income',        value: 'rentalIncome',   icon: '🏘️' },
    ],
  },
]

// ── Animation variants ────────────────────────────────────────────────────────

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

const EASE = [0.25, 0.46, 0.45, 0.94]

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {STEPS.map((_, i) => (
        <motion.div
          key={i}
          className="h-1 rounded-full"
          animate={{
            backgroundColor:
              i < step  ? '#0F3D2E' :
              i === step ? '#C9A24D' : '#E5E7EB',
            flexGrow: i === step ? 2 : 1,
          }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      ))}
    </div>
  )
}

function OptionCard({ icon, label, selected, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.28, ease: EASE }}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.965 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-colors duration-200 cursor-pointer text-center min-h-[88px] ${
        selected
          ? 'border-forest bg-forest/[0.06] shadow-md shadow-forest/10'
          : 'border-gray-100 hover:border-gold hover:shadow-md hover:shadow-gold/8'
      }`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className={`text-xs font-semibold leading-tight ${selected ? 'text-forest' : 'text-charcoal/75'}`}>
        {label}
      </span>
    </motion.button>
  )
}

function QuizCard({ step, direction, answers, onSelect, onBack }) {
  const s = STEPS[step]
  const isSix = s.options.length === 6

  return (
    <motion.div
      key={step}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.32, ease: EASE }}
      className="bg-white rounded-[32px] shadow-2xl shadow-charcoal/10 p-7 md:p-9"
    >
      <ProgressBar step={step} />

      <p className="text-[10px] font-semibold tracking-[0.22em] text-gold uppercase mb-2">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2 className="font-serif text-2xl md:text-[28px] text-forest font-bold leading-tight mb-1.5">
        {s.question}
      </h2>
      <p className="text-charcoal/45 text-sm leading-relaxed mb-7">{s.subtitle}</p>

      <div className={`grid gap-3 ${isSix ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
        {s.options.map((opt, i) => (
          <OptionCard
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            selected={answers[s.key] === opt.value}
            onClick={() => onSelect(opt.value)}
            index={i}
          />
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={onBack}
          className="mt-7 text-[11px] text-charcoal/35 hover:text-forest transition-colors duration-200 cursor-pointer"
        >
          ← Back
        </button>
      )}
    </motion.div>
  )
}

function ResultCard({ city, rank, count, countLoading }) {
  const isFirst = rank === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.12, duration: 0.44, ease: EASE }}
      className={`rounded-[24px] p-6 md:p-7 ${
        isFirst
          ? 'shadow-2xl shadow-forest/25'
          : 'border border-forest/[0.09] shadow-md shadow-charcoal/5'
      }`}
      style={isFirst ? { background: 'linear-gradient(135deg, #07201A 0%, #0F3D2E 100%)' } : { background: '#fff' }}
    >
      {/* Rank badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg leading-none">{rank === 0 ? '🏆' : '⭐'}</span>
        <span className={`text-[9px] font-semibold tracking-[0.22em] uppercase ${isFirst ? 'text-gold/60' : 'text-charcoal/38'}`}>
          {rank === 0 ? 'Best Match' : rank === 1 ? 'Runner Up' : 'Also Great'}
        </span>
      </div>

      {/* City name */}
      <h3 className={`font-serif text-2xl md:text-3xl font-bold leading-none mb-2 ${isFirst ? 'text-white' : 'text-forest'}`}>
        {city.name}
      </h3>

      {/* Tagline */}
      <p className={`text-sm leading-relaxed mb-4 ${isFirst ? 'text-white/55' : 'text-charcoal/50'}`}>
        {city.tagline}
      </p>

      {/* Property count */}
      <div className="mb-5">
        {countLoading ? (
          <div className={`h-3 w-28 rounded-full animate-pulse ${isFirst ? 'bg-white/15' : 'bg-gray-100'}`} />
        ) : (
          <p className={`text-xs font-medium ${isFirst ? 'text-white/45' : 'text-charcoal/38'}`}>
            {count > 0
              ? `${count} propert${count === 1 ? 'y' : 'ies'} currently listed`
              : 'No properties currently listed'
            }
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/listings?city=${encodeURIComponent(city.name)}`}
        className={`block text-center rounded-full py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
          isFirst
            ? 'bg-gold text-white hover:bg-gold-dark hover:shadow-lg hover:shadow-gold/25 hover:-translate-y-0.5'
            : 'border border-forest text-forest hover:bg-forest hover:text-white'
        }`}
      >
        View Properties
      </Link>
    </motion.div>
  )
}

function ResultsView({ results, counts, countLoading, onRetake }) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold/50" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-gold uppercase">Your Match</p>
            <div className="h-px w-8 bg-gold/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold leading-tight mb-2">
            Recommended Locations
          </h2>
          <p className="text-charcoal/45 text-sm">Curated based on your lifestyle preferences</p>
        </motion.div>
      </div>

      {/* City cards */}
      <div className="flex flex-col gap-4">
        {results.map((city, i) => (
          <ResultCard
            key={city.name}
            city={city}
            rank={i}
            count={counts[city.name]}
            countLoading={countLoading[city.name]}
          />
        ))}
      </div>

      {/* Retake */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="text-center mt-10"
      >
        <button
          onClick={onRetake}
          className="text-sm text-charcoal/38 hover:text-forest transition-colors duration-200 cursor-pointer"
        >
          ↺ Retake the quiz
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FindMyPlacePage() {
  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [selected, setSelected] = useState(null)
  const [results,  setResults]  = useState(null)
  const [counts,   setCounts]   = useState({})
  const [countLoading, setCountLoading] = useState({})
  const dirRef = useRef(1)

  const isShowingResults = results !== null

  // Fetch property counts for each recommended city
  useEffect(() => {
    if (!results) return
    results.forEach(city => {
      setCountLoading(prev => ({ ...prev, [city.name]: true }))
      fetch(`/api/listings?city=${encodeURIComponent(city.name)}&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setCounts(prev => ({ ...prev, [city.name]: data.total }))
          }
        })
        .catch(() => {})
        .finally(() => setCountLoading(prev => ({ ...prev, [city.name]: false })))
    })
  }, [results])

  function handleSelect(value) {
    const key = STEPS[step].key
    const nextAnswers = { ...answers, [key]: value }

    setSelected(value)
    setAnswers(nextAnswers)

    setTimeout(() => {
      setSelected(null)
      dirRef.current = 1

      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
      } else {
        setResults(computeRecommendations(nextAnswers))
      }
    }, 210)
  }

  function handleBack() {
    if (step === 0) return
    dirRef.current = -1
    setStep(s => s - 1)
  }

  function handleRetake() {
    dirRef.current = 1
    setStep(0)
    setAnswers({})
    setSelected(null)
    setResults(null)
    setCounts({})
    setCountLoading({})
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ── Dark hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 pb-28 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 55%, #0F3D2E 100%)' }}
      >
        {/* Gold grid texture */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-gold/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />

        {/* Watermark */}
        <div
          className="absolute right-0 bottom-4 font-serif font-bold uppercase select-none pointer-events-none"
          style={{ fontSize: 'clamp(64px, 12vw, 180px)', lineHeight: 1, color: '#fff', opacity: 0.03, letterSpacing: '-0.02em' }}
          aria-hidden="true"
        >
          DISCOVER
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-8 bg-gold/50" />
              <p className="section-label text-gold/80">Guided Discovery</p>
              <div className="h-px w-8 bg-gold/50" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-3">
              Find My Place in Lebanon
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Answer four quick questions and we'll match you with the perfect Lebanese location.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Quiz / Results card ─────────────────────────────────────────────── */}
      <div className="relative z-20 -mt-14 px-4 pb-20">
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait" custom={dirRef.current}>
            {isShowingResults ? (
              <ResultsView
                key="results"
                results={results}
                counts={counts}
                countLoading={countLoading}
                onRetake={handleRetake}
              />
            ) : (
              <QuizCard
                key={step}
                step={step}
                direction={dirRef.current}
                answers={{ ...answers, [STEPS[step].key]: selected }}
                onSelect={handleSelect}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  )
}
