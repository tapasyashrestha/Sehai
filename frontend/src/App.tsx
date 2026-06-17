import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Index from './pages/Index'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ANMDashboard from './pages/ANMDashboard'
import PHCDashboard from './pages/PHCDashboard'
import CHCDashboard from './pages/CHCDashboard'
import PatientRecord from './pages/PatientRecord'
import DatasetManager from './pages/DatasetManager'
import Help from './pages/Help'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
    return (
        <LanguageProvider>
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/anm-dashboard" element={
                        <ProtectedRoute allowedRoles={['anm']}>
                            <ANMDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/phc-dashboard" element={
                        <ProtectedRoute allowedRoles={['phc']}>
                            <PHCDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/chc-dashboard" element={
                        <ProtectedRoute allowedRoles={['chc']}>
                            <CHCDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/patient/:id" element={
                        <ProtectedRoute>
                            <PatientRecord />
                        </ProtectedRoute>
                    } />
                    <Route path="/dataset" element={
                        <ProtectedRoute>
                            <DatasetManager />
                        </ProtectedRoute>
                    } />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
        </LanguageProvider>
    )
}

export default App
