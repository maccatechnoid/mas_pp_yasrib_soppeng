import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllData, saveData } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const data = getAllData();
      if (data.user && data.user.isLoggedIn) {
        setUser(data.user);
      }
    };

    loadUser();
    
    const handleUpdate = () => {
      loadUser();
    };

    window.addEventListener('user-data-updated', handleUpdate);
    window.addEventListener('storage', loadUser);
    
    setLoading(false);

    return () => {
      window.removeEventListener('user-data-updated', handleUpdate);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    saveData('user', updatedUser);
    window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updatedUser }));
  };

  const login = (username, password) => {
    const data = getAllData();
    const accounts = data.accounts || [];
    
    const account = accounts.find(
      acc => acc.username === username && acc.password === password
    );

    if (account) {
      const activeUser = { ...account, isLoggedIn: true };
      setUser(activeUser);
      saveData('user', activeUser);
      return { success: true };
    } else {
      return { success: false, message: 'Username atau Password salah!' };
    }
  };

  const logout = () => {
    setUser(null);
    const data = getAllData();
    const guestUser = { name: 'Guest', role: 'Guest', photo: null, isLoggedIn: false };
    saveData('user', guestUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
