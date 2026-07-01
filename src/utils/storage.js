import { supabase, isSupabaseReady } from './supabase';
export { supabase, isSupabaseReady };

// ─── localStorage Keys ────────────────────────────────────────────────
const SUBJECTS_KEY  = 'madrasah_hub_subjects';
const CLASSES_KEY   = 'madrasah_hub_classes';
const TEACHERS_KEY  = 'madrasah_hub_teachers';
const ROLES_KEY     = 'madrasah_hub_roles';
const ORG_KEY       = 'madrasah_hub_org';
const SLIDES_KEY    = 'madrasah_hub_slides';
const STUDENTS_KEY  = 'madrasah_hub_students';
const USER_KEY      = 'madrasah_hub_user';
const SCHEDULE_KEY  = 'madrasah_hub_schedule';
const ACCOUNTS_KEY  = 'madrasah_hub_accounts';
const P5_PROJECTS_KEY = 'madrasah_hub_p5_projects';
const P5_ELEMENTS_KEY = 'madrasah_hub_p5_elements';
const ALLOWANCES_KEY  = 'madrasah_hub_allowances';
const PERMISSIONS_KEY = 'madrasah_hub_permissions';
const BK_RULES_KEY    = 'madrasah_hub_bk_rules';
const BK_RECORDS_KEY  = 'madrasah_hub_bk_records';
const BK_COUNSELING_SCHEDULES_KEY = 'madrasah_hub_bk_counseling_schedules';
const ALUMNI_KEY = 'madrasah_hub_alumni_data';
const BK_LETTERS_KEY = 'madrasah_hub_bk_letters';

