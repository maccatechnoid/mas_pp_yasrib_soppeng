import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Presensi from './pages/Presensi';
import Siswa from './pages/Siswa';
import Religious from './pages/Religious';

import Quran from './pages/Quran';
import './App.css';

import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Grades from './pages/Grades';
import PortalAkademik from './pages/PortalAkademik';
import StudentReport from './pages/StudentReport';
import Login from './pages/Login';

import Finance from './pages/Finance';
import DetailSiswa from './pages/DetailSiswa';
import TeacherStudy from './pages/TeacherStudy';
import TeacherLeaves from './pages/TeacherLeaves';
import UjianSumatif from './pages/UjianSumatif';
import DashboardWali from './pages/DashboardWali';
import ParentAcademic from './pages/ParentAcademic';
import ParentFinance from './pages/ParentFinance';
import DashboardSiswa from './pages/DashboardSiswa';
import NilaiSiswa from './pages/NilaiSiswa';
import StudentReligious from './pages/StudentReligious';
import RiwayatPresensi from './pages/RiwayatPresensi';
import ManajemenKelas from './pages/ManajemenKelas';
import ManajemenAkses from './pages/ManajemenAkses';
import Profile from './pages/Profile';
import Konseling from './pages/Konseling';
import PresensiHarian from './pages/PresensiHarian';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { initializeFromSupabase } from './utils/storage';
import { Toaster } from 'react-hot-toast';
import DashboardGuru from './pages/DashboardGuru';
import DashboardWaliKelas from './pages/DashboardWaliKelas';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Role-based dashboard redirect
const RoleDashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'Guru Mata Pelajaran') return <DashboardGuru />;
  if (user.role === 'Wali Kelas') return <DashboardWaliKelas />;
  if (user.role === 'Siswa') return <DashboardSiswa />;
  if (user.role === 'Orang Tua') return <DashboardWali />;
  return <Dashboard />;
};

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Start syncing in background
      initializeFromSupabase();
      
      // Wait only 1 second for branding/splash effect
      setTimeout(() => {
        setReady(true);
      }, 1000);
    };
    init();
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
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }} 
      />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/rapor" element={<StudentReport />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<RoleDashboard />} />
            <Route path="teacher-dashboard" element={<DashboardGuru />} />
            <Route path="homeroom-dashboard" element={<DashboardWaliKelas />} />
            <Route path="presensi" element={<Presensi />} />
            <Route path="students" element={<Siswa />} />
            <Route path="portal-akademik" element={<PortalAkademik />} />
            <Route path="religious" element={<Religious />} />
            <Route path="quran" element={<Quran />} />
            <Route path="grades" element={<Grades />} />
            <Route path="finance" element={<Finance />} />
            <Route path="student/:id" element={<DetailSiswa />} />
            <Route path="reports" element={<Reports />} />
            <Route path="teacher-study" element={<TeacherStudy />} />
            <Route path="teacher-leaves" element={<TeacherLeaves />} />
            <Route path="ujian-sumatif" element={<UjianSumatif />} />
            <Route path="manajemen-kelas" element={<ManajemenKelas />} />
            <Route path="manajemen-akses" element={<ManajemenAkses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="parent-dashboard" element={<DashboardWali />} />
            <Route path="parent-academic" element={<ParentAcademic />} />
            <Route path="parent-finance" element={<ParentFinance />} />
            <Route path="student-dashboard" element={<DashboardSiswa />} />
            <Route path="nilai-siswa" element={<NilaiSiswa />} />
            <Route path="riwayat-presensi" element={<RiwayatPresensi />} />
            <Route path="konseling" element={<Konseling />} />
            <Route path="teacher-presence" element={<PresensiHarian />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
