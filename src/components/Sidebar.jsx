import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  FileText,
  Download,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllData } from '../utils/storage';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeMenu }) => {
  const [orgData, setOrgData] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadData = () => {
      const data = getAllData();
      if (data.org) setOrgData(data.org);
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('user-data-updated', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('user-data-updated', loadData);
    };
  }, []);

  const getAllMenuItems = () => [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['Admin', 'Kepala Madrasah', 'Guru Mata Pelajaran', 'Guru BK'] },
    { icon: <UserCheck size={20} />, label: 'Presensi', path: '/presence', roles: ['Admin', 'Guru Mata Pelajaran', 'Pembina'] },
    { icon: <Users size={20} />, label: 'Siswa', path: '/students', roles: ['Admin', 'Kepala Madrasah', 'Guru BK', 'Pembina'] },
    { icon: <BookOpen size={20} />, label: 'Kegiatan Ibadah', path: '/religious', roles: ['Admin', 'Guru BK'] },
    { icon: <FileText size={20} />, label: 'Laporan', path: '/reports', roles: ['Admin', 'Kepala Madrasah', 'Guru BK'] },
    { icon: <Settings size={20} />, label: 'Pengaturan', path: '/settings', roles: ['Admin', 'Kepala Madrasah', 'Guru Mata Pelajaran', 'Guru BK', 'Pembina'] },
  ];

  const menuItems = getAllMenuItems().filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className={`logo-icon ${orgData.logo ? 'has-image' : ''}`}>
            {orgData.logo ? (
              <img src={orgData.logo} alt="Logo" className="sidebar-logo-img" />
            ) : (
              orgData.appShortName || 'M'
            )}
          </div>
          <span className="logo-text">
            {orgData.appName ? (
              <>
                {orgData.appName.split(' ')[0]}
                <span>{orgData.appName.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <>Madrasah<span>Hub</span></>
            )}
          </span>
          <button className="icon-btn mobile-close-btn" onClick={closeMenu}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-academic-badge">
          <div className="academic-info">
            <span className="a-year">{orgData.academicYear || '2023/2024'}</span>
            <span className="a-semester">{orgData.semester || 'Ganjil'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-item download-btn" 
          onClick={() => {
            const data = getAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Backup_Madrasah_Hub_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          title="Download Cadangan Data"
        >
          <Download size={20} />
          <span>Cadangan</span>
        </button>
        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