// ─── Default Data ─────────────────────────────────────────────────────
const defaults = {
  user: { name: 'Administrator', role: 'Admin', photo: null },
  accounts: [
    { id: 1, username: 'admin',      password: 'password', name: 'Administrator',        role: 'Admin',               photo: null },
    { id: 2, username: 'kepsek',     password: 'password', name: 'Drs. M. Zaini',        role: 'Kepala Madrasah',     photo: null },
    { id: 3, username: 'gurubk',     password: 'password', name: 'Hj. Siti Aminah, M.Pd',role: 'Guru BK',            photo: null },
    { id: 4, username: 'gurumapel',  password: 'password', name: 'Ustadz Ridwan, S.Ag',  role: 'Guru Mata Pelajaran', photo: null },
    { id: 5, username: 'walikelas',  password: 'password', name: 'Laila Husna, S.Si',     role: 'Wali Kelas',          photo: null },
    { id: 6, username: 'pembina',    password: 'password', name: 'Ahmad Fauzi, S.Pd',    role: 'Pembina',             photo: null },
    { id: 7, username: 'ortu',       password: 'password', name: 'Bapak Abdullah',       role: 'Orang Tua',           photo: null },
    { id: 8, username: 'siswa',      password: 'password', name: 'Abdullah Hakim',       role: 'Siswa',               photo: null },
  ],
  subjects: ['Bahasa Indonesia','Matematika','Bahasa Inggris','Fisika','Biologi','Kimia','Ekonomi','Geografi','Sosiologi','Sejarah','PAI','PJOK','Seni Budaya','TIK'],
  classes:  ['X-A','X-B','X-C','XI-A','XI-B','XI-C','XII-A','XII-B','XII-C'],
  teachers: ['Drs. M. Zaini','Hj. Siti Aminah, M.Pd','Ahmad Fauzi, S.Pd','Laila Husna, S.Si', 'Ustadz Ridwan, S.Ag'],
  roles:    ['Kepala Sekolah','Waka Kurikulum','Pembina OSIM','Guru Mata Pelajaran','Wali Kelas','Orang Tua','Siswa'],
  allowances: [
    { id: 'none', label: 'Tanpa Tunjangan (Rp 0)', value: 0, name: '' },
    { id: 'wali', label: 'Wali Kelas (Rp 300rb)', value: 300000, name: 'Tunjangan Wali Kelas' },
    { id: 'eskul', label: 'Pembina Eskul (Rp 200rb)', value: 200000, name: 'Tunjangan Pembina Eskul' },
    { id: 'waka', label: 'Waka / Staf (Rp 750rb)', value: 750000, name: 'Tunjangan Waka / Staf' },
    { id: 'kamad', label: 'Kepala Madrasah (Rp 1.5jt)', value: 1500000, name: 'Tunjangan Kepala Madrasah' }
  ],
  schedule: [
    { id: 1, label: 'I',   time: '07.30 - 08.05', type: 'Belajar' },
    { id: 2, label: 'II',  time: '08.05 - 08.40', type: 'Belajar' },
    { id: 3, label: 'III', time: '08.40 - 09.15', type: 'Belajar' },
    { id: 4, label: 'IV',  time: '09.15 - 09.50', type: 'Belajar' },
    { id: 5, label: '-',   time: '09.50 - 10.10', type: 'Istirahat' },
    { id: 6, label: 'V',   time: '10.10 - 10.45', type: 'Belajar' },
    { id: 7, label: 'VI',  time: '10.45 - 11.20', type: 'Belajar' },
    { id: 8, label: 'VII', time: '11.20 - 11.55', type: 'Belajar' },
    { id: 9, label: 'VIII',time: '11.55 - 12.30', type: 'Belajar' },
  ],
  students: [
    { id: 1, name: 'Abdullah Hakim', nisn: '0012345678', class: 'XII-A', gender: 'L', status: 'Aktif', parentPhone: '6281234567890' },
    { id: 2, name: 'Aisyah Putri',   nisn: '0012345679', class: 'XII-A', gender: 'P', status: 'Aktif', parentPhone: '6281234567891' },
    { id: 3, name: 'Bambang Sudirjo',nisn: '0012345680', class: 'XI-B',  gender: 'L', status: 'Aktif', parentPhone: '6281234567892' },
    { id: 4, name: 'Citra Kirana',   nisn: '0012345681', class: 'X-C',   gender: 'P', status: 'Aktif', parentPhone: '6281234567893' },
  ],
  org: {
    name: 'Madrasah Hub',
    dashboardTitle: 'Madrasah Hub Dashboard',
    dashboardTagline: 'Mencetak Generasi Cerdas, Berakhlak, dan Berkemandirian.',
    address: 'Jl. Contoh No. 123',
    phone: '-', email: '-',
    principal: 'Drs. M. Zaini', principalNip: '19750824 200501 1 002', principalPhoto: null,
    teacherName: 'Ustadz Ridwan, S.Ag', teacherNip: '19821112 201012 1 005',
    chairman: 'H. Ahmad Syarif', chairmanPhoto: null,
    logo: null,
    academicYear: '2024/2025',
    semester: 'Ganjil',
    runningText: 'Selamat Datang di Madrasah Hub • Tetap semangat mencetak Generasi Rabbani •',
    lat: -6.2088, lng: 106.8456, radius: 100,
    quotes: [
      { id: 1, text: "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.", author: 'HR. Bukhari' },
      { id: 2, text: 'Tuntutlah ilmu dari buaian hingga liang lahat.', author: 'Mahfuzhat' },
      { id: 3, text: 'Ilmu tanpa amal bagaikan pohon tanpa buah.', author: 'Pepatah Arab' },
    ],
    agendas: [
      { id: 1, date: '2026-05-10', title: 'Ujian Tengah Semester', category: 'Akademik' },
      { id: 2, date: '2026-05-25', title: 'Rapat Wali Murid',      category: 'Umum'    },
      { id: 3, date: '2026-06-15', title: 'Libur Hari Raya',       category: 'Libur'   },
    ],
    attendanceTrends: [
      { day: 'Sen', value: 92 }, { day: 'Sel', value: 95 },
      { day: 'Rab', value: 88 }, { day: 'Kam', value: 94 },
      { day: 'Jum', value: 98 }, { day: 'Sab', value: 85 },
    ],
    payment: {
      bankName: 'BSI (Bank Syariah Indonesia)',
      bankAccount: '701 234 5678',
      bankHolder: 'YAYASAN MADRASAH HUB',
      ewalletName: 'OVO / DANA / GoPay',
      ewalletNumber: '0812 3456 7890',
      ewalletHolder: 'MADRASAH HUB',
      confirmWhatsApp: '0812-3456-7890'
    },
  },
  slides: [
    { id: 1, url: '/madrasah_activity_1_1777214815823.png', title: 'Kemandirian & Akhlakul Karimah', desc: 'Mencetak generasi cerdas yang berjiwa Islami.' },
    { id: 2, url: '/madrasah_activity_2_1777214845095.png', title: 'Pembelajaran Inovatif', desc: 'Menggabungkan teknologi dengan kurikulum madrasah.' },
  ],
  permissions: {
    'Admin': ['/', '/presensi', '/teacher-presence', '/students', '/portal-akademik', '/manajemen-kelas', '/religious', '/quran', '/teacher-study', '/teacher-leaves', '/finance', '/reports', '/manajemen-akses', '/settings', '/ujian-sumatif', '/konseling'],
    'Kepala Madrasah': ['/', '/teacher-presence', '/students', '/portal-akademik', '/manajemen-kelas', '/teacher-study', '/teacher-leaves', '/finance', '/reports', '/settings', '/ujian-sumatif', '/konseling'],
    'Guru BK': ['/', '/students', '/manajemen-kelas', '/religious', '/teacher-study', '/teacher-leaves', '/reports', '/settings', '/ujian-sumatif', '/konseling'],
    'Guru Mata Pelajaran': ['/', '/teacher-dashboard', '/presensi', '/portal-akademik', '/manajemen-kelas', '/quran', '/teacher-study', '/teacher-leaves', '/settings', '/ujian-sumatif', '/konseling'],
    'Wali Kelas': ['/', '/homeroom-dashboard', '/presensi', '/students', '/portal-akademik', '/manajemen-kelas', '/quran', '/teacher-study', '/teacher-leaves', '/finance', '/reports', '/settings', '/ujian-sumatif', '/konseling'],
    'Pembina': ['/presensi', '/students', '/quran', '/teacher-study', '/teacher-leaves', '/settings', '/ujian-sumatif'],
    'Orang Tua': ['/parent-dashboard', '/parent-academic', '/parent-finance', '/settings', '/ujian-sumatif'],
    'Siswa': ['/student-dashboard', '/riwayat-presensi', '/nilai-siswa', '/religious', '/quran', '/teacher-study', '/ujian-sumatif'],
  },
  p5Projects: [
    'Proyek 1: Gaya Hidup Berkelanjutan',
    'Proyek 2: Bangunlah Jiwa dan Raganya',
    'Proyek 3: Suara Demokrasi'
  ],
  p5Elements: [
    { id: 'e1', name: 'Beriman & Bertaqwa', sub: 'Akhlak kepada alam' },
    { id: 'e2', name: 'Gotong Royong', sub: 'Kerjasama dalam tim' },
    { id: 'e3', name: 'Mandiri', sub: 'Tanggung jawab pada tugas' },
    { id: 'e4', name: 'Rahmatan Lil Alamin', sub: 'Keadilan sosial' }
  ],
  bkRules: [
    { id: 1, type: 'Pelanggaran', category: 'Keterlambatan', name: 'Terlambat masuk kelas > 15 menit', point: -5 },
    { id: 2, type: 'Pelanggaran', category: 'Kerapian', name: 'Seragam tidak sesuai ketentuan', point: -10 },
    { id: 3, type: 'Pelanggaran', category: 'Sikap', name: 'Berkelahi di lingkungan madrasah', point: -50 },
    { id: 4, type: 'Prestasi', category: 'Akademik', name: 'Juara 1 Lomba Tingkat Kabupaten', point: 50 },
    { id: 5, type: 'Prestasi', category: 'Akhlak', name: 'Membantu guru/teman tanpa diminta', point: 10 },
  ],
  bkRecords: [],
  bkCounselingSchedules: [],
  alumni: [],
  bkLetters: []
};

