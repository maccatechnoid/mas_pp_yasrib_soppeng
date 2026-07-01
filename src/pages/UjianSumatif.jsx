import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  ClipboardCheck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Trophy,
  X,
  ShieldAlert,
  ListOrdered,
  Check,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllData, getFromStorage, saveToStorage } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import toast from 'react-hot-toast';
import './UjianSumatif.css';

const UjianSumatif = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active-exams');

  // Storage Keys
  const EXAMS_KEY = 'madrasah_hub_exams';
  const ATTEMPTS_KEY = 'madrasah_hub_exam_attempts';

  // State
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  // Form states for creating exams
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamClass, setNewExamClass] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(60);

  // Question Editor modal state
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const [newQuestionType, setNewQuestionType] = useState('pilihan_ganda');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newOptionE, setNewOptionE] = useState('');
  const [newCorrectAnswers, setNewCorrectAnswers] = useState(['A']);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Exam Confirmation modal
  const [examToConfirm, setExamToConfirm] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [participantClass, setParticipantClass] = useState('');

  // Active Exam (CBT Mode) State
  const [activeExam, setActiveExam] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: 'A'/'B'/etc }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [examCompleted, setExamCompleted] = useState(false);
  const [completedAttemptResult, setCompletedAttemptResult] = useState(null);

  // Load Data
  useEffect(() => {
    const systemData = getAllData();
    setSubjects(systemData.subjects || []);
    setClasses(systemData.classes || []);

    const loadedExams = getFromStorage(EXAMS_KEY, []);
    const loadedAttempts = getFromStorage(ATTEMPTS_KEY, []);
    setExams(loadedExams);
    setAttempts(loadedAttempts);

    // Default values for dropdowns
    if (systemData.subjects?.length > 0) setNewExamSubject(systemData.subjects[0]);
    if (systemData.classes?.length > 0) setNewExamClass(systemData.classes[0]);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeExam || examCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Waktu ujian telah habis! Jawaban Anda dikirim secara otomatis.');
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, examCompleted, userAnswers]);

  // Format Seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Create Exam
  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!newExamTitle.trim()) {
      toast.error('Judul ujian tidak boleh kosong.');
      return;
    }

    const newExam = {
      id: Date.now(),
      title: newExamTitle,
      subject: newExamSubject,
      className: newExamClass,
      duration: Number(newExamDuration) || 60,
      questions: []
    };

    const updated = [...exams, newExam];
    setExams(updated);
    saveToStorage(EXAMS_KEY, updated);
    setNewExamTitle('');
    toast.success('Ujian berhasil dibuat! Silakan tambah soal.');
  };

  // Delete Exam
  const handleDeleteExam = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ujian ini beserta seluruh soalnya?')) {
      const updated = exams.filter(e => e.id !== id);
      setExams(updated);
      saveToStorage(EXAMS_KEY, updated);
      toast.success('Ujian berhasil dihapus.');
    }
  };

  // Add Question
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      toast.error('Harap isi teks soal.');
      return;
    }

    if (newQuestionType === 'pilihan_ganda') {
      if (!newOptionA.trim() || !newOptionB.trim() || !newOptionC.trim() || !newOptionD.trim() || !newOptionE.trim()) {
        toast.error('Harap isi seluruh pilihan jawaban (A - E).');
        return;
      }
      if (newCorrectAnswers.length === 0) {
        toast.error('Harap pilih minimal 1 kunci jawaban benar.');
        return;
      }
    }

    const newQuestion = {
      id: editingQuestionId ? editingQuestionId : Date.now(),
      type: newQuestionType,
      questionText: newQuestionText,
      options: newQuestionType === 'pilihan_ganda' ? {
        A: newOptionA,
        B: newOptionB,
        C: newOptionC,
        D: newOptionD,
        E: newOptionE
      } : null,
      correctAnswer: newQuestionType === 'pilihan_ganda' ? [...newCorrectAnswers].sort() : null
    };

    let updatedQuestions;
    if (editingQuestionId) {
      updatedQuestions = selectedExamForQuestions.questions.map(q => q.id === editingQuestionId ? newQuestion : q);
      setEditingQuestionId(null);
      toast.success('Soal berhasil diperbarui.');
    } else {
      updatedQuestions = [...selectedExamForQuestions.questions, newQuestion];
      toast.success('Soal berhasil ditambahkan.');
    }

    const updatedExam = { ...selectedExamForQuestions, questions: updatedQuestions };

    const updatedExams = exams.map(e => e.id === selectedExamForQuestions.id ? updatedExam : e);
    setExams(updatedExams);
    saveToStorage(EXAMS_KEY, updatedExams);

    // Update state of selected exam
    setSelectedExamForQuestions(updatedExam);

    // Clear question form
    setNewQuestionText('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewOptionE('');
    setNewCorrectAnswers(['A']);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setNewQuestionType(q.type);
    setNewQuestionText(q.questionText);
    if (q.type === 'pilihan_ganda') {
      setNewOptionA(q.options?.A || '');
      setNewOptionB(q.options?.B || '');
      setNewOptionC(q.options?.C || '');
      setNewOptionD(q.options?.D || '');
      setNewOptionE(q.options?.E || '');
      setNewCorrectAnswers(Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : (q.correctAnswer ? [q.correctAnswer] : []));
    } else {
      setNewQuestionText(q.questionText);
      setNewQuestionType(q.type);
      setNewOptionA('');
      setNewOptionB('');
      setNewOptionC('');
      setNewOptionD('');
      setNewOptionE('');
      setNewCorrectAnswers(['A']);
    }
  };

  // Delete Question
  const handleDeleteQuestion = (qId) => {
    const updatedQuestions = selectedExamForQuestions.questions.filter(q => q.id !== qId);
    const updatedExam = { ...selectedExamForQuestions, questions: updatedQuestions };

    const updatedExams = exams.map(e => e.id === selectedExamForQuestions.id ? updatedExam : e);
    setExams(updatedExams);
    saveToStorage(EXAMS_KEY, updatedExams);

    setSelectedExamForQuestions(updatedExam);
    toast.success('Soal berhasil dihapus.');
  };

  // Confirm start exam
  const handlePrepareExam = (exam) => {
    if (exam.questions.length === 0) {
      toast.error('Ujian ini belum memiliki soal. Hubungi guru mata pelajaran terkait.');
      return;
    }
    setExamToConfirm(exam);
    // Pre-fill student info based on user role
    if (user.role === 'Orang Tua') {
      // default child name for parent account
      setParticipantName('Abdullah Hakim');
      setParticipantClass('XII-A');
    } else {
      setParticipantName(user.name);
      setParticipantClass(exam.className);
    }
  };

  // Start CBT Mode
  const handleStartExam = () => {
    if (!participantName.trim()) {
      toast.error('Nama peserta harus diisi.');
      return;
    }

    setActiveExam(examToConfirm);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setTimeLeft(examToConfirm.duration * 60);
    setExamCompleted(false);
    setCompletedAttemptResult(null);
    setExamToConfirm(null);
    toast.success(`Ujian dimulai! Semoga sukses, ${participantName}.`);
  };

  // Handle Finish/Submit Exam
  const handleFinishExam = (isAuto = false) => {
    if (!isAuto && !window.confirm('Apakah Anda yakin ingin menyelesaikan ujian dan mengirim jawaban sekarang?')) {
      return;
    }

    // Scoring
    let correctCount = 0;
    const questions = activeExam.questions;
    const pgQuestions = questions.filter(q => q.type !== 'essai');
    const hasEssai = questions.some(q => q.type === 'essai');

    pgQuestions.forEach((q) => {
      let selected = userAnswers[q.id] || [];
      if (!Array.isArray(selected)) selected = [selected];

      let correct = q.correctAnswer || [];
      if (!Array.isArray(correct)) correct = [correct];

      if (selected.length === correct.length && selected.every(v => correct.includes(v))) {
        correctCount++;
      }
    });

    const totalPgQuestions = pgQuestions.length;
    const score = totalPgQuestions > 0 ? Math.round((correctCount / totalPgQuestions) * 100) : 0;

    const attempt = {
      id: Date.now(),
      examId: activeExam.id,
      examTitle: activeExam.title,
      subject: activeExam.subject,
      studentName: participantName,
      className: participantClass,
      score: score,
      correctCount: correctCount,
      incorrectCount: totalPgQuestions - correctCount,
      totalQuestions: questions.length,
      hasEssai: hasEssai,
      answers: userAnswers,
      completedAt: new Date().toISOString()
    };

    // Save attempt
    const updatedAttempts = [attempt, ...attempts];
    setAttempts(updatedAttempts);
    saveToStorage(ATTEMPTS_KEY, updatedAttempts);

    // Show result
    setCompletedAttemptResult(attempt);
    setExamCompleted(true);
    toast.success('Ujian telah selesai dikirim!');
  };

  // Close CBT view
  const handleCloseCbt = () => {
    setActiveExam(null);
    setExamCompleted(false);
    setCompletedAttemptResult(null);
    // Refresh lists
    const loadedAttempts = getFromStorage(ATTEMPTS_KEY, []);
    setAttempts(loadedAttempts);
    setActiveTab('results');
  };

  // Check if role is authorized to manage exams (Admin, Kepala, Guru Mapel, BK, Pembina)
  const canManage = ['Admin', 'Kepala Madrasah', 'Guru Mata Pelajaran', 'Guru BK', 'Pembina'].includes(user?.role);

  // If in CBT Mode, show the full page CBT viewport
  if (activeExam) {
    const questions = activeExam.questions;
    const currentQuestion = questions[currentQuestionIdx];

    return (
      <div className="cbt-container">
        {/* CBT Header */}
        <header className="cbt-header">
          <div className="cbt-brand">
            <ClipboardCheck size={26} className="text-emerald-400" />
            <div>
              <h3>{activeExam.title}</h3>
              <p>{activeExam.subject} • Kelas {activeExam.className}</p>
            </div>
          </div>

          <div className={`cbt-timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button className="cbt-btn-finish" onClick={() => handleFinishExam(false)}>
            Selesai & Kirim
          </button>
        </header>

        {/* CBT Main Layout */}
        <main className="cbt-layout">
          {/* Left Side: Question Screen */}
          <div className="cbt-question-pane">
            {!examCompleted ? (
              <div className="glass-card question-card animate-fade-in">
                <div className="question-header">
                  <span className="question-number">Soal Nomor {currentQuestionIdx + 1} dari {questions.length}</span>
                </div>

                <div className="question-text">
                  <p>{currentQuestion.questionText}</p>
                </div>

                {currentQuestion.type === 'essai' ? (
                  <div className="mt-6">
                    <textarea
                      rows="8"
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Tuliskan jawaban essai Anda di sini..."
                      value={userAnswers[currentQuestion.id] || ''}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [currentQuestion.id]: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="options-list">
                    {Object.entries(currentQuestion.options || {}).map(([key, val]) => {
                      let currentAns = userAnswers[currentQuestion.id];
                      if (currentAns && !Array.isArray(currentAns)) currentAns = [currentAns];
                      const isSelected = Array.isArray(currentAns) && currentAns.includes(key);
                      return (
                        <button
                          key={key}
                          className={`option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            let newAns = Array.isArray(currentAns) ? [...currentAns] : [];
                            if (isSelected) {
                              newAns = newAns.filter(a => a !== key);
                            } else {
                              newAns.push(key);
                            }
                            newAns.sort();
                            if (newAns.length === 0) {
                              const { [currentQuestion.id]: removed, ...rest } = userAnswers;
                              setUserAnswers(rest);
                            } else {
                              setUserAnswers({ ...userAnswers, [currentQuestion.id]: newAns });
                            }
                          }}
                        >
                          <div className="option-badge">{key}</div>
                          <div className="option-text">{val}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="question-navigation mt-8">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0}
                  >
                    <ArrowLeft size={18} className="mr-2" /> Sebelumnya
                  </button>

                  <div className="current-status-badge">
                    {userAnswers[currentQuestion.id] && (Array.isArray(userAnswers[currentQuestion.id]) ? userAnswers[currentQuestion.id].length > 0 : true) ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 size={16} /> Sudah Dijawab ({Array.isArray(userAnswers[currentQuestion.id]) ? userAnswers[currentQuestion.id].join(', ') : userAnswers[currentQuestion.id]})
                      </span>
                    ) : (
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <AlertCircle size={16} /> Belum Dijawab
                      </span>
                    )}
                  </div>

                  {currentQuestionIdx < questions.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    >
                      Selanjutnya <ArrowRight size={18} className="ml-2" />
                    </button>
                  ) : (
                    <button
                      className="btn btn-emerald bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => handleFinishExam(false)}
                    >
                      Selesai Ujian <CheckCircle2 size={18} className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Results Card
              <div className="glass-card result-card animate-scale-up text-center">
                <div className="result-decor">
                  <Trophy size={64} className="text-amber-400 mx-auto" />
                </div>
                <h2>Hasil Ujian</h2>
                <p className="text-slate-500">Terima kasih telah mengikuti ujian ini secara jujur dan mandiri.</p>

                <div className="score-ring-wrapper my-8">
                  <div className="score-ring" style={{
                    borderColor: completedAttemptResult?.score >= 75 ? '#10b981' : '#f59e0b'
                  }}>
                    <span className="score-value">{completedAttemptResult?.score}</span>
                    <span className="score-label">SKOR ANDA</span>
                  </div>
                </div>

                <div className="stats-breakdown grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                  <div className="stat-box-green">
                    <span className="stat-num">{completedAttemptResult?.correctCount}</span>
                    <span className="stat-lbl">Benar</span>
                  </div>
                  <div className="stat-box-red">
                    <span className="stat-num">{completedAttemptResult?.incorrectCount}</span>
                    <span className="stat-lbl">Salah</span>
                  </div>
                </div>

                <div className={`passing-indicator py-3 px-6 rounded-xl font-bold inline-block ${completedAttemptResult?.hasEssai ? 'bg-blue-100 text-blue-800' : (completedAttemptResult?.score >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                  }`}>
                  {completedAttemptResult?.hasEssai ? 'Jawaban Essai Menunggu Penilaian Guru' : (completedAttemptResult?.score >= 75 ? 'Dinyatakan Lulus KKM' : 'Perlu Remedial / Belajar Lagi')}
                </div>

                <div className="mt-8">
                  <button className="btn btn-primary px-8 py-3" onClick={handleCloseCbt}>
                    Kembali Ke Menu Utama
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Navigation Grid Map */}
          {!examCompleted && (
            <div className="cbt-sidebar">
              <div className="sidebar-card-premium p-4">
                <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-700">
                  <ListOrdered size={18} /> Peta Navigasi Soal
                </h4>
                <div className="cbt-grid-map">
                  {questions.map((q, idx) => {
                    const isAnswered = !!userAnswers[q.id];
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <button
                        key={q.id}
                        className={`grid-cell ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                        onClick={() => setCurrentQuestionIdx(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="legend-grid mt-6 border-t pt-4">
                  <div className="legend-item">
                    <div className="legend-dot current"></div>
                    <span>Sedang Dilihat</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot answered"></div>
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot empty"></div>
                    <span>Belum Dijawab</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="summative-exams-container">
      {/* Header */}
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-indigo">
            <ClipboardCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Ujian</h1>
            <p className="page-subtitle">Sistem Evaluasi Akademik dan Computer Based Test (CBT) Terpadu.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="exam-tabs-row">
        <button
          className={`exam-tab-btn ${activeTab === 'active-exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('active-exams')}
        >
          <Play size={16} /> Ujian Aktif
        </button>
        {canManage && (
          <button
            className={`exam-tab-btn ${activeTab === 'manage-exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage-exams')}
          >
            <Plus size={16} /> Kelola
          </button>
        )}
        <button
          className={`exam-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <Trophy size={16} /> Rekap Nilai
        </button>
      </div>

      {/* Main Content */}
      <div className="exam-tab-content">

        {/* Tab 1: Active Exams List */}
        {activeTab === 'active-exams' && (
          <div className="active-exams-list grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const alreadyTaken = attempts.find(a => a.examId === exam.id && a.studentName === (user.role === 'Orang Tua' ? 'Abdullah Hakim' : user.name));
              return (
                <div key={exam.id} className="glass-card exam-card-item">
                  <div className="exam-card-header">
                    <span className="exam-subject-badge">{exam.subject}</span>
                    <span className="exam-class-badge">Kelas {exam.className}</span>
                  </div>
                  <h3 className="exam-title-text mt-3">{exam.title}</h3>

                  <div className="exam-metadata-row mt-4">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{exam.duration} Menit</span>
                    </div>
                    <div className="meta-item">
                      <ListOrdered size={16} />
                      <span>{exam.questions.length} Soal</span>
                    </div>
                  </div>

                  <div className="exam-action-footer mt-6 border-t pt-4">
                    {alreadyTaken ? (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500 text-xs font-semibold uppercase">STATUS: SELESAI</span>
                        <span className={`score-badge ${alreadyTaken.score >= 75 ? 'passed' : 'failed'}`}>
                          Skor: {alreadyTaken.score} ({alreadyTaken.score >= 75 ? 'LULUS' : 'REMEDIAL'})
                        </span>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary w-full justify-center"
                        onClick={() => handlePrepareExam(exam)}
                      >
                        <Play size={16} className="mr-2" /> Mulai Ujian Sumatif
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {exams.length === 0 && (
              <div className="glass-card p-12 text-center col-span-2">
                <ShieldAlert size={48} className="text-slate-300 mx-auto mb-4" />
                <h3>Belum Ada Ujian Aktif</h3>
                <p className="text-slate-500">Saat ini tidak ada jadwal ujian sumatif aktif untuk kelas Anda.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage Exams */}
        {activeTab === 'manage-exams' && canManage && (
          <div className="manage-exams-grid">
            <div className="glass-card p-6">
              <h3 className="card-title mb-4 flex items-center gap-2">
              </h3>

              <form onSubmit={handleCreateExam} className="exam-creation-form flex flex-col gap-4">
                <div className="form-group">
                  <label>Judul Ujian Sumatif</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sumatif Harian Bab 1 Fiqih"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Mata Pelajaran</label>
                    <CustomSelect
                      options={subjects}
                      value={newExamSubject}
                      onChange={setNewExamSubject}
                      icon={BookOpen}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kelas</label>
                    <CustomSelect
                      options={classes}
                      value={newExamClass}
                      onChange={setNewExamClass}
                      icon={Calendar}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Durasi Ujian (Menit)</label>
                  <div className="input-with-icon">
                    <Clock size={18} className="text-slate-400" />
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={newExamDuration}
                      onChange={(e) => setNewExamDuration(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary py-3 justify-center font-bold">
                  <Plus size={18} /> Simpan Kerangka Ujian
                </button>
              </form>
            </div>

            <div className="glass-card p-6">
              <h3 className="card-title mb-4">Daftar Kerangka Ujian</h3>
              <div className="exams-draft-list flex flex-col gap-4">
                {exams.map(exam => (
                  <div key={exam.id} className="draft-exam-card">
                    <div className="draft-exam-info">
                      <h4 className="font-bold text-slate-800">{exam.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {exam.subject} • Kelas {exam.className} • {exam.duration} Menit
                      </p>
                      <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                        {exam.questions.length} Soal Terdaftar
                      </span>
                    </div>

                    <div className="draft-exam-actions">
                      <button
                        className="btn btn-secondary btn-sm px-3 py-1.5"
                        onClick={() => setSelectedExamForQuestions(exam)}
                      >
                        <ListOrdered size={14} className="mr-1" /> Kelola Soal
                      </button>
                      <button
                        className="btn-icon-danger"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {exams.length === 0 && (
                  <div className="text-center text-slate-400 py-8 italic">
                    Belum ada kerangka ujian dibuat. Gunakan form sebelah kiri untuk membuat baru.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Exam Results */}
        {activeTab === 'results' && (
          <div className="glass-card p-6">
            <h3 className="card-title mb-4">Hasil Ujian</h3>
            <div className="se-table-responsive">
              <table className="results-table-premium w-full">
                <thead>
                  <tr>
                    <th>Waktu Pengumpulan</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Ujian Sumatif</th>
                    <th>Mata Pelajaran</th>
                    <th>Benar/Salah</th>
                    <th>Nilai Akhir</th>
                    <th>Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredAttempts = user?.role === 'Siswa' ? attempts.filter(a => a.studentName === user.name) : attempts;
                    return (
                      <>
                        {filteredAttempts.map((att) => (
                          <tr key={att.id}>
                            <td className="time-col">
                              {new Date(att.completedAt).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="name-col">{att.studentName}</td>
                            <td>Kelas {att.className}</td>
                            <td className="title-col">{att.examTitle}</td>
                            <td>{att.subject}</td>
                            <td className="ratio-col">
                              <span className="text-emerald-600 font-semibold">{att.correctCount}</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-rose-600 font-semibold">{att.incorrectCount}</span>
                            </td>
                            <td className="score-col font-bold">{att.score}</td>
                            <td>
                              <span className={`status-pill ${att.score >= 75 ? 'passed' : 'failed'}`}>
                                {att.score >= 75 ? 'Lulus KKM' : 'Remedial'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredAttempts.length === 0 && (
                          <tr>
                            <td colSpan="8" className="text-center text-slate-400 py-12 italic">
                              Belum ada riwayat pengerjaan ujian sumatif.
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Confirm Start Exam */}
      {examToConfirm && (
        <div className="exam-modal-overlay" onClick={() => setExamToConfirm(null)}>
          <div className="exam-modal-content exam-fullscreen glass-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Konfirmasi Data Peserta Ujian</h3>
              <button className="p-1 hover:bg-slate-100 rounded" onClick={() => setExamToConfirm(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-2">
                <h4 className="font-bold text-emerald-800">{examToConfirm.title}</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Mata Pelajaran: {examToConfirm.subject} • Durasi KBM: {examToConfirm.duration} Menit
                </p>
              </div>

              <div className="form-group">
                <label>Nama Lengkap Peserta</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa..."
                />
              </div>

              <div className="form-group">
                <label>Kelas / Rombel</label>
                <input
                  type="text"
                  value={participantClass}
                  onChange={(e) => setParticipantClass(e.target.value)}
                  placeholder="Contoh: XII-A"
                />
              </div>

              <div className="premium-info-box bg-slate-50 border border-slate-200">
                <AlertCircle size={18} className="text-slate-500 shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah menekan tombol <strong>Mulai Ujian</strong>, timer mundur akan berjalan secara otomatis. Pastikan koneksi internet stabil dan selesaikan semua soal sebelum batas waktu habis.
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="btn btn-ghost" onClick={() => setExamToConfirm(null)}>Batal</button>
                <button className="btn btn-primary" onClick={handleStartExam}>
                  <Play size={16} /> Mulai Ujian Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage Questions */}
      {selectedExamForQuestions && (
        <div className="exam-modal-overlay" onClick={() => setSelectedExamForQuestions(null)}>
          <div className="exam-modal-content question-manager glass-card p-6" onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="modal-header-icon-wrapper">
                  <ListOrdered size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Kelola Bank Soal Ujian</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedExamForQuestions.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn-close-modal" onClick={() => {
                  setSelectedExamForQuestions(null);
                  setEditingQuestionId(null);
                }} title="Tutup Modal">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="question-manager-layout">
              {/* Left Column: Form Add Question */}
              <div className="form-add-question-pane">
                <div className="flex justify-end mb-4">
                  <div className="type-toggle-wrapper">
                    <button
                      type="button"
                      className={`type-toggle-btn ${newQuestionType === 'pilihan_ganda' ? 'active' : ''}`}
                      onClick={() => setNewQuestionType('pilihan_ganda')}
                    >Pilihan Ganda</button>
                    <button
                      type="button"
                      className={`type-toggle-btn ${newQuestionType === 'essai' ? 'active' : ''}`}
                      onClick={() => setNewQuestionType('essai')}
                    >Essai</button>
                  </div>
                </div>

                <form onSubmit={handleAddQuestion} className="question-creation-form">
                  <div className="form-group">
                    <label>Teks Pertanyaan Soal</label>
                    <textarea
                      rows="12"
                      placeholder="Tuliskan pertanyaan ujian di sini..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      required
                    />
                  </div>

                  {newQuestionType === 'pilihan_ganda' && (
                    <div className="options-grid-form">
                      <div className="form-group">
                        <label>Pilihan A</label>
                        <div className="option-input-wrapper">
                          <input type="text" placeholder="Jawaban A" value={newOptionA} onChange={(e) => setNewOptionA(e.target.value)} required />
                          <span className="option-input-badge">A</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pilihan B</label>
                        <div className="option-input-wrapper">
                          <input type="text" placeholder="Jawaban B" value={newOptionB} onChange={(e) => setNewOptionB(e.target.value)} required />
                          <span className="option-input-badge">B</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pilihan C</label>
                        <div className="option-input-wrapper">
                          <input type="text" placeholder="Jawaban C" value={newOptionC} onChange={(e) => setNewOptionC(e.target.value)} required />
                          <span className="option-input-badge">C</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pilihan D</label>
                        <div className="option-input-wrapper">
                          <input type="text" placeholder="Jawaban D" value={newOptionD} onChange={(e) => setNewOptionD(e.target.value)} required />
                          <span className="option-input-badge">D</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pilihan E</label>
                        <div className="option-input-wrapper">
                          <input type="text" placeholder="Jawaban E" value={newOptionE} onChange={(e) => setNewOptionE(e.target.value)} required />
                          <span className="option-input-badge">E</span>
                        </div>
                      </div>

                      <div className="form-group md:col-span-2">
                        <label>Kunci Jawaban Benar (Bisa pilih lebih dari 1)</label>
                        <div className="type-toggle-wrapper mt-3" style={{ width: 'fit-content' }}>
                          {['A', 'B', 'C', 'D', 'E'].map(key => {
                            const isSelected = newCorrectAnswers.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setNewCorrectAnswers(newCorrectAnswers.filter(ans => ans !== key));
                                  } else {
                                    setNewCorrectAnswers([...newCorrectAnswers, key].sort());
                                  }
                                }}
                                className={`type-toggle-btn ${isSelected ? 'active' : ''}`}
                              >
                                {key}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-premium btn-primary-premium w-full justify-center py-3 mt-2">
                    <Plus size={18} /> {editingQuestionId ? 'Perbarui Soal' : 'Simpan Soal Ke Bank Soal'}
                  </button>
                  {editingQuestionId && (
                    <button type="button" className="btn btn-ghost w-full justify-center mt-2" onClick={() => {
                      setEditingQuestionId(null);
                      setNewQuestionText('');
                      setNewOptionA('');
                      setNewOptionB('');
                      setNewOptionC('');
                      setNewOptionD('');
                      setNewOptionE('');
                      setNewCorrectAnswers(['A']);
                    }}>
                      Batal Edit
                    </button>
                  )}
                </form>
              </div>

              {/* Right Column: Questions List */}
              <div className="questions-list-pane">
                <h4 className="font-bold text-slate-700 mb-4">
                  Daftar Soal Terinput ({selectedExamForQuestions.questions.length})
                </h4>

                <div className="flex flex-col gap-4">
                  {selectedExamForQuestions.questions.map((q, idx) => (
                    <div key={q.id} className="question-list-card">
                      <div className="question-card-header">
                        <span className="question-card-number">Soal {idx + 1}</span>
                        <div className="flex gap-2">
                          <button
                            className="btn-icon-warning-circle"
                            onClick={() => handleEditQuestion(q)}
                            title="Edit Soal"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-icon-danger-circle"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Hapus Soal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="question-card-text">{q.questionText}</p>

                      {q.type === 'essai' ? (
                        <div className="mt-2 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-sm text-slate-500">
                          (Soal Essai - Jawaban dalam bentuk teks)
                        </div>
                      ) : (
                        <div className="options-preview-grid">
                          {q.options && Object.entries(q.options).map(([key, val]) => {
                            const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(key) : q.correctAnswer === key;
                            return (
                              <div key={key} className={`option-preview-item ${isCorrect ? 'correct' : ''}`}>
                                <span className="option-preview-letter">{key}</span>
                                <span className="option-preview-text">{val}</span>
                                {isCorrect && <CheckCircle2 size={14} className="correct-icon" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedExamForQuestions.questions.length === 0 && (
                    <div className="text-center text-slate-400 py-12 italic">
                      Ujian ini belum memiliki soal. Masukkan data soal di sebelah kiri.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UjianSumatif;
