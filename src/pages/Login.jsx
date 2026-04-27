import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User, ChevronRight, GraduationCap } from 'lucide-react';
import { getAllData } from '../utils/storage';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const data = getAllData();
    if (data.org) {
      setOrgData(data.org);
      if (data.org.appName) {
        document.title = data.org.appName;
      }
    }

    // Splash timer: fade out at 2s, fully hidden at 2.5s
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const hideTimer = setTimeout(() => setShowSplash(false), 2600);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 800); // Simulate network delay for premium feel
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <div className={`splash-screen ${splashFading ? 'splash-fade-out' : ''}`}>
          <div className="splash-content">
            <div className="splash-logo">
              {orgData.logo ? (
                <img src={orgData.logo} alt="Logo" />
              ) : (
                <GraduationCap size={72} color="white" />
              )}
            </div>
            <div className="splash-glow" />
            <h1 className="splash-title">{orgData.loginTitle || orgData.appName || ''}</h1>
            <p className="splash-subtitle">{orgData.loginTagline || ''}</p>
            <div className="splash-loader">
              <div className="splash-loader-bar" />
            </div>
          </div>
        </div>
      )}

      {/* Login Page */}
      <div className="login-container">
        <div className="login-visual">
        <div className="login-visual-content">
          {orgData.logo && (
            <div className="brand-logo-large">
              <div className="logo-icon-large">
                <img src={orgData.logo} alt="Logo" />
              </div>
              {orgData.loginTitle && <h1>{orgData.loginTitle}</h1>}
            </div>
          )}
          
          {!orgData.logo && orgData.loginTitle && (
            <div className="brand-logo-large">
              <h1>{orgData.loginTitle}</h1>
            </div>
          )}

          {orgData.loginTagline && <p className="login-tagline">{orgData.loginTagline}</p>}
          
          <div className="leadership-showcase">
            <div className="leader-card">
              <div className="leader-photo-wrapper">
                <div className="leader-photo-inner">
                  {orgData.chairmanPhoto ? (
                    <img src={orgData.chairmanPhoto} alt="Kepala Yayasan" />
                  ) : (
                    <div className="leader-placeholder"><User size={40} /></div>
                  )}
                </div>
              </div>
              <div className="leader-info">
                <h4>{orgData.chairman || 'Kepala Yayasan'}</h4>
                <span>Ketua Yayasan</span>
              </div>
            </div>
            
            <div className="leader-card">
              <div className="leader-photo-wrapper">
                <div className="leader-photo-inner">
                  {orgData.principalPhoto ? (
                    <img src={orgData.principalPhoto} alt="Kepala Madrasah" />
                  ) : (
                    <div className="leader-placeholder"><User size={40} /></div>
                  )}
                </div>
              </div>
              <div className="leader-info">
                <h4>{orgData.principal || 'Kepala Madrasah'}</h4>
                <span>Kepala Madrasah</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="login-form-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h2>Selamat Datang</h2>
            <p>Silakan masuk ke akun Anda</p>
          </div>

          {error && <div className="login-alert">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-field-wrapper">
                <User size={20} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Masukkan username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <div className="input-field-wrapper">
                <KeyRound size={20} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Masukkan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;
