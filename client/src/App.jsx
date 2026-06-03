import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import FindMyPlacePage from './pages/FindMyPlacePage'
import PropertyDetailPage from './pages/PropertyDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/"               element={<HomePage />} />
      <Route path="/listings"       element={<ListingsPage />} />
      <Route path="/listings/:slug" element={<PropertyDetailPage />} />
      <Route path="/find-my-place"  element={<FindMyPlacePage />} />
      {/* <Route path="/login"    element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Routes>
  )
}

export default App
