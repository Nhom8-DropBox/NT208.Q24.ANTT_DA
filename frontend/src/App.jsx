import React from 'react'
import './index.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoginForm from '/src/pages/loginForm.jsx'
import Register from '/src/pages/register.jsx'
import Dashboard from '/src/pages/Dashboard.jsx'
import Profile from '/src/components/profile-popup.jsx'
import ShareBoard from './components/share_link'
import VersionHistory from './components/version_history'

function App() {

    return (
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/login" element={< LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LoginForm />} />
          <Route path="/share" element={<ShareBoard/>} />
          <Route path="/versions" element={<VersionHistory />} /> {/*url qua version: /version/fileiid*/}
        </Routes>
      </Router>

    )
  }

export default App
