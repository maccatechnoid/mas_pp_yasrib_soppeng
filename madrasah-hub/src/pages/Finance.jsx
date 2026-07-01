import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  History, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Printer,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllData, saveData, supabase } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'react-hot-toast';
import './Finance.css';

const Finance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [payments, setPayments] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  
  // Payroll State
  const [showSalaryReceipt, setShowSalaryReceipt] = useState(false);
  const [lastSalaryPayment, setLastSalaryPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('spp');
  const [hourlyRate, setHourlyRate] = useState(50000);
  const [teachers, setTeachers] = useState([]);
  const [teacherHours, setTeacherHours] = useState({});
  const [teacherAllowances, setTeacherAllowances] = useState({});
  
  const [paymentForm, setPaymentForm] = useState({
    amount: 250000,
    month: new Date().getMonth() + 1,
    method: 'Tunai',
    note: ''
  });

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const [allowanceOptions, setAllowanceOptions] = useState([
    { id: 'none', label: 'Tanpa Tunjangan (Rp 0)', value: 0, name: '' }
  ]);

  useEffect(() => {
    const loadData = async () => {
      const data = getAllData();
      setStudents(data.students || []);
      setClasses(data.classes || []);
      
      const loadedTeachers = data.teachers || [];
      setTeachers(loadedTeachers);

      // Load dynamic allowances from settings
      if (Array.isArray(data.allowances) && data.allowances.length > 0) {
        setAllowanceOptions(data.allowances);
      } else {
        setAllowanceOptions([
          { id: 'none', label: 'Tanpa Tunjangan (Rp 0)', value: 0, name: '' },
          { id: 'wali', label: 'Wali Kelas (Rp 300rb)', value: 300000, name: 'Tunjangan Wali Kelas' },
          { id: 'eskul', label: 'Pembina Eskul (Rp 200rb)', value: 200000, name: 'Tunjangan Pembina Eskul' },
          { id: 'waka', label: 'Waka / Staf (Rp 750rb)', value: 750000, name: 'Tunjangan Waka / Staf' },
          { id: 'kamad', label: 'Kepala Madrasah (Rp 1.5jt)', value: 1500000, name: 'Tunjangan Kepala Madrasah' }
        ]);
      }
      
      // Teacher hours calculation is moved to a separate useEffect below
      // so it can react to selectedMonth changes.
      
      try {
        // Fetch payments from Supabase
        const { data: payData, error } = await supabase
          .from('student_payments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && payData) {
          setPayments(payData);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using mock data');
        setPayments([]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const actualHours = {};
    try {
      const logsStr = localStorage.getItem('teacher_teaching_logs');
      const logs = logsStr ? JSON.parse(logsStr) : [];
      
      const { schedule } = getAllData();
      
      const parseTime = (tStr) => {
        if (!tStr) return 0;
        const parts = tStr.replace('.', ':').split(':');
        if (parts.length !== 2) return 0;
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      };
      
      teachers.forEach(t => {
        const teacherLogs = logs.filter(log => {
          if (log.teacher !== t) return false;
          if (log.date) {
            const logMonth = new Date(log.date).getMonth() + 1;
            return logMonth === selectedMonth;
          }
          return false;
        });
        
        let totalJP = 0;
        teacherLogs.forEach(log => {
          if (!log.timeIn || !log.timeOut || !schedule) {
             totalJP += 1; 
             return;
          }
          
          const inMin = parseTime(log.timeIn);
          const outMin = parseTime(log.timeOut);
          
          if (inMin >= outMin) {
            totalJP += 1;
            return;
          }
          
          let logJP = 0;
          schedule.forEach(slot => {
            if (slot.type !== 'Belajar') return;
            const timeParts = slot.time.split(' - ');
            if (timeParts.length !== 2) return;
            
            const slotStart = parseTime(timeParts[0].trim());
            const slotEnd = parseTime(timeParts[1].trim());
            
            const overlapStart = Math.max(inMin, slotStart);
            const overlapEnd = Math.min(outMin, slotEnd);
            const overlapMinutes = overlapEnd - overlapStart;
            
            // If overlap is at least 15 minutes, count as 1 Jam Pelajaran
            if (overlapMinutes >= 15) {
              logJP += 1;
            }
          });
          
          totalJP += (logJP > 0 ? logJP : 1);
        });
        
        actualHours[t] = totalJP; 
      });
    } catch (e) {
      console.warn('Failed to parse teaching logs', e);
      teachers.forEach(t => actualHours[t] = 0);
    }
    
    setTeacherHours(actualHours);
  }, [selectedMonth, teachers]);

  const getPaymentStatus = (studentId, month) => {
    const payment = payments.find(p => p.student_id === studentId && p.month === month);
    if (!payment) return { status: 'unpaid', label: 'Belum Lunas' };
    if (payment.amount >= 250000) return { status: 'paid', label: 'Lunas' };
    return { status: 'partial', label: 'Cicilan' };
  };

  const handlePay = (student) => {
    setSelectedStudent(student);
    setPaymentForm({
      ...paymentForm,
      month: selectedMonth
    });
    setShowPayModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const newPayment = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      student_class: selectedStudent.class,
      amount: paymentForm.amount,
      month: paymentForm.month,
      method: paymentForm.method,
      note: paymentForm.note,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('student_payments').insert([newPayment]);
      if (error) throw error;
      
      setPayments([newPayment, ...payments]);
      setLastPayment(newPayment);
      setShowPayModal(false);
      setShowReceipt(true);
      toast.success("Pembayaran berhasil dicatat!");
    } catch (err) {
      // Fallback
      setPayments([newPayment, ...payments]);
      setLastPayment(newPayment);
      setShowPayModal(false);
      setShowReceipt(true);
      toast.success("Pembayaran dicatat (Mode Lokal)");
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handlePaySalary = (teacher, hours, allowance, total) => {
    setLastSalaryPayment({
      teacher,
      hours,
      allowance,
      total,
      month: selectedMonth,
      date: new Date().toISOString()
    });
    setShowSalaryReceipt(true);
  };

  const filteredStudents = students.filter(s => {
    const matchClass = selectedClass === 'Semua' || s.class === selectedClass;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (s.nisn && s.nisn.includes(searchTerm));
    return matchClass && matchSearch;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalStudents = students.length;
  const paidThisMonth = payments.filter(p => p.month === selectedMonth).length;

  return (
    <div className="finance-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <Wallet size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Manajemen Keuangan</h1>
            <p className="page-subtitle">Kelola pembayaran SPP dan administrasi siswa secara transparan.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-premium btn-primary-premium" onClick={() => toast('Fitur Ekspor Segera Hadir', { icon: '⏳' })}>
            <Download size={18} />
            <span>Rekap Bulanan</span>
          </button>
        </div>
      </div>

      <div className="finance-tabs">
        <button 
          className={`finance-tab-btn ${activeTab === 'spp' ? 'active' : ''}`}
          onClick={() => setActiveTab('spp')}
        >
          SPP Siswa
        </button>
        <button 
          className={`finance-tab-btn ${activeTab === 'gaji' ? 'active' : ''}`}
          onClick={() => setActiveTab('gaji')}
        >
          Penggajian Guru
        </button>
      </div>

      {activeTab === 'spp' && (
        <>
          <div className="finance-summary-grid">
        <motion.div whileHover={{ y: -5 }} className="glass-card summary-card">
          <div className="summary-icon total">
            <TrendingUp size={24} />
          </div>
          <div className="summary-info">
            <span>Total Terkumpul</span>
            <h3>Rp {(totalCollected / 1000000).toFixed(1)} JT</h3>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="glass-card summary-card">
          <div className="summary-icon pending">
            <CheckCircle2 size={24} />
          </div>
          <div className="summary-info">
            <span>Sudah Lunas ({months[selectedMonth-1]})</span>
            <h3>{paidThisMonth} Siswa</h3>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card summary-card">
          <div className="summary-icon overdue">
            <AlertCircle size={24} />
          </div>
          <div className="summary-info">
            <span>Belum Lunas</span>
            <h3>{totalStudents - paidThisMonth} Siswa</h3>
          </div>
        </motion.div>
      </div>

      <div className="glass-card table-container">
        <div className="finance-filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari nama siswa atau NISN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CustomSelect 
            options={['Semua Kelas', ...classes.map(c => `Kelas ${c}`)]}
            value={selectedClass === 'Semua' ? 'Semua Kelas' : `Kelas ${selectedClass}`}
            onChange={(val) => setSelectedClass(val === 'Semua Kelas' ? 'Semua' : val.replace('Kelas ', ''))}
            icon={Filter}
          />
          <CustomSelect 
            options={months}
            value={months[selectedMonth - 1]}
            onChange={(val) => setSelectedMonth(months.indexOf(val) + 1)}
            icon={FileText}
          />
        </div>

        <div className="data-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Status ({months[selectedMonth-1]})</th>
                <th>Besar Iuran</th>
                <th>Terakhir Bayar</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const status = getPaymentStatus(student.id, selectedMonth);
                const lastPay = payments.find(p => p.student_id === student.id);
                
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div 
                          onClick={() => navigate(`/student/${student.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="student-name">{student.name}</span>
                          <span className="student-class">Kelas {student.class}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-payment ${status.status}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>Rp 250.000</td>
                    <td>
                      {lastPay ? new Date(lastPay.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns">
                        <button className="icon-btn-sm pay" title="Bayar Sekarang" onClick={() => handlePay(student)}>
                          <CreditCard size={16} />
                        </button>
                        <button className="icon-btn-sm history" title="Riwayat">
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-muted">
              Tidak ada data siswa ditemukan.
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {activeTab === 'gaji' && (
        <div className="payroll-section">
          <div className="payroll-controls">
            <div className="rate-input-group">
              <label>Tarif per Jam (Rp):</label>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
              />
            </div>
            <CustomSelect 
              options={months}
              value={months[selectedMonth - 1]}
              onChange={(val) => setSelectedMonth(months.indexOf(val) + 1)}
              icon={FileText}
              className="month-select-inline"
            />
          </div>

          <div className="glass-card table-container">
            <div className="data-table-wrapper">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Nama Guru</th>
                    <th>Jam Mengajar (Bulan Ini)</th>
                    <th>Tarif/Jam</th>
                    <th>Tunjangan Jabatan</th>
                    <th>Total Gaji</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, idx) => {
                    const hours = teacherHours[teacher] || 0;
                    const selectedAllowance = teacherAllowances[teacher] || allowanceOptions[0];
                    const totalSalary = (hours * hourlyRate) + selectedAllowance.value;
                    
                    return (
                      <tr key={idx}>
                        <td>
                          <div className="student-cell">
                            <span className="student-name">{teacher}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{hours} Jam</strong>
                          <div style={{fontSize: '0.75rem', color: '#64748b'}}>Dari data presensi</div>
                        </td>
                        <td>Rp {hourlyRate.toLocaleString('id-ID')}</td>
                        <td>
                          <CustomSelect 
                            options={allowanceOptions.map(opt => opt.label)}
                            value={selectedAllowance.label}
                            onChange={(val) => {
                              const opt = allowanceOptions.find(o => o.label === val);
                              setTeacherAllowances({...teacherAllowances, [teacher]: opt});
                            }}
                            className="finance-allowance-select"
                          />
                        </td>
                        <td>
                          <strong style={{color: '#059669'}}>Rp {totalSalary.toLocaleString('id-ID')}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn-primary-premium" 
                            style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex'}}
                            onClick={() => handlePaySalary(teacher, hours, selectedAllowance, totalSalary)}
                          >
                            <Wallet size={14} /> Bayar Gaji
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {teachers.length === 0 && (
                <div className="text-center py-12 text-muted">
                  Tidak ada data guru ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPayModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="finance-modal"
            >
              <div className="modal-header">
                <h3>Pembayaran SPP</h3>
                <button className="btn-ghost" onClick={() => setShowPayModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={submitPayment}>
                <div className="modal-body">
                  <div className="student-brief mb-6 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                      {selectedStudent?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{selectedStudent?.name}</h4>
                      <p className="text-sm text-slate-500">Kelas {selectedStudent?.class} • NISN {selectedStudent?.nisn}</p>
                    </div>
                  </div>

                  <div className="payment-form-group">
                    <label>Bulan Pembayaran</label>
                    <CustomSelect 
                      options={months}
                      value={months[paymentForm.month - 1]}
                      onChange={(val) => setPaymentForm({...paymentForm, month: months.indexOf(val) + 1})}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label>Jumlah Pembayaran (Rp)</label>
                    <input 
                      type="number" 
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label>Metode Pembayaran</label>
                    <CustomSelect 
                      options={['Tunai', 'Transfer', 'E-Wallet']}
                      value={paymentForm.method}
                      onChange={(val) => setPaymentForm({...paymentForm, method: val})}
                    />
                  </div>

                  <div className="payment-form-group">
                    <label>Catatan (Opsional)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Lunas bulan April"
                      value={paymentForm.note}
                      onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowPayModal(false)}>Batal</button>
                  <button type="submit" className="btn-primary-premium">
                    <Wallet size={18} />
                    <span>Catat Pembayaran</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && lastPayment && (
          <div className="modal-overlay receipt-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="receipt-modal glass-card"
            >
              <div className="receipt-header-print">
                <div className="madrasah-info">
                  <h2>{masterData?.org?.name || 'MADRASAH ALIYAH HUB'}</h2>
                  <p>{masterData?.org?.address || 'Jl. Pendidikan No. 1, Kota Madani'}</p>
                </div>
                <div className="receipt-label">KUITANSI PEMBAYARAN</div>
              </div>

              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Nomor Kuitansi</span>
                  <strong>#PAY-{lastPayment.created_at.slice(-6).toUpperCase()}</strong>
                </div>
                <div className="receipt-row">
                  <span>Tanggal</span>
                  <strong>{new Date(lastPayment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <hr className="receipt-divider" />
                <div className="receipt-row">
                  <span>Diterima Dari</span>
                  <strong>{lastPayment.student_name}</strong>
                </div>
                <div className="receipt-row">
                  <span>Kelas</span>
                  <strong>{lastPayment.student_class}</strong>
                </div>
                <div className="receipt-row">
                  <span>Untuk Pembayaran</span>
                  <strong>SPP Bulan {months[lastPayment.month - 1]}</strong>
                </div>
                <div className="receipt-row">
                  <span>Metode</span>
                  <strong>{lastPayment.method}</strong>
                </div>
                <div className="receipt-total-box">
                  <span>TOTAL PEMBAYARAN</span>
                  <h2>Rp {lastPayment.amount.toLocaleString('id-ID')}</h2>
                </div>
              </div>

              <div className="receipt-footer no-print">
                <button className="btn btn-ghost" onClick={() => setShowReceipt(false)}>Tutup</button>
                <button className="btn-primary-premium" onClick={handlePrintReceipt}>
                  <Printer size={18} />
                  <span>Cetak Kuitansi</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salary Receipt Modal */}
      <AnimatePresence>
        {showSalaryReceipt && lastSalaryPayment && (
          <div className="modal-overlay receipt-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="receipt-modal glass-card"
            >
              <div className="receipt-header-print">
                <div className="madrasah-info">
                  <h2>MADRASAH ALIYAH HUB</h2>
                  <p>Jl. Pendidikan No. 1, Kota Madani</p>
                </div>
                <div className="receipt-label">SLIP GAJI GURU</div>
              </div>

              <div className="receipt-body">
                <div className="receipt-row">
                  <span>No. Slip</span>
                  <strong>#PAY-{Date.now().toString().slice(-6).toUpperCase()}</strong>
                </div>
                <div className="receipt-row">
                  <span>Tanggal Cetak</span>
                  <strong>{new Date(lastSalaryPayment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <hr className="receipt-divider" />
                <div className="receipt-row">
                  <span>Nama Guru</span>
                  <strong>{lastSalaryPayment.teacher}</strong>
                </div>
                <div className="receipt-row">
                  <span>Periode Gaji</span>
                  <strong>Bulan {months[lastSalaryPayment.month - 1]}</strong>
                </div>
                <div className="receipt-row">
                  <span>Jam Mengajar (Absensi)</span>
                  <strong>{lastSalaryPayment.hours} Jam</strong>
                </div>
                <div className="receipt-row">
                  <span>Tarif per Jam</span>
                  <strong>Rp {hourlyRate.toLocaleString('id-ID')}</strong>
                </div>
                {lastSalaryPayment.allowance && lastSalaryPayment.allowance.value > 0 && (
                  <div className="receipt-row">
                    <span>{lastSalaryPayment.allowance.name}</span>
                    <strong>Rp {lastSalaryPayment.allowance.value.toLocaleString('id-ID')}</strong>
                  </div>
                )}
                <div className="receipt-total-box" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                  <span style={{ color: '#1d4ed8' }}>TOTAL GAJI DIBAYARKAN</span>
                  <h2 style={{ color: '#1e40af' }}>Rp {lastSalaryPayment.total.toLocaleString('id-ID')}</h2>
                </div>
              </div>

              <div className="receipt-footer no-print">
                <button className="btn btn-ghost" onClick={() => setShowSalaryReceipt(false)}>Tutup</button>
                <button className="btn-primary-premium" onClick={handlePrintReceipt}>
                  <Printer size={18} />
                  <span>Cetak Slip Gaji</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Finance;
