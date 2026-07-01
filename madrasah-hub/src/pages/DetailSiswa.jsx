import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Wallet,
  TrendingUp,
  FileText,
  Award,
  AlertCircle,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getAllData } from '../utils/storage';
import './DetailSiswa.css';

const DetailSiswa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getAllData();
    const s = data.students.find(item => item.id === parseInt(id));

    if (s) {
      setStudent(s);
      // Mock some data if real grades/payments not found
      setGrades([
        { subject: 'PAI', score: 85 },
        { subject: 'B. Ind', score: 88 },
        { subject: 'Matematika', score: 76 },
        { subject: 'B. Ingg', score: 92 },
        { subject: 'Fisika', score: 80 },
        { subject: 'Biologi', score: 84 },
      ]);
      setPayments([
        { month: 'Januari', status: 'Paid', date: '2026-01-10', amount: 250000 },
        { month: 'Februari', status: 'Paid', date: '2026-02-12', amount: 250000 },
        { month: 'Maret', status: 'Unpaid', date: '-', amount: 250000 },
      ]);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading student profile...</div>;
  if (!student) return <div className="p-8 text-center">Student not found.</div>;

  return (
    <div className="student-detail-container">
      <header className="detail-header">
        <button className="btn-back" onClick={() => navigate('/students')} title="Kembali">
          <ArrowLeft size={20} />
        </button>
        <button className="btn-print-profile" title="Cetak Profil">
          <Printer size={20} />
        </button>
      </header>

      <div className="detail-grid">
        {/* Left Side: Profile Summary */}
        <div className="profile-sidebar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card profile-main-card"
          >
            <div className="student-avatar-large">
              {student.photo ? (
                <img src={student.photo} alt={student.name} />
              ) : (
                <div className="avatar-placeholder">{student.name[0]}</div>
              )}
            </div>
            <h2 className="detail-name">{student.name}</h2>
            <div className="detail-badge">{student.class}</div>

            <div className="sidebar-stats">
              <div className="stat-item">
                <span className="stat-val">84.5</span>
                <span className="stat-label">Rata-rata Nilai</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">96%</span>
                <span className="stat-label">Kehadiran</span>
              </div>
            </div>

            <div className="contact-list">
              <div className="contact-item">
                <Phone size={16} />
                <span>{student.parentPhone || '-'}</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>{student.address || 'Alamat belum diatur'}</span>
              </div>
              <div className="contact-item">
                <Calendar size={16} />
                <span>{student.birth_place || '-'}, {student.birth_date || '-'}</span>
              </div>
            </div>
          </motion.div>

          <div className="glass-card mt-6">
            <h3 className="card-subtitle">Status Akademik</h3>
            <div className="status-timeline">
              <div className="timeline-point active">
                <div className="point-marker"></div>
                <div className="point-text">
                  <strong>Terdaftar Aktif</strong>
                  <span>Semester Ganjil 2025/2026</span>
                </div>
              </div>
              <div className="timeline-point">
                <div className="point-marker"></div>
                <div className="point-text">
                  <strong>Naik Kelas</strong>
                  <span>Dari Kelas XI-A ke XII-A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Info */}
        <div className="profile-main-content">
          <div className="tabs-content">
            {/* Academic Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card content-card"
            >
              <div className="card-header-flex">
                <div className="title-group">
                  <GraduationCap size={20} className="text-primary" />
                  <h3>Performa Akademik</h3>
                </div>
                <TrendingUp size={18} className="text-success" />
              </div>

              <div className="academic-chart-large">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { name: 'Smt 1', score: 78 },
                    { name: 'Smt 2', score: 82 },
                    { name: 'Smt 3', score: 80 },
                    { name: 'Smt 4', score: 85 },
                    { name: 'Smt 5', score: 84 },
                  ]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grades-grid-mini">
                {grades.map((g, idx) => (
                  <div key={idx} className="grade-item-small">
                    <span className="g-subject">{g.subject}</span>
                    <div className="g-bar-container">
                      <div className="g-bar" style={{ width: `${g.score}%` }}></div>
                    </div>
                    <span className="g-score">{g.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Financial History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card content-card mt-6"
            >
              <div className="card-header-flex">
                <div className="title-group">
                  <Wallet size={20} className="text-warning" />
                  <h3>Riwayat Keuangan</h3>
                </div>
                <button className="btn-link" onClick={() => navigate('/finance')}>Kelola Keuangan</button>
              </div>

              <div className="payment-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th>Jumlah</th>
                      <th>Tanggal Bayar</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.month}</td>
                        <td>Rp {p.amount.toLocaleString('id-ID')}</td>
                        <td>{p.date}</td>
                        <td>
                          <span className={`status-badge ${p.status.toLowerCase()}`}>
                            {p.status === 'Paid' ? 'Lunas' : 'Belum Lunas'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Documents & Reports */}
            <div className="grid-2-col mt-6">
              <div className="glass-card">
                <h3 className="card-subtitle-flex">
                  <FileText size={18} />
                  <span>Dokumen Rapor</span>
                </h3>
                <div className="doc-item">
                  <div className="doc-info">
                    <strong>Rapor Semester Ganjil</strong>
                    <span>Tahun 2025/2026</span>
                  </div>
                  <button className="btn-icon-s"><FileText size={16} /></button>
                </div>
                <div className="doc-item">
                  <div className="doc-info">
                    <strong>Rapor Semester Genap</strong>
                    <span>Tahun 2024/2025</span>
                  </div>
                  <button className="btn-icon-s"><FileText size={16} /></button>
                </div>
              </div>

              <div className="glass-card">
                <h3 className="card-subtitle-flex">
                  <Award size={18} />
                  <span>Prestasi & Catatan</span>
                </h3>
                <div className="empty-mini">
                  <AlertCircle size={32} />
                  <p>Belum ada catatan prestasi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSiswa;
