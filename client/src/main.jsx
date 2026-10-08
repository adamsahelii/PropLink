import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Route /api calls to the backend in production; stays relative (Vite proxy) in dev
const API = import.meta.env.VITE_API_URL || ''
const _fetch = window.fetch.bind(window)
window.fetch = (url, opts) =>
  typeof url === 'string' && url.startsWith('/api')
    ? _fetch(API + url, opts)
    : _fetch(url, opts)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)