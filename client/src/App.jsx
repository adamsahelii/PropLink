import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import FindMyPlacePage from './pages/FindMyPlacePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/listings"       element={<ListingsPage />} />
        <Route path="/listings/:slug" element={<PropertyDetailPage />} />
        <Route path="/find-my-place"  element={<FindMyPlacePage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />

        {/* ── Protected — any authenticated user ─────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* Future: <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>

        {/* ── Protected — owner or admin only ────────────────────── */}
        <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
          {/* Future: <Route path="/my-listings" element={<MyListingsPage />} /> */}
        </Route>

        {/* ── Protected — admin only ──────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          {/* Future: <Route path="/admin" element={<AdminPage />} /> */}
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
