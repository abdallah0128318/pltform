// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Playlist from './pages/Playlist'
import Watch from './pages/Watch'
import AdminAddVideo from './pages/AdminAddVideo'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/video/:id" element={<Watch />} />
            <Route path="/admin" element={<AdminAddVideo />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  )
}