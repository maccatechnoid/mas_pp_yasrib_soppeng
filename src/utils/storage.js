export { supabase, isSupabaseReady } from './supabase';

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

// ─── Default Data ─────────────────────────────────────────────────────
const defaults = {
  user: { name: 'Administrator', role: 'Admin', photo: null },
  accounts: [
    { id: 1, username: 'admin',      password: 'password', name: 'Administrator',        role: 'Admin',               photo: null },
    { id: 2, username: 'kepsek',     password: 'password', name: 'Drs. M. Zaini',        role: 'Kepala Madrasah',     photo: null },
    { id: 3, username: 'gurubk',     password: 'password', name: 'Hj. Siti Aminah, M.Pd',role: 'Guru BK',            photo: null },
    { id: 4, username: 'gurumapel',  password: 'password', name: 'Ustadz Ridwan, S.Ag',  role: 'Guru Mata Pelajaran', photo: null },
    { id: 5, username: 'pembina',    password: 'password', name: 'Ahmad Fauzi, S.Pd',    role: 'Pembina',             photo: null },
  ],
  subjects: ['Bahasa Indonesia','Matematika','Bahasa Inggris','Fisika','Biologi','Kimia','Ekonomi','Geografi','Sosiologi','Sejarah','PAI','PJOK','Seni Budaya','TIK'],
  classes:  ['X-A','X-B','X-C','XI-A','XI-B','XI-C','XII-A','XII-B','XII-C'],
  teachers: ['Drs. M. Zaini','Hj. Siti Aminah, M.Pd','Ahmad Fauzi, S.Pd','Laila Husna, S.Si'],
  roles:    ['Kepala Sekolah','Waka Kurikulum','Pembina OSIM','Guru Mata Pelajaran','Wali Kelas'],
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
  },
  slides: [
    { id: 1, url: '/madrasah_activity_1_1777214815823.png', title: 'Kemandirian & Akhlakul Karimah', desc: 'Mencetak generasi cerdas yang berjiwa Islami.' },
    { id: 2, url: '/madrasah_activity_2_1777214845095.png', title: 'Pembelajaran Inovatif', desc: 'Menggabungkan teknologi dengan kurikulum madrasah.' },
  ],
};

// ─── Supabase Table / Key Mapping ─────────────────────────────────────
// master_data table stores: subjects, classes, teachers, roles, schedule, slides
// org_settings table stores: org object
// students table stores: students array
// accounts table stores: accounts array
// user is session-only → localStorage only

const MASTER_KEYS = ['subjects', 'classes', 'teachers', 'roles', 'schedule', 'slides'];

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
};

// ─── Public: Synchronous read (from localStorage cache) ───────────────
export const getAllData = () => ({
  subjects: getStored(SUBJECTS_KEY,  defaults.subjects),
  classes:  getStored(CLASSES_KEY,   defaults.classes),
  teachers: getStored(TEACHERS_KEY,  defaults.teachers),
  roles:    getStored(ROLES_KEY,     defaults.roles),
  org:      getStored(ORG_KEY,       defaults.org),
  slides:   getStored(SLIDES_KEY,    defaults.slides),
  students: getStored(STUDENTS_KEY,  defaults.students),
  user:     getStored(USER_KEY,      defaults.user),
  schedule: getStored(SCHEDULE_KEY,  defaults.schedule),
  accounts: getStored(ACCOUNTS_KEY,  defaults.accounts),
});

// ─── Public: Save (localStorage + background Supabase sync) ───────────
export const saveData = (type, data) => {
  localStorage.setItem(localKeys[type], JSON.stringify(data));
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
        name: s.name, nisn: s.nisn, class: s.class, gender: s.gender,
        status: s.status, parent_phone: s.parentPhone,
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
