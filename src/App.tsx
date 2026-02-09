import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ANMDashboard from './pages/ANMDashboard'
import PHCDashboard from './pages/PHCDashboard'
import CHCDashboard from './pages/CHCDashboard'
import PatientRecord from './pages/PatientRecord'
import Help from './pages/Help'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/anm-dashboard" element={<ANMDashboard />} />
                <Route path="/phc-dashboard" element={<PHCDashboard />} />
                <Route path="/chc-dashboard" element={<CHCDashboard />} />
                <Route path="/patient/:id" element={<PatientRecord />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}

export default App