// ─── Supabase Table / Key Mapping ─────────────────────────────────────
// master_data table stores: subjects, classes, teachers, roles, schedule, slides
// org_settings table stores: org object
// students table stores: students array
// accounts table stores: accounts array
// user is session-only → localStorage only

const MASTER_KEYS = ['subjects', 'classes', 'teachers', 'roles', 'schedule', 'slides', 'p5Projects', 'p5Elements'];

// ─── localStorage helpers (synchronous) ───────────────────────────────
const getStored = (key, defaultVal) => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try { return JSON.parse(stored); }
  catch { return defaultVal; }
};

const localKeys = {
  subjects: SUBJECTS_KEY, classes: CLASSES_KEY, teachers: TEACHERS_KEY,
  roles: ROLES_KEY, org: ORG_KEY, slides: SLIDES_KEY, students: STUDENTS_KEY,
  user: USER_KEY, schedule: SCHEDULE_KEY, accounts: ACCOUNTS_KEY,
  p5Projects: P5_PROJECTS_KEY, p5Elements: P5_ELEMENTS_KEY,
  allowances: ALLOWANCES_KEY, permissions: PERMISSIONS_KEY,
  bkRules: BK_RULES_KEY, bkRecords: BK_RECORDS_KEY,
  bkCounselingSchedules: BK_COUNSELING_SCHEDULES_KEY,
  alumni: ALUMNI_KEY, bkLetters: BK_LETTERS_KEY
};

