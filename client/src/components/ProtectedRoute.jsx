import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps one or more routes that require authentication.
 *
 * Usage (React Router v6 nested routes):
 *
 *   // Any logged-in user
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 *   // Specific roles only
 *   <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
 *     <Route path="/my-listings" element={<MyListingsPage />} />
 *   </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still validating the saved token — show a centred spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in — redirect to /login and remember where the user was heading
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role — redirect to home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
