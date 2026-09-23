import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { CompareProvider } from './context/CompareContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import FindMyPlacePage from './pages/FindMyPlacePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import AddResidencePage from './pages/AddResidencePage' 
import ListingFormPage from './pages/ListingFormPage' 
import MyPropertiesPage from './pages/MyPropertiesPage'
import AdminPage from './pages/AdminPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage'
import ComparePage from './pages/ComparePage'
import CompareBar from './components/CompareBar'
import MyInquiriesPage from './pages/MyInquiriesPage'
import OwnerInboxPage from './pages/OwnerInboxPage'
function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
      <CompareProvider>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/privacy"        element={<PrivacyPage />} />
        <Route path="/terms"          element={<TermsPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />

        {/* ── Protected — any authenticated user ─────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* Future: <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>

        {/* ── Protected — owner or admin only ────────────────────── */}
<Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
  <Route path="/add-residence" element={<AddResidencePage />} />
  <Route path="/my-properties" element={<MyPropertiesPage />} />
  <Route path="/my-properties/:id/edit" element={<ListingFormPage mode="edit" />} />
  <Route path="/analytics" element={<OwnerAnalyticsPage />} />
  <Route path="/inbox" element={<OwnerInboxPage />} />
</Route>
{/* ── Protected — admin only ──────────────────────────────── */}
<Route element={<ProtectedRoute roles={['admin']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
        {/* ── Protected — any authenticated user ─────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/listings"       element={<ListingsPage />} />
          <Route path="/listings/:slug" element={<PropertyDetailPage />} />
          <Route path="/compare"        element={<ComparePage />} />
          <Route path="/find-my-place"  element={<FindMyPlacePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/my-inquiries" element={<MyInquiriesPage />} />
        </Route>

        {/* ── Protected — admin only ──────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          {/* Future: <Route path="/admin" element={<AdminPage />} /> */}
        </Route>
      </Routes>
      <CompareBar />
      </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App