// ─── Public: Synchronous read (from localStorage cache) ───────────────
export const getAllData = () => {
  const storedOrg = getStored(ORG_KEY, defaults.org);
  // Deep merge: ensure new fields (like payment) are always present
  const mergedOrg = { ...defaults.org, ...storedOrg, payment: { ...defaults.org.payment, ...(storedOrg.payment || {}) } };
  
  // Merge missing default roles
  let storedRoles = getStored(ROLES_KEY, defaults.roles);
  const missingRoles = defaults.roles.filter(r => !storedRoles.includes(r));
  if (missingRoles.length > 0) {
    storedRoles = [...storedRoles, ...missingRoles];
    localStorage.setItem(ROLES_KEY, JSON.stringify(storedRoles));
  }

  // Merge missing default accounts (like 'siswa')
  let storedAccounts = getStored(ACCOUNTS_KEY, defaults.accounts);
  const missingAccounts = defaults.accounts.filter(defAcc => !storedAccounts.some(acc => acc.username === defAcc.username));
  if (missingAccounts.length > 0) {
    storedAccounts = [...storedAccounts, ...missingAccounts];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(storedAccounts));
  }

  // Force merge Siswa new permissions to avoid breaking changes locally
  let storedPerms = getStored(PERMISSIONS_KEY, defaults.permissions);
  if (storedPerms['Siswa'] && !storedPerms['Siswa'].includes('/religious')) {
    storedPerms['Siswa'] = [...new Set([...storedPerms['Siswa'], '/religious', '/quran', '/teacher-study'])];
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(storedPerms));
  }

  return {
    subjects: getStored(SUBJECTS_KEY,  defaults.subjects),
    classes:  getStored(CLASSES_KEY,   defaults.classes),
    teachers: getStored(TEACHERS_KEY,  defaults.teachers),
    roles:    storedRoles,
    org:      mergedOrg,
    slides:   getStored(SLIDES_KEY,    defaults.slides),
    students: getStored(STUDENTS_KEY,  defaults.students),
    user:     getStored(USER_KEY,      defaults.user),
    schedule: getStored(SCHEDULE_KEY,  defaults.schedule),
    accounts: storedAccounts,
    permissions: (() => {
      const stored = getStored(PERMISSIONS_KEY, defaults.permissions);
      let migrated = false;

      // Merge completely missing roles from defaults
      Object.keys(defaults.permissions).forEach(role => {
        if (!stored[role]) {
          stored[role] = [...defaults.permissions[role]];
          migrated = true;
        }
      });

      // Existing migration for specific routes
      Object.keys(defaults.permissions).forEach(role => {
        if (stored[role]) {
          if (defaults.permissions[role].includes('/teacher-leaves') && !stored[role].includes('/teacher-leaves')) {
            stored[role].push('/teacher-leaves');
            migrated = true;
          }
          if (defaults.permissions[role].includes('/ujian-sumatif') && !stored[role].includes('/ujian-sumatif')) {
            stored[role].push('/ujian-sumatif');
            migrated = true;
          }
          if (defaults.permissions[role].includes('/riwayat-presensi') && !stored[role].includes('/riwayat-presensi')) {
            stored[role].push('/riwayat-presensi');
            migrated = true;
          }
          if (defaults.permissions[role].includes('/konseling') && !stored[role].includes('/konseling')) {
            stored[role].push('/konseling');
            migrated = true;
          }
          if (defaults.permissions[role].includes('/nilai-siswa') && !stored[role].includes('/nilai-siswa')) {
            stored[role].push('/nilai-siswa');
            migrated = true;
          }
          if (defaults.permissions[role].includes('/teacher-presence') && !stored[role].includes('/teacher-presence')) {
            stored[role].push('/teacher-presence');
            migrated = true;
          }
        }
      });
      if (migrated) {
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(stored));
      }
      return stored;
    })(),
    p5Projects: getStored(P5_PROJECTS_KEY, defaults.p5Projects),
    p5Elements: getStored(P5_ELEMENTS_KEY, defaults.p5Elements),
    allowances: getStored(ALLOWANCES_KEY, defaults.allowances),
    bkRules: getStored(BK_RULES_KEY, defaults.bkRules),
    bkRecords: getStored(BK_RECORDS_KEY, defaults.bkRecords),
    bkCounselingSchedules: getStored(BK_COUNSELING_SCHEDULES_KEY, defaults.bkCounselingSchedules),
    alumni: getStored(ALUMNI_KEY, defaults.alumni),
    bkLetters: getStored(BK_LETTERS_KEY, defaults.bkLetters)
  };
};

