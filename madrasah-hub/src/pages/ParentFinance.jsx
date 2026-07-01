import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Clock, X, Building, Smartphone, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllData } from '../utils/storage';

const ParentFinance = () => {
  const history = [
    { month: 'Januari 2026', amount: 250000, date: '05 Jan 2026', status: 'Lunas' },
    { month: 'Februari 2026', amount: 250000, date: '06 Feb 2026', status: 'Lunas' },
    { month: 'Maret 2026', amount: 250000, date: '10 Mar 2026', status: 'Lunas' },
    { month: 'April 2026', amount: 250000, date: '05 Apr 2026', status: 'Lunas' },
    { month: 'Mei 2026', amount: 250000, date: '-', status: 'Belum Lunas' },
  ];

  const [showModal, setShowModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    bankName: 'BSI (Bank Syariah Indonesia)',
    bankAccount: '701 234 5678',
    bankHolder: 'YAYASAN MADRASAH HUB',
    ewalletName: 'OVO / DANA / GoPay',
    ewalletNumber: '0812 3456 7890',
    ewalletHolder: 'MADRASAH HUB',
    confirmWhatsApp: '0812-3456-7890'
  });

  useEffect(() => {
    const data = getAllData();
    if (data.org?.payment) {
      setPaymentInfo(data.org.payment);
    }
    const handleUpdate = () => {
      const refreshed = getAllData();
      if (refreshed.org?.payment) setPaymentInfo(refreshed.org.payment);
    };
    window.addEventListener('user-data-updated', handleUpdate);
    return () => window.removeEventListener('user-data-updated', handleUpdate);
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <Wallet size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Informasi Keuangan</h1>
            <p className="page-subtitle">Pantau tagihan dan riwayat pembayaran SPP ananda.</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="stats-main">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Riwayat Pembayaran SPP Tahun 2026</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-detail-table">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Jumlah Tagihan</th>
                    <th>Tanggal Bayar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td><strong>{h.month}</strong></td>
                      <td>Rp {h.amount.toLocaleString('id-ID')}</td>
                      <td>{h.date}</td>
                      <td>
                        <span className={`status-pill ${h.status === 'Lunas' ? 'hadir' : 'alpa'}`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="stats-sidebar">
          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertCircle size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Tagihan Aktif</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dark)' }}>SPP Mei 2026</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Rp 250.000</span>
              </div>
              <hr style={{ borderTop: '1px dashed #ef4444', margin: '0.5rem 0', opacity: 0.3 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--text-dark)' }}>Total Tagihan</span>
                <span style={{ color: '#ef4444' }}>Rp 250.000</span>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              style={{ width: '100%', padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1.5rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              Cara Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* Payment Instruction Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
            >
              <button 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Cara Pembayaran SPP</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Transfer Bank {paymentInfo.bankName}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        No. Rekening: <strong>{paymentInfo.bankAccount}</strong><br/>
                        Atas Nama: <strong>{paymentInfo.bankHolder}</strong><br/>
                        <span style={{ fontSize: '0.85rem' }}>*Mohon sertakan nama santri pada berita acara transfer.</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>E-Wallet ({paymentInfo.ewalletName})</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        No. Tujuan: <strong>{paymentInfo.ewalletNumber}</strong><br/>
                        Atas Nama: <strong>{paymentInfo.ewalletHolder}</strong>
                      </p>
                    </div>
                  </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                  Setelah melakukan pembayaran, harap konfirmasi dan kirimkan bukti transfer melalui WhatsApp Tata Usaha di nomor <strong>{paymentInfo.confirmWhatsApp}</strong>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentFinance;
