export type MaterialAsset = {
  type: 'pdf' | 'video' | 'link' | 'file';
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

export const materials: Material[] = [
  { id: 'bk', title: 'Berpikir Komputasional', desc: 'Memecahkan masalah dengan dekomposisi, pola, abstraksi, dan algoritma.', type: 'Materi inti', tag: 'Dasar', element: 'Berpikir Komputasional', duration: '35 menit', content: ['Berpikir komputasional adalah cara menyelesaikan masalah secara sistematis dengan konsep yang dapat diterapkan manusia maupun komputer.', 'Empat pola yang sering digunakan adalah dekomposisi, pengenalan pola, abstraksi, dan penyusunan algoritma.', 'Mulailah dari masalah nyata, pecah menjadi bagian kecil, tentukan informasi yang penting, lalu susun langkah penyelesaian yang dapat diuji.'], objectives: ['Menjelaskan konsep berpikir komputasional.', 'Menggunakan dekomposisi dan abstraksi.', 'Menyusun langkah solusi yang terstruktur.'], assets: [{ type: 'pdf', title: 'Ringkasan Berpikir Komputasional', url: '#', meta: 'PDF · 1,2 MB' }, { type: 'video', title: 'Pengenalan Berpikir Komputasional', url: '#', meta: 'Video · 08:42' }] },
  { id: 'tik', title: 'Teknologi Informasi & Komunikasi', desc: 'Memahami teknologi digital, komunikasi, informasi, dan etika penggunaannya.', type: 'Materi inti', tag: 'Dasar', element: 'Teknologi Informasi dan Komunikasi', duration: '30 menit', content: ['Teknologi informasi membantu manusia mengumpulkan, memproses, menyimpan, dan menyebarkan informasi.', 'Penggunaan teknologi juga membutuhkan literasi digital agar komunikasi tetap aman, efektif, dan bertanggung jawab.'], objectives: ['Mengenali fungsi teknologi informasi.', 'Menerapkan etika komunikasi digital.', 'Menilai informasi secara kritis.'], assets: [{ type: 'link', title: 'Sumber literasi digital', url: '#', meta: 'Link eksternal' }] },
  { id: 'komputer', title: 'Sistem Komputer', desc: 'Mengenal hardware, software, sistem operasi, dan cara komputer bekerja.', type: 'Materi inti', tag: 'Dasar', element: 'Sistem Komputer', duration: '40 menit', content: ['Sistem komputer terdiri dari perangkat keras, perangkat lunak, dan pengguna yang saling berinteraksi.', 'CPU, memori, penyimpanan, dan perangkat input-output bekerja bersama untuk menjalankan instruksi.'], objectives: ['Membedakan hardware dan software.', 'Menjelaskan alur kerja komputer.', 'Mengenali fungsi komponen utama.'], assets: [{ type: 'pdf', title: 'Modul Sistem Komputer', url: '#', meta: 'PDF · 2,4 MB' }] },
  { id: 'jaringan', title: 'Jaringan Komputer & Internet', desc: 'Belajar konsep jaringan, protokol, alamat IP, dan internet.', type: 'Materi inti', tag: 'Jaringan', element: 'Jaringan Komputer dan Internet', duration: '45 menit', content: ['Jaringan menghubungkan perangkat agar dapat bertukar data dan berbagi sumber daya.', 'Internet bekerja menggunakan berbagai protokol, termasuk TCP/IP, untuk mengatur komunikasi antarperangkat.'], objectives: ['Menjelaskan fungsi jaringan.', 'Mengenali alamat IP dan protokol.', 'Membedakan jaringan lokal dan internet.'], assets: [{ type: 'video', title: 'Cara kerja internet secara sederhana', url: '#', meta: 'Video · 11:20' }, { type: 'link', title: 'Simulasi jaringan', url: '#', meta: 'Link · Praktik' }] },
  { id: 'data', title: 'Analisis Data', desc: 'Mengolah, membaca, memvisualisasikan, dan menarik kesimpulan dari data.', type: 'Materi inti', tag: 'Data', element: 'Analisis Data', duration: '40 menit', content: ['Analisis data dimulai dari memahami pertanyaan, membersihkan data, menemukan pola, lalu menyajikan hasil secara jelas.', 'Visualisasi yang tepat membantu pembaca memahami informasi tanpa harus membaca seluruh tabel mentah.'], objectives: ['Membaca dataset sederhana.', 'Memilih visualisasi yang sesuai.', 'Menarik kesimpulan berdasarkan data.'], assets: [{ type: 'file', title: 'Dataset latihan kelas', url: '#', meta: 'CSV · 18 KB' }] },
  { id: 'algo', title: 'Algoritma & Pemrograman', desc: 'Menyusun algoritma dan mengubahnya menjadi program yang dapat dijalankan.', type: 'Materi inti', tag: 'Coding', element: 'Algoritma dan Pemrograman', duration: '50 menit', content: ['Program adalah instruksi yang ditulis dengan aturan tertentu agar komputer dapat menjalankan solusi.', 'Sebelum coding, tuliskan algoritma, tentukan input dan output, lalu uji solusi dengan beberapa contoh.'], objectives: ['Menulis algoritma sederhana.', 'Mengenali variabel, kondisi, dan perulangan.', 'Mengubah algoritma menjadi JavaScript.'], assets: [{ type: 'video', title: 'JavaScript untuk pemula', url: '#', meta: 'Video · 14:05' }, { type: 'link', title: 'Buka CHEXO Playground', url: '/playground', meta: 'Praktik coding' }] },
  { id: 'dsi', title: 'Dampak Sosial Informatika', desc: 'Membahas keamanan, privasi, etika, dan dampak teknologi terhadap masyarakat.', type: 'Materi inti', tag: 'Etika', element: 'Dampak Sosial Informatika', duration: '30 menit', content: ['Teknologi dapat membawa manfaat besar sekaligus risiko. Privasi, keamanan, jejak digital, dan etika perlu dipahami sejak dini.', 'Setiap pengguna bertanggung jawab mempertimbangkan dampak dari tindakan digitalnya.'], objectives: ['Memahami privasi dan jejak digital.', 'Mengenali risiko keamanan digital.', 'Membuat keputusan digital yang bertanggung jawab.'], assets: [{ type: 'pdf', title: 'Panduan keamanan digital', url: '#', meta: 'PDF · 900 KB' }] },
  { id: 'plb', title: 'Praktik Lintas Bidang', desc: 'Menerapkan informatika untuk menghasilkan karya dan menyelesaikan masalah nyata.', type: 'Materi inti', tag: 'Project', element: 'Praktik Lintas Bidang', duration: '60 menit', content: ['Praktik lintas bidang menggabungkan konsep informatika dengan kebutuhan nyata untuk menghasilkan karya.', 'Project yang baik memiliki tujuan, pengguna, proses pengembangan, pengujian, dan dokumentasi.'], objectives: ['Merancang project sederhana.', 'Membagi pekerjaan menjadi tahapan.', 'Mendokumentasikan hasil karya.'], assets: [{ type: 'link', title: 'Template project CHEXO', url: '/portfolio', meta: 'Panduan' }] },
];

export const tasks = [
  { id: 't1', title: 'Landing Page Sekolah', subject: 'HTML & CSS', className: 'XI-1', deadline: '2026-08-20T23:59:00', maxScore: 100, status: 'Belum dikumpulkan', description: 'Buat landing page sederhana bertema sekolah menggunakan HTML dan CSS.' },
  { id: 't2', title: 'Algoritma Kehidupan Sehari-hari', subject: 'Algoritma & Pemrograman', className: 'XI-1', deadline: '2026-08-24T23:59:00', maxScore: 100, status: 'Belum dikumpulkan', description: 'Tuliskan algoritma terstruktur untuk menyelesaikan satu masalah sehari-hari.' },
  { id: 't3', title: 'Analisis Data Sederhana', subject: 'Analisis Data', className: 'XI-2', deadline: '2026-08-27T23:59:00', maxScore: 100, status: 'Sudah dinilai', description: 'Buat kesimpulan dari dataset yang diberikan guru.' },
];

export const portfolioItems = [
  { title: 'Website Profil Kelas', type: 'Website', desc: 'Website sederhana untuk memperkenalkan kelas.', tech: 'HTML · CSS' },
  { title: 'Quiz JavaScript', type: 'Program JavaScript', desc: 'Mini quiz interaktif dengan scoring.', tech: 'JavaScript' },
];