// ─── Public: Generic Storage Helpers ─────────────────────────────────
export const getFromStorage = (key, defaultVal) => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try { return JSON.parse(stored); }
  catch { return defaultVal; }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save to localStorage for key ${key}:`, err);
    try {
      // If quota exceeded, try clearing large cached images (slides) to free up space
      localStorage.removeItem('madrasah_hub_slides');
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err2) {
      console.error(`Still failing after clearing space:`, err2);
    }
  }
};

// ─── Public: Save (localStorage + background Supabase sync) ───────────
export const saveData = (type, data) => {
  try {
    localStorage.setItem(localKeys[type], JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save data for type ${type}:`, err);
    try {
      localStorage.removeItem('madrasah_hub_slides');
      localStorage.setItem(localKeys[type], JSON.stringify(data));
    } catch (err2) {
      console.error(`Still failing after clearing space:`, err2);
    }
  }
  if (isSupabaseReady) _syncToSupabase(type, data);
};

// ─── Supabase Write ───────────────────────────────────────────────────
const _syncToSupabase = async (type, data) => {
  try {
    if (type === 'org') {
      await supabase.from('org_settings').upsert({ id: 1, data }, { onConflict: 'id' });
    } else if (type === 'students') {
      // Replace all students (simple approach)
      await supabase.from('students').delete().neq('id', 0);
      if (data.length > 0) await supabase.from('students').insert(data.map(s => ({
        name: s.name, 
        nis: s.nis,
        nisn: s.nisn, 
        class: s.class, 
        gender: s.gender,
        status: s.status, 
        parent_phone: s.parentPhone || s.parent_phone,
        birth_place: s.birth_place,
        birth_date: s.birth_date,
        address: s.student_address || s.address,
        photo: s.photo,
        data: s // Store full object in a JSON column if available as backup
      })));
    } else if (type === 'accounts') {
      await supabase.from('accounts').delete().neq('id', 0);
      if (data.length > 0) await supabase.from('accounts').insert(data.map(a => ({
        username: a.username, password: a.password, name: a.name,
        role: a.role, photo: a.photo,
      })));
    } else if (MASTER_KEYS.includes(type)) {
      await supabase.from('master_data').upsert({ key: type, value: data }, { onConflict: 'key' });
    }
    // 'user' is session only — not synced to Supabase
  } catch (err) {
    console.warn('[Supabase sync error]', type, err.message);
  }
};

