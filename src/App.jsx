import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BlueWingLogin from './pages/BluewingLogin'
import ForgotPassword from './pages/ForgotPassword'
import RegistrationPage from './pages/RegistrationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<BlueWingLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
