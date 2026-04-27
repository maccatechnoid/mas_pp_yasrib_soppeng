import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Book, 
  Star, 
  Users,
  LayoutGrid
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { getAllData } from '../utils/storage';
import './Religious.css';

const Religious = () => {
  const [masterData, setMasterData] = useState({ classes: [], students: [] });
  const [selectedClass, setSelectedClass] = useState('');
  
  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
    if (data.classes.length > 0) {
      setSelectedClass(data.classes[0]);
    }
  }, []);

  const filteredStudents = masterData.students.filter(s => s.class === selectedClass);

  const activities = [
    { id: 1, title: 'Sholat Dhuha', time: '07:00 - 08:00', icon: <Clock size={20} />, stats: '85%' },
    { id: 2, title: 'Tadarus Pagi', time: '08:00 - 08:30', icon: <Book size={20} />, stats: '92%' },
    { id: 3, title: 'Sholat Dzuhur Jama\'ah', time: '12:15 - 13:00', icon: <Clock size={20} />, stats: '78%' },
  ];

  return (
    <div className="religious-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Ibadah</h1>
          <p className="page-subtitle">Pantau kedisiplinan ibadah harian siswa Madrasah.</p>
        </div>
      </div>

      <div className="religious-stats-grid">
        {activities.map((act) => (
          <div key={act.id} className="glass-card activity-stat-card">
            <div className="act-icon-box">
              {act.icon}
            </div>
            <div className="act-info">
              <h3>{act.title}</h3>
              <span className="time">{act.time}</span>
              <div className="participation">
                <div className="bar"><div className="fill" style={{ width: act.stats }}></div></div>
                <span className="percent">{act.stats} Siswa</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card religious-form">
        <div className="form-header">
          <div className="header-with-icon">
            <Star className="text-primary" />
            <h3>Input Monitoring Harian</h3>
          </div>
          <span className="badge-today">Hari Ini</span>
        </div>
        
        <div className="class-selector">
          <div className="label-with-icon" style={{ marginBottom: '1rem' }}>
            <Users size={16} />
            <label style={{ fontWeight: 600, fontSize: '0.875rem', marginLeft: '0.5rem' }}>Pilih Kelas</label>
          </div>
          <CustomSelect 
            options={masterData.classes.map(c => `Kelas ${c}`)}
            value={`Kelas ${selectedClass}`}
            onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
            icon={Users}
            className="religious-class-select"
          />
        </div>

        <div className="student-checklist">
          {filteredStudents.map((student) => (
            <div key={student.id} className="checklist-row">
              <span className="student-name">{student.name}</span>
              <div className="check-options">
                <button className="check-btn active">Dhuha</button>
                <button className="check-btn">Tadarus</button>
                <button className="check-btn">Dzuhur</button>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted">
              Tidak ada data siswa untuk kelas ini.
            </div>
          )}
        </div>
        
        <div className="form-footer">
          <button className="btn btn-primary">Simpan Laporan Ibadah</button>
        </div>
      </div>
    </div>
  );
};

export default Religious;