// ─── Initialize: Pull from Supabase on app boot ───────────────────────
export const initializeFromSupabase = async () => {
  if (!isSupabaseReady) return;

  // Create a timeout promise
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Supabase timeout')), 5000)
  );

  try {
    // Wrap the init logic in a Promise.race with the timeout
    await Promise.race([
      (async () => {
        // 1. org_settings
        const { data: orgRows } = await supabase.from('org_settings').select('data').eq('id', 1).single();
        if (orgRows?.data) localStorage.setItem(ORG_KEY, JSON.stringify({ ...defaults.org, ...orgRows.data }));

        // 2. students
        const { data: students } = await supabase.from('students').select('*').order('id');
        if (students?.length) {
          const mapped = students.map(s => ({
            id: s.id, name: s.name, nisn: s.nisn, class: s.class,
            gender: s.gender, status: s.status, parentPhone: s.parent_phone,
          }));
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(mapped));
        }

        // 3. accounts
        const { data: accounts } = await supabase.from('accounts').select('*').order('id');
        if (accounts?.length) {
          const mapped = accounts.map(a => ({
            id: a.id, username: a.username, password: a.password,
            name: a.name, role: a.role, photo: a.photo,
          }));
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(mapped));
        }

        // 4. master_data
        const { data: masterRows } = await supabase.from('master_data').select('key, value');
        if (masterRows?.length) {
          const keyMap = {
            subjects: SUBJECTS_KEY, classes: CLASSES_KEY, teachers: TEACHERS_KEY,
            roles: ROLES_KEY, schedule: SCHEDULE_KEY, slides: SLIDES_KEY,
            p5Projects: P5_PROJECTS_KEY, p5Elements: P5_ELEMENTS_KEY,
          };
          masterRows.forEach(row => {
            if (keyMap[row.key]) localStorage.setItem(keyMap[row.key], JSON.stringify(row.value));
          });
        }
      })(),
      timeout
    ]);

    console.log('[Supabase] Data synced successfully.');
  } catch (err) {
    console.warn('[Supabase init error/timeout]', err.message, '— Using localStorage fallback.');
  }
};

// ─── Upload image to Supabase Storage ────────────────────────────────
export const uploadImage = async (bucket, file, path) => {
  if (!isSupabaseReady) {
    // Fallback: return base64 data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target.result, error: null });
      reader.readAsDataURL(file);
    });
  }
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: publicUrl, error: null };
};

// ─── Legacy exports ───────────────────────────────────────────────────
export const getOrgSettings = () => getStored(ORG_KEY, defaults.org);
export const saveOrgSettings = (data) => saveData('org', data);
export const getSubjects = () => getStored(SUBJECTS_KEY, defaults.subjects);

export const saveStudentGrade = async (gradeData) => {
  if (!supabase) return;
  // Use a composite unique key if possible, or upsert by student_id + subject_name
  const { error } = await supabase
    .from('student_grades')
    .upsert(gradeData, { onConflict: 'student_id,subject_name' });
  if (error) throw error;
};

export const fetchStudentGrades = async (studentIds, subjectName) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_grades')
    .select('*')
    .in('student_id', studentIds)
    .eq('subject_name', subjectName);
  if (error) throw error;
  return data;
};

export const saveStudentSummary = async (summaryData) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('student_summaries')
    .upsert(summaryData, { onConflict: 'student_id' });
  if (error) throw error;
};
