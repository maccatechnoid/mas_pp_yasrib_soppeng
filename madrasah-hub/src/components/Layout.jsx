import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getAllData } from '../utils/storage';

import './Layout.css';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateBranding = () => {
      const data = getAllData();
      if (data.org) {
        // Update Document Title
        if (data.org.appName) {
          document.title = data.org.appName;
        }

        // Update Favicon
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

  // Prevent re-rendering heavy page content (like charts on Dashboard) when the sidebar is toggled
  const pageContent = useMemo(() => (
    <main className="page-content">
      <Outlet />
    </main>
  ), [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
      <div className="main-wrapper">
        <Topbar toggleMenu={toggleMobileMenu} />
        {pageContent}
      </div>
    </div>
  );
};

export default Layout;
