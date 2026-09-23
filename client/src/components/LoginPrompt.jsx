import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoLockClosedOutline } from 'react-icons/io5'
import Navbar from './Navbar'

const EASE = [0.25, 0.46, 0.45, 0.94]

/**
 * Shown in place of a locked page when a guest opens it.
 * The URL stays the same; `from` lets Login/Register send the user
 * back here once they've signed in.
 */
export default function LoginPrompt({ from }) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <IoLockClosedOutline className="w-7 h-7 text-gold" aria-hidden="true" />
          </div>

          <h1 className="font-serif text-3xl text-forest font-bold mb-3">
            Log in to explore more
          </h1>
          <p className="text-charcoal/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Sign in or create a free account to browse properties, save favorites,
            and contact owners across Lebanon.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              state={{ from }}
              className="btn-gold rounded-full px-8 py-3 text-sm"
            >
              Log In
            </Link>
            <Link
              to="/register"
              state={{ from }}
              className="btn-outline-forest rounded-full px-8 py-3 text-sm"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}