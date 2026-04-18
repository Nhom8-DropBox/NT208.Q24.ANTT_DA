import React from 'react'
import './index.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoginForm from '/src/components/login/loginForm.jsx'
import Register from '/src/components/register/register.jsx'
import Dashboard from '/src/components/Dashboard/Dashboard.jsx'


function App() {

    return (
      <Router>
        <Routes>
          <Route path="/login" element={< LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
      </Router>

    )
  }

export default App
