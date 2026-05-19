import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Future routes — add here as you build each page */}
      {/* <Route path="/listings"  element={<ListingsPage />} /> */}
      {/* <Route path="/listings/:slug" element={<ListingDetailPage />} /> */}
      {/* <Route path="/login"    element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Routes>
  )
}

export default App
