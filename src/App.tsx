import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import GameById from './pages/GameById'
import Result from './pages/Result'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-amber-400">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GameById />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
