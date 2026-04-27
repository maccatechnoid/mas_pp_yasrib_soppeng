import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Presence from './pages/Presence';
import Students from './pages/Students';
import Religious from './pages/Religious';
import './App.css';

import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { initializeFromSupabase } from './utils/storage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeFromSupabase().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Memuat data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="presence" element={<Presence />} />
            <Route path="students" element={<Students />} />
            <Route path="religious" element={<Religious />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
