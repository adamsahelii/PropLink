import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-blue-600">PropLink is live!</h1>
          </div>
        }
      />
    </Routes>
  )
}

export default App
