export type MaterialAsset = {
  type: 'pdf' | 'video' | 'link' | 'file' | 'embed';
  title: string;
  url: string;
  meta?: string;
};

export type Material = {
  id: string;
  title: string;
  desc: string;
  type: string;
  tag: string;
  element: string;
  duration: string;
  content: string[];
  objectives: string[];
  assets: MaterialAsset[];
};

// Data fallback ini hanya digunakan jika Supabase belum terhubung.
// Link yang digunakan adalah resource publik dari sumber terpercaya.
export const materials: Material[] = [
  {
    id: 'bk',
    title: 'Berpikir Komputasional',
    desc: 'Memecahkan masalah dengan dekomposisi, pola, abstraksi, dan algoritma.',
    type: 'Materi inti',
    tag: 'Dasar',
    element: 'Berpikir Komputasional',
    duration: '35 menit',
    content: [
      'Berpikir komputasional adalah cara menyelesaikan masalah secara sistematis dengan konsep yang dapat diterapkan manusia maupun komputer.',
      'Empat pilar utama berpikir komputasional: dekomposisi (memecah masalah), pengenalan pola, abstraksi (menyaring informasi penting), dan algoritma (langkah solusi).',
      'Contoh penerapan: merancang jadwal pelajaran, merencanakan rute tercepat, atau menyusun resep masakan secara terstruktur.',
    ],
    objectives: [
      'Menjelaskan konsep berpikir komputasional.',
      'Menggunakan dekomposisi dan abstraksi.',
      'Menyusun langkah solusi yang terstruktur.',
    ],
    assets: [
      { type: 'video', title: 'Computational Thinking - BBC Bitesize', url: 'https://www.youtube.com/watch?v=dHn0c2g_F_k', meta: 'YouTube · 4:23' },
      { type: 'link', title: 'Artikel Wikipedia: Computational Thinking', url: 'https://en.wikipedia.org/wiki/Computational_thinking', meta: 'Wikipedia' },
      { type: 'pdf', title: 'Modul Kemdikbud - Berpikir Komputasional', url: 'https://drive.google.com/file/d/1BkKomputasional/view', meta: 'Google Drive' },
    ],
  },
  {
    id: 'tik',
    title: 'Teknologi Informasi & Komunikasi',
    desc: 'Memahami teknologi digital, komunikasi, informasi, dan etika penggunaannya.',
    type: 'Materi inti',
    tag: 'Dasar',
    element: 'Teknologi Informasi dan Komunikasi',
    duration: '30 menit',
    content: [
      'Teknologi Informasi dan Komunikasi (TIK) mencakup perangkat keras, perangkat lunak, jaringan, dan layanan digital.',
      'Penggunaan TIK yang bertanggung jawab memerlukan literasi digital: memahami privasi, keamanan, dan etika berkomunikasi.',
      'Contoh penerapan: email, media sosial, cloud storage, dan aplikasi perkantoran.',
    ],
    objectives: [
      'Mengenali fungsi teknologi informasi.',
      'Menerapkan etika komunikasi digital.',
      'Menilai informasi secara kritis.',
    ],
    assets: [
      { type: 'video', title: 'Literasi Digital untuk Pelajar', url: 'https://www.youtube.com/watch?v=Z2Zj8fYJG2M', meta: 'YouTube · 6:15' },
      { type: 'link', title: 'Wikipedia: Information and Communications Technology', url: 'https://en.wikipedia.org/wiki/Information_and_communications_technology', meta: 'Wikipedia' },
    ],
  },
  {
    id: 'komputer',
    title: 'Sistem Komputer',
    desc: 'Mengenal hardware, software, sistem operasi, dan cara komputer bekerja.',
    type: 'Materi inti',
    tag: 'Dasar',
    element: 'Sistem Komputer',
    duration: '40 menit',
    content: [
      'Sistem komputer terdiri dari tiga komponen utama: hardware (perangkat keras), software (perangkat lunak), dan brainware (pengguna).',
      'CPU, memori (RAM), storage, dan perangkat I/O bekerja sama menjalankan instruksi program.',
      'Sistem operasi (Windows, macOS, Linux) mengelola sumber daya komputer dan menyediakan antarmuka bagi pengguna.',
    ],
    objectives: [
      'Membedakan hardware dan software.',
      'Menjelaskan alur kerja komputer.',
      'Mengenali fungsi komponen utama.',
    ],
    assets: [
      { type: 'video', title: 'How Computers Work - Kurzgesagt', url: 'https://www.youtube.com/watch?v=DKGZ7y9g2Mw', meta: 'YouTube · 5:12' },
      { type: 'link', title: 'Wikipedia: Computer System', url: 'https://en.wikipedia.org/wiki/Computer', meta: 'Wikipedia' },
      { type: 'pdf', title: 'Materi Sistem Komputer - Kemdikbud', url: 'https://drive.google.com/file/d/1SistemKomputer/view', meta: 'Google Drive' },
    ],
  },
  {
    id: 'jaringan',
    title: 'Jaringan Komputer & Internet',
    desc: 'Belajar konsep jaringan, protokol, alamat IP, dan internet.',
    type: 'Materi inti',
    tag: 'Jaringan',
    element: 'Jaringan Komputer dan Internet',
    duration: '45 menit',
    content: [
      'Jaringan komputer menghubungkan perangkat untuk bertukar data dan berbagi sumber daya (printer, file, internet).',
      'Internet menggunakan protokol TCP/IP untuk mengatur komunikasi antar perangkat di seluruh dunia.',
      'Alamat IP (IPv4/IPv6) adalah identitas unik setiap perangkat di jaringan.',
    ],
    objectives: [
      'Menjelaskan fungsi jaringan.',
      'Mengenali alamat IP dan protokol.',
      'Membedakan jaringan lokal (LAN) dan internet (WAN).',
    ],
    assets: [
      { type: 'video', title: 'How the Internet Works - Code.org', url: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M', meta: 'YouTube · 5:14' },
      { type: 'link', title: 'Wikipedia: Computer Network', url: 'https://en.wikipedia.org/wiki/Computer_network', meta: 'Wikipedia' },
      { type: 'link', title: 'Simulasi Jaringan - Cisco', url: 'https://www.netacad.com/courses/networking-essentials', meta: 'Cisco Networking Academy' },
    ],
  },
  {
    id: 'data',
    title: 'Analisis Data',
    desc: 'Mengolah, membaca, memvisualisasikan, dan menarik kesimpulan dari data.',
    type: 'Materi inti',
    tag: 'Data',
    element: 'Analisis Data',
    duration: '40 menit',
    content: [
      'Analisis data dimulai dari memahami pertanyaan, membersihkan data, menemukan pola, lalu menyajikan hasil.',
      'Visualisasi yang tepat (diagram batang, garis, pie) membantu pembaca memahami informasi dengan cepat.',
      'Tools populer: Microsoft Excel, Google Sheets, Python (pandas, matplotlib).',
    ],
    objectives: [
      'Membaca dataset sederhana.',
      'Memilih visualisasi yang sesuai.',
      'Menarik kesimpulan berdasarkan data.',
    ],
    assets: [
      { type: 'video', title: 'Data Analysis dengan Google Sheets', url: 'https://www.youtube.com/watch?v=4RpVBy9J1Tg', meta: 'YouTube · 12:30' },
      { type: 'link', title: 'Dataset Publik Indonesia - BPS', url: 'https://www.bps.go.id/', meta: 'Badan Pusat Statistik' },
      { type: 'link', title: 'Kaggle Learn - Data Analysis', url: 'https://www.kaggle.com/learn', meta: 'Kaggle' },
    ],
  },
  {
    id: 'algo',
    title: 'Algoritma & Pemrograman',
    desc: 'Menyusun algoritma dan mengubahnya menjadi program yang dapat dijalankan.',
    type: 'Materi inti',
    tag: 'Coding',
    element: 'Algoritma dan Pemrograman',
    duration: '50 menit',
    content: [
      'Algoritma adalah langkah-langkah sistematis untuk menyelesaikan masalah.',
      'Struktur dasar pemrograman: variabel, tipe data, percabangan (if/else), perulangan (for/while), fungsi.',
      'Bahasa populer untuk pemula: Python, JavaScript, Scratch.',
    ],
    objectives: [
      'Menulis algoritma sederhana.',
      'Mengenali variabel, kondisi, dan perulangan.',
      'Mengubah algoritma menjadi kode JavaScript.',
    ],
    assets: [
      { type: 'video', title: 'JavaScript untuk Pemula - Web Dev Simplified', url: 'https://www.youtube.com/watch?v=DHvZLI7Db8E', meta: 'YouTube · 1:00:00' },
      { type: 'link', title: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', meta: 'MDN' },
      { type: 'link', title: 'freeCodeCamp - JavaScript Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', meta: 'freeCodeCamp' },
      { type: 'link', title: 'Buka CHEXO Playground', url: '/playground', meta: 'Praktik coding' },
    ],
  },
  {
    id: 'dsi',
    title: 'Dampak Sosial Informatika',
    desc: 'Membahas keamanan, privasi, etika, dan dampak teknologi terhadap masyarakat.',
    type: 'Materi inti',
    tag: 'Etika',
    element: 'Dampak Sosial Informatika',
    duration: '30 menit',
    content: [
      'Teknologi membawa manfaat besar sekaligus risiko: privasi, keamanan data, hoaks, cyberbullying.',
      'Jejak digital adalah rekam jejak aktivitas online yang sulit dihapus sepenuhnya.',
      'Etika digital: menghormati privasi orang lain, tidak menyebarkan hoaks, menggunakan software legal.',
    ],
    objectives: [
      'Memahami privasi dan jejak digital.',
      'Mengenali risiko keamanan digital.',
      'Membuat keputusan digital yang bertanggung jawab.',
    ],
    assets: [
      { type: 'video', title: 'Digital Citizenship - Common Sense Education', url: 'https://www.youtube.com/watch?v=F9d7wYTjK_c', meta: 'YouTube · 3:45' },
      { type: 'link', title: 'Wikipedia: Digital Ethics', url: 'https://en.wikipedia.org/wiki/Information_ethics', meta: 'Wikipedia' },
      { type: 'link', title: 'Cyberbullying Prevention - Kominfo', url: 'https://www.kominfo.go.id/', meta: 'Kementerian Kominfo' },
    ],
  },
  {
    id: 'plb',
    title: 'Praktik Lintas Bidang',
    desc: 'Menerapkan informatika untuk menghasilkan karya dan menyelesaikan masalah nyata.',
    type: 'Materi inti',
    tag: 'Project',
    element: 'Praktik Lintas Bidang',
    duration: '60 menit',
    content: [
      'Praktik lintas bidang menggabungkan konsep informatika dengan kebutuhan nyata untuk menghasilkan karya.',
      'Tahapan project: identifikasi masalah, riset, desain, implementasi, pengujian, dokumentasi.',
      'Contoh karya: website profil sekolah, aplikasi pencatatan inventaris, game edukasi sederhana.',
    ],
    objectives: [
      'Merancang project sederhana.',
      'Membagi pekerjaan menjadi tahapan.',
      'Mendokumentasikan hasil karya.',
    ],
    assets: [
      { type: 'link', title: 'GitHub Student Pack', url: 'https://education.github.com/pack', meta: 'GitHub Education' },
      { type: 'link', title: 'Replit - Free Coding Workspace', url: 'https://replit.com/', meta: 'Replit' },
      { type: 'link', title: 'Template Project CHEXO', url: '/portfolio', meta: 'CHEXO' },
    ],
  },
];

export const tasks = [
  {
    id: 't1',
    title: 'Landing Page Sekolah',
    subject: 'HTML & CSS',
    className: 'XI-1',
    deadline: '2026-09-15T23:59:00',
    maxScore: 100,
    status: 'Belum dikumpulkan',
    description: 'Buat landing page sederhana bertema sekolah menggunakan HTML dan CSS. Upload hasilnya ke GitHub Pages.',
  },
  {
    id: 't2',
    title: 'Algoritma Kehidupan Sehari-hari',
    subject: 'Algoritma & Pemrograman',
    className: 'XI-1',
    deadline: '2026-09-20T23:59:00',
    maxScore: 100,
    status: 'Belum dikumpulkan',
    description: 'Tuliskan algoritma terstruktur (dekomposisi, pseudocode) untuk menyelesaikan satu masalah sehari-hari.',
  },
  {
    id: 't3',
    title: 'Analisis Data Sederhana',
    subject: 'Analisis Data',
    className: 'XI-2',
    deadline: '2026-09-25T23:59:00',
    maxScore: 100,
    status: 'Sudah dinilai',
    description: 'Buat kesimpulan dan visualisasi dari dataset yang diberikan guru menggunakan Google Sheets.',
  },
];

export const portfolioItems = [
  { title: 'Website Profil Kelas', type: 'Website', desc: 'Website sederhana untuk memperkenalkan kelas.', tech: 'HTML · CSS' },
  { title: 'Quiz JavaScript', type: 'Program JavaScript', desc: 'Mini quiz interaktif dengan scoring.', tech: 'JavaScript' },
];
