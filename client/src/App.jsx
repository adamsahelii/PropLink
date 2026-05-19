import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'

function App() {
  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path="/listings" element={<ListingsPage />} />
      {/* Future routes */}
      {/* <Route path="/listings/:slug" element={<ListingDetailPage />} /> */}
      {/* <Route path="/login"    element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Routes>
  )
}

export default App
