import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getAllData } from '../utils/storage';
import './Layout.css';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    const updateBranding = () => {
      const data = getAllData();
      if (data.org) {
        if (data.org.appName) {
          document.title = data.org.appName;
        }
        if (data.org.logo) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.org.logo;
        }
      }
    };

    updateBranding();
    window.addEventListener('user-data-updated', updateBranding);
    return () => window.removeEventListener('user-data-updated', updateBranding);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
      <div className="main-wrapper">
        <Topbar toggleMenu={toggleMobileMenu} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
