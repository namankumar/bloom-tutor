import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import HomeScreen from './screens/HomeScreen'
import NumberKitchen from './screens/NumberKitchen'
import { initAudio } from './shared/audio'

export default function App() {
  useEffect(() => {
    initAudio()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/number-kitchen" element={<NumberKitchen />} />
      </Routes>
    </BrowserRouter>
  )
}
