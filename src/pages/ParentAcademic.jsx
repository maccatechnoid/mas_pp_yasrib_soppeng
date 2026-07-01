import React, { useState } from 'react';
import { BookOpen, Trophy, Bookmark, Book } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentAcademic = () => {
  // Mock data for Abdullah Hakim
  const grades = [
    { subject: 'PAI', score: 90, predicate: 'A' },
    { subject: 'Bahasa Indonesia', score: 85, predicate: 'B+' },
    { subject: 'Matematika', score: 88, predicate: 'A-' },
    { subject: 'Bahasa Inggris', score: 82, predicate: 'B' },
  ];

  const hafalan = [
    { date: '12 Mei 2026', surah: 'Al-Mulk', ayat: '1-10', predikat: 'Mumtaz', guru: 'Ustadz Ridwan' },
    { date: '10 Mei 2026', surah: 'As-Sajdah', ayat: '1-15', predikat: 'Jayyid Jiddan', guru: 'Ustadz Ridwan' },
    { date: '08 Mei 2026', surah: 'As-Sajdah', ayat: '16-30', predikat: 'Mumtaz', guru: 'Ustadz Ridwan' }
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-amber">
            <BookOpen size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Akademik & Hafalan</h1>
            <p className="page-subtitle">Pantau nilai mata pelajaran dan hafalan Qur'an ananda.</p>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Trophy size={24} className="text-primary" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Nilai Tengah Semester (Mock)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-detail-table">
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>Nilai Angka</th>
                <th>Predikat</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i}>
                  <td>{g.subject}</td>
                  <td><strong>{g.score}</strong></td>
                  <td><span className="status-pill hadir">{g.predicate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <BookOpen size={24} className="text-success" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Jurnal Setoran Hafalan (Tahfidz)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-detail-table">
            <thead>
              <tr>
                <th>Tanggal Setoran</th>
                <th>Surah</th>
                <th>Ayat</th>
                <th>Predikat</th>
                <th>Penyimak</th>
              </tr>
            </thead>
            <tbody>
              {hafalan.map((h, i) => (
                <tr key={i}>
                  <td>{h.date}</td>
                  <td><strong>{h.surah}</strong></td>
                  <td>{h.ayat}</td>
                  <td><span className="status-pill izin">{h.predikat}</span></td>
                  <td>{h.guru}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentAcademic;
