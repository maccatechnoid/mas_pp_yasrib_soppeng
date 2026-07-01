import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Settings,
  LogOut,
  FileText,
  Download,
  X,
  Wallet,
  ShieldCheck,
  CalendarClock,
  HeartHandshake,
  UserCheck,
  LayoutGrid,
  GraduationCap,
  BookMarked,
  Landmark,
  ScrollText,
  ClipboardList,
  Home,
  School,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllData } from '../utils/storage';
import './Sidebar.css';

// Menu structure with group categories
const MENU_GROUPS = [
  {
    label: 'MENU UTAMA',
    items: [
      { icon: <Home size={18} />, label: 'Dashboard', path: '/' },
      { icon: <LayoutGrid size={18} />, label: 'Dashboard Guru', path: '/teacher-dashboard' },
      { icon: <LayoutGrid size={18} />, label: 'Dashboard Wali Kelas', path: '/homeroom-dashboard' },
      { icon: <LayoutGrid size={18} />, label: 'Dashboard Siswa', path: '/student-dashboard' },
      { icon: <LayoutGrid size={18} />, label: 'Dashboard Wali', path: '/parent-dashboard' },
    ]
  },
  {
    label: 'DATA SISWA',
    items: [
      { icon: <Users size={18} />, label: 'Siswa', path: '/students' },
      { icon: <UserCheck size={18} />, label: 'Portal Akademik', path: '/portal-akademik' },
      { icon: <ClipboardList size={18} />, label: 'Riwayat Presensi', path: '/riwayat-presensi' },
      { icon: <BookOpen size={18} />, label: 'Nilai Siswa', path: '/nilai-siswa' },
    ]
  },
  {
    label: 'KEHADIRAN',
    items: [
      { icon: <ClipboardCheck size={18} />, label: 'Presensi', path: '/presensi' },
      { icon: <UserCheck size={18} />, label: 'Presensi Harian', path: '/teacher-presence' },
    ]
  },
  {
    label: 'AKADEMIK',
    items: [
      { icon: <School size={18} />, label: 'Manajemen Kelas & Modul', path: '/manajemen-kelas' },
      { icon: <ScrollText size={18} />, label: 'Ujian Sumatif', path: '/ujian-sumatif' },
      { icon: <HeartHandshake size={18} />, label: 'Bimbingan Konseling', path: '/konseling' },
    ]
  },
  {
    label: 'KEAGAMAAN',
    items: [
      { icon: <Landmark size={18} />, label: 'Kegiatan Ibadah', path: '/religious' },
      { icon: <BookMarked size={18} />, label: 'Tahfidz', path: '/quran' },
      { icon: <BookOpen size={18} />, label: 'Kajian Keagamaan', path: '/teacher-study' },
    ]
  },
  {
    label: 'KEPEGAWAIAN',
    items: [
      { icon: <CalendarClock size={18} />, label: 'Pengajuan', path: '/teacher-leaves' },
    ]
  },
  {
    label: 'MANAJEMEN',
    items: [
      { icon: <Wallet size={18} />, label: 'Keuangan', path: '/finance' },
      { icon: <FileText size={18} />, label: 'Laporan', path: '/reports' },
      { icon: <ShieldCheck size={18} />, label: 'Manajemen Akses', path: '/manajemen-akses' },
      { icon: <Settings size={18} />, label: 'Pengaturan', path: '/settings' },
    ]
  },
  {
    label: 'WALI SISWA',
    items: [
      { icon: <BookOpen size={18} />, label: 'Akademik & Hafalan', path: '/parent-academic' },
    ]
  },
];

const Sidebar = ({ isOpen, closeMenu }) => {
  const [orgData, setOrgData] = useState({});
  const [permissions, setPermissions] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackup = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Madrasah_Hub_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = () => {
      const data = getAllData();
      if (data.org) setOrgData(data.org);
      if (data.permissions) setPermissions(data.permissions);
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('user-data-updated', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('user-data-updated', loadData);
    };
  }, []);

  const isItemVisible = (path) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;

    const rolePaths = permissions[user.role];
    if (rolePaths) {
      if (user.role === 'Siswa' && path === '/settings') return false;

      const forcedMenus = {
        'Kepala Madrasah': ['/manajemen-kelas', '/konseling', '/teacher-presence'],
        'Guru BK': ['/manajemen-kelas', '/konseling', '/teacher-presence'],
        'Guru Mata Pelajaran': ['/manajemen-kelas', '/konseling', '/teacher-dashboard', '/teacher-presence'],
        'Wali Kelas': ['/manajemen-kelas', '/konseling', '/homeroom-dashboard', '/teacher-presence'],
      };
      if (forcedMenus[user.role] && forcedMenus[user.role].includes(path)) {
        return true;
      }
      return rolePaths.includes(path);
    }
    if (user.role === 'Siswa' && path === '/settings') return false;
    return path === '/settings';
  };

  // Filter groups and items based on permissions
  const visibleGroups = MENU_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => isItemVisible(item.path))
  })).filter(group => group.items.length > 0);

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeMenu}
        ></div>
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Logo Header */}
        <div className="sidebar-header">
          <div className={`sidebar-logo-icon ${orgData.logo ? 'has-image' : ''}`}>
            {orgData.logo ? (
              <img src={orgData.logo} alt="Logo" className="sidebar-logo-img" />
            ) : (
              <span>{orgData.appShortName || 'M'}</span>
            )}
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-text">
              {orgData.appName ? (
                <>
                  <strong>{orgData.appName.split(' ')[0]}</strong>
                  {' '}{orgData.appName.split(' ').slice(1).join(' ')}
                </>
              ) : (
                <><strong>Madrasah</strong> Hub</>
              )}
            </span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={closeMenu}
          >
            <X size={20} />
          </button>
        </div>

        {/* Academic Year Badge */}
        <div className="sidebar-period">
          <span className="period-year">TP. {orgData.academicYear || '2024/2025'}</span>
          <span className="period-semester">SMT. {(orgData.semester || 'GANJIL').toUpperCase()}</span>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {visibleGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  <span className="nav-link-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="nav-group-label">WALI SISWA</div>
          <button
            className="nav-link"
            onClick={handleBackup}
          >
            <span className="nav-link-icon"><Download size={18} /></span>
            <span className="nav-link-label">Cadangan Data</span>
          </button>
          <button 
            className="nav-link logout" 
            onClick={logout}
          >
            <span className="nav-link-icon"><LogOut size={18} /></span>
            <span className="nav-link-label">Keluar</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
