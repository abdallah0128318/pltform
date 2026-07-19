// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Playlist from './pages/Playlist'
import Watch from './pages/Watch'
import AdminAddVideo from './pages/AdminAddVideo'
import AdminAddStudent from './pages/AdminAddStudent'
import GraphTool from './pages/GraphTool'
import StudentGate from './components/StudentGate'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<StudentGate><Home /></StudentGate>} />
            <Route path="/playlist/:id" element={<StudentGate><Playlist /></StudentGate>} />
            <Route path="/video/:id" element={<StudentGate><Watch /></StudentGate>} />
            <Route path="/graph" element={<StudentGate><GraphTool /></StudentGate>} />
            <Route path="/admin" element={<AdminAddVideo />} />
            <Route path="/admin/students" element={<AdminAddStudent />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}