import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LearningPathSelection from './pages/LearningPathSelection'
import Assessment from './pages/Assessment'
import LearningPlan from './pages/LearningPlan'
import Dashboard from './pages/Dashboard'
import ModuleLesson from './pages/ModuleLesson'
import LessonView from './pages/LessonView'
import { applyTheme, getStoredTheme } from './utils/theme'

function ThemeRouteSync() {
  const location = useLocation()

  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [location.pathname])

  return null
}

function App() {
  return (
    <Router>
      <ThemeRouteSync />
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/paths" element={<LearningPathSelection />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/learn" element={<LearningPlan />} />
          <Route path="/learn/:moduleId" element={<ModuleLesson />} />
          <Route path="/lesson/:id" element={<LessonView />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
