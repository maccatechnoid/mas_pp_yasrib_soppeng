import React, { useState, useEffect } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { getAllData, saveData, uploadImage } from '../utils/storage';
import toast from 'react-hot-toast';
import '../pages/Settings.css'; // Reuse existing styles
import './Profile.css';

const Profile = () => {
  const [data, setData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setData(getAllData());
  }, []);

  if (!data) return null;

  const handleUserPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const path = `avatars/${Date.now()}_${file.name}`;
      const { url, error } = await uploadImage('public', file, path);
      if (error) throw error;
      
      const updated = { ...data.user, photo: url };
      setData({ ...data, user: updated });
      saveData('user', updated);
      
      if (data.accounts) {
        const updatedAccounts = data.accounts.map(acc => acc.id === updated.id ? { ...acc, photo: updated.photo } : acc);
        saveData('accounts', updatedAccounts);
      }
      
      window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
      toast.success('Foto profil berhasil diunggah');
    } catch (err) {
      toast.error('Gagal mengunggah foto profil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (updatedUser) => {
    setData({ ...data, user: updatedUser });
    saveData('user', updatedUser);
    
    // Update accounts array if exists
    if (data.accounts) {
      const updatedAccounts = data.accounts.map(acc => acc.id === updatedUser.id ? { ...acc, name: updatedUser.name, username: updatedUser.username, password: updatedUser.password } : acc);
      saveData('accounts', updatedAccounts);
    }
    
    window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updatedUser }));
    toast.success('Profil berhasil diperbarui');
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-indigo">
            <User size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Profil Pengguna</h1>
            <p className="page-subtitle">Kelola informasi akun, username, dan password Anda</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mt-6 max-w-3xl mx-auto">
        <div className="user-profile-settings">
          <div className="profile-hero-editor">
            <div className="avatar-edit-container">
              <div className="avatar-preview-large">
                {data.user.photo ? (
                  <img src={data.user.photo} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder-large">
                    <User size={64} />
                  </div>
                )}
                <label className={`avatar-upload-badge ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Camera size={20} />
                  <input type="file" hidden accept="image/*" onChange={handleUserPhotoChange} disabled={isUploading} />
                </label>
              </div>
              <div className="avatar-info-text">
                <h3>Foto Profil Anda</h3>
                <p>Format JPG, PNG atau GIF. Maksimal 2MB.</p>
              </div>
            </div>
          </div>

          <div className="doc-divider-settings">Informasi Akun</div>
          <div className="form-grid-2 mt-4">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                value={data.user.name || ''} 
                onChange={(e) => handleSave({ ...data.user, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Jabatan / Peran</label>
              <input 
                type="text" 
                value={data.user.role || ''} 
                readOnly
                disabled
                className="bg-gray-50"
                title="Hubungi Admin untuk mengubah Jabatan"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={data.user.username || ''} 
                onChange={(e) => handleSave({ ...data.user, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={data.user.password || ''} 
                  onChange={(e) => handleSave({ ...data.user, password: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
