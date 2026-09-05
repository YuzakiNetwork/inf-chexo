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

// Data fallback - Kurikulum Merdeka Informatika Kelas 11
// Link menggunakan resource publik dari sumber terpercaya
export const materials: Material[] = [
  {
    id: 'tentang-informatika',
    title: 'Tentang Informatika',
    desc: 'Pengertian, ruang lingkup, dan delapan elemen informatika.',
    type: 'Materi inti',
    tag: 'Dasar',
    element: 'Berpikir Komputasional',
    duration: '40 menit',
    content: [
      'Informatika adalah disiplin ilmu yang mempelajari teori, metodologi, dan praktik untuk mengelola serta memproses informasi secara otomatis menggunakan komputer.',
      'Ruang lingkup informatika mencakup pemrosesan data, algoritma, pemrograman, jaringan, kecerdasan buatan, dan dampak sosial teknologi.',
      'Informatika berhubungan erat dengan teknologi (hardware/software), sains (matematika, logika), dan kehidupan sehari-hari (komunikasi, bisnis, pendidikan).',
      'Delapan elemen Informatika menurut Kurikulum Merdeka: berpikir komputasional, TIK, sistem komputer, jaringan komputer & internet, analisis data, algoritma & pemrograman, dampak sosial informatika, dan praktik lintas bidang.',
    ],
    objectives: [
      'Menjelaskan pengertian dan ruang lingkup informatika.',
      'Mengidentifikasi hubungan informatika dengan bidang lain.',
      'Mengenali delapan elemen informatika.',
    ],
    assets: [
      { type: 'link', title: 'Materi Informatika Kelas 11 - Mamikos', url: 'https://mamikos.com/info/materi-informatika-kelas-11-kurikulum-merdeka-pljr/', meta: 'Artikel' },
      { type: 'link', title: 'Wikipedia: Informatika', url: 'https://id.wikipedia.org/wiki/Informatika', meta: 'Wikipedia' },
      { type: 'video', title: 'Apa itu Informatika? - YouTube Edu', url: 'https://www.youtube.com/results?search_query=pengertian+informatika+kurikulum+merdeka', meta: 'YouTube' },
    ],
  },
  {
    id: 'strategi-algoritmik',
    title: 'Strategi Algoritmik dan Pemrograman',
    desc: 'Proses merancang program, berpikir komputasional, hingga algoritma lanjut.',
    type: 'Materi inti',
    tag: 'Coding',
    element: 'Algoritma dan Pemrograman',
    duration: '90 menit',
    content: [
      'Proses merancang dan menguji program: identifikasi masalah, analisis kebutuhan, desain algoritma, implementasi kode, testing, dan debugging.',
      'Berpikir komputasional: dekomposisi, pengenalan pola, abstraksi, dan algoritma sebagai fondasi menyelesaikan masalah.',
      'Rekursi: teknik di mana fungsi memanggil dirinya sendiri untuk menyelesaikan sub-masalah yang lebih kecil (contoh: faktorial, fibonacci, tower of Hanoi).',
      'Algoritma greedy: pendekatan yang memilih opsi terbaik pada setiap langkah untuk mencapai solusi optimal lokal (contoh: coin change, Dijkstra).',
      'Pemrograman dinamis: teknik menyimpan hasil sub-masalah untuk menghindari komputasi berulang (contoh: 0-1 Knapsack, Fibonacci memoization).',
      'Array atau larik: struktur data untuk menyimpan kumpulan elemen dengan tipe data yang sama dan diakses menggunakan indeks.',
      'Karakter dan string: tipe data untuk memproses teks, termasuk operasi penggabungan, pemotongan, dan pencarian pola.',
      'Penyelesaian masalah menggunakan algoritma dan kode: mengintegrasikan semua konsep untuk memecahkan masalah nyata secara efisien.',
    ],
    objectives: [
      'Merancang dan menguji program secara terstruktur.',
      'Menerapkan berpikir komputasional dalam pemecahan masalah.',
      'Menggunakan rekursi dan algoritma greedy untuk masalah sederhana.',
      'Menerapkan pemrograman dinamis pada kasus optimasi.',
      'Mengolah array, karakter, dan string dalam program.',
    ],
    assets: [
      { type: 'link', title: 'Materi Algoritma Kelas 11 - Pikiran Rakyat', url: 'https://temanggung.pikiran-rakyat.com/pendidikan/pr-2617524206/materi-informatika-kelas-11-sma-kurikulum-merdeka-semester-1-dan-2-berpikir-kritis-dan-dampak-sosial-informati?page=all', meta: 'Artikel' },
      { type: 'link', title: 'Visualisasi Algoritma - VisuAlgo', url: 'https://visualgo.net/', meta: 'Tool Interaktif' },
      { type: 'link', title: '0-1 Knapsack Tutorial - GeeksforGeeks', url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-/', meta: 'Tutorial' },
      { type: 'link', title: 'freeCodeCamp - JavaScript Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', meta: 'freeCodeCamp' },
    ],
  },
  {
    id: 'berpikir-kritis',
    title: 'Berpikir Kritis dan Dampak Sosial Informatika',
    desc: 'Evaluasi informasi digital, etika, privasi, dan dampak teknologi.',
    type: 'Materi inti',
    tag: 'Etika',
    element: 'Dampak Sosial Informatika',
    duration: '60 menit',
    content: [
      'Cara mengevaluasi informasi digital: periksa sumber, bandingkan dengan referensi terpercaya, lihat tanggal publikasi, dan identifikasi bias.',
      'Membedakan fakta (dapat dibuktikan), opini (pendapat pribadi), misinformasi (informasi salah tanpa niat jahat), dan disinformasi (informasi salah dengan niat jahat).',
      'Etika penggunaan teknologi: menghormati privasi orang lain, tidak menyebarkan hoaks, menggunakan software legal, dan menghargai hak cipta.',
      'Privasi dan keamanan data: melindungi informasi pribadi, menggunakan password kuat, dan waspada terhadap phishing.',
      'Jejak digital: rekam jejak aktivitas online yang sulit dihapus dan dapat mempengaruhi reputasi di masa depan.',
      'Dampak positif AI: otomasi, efisiensi, akses informasi mudah. Dampak negatif: penggantian pekerjaan, bias algoritma, deepfake.',
      'Dampak media sosial: konektivitas global vs. cyberbullying, kecanduan, dan echo chamber.',
    ],
    objectives: [
      'Mengevaluasi informasi digital secara kritis.',
      'Membedakan fakta, opini, misinformasi, dan disinformasi.',
      'Menerapkan etika dalam penggunaan teknologi.',
      'Memahami konsep privasi, keamanan data, dan jejak digital.',
      'Menganalisis dampak positif dan negatif AI serta media sosial.',
    ],
    assets: [
      { type: 'link', title: 'Materi Berpikir Kritis - Scribd', url: 'https://id.scribd.com/presentation/982581365/Informatika-Kelas-XI-Kurikulum-Merdeka', meta: 'Presentasi' },
      { type: 'video', title: 'Digital Literacy - Common Sense', url: 'https://www.youtube.com/watch?v=F9d7wYTjK_c', meta: 'YouTube' },
      { type: 'link', title: 'Cek Fakta - TurnBackHoax', url: 'https://turnbackhoax.id/', meta: 'Tool Verifikasi' },
      { type: 'link', title: 'Cyberbullying Prevention - Kominfo', url: 'https://www.kominfo.go.id/', meta: 'Kementerian Kominfo' },
    ],
  },
  {
    id: 'jaringan-komputer',
    title: 'Jaringan Komputer dan Internet',
    desc: 'Topologi, model jaringan, packet switching, dan transmisi data.',
    type: 'Materi inti',
    tag: 'Jaringan',
    element: 'Jaringan Komputer dan Internet',
    duration: '75 menit',
    content: [
      'Topologi jaringan: pola koneksi antar-perangkat. Bus (satu kabel utama), Star (pusat switch/hub), Ring (lingkaran), Mesh (setiap perangkat terhubung ke semua).',
      'Model jaringan komputer: OSI Layer (7 lapisan) dan TCP/IP (4 lapisan) sebagai standar komunikasi data.',
      'Cara data dikirim melalui jaringan: diubah menjadi paket, diberi alamat pengirim dan penerima, kemudian dirutekan.',
      'Packet switching: metode pengiriman data dengan memecah pesan menjadi paket-paket kecil yang dikirim secara independen melalui jalur terbaik.',
      'Transmisi digital (sinyal diskrit 0/1) vs analog (gelombang kontinyu): digital lebih tahan noise, analog lebih cocok untuk audio/video tradisional.',
      'Deteksi kesalahan: parity check, checksum, CRC (Cyclic Redundancy Check). Perbaikan: ARQ, forward error correction.',
      'Komponen jaringan: LAN (Local Area Network), Wi-Fi (nirkabel), internet (jaringan global), router (pengatur lalu lintas), server (penyedia layanan), protokol (aturan komunikasi).',
    ],
    objectives: [
      'Membandingkan berbagai topologi jaringan.',
      'Menjelaskan model OSI dan TCP/IP.',
      'Memahami konsep packet switching.',
      'Membedakan transmisi digital dan analog.',
      'Mengenali metode deteksi dan perbaikan kesalahan.',
    ],
    assets: [
      { type: 'link', title: 'Materi Jaringan Kelas 11 - Tribun Pekanbaru', url: 'https://pekanbaru.tribunnews.com/2025/01/03/materi-informatika-kelas-11-sma-kurikulum-merdeka-semester-2-dan-link-buku-paket-informatika-pdf', meta: 'Artikel' },
      { type: 'link', title: 'Cisco Networking Academy', url: 'https://www.netacad.com/courses/networking-essentials', meta: 'Course Gratis' },
      { type: 'video', title: 'How the Internet Works - Code.org', url: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M', meta: 'YouTube' },
      { type: 'link', title: 'Subnetting Practice - SubnetIPv4', url: 'https://www.subnetipv4.com/', meta: 'Tool Praktik' },
    ],
  },
  {
    id: 'aplikasi-mobile-ai',
    title: 'Pengembangan Aplikasi Mobile dengan AI',
    desc: 'Jenis aplikasi, MIT App Inventor, dan integrasi AI.',
    type: 'Materi inti',
    tag: 'Coding',
    element: 'Praktik Lintas Bidang',
    duration: '90 menit',
    content: [
      'Jenis aplikasi: desktop (dipasang di komputer), web (diakses via browser), mobile (ponsel/tablet).',
      'MIT App Inventor: platform berbasis blok visual untuk membuat aplikasi Android tanpa coding teks.',
      'Pembuatan aplikasi mobile berbasis blok: drag-and-drop komponen (Button, Label, Image), atur logika dengan Block editor.',
      'Penggunaan library AI: integrasi layanan seperti Dialogflow (chatbot), Teachable Machine (image classification), atau ChatGPT API.',
      'Pembuatan proyek aplikasi sederhana: misalnya aplikasi klasifikasi gambar daun, chatbot FAQ sekolah, atau pengenalan tulisan tangan.',
      'Proyek contoh: aplikasi "Deteksi Tanaman Herbal" yang menggunakan Teachable Machine untuk mengenali jenis tanaman dari foto.',
    ],
    objectives: [
      'Membedakan jenis aplikasi desktop, web, dan mobile.',
      'Membuat aplikasi sederhana menggunakan MIT App Inventor.',
      'Mengintegrasikan library atau layanan AI dalam aplikasi.',
      'Menyelesaikan proyek aplikasi mobile berbasis AI.',
    ],
    assets: [
      { type: 'link', title: 'MIT App Inventor', url: 'https://appinventor.mit.edu/', meta: 'Platform' },
      { type: 'link', title: 'Teachable Machine - Google', url: 'https://teachablemachine.withgoogle.com/', meta: 'AI Tool' },
      { type: 'link', title: 'Tutorial MIT App Inventor (ID)', url: 'https://www.youtube.com/results?search_query=tutorial+mit+app+inventor+bahasa+indonesia', meta: 'YouTube' },
      { type: 'link', title: 'AI Chatbot dengan Dialogflow', url: 'https://cloud.google.com/dialogflow', meta: 'Google Cloud' },
    ],
  },
  {
    id: 'proyek-analisis-data',
    title: 'Proyek Analisis Data',
    desc: 'Tahapan proyek data dari mengamati masalah hingga presentasi hasil.',
    type: 'Materi inti',
    tag: 'Data',
    element: 'Analisis Data',
    duration: '120 menit',
    content: [
      'Mengamati dan merumuskan masalah: identifikasi fenomena yang ingin diteliti, buat pertanyaan penelitian yang jelas.',
      'Mengumpulkan data: survei, observasi, atau unduh dataset publik (BPS, Kaggle, Google Dataset Search).',
      'Membersihkan data: hapus duplikat, tangani missing values, perbaiki inkonsistensi format.',
      'Mengolah data: agregasi, filter, sort, dan transformasi sesuai kebutuhan analisis.',
      'Menganalisis data: gunakan statistik deskriptif (mean, median, modus) atau inferensial (uji hipotesis, korelasi).',
      'Membuat visualisasi: pilih chart yang sesuai (bar, line, pie, scatter) untuk menceritakan insight dari data.',
      'Mempresentasikan hasil: buat laporan atau infografis yang merangkum temuan dan rekomendasi.',
      'Contoh proyek "Hutanku Dulu, Kini, dan yang Akan Datang": analisis data deforestasi Indonesia untuk memahami perubahan kondisi hutan dan memprediksi tren masa depan.',
    ],
    objectives: [
      'Merumuskan masalah dan pertanyaan penelitian.',
      'Mengumpulkan dan membersihkan data.',
      'Menganalisis data dengan metode yang tepat.',
      'Membuat visualisasi yang informatif.',
      'Mempresentasikan hasil analisis secara efektif.',
    ],
    assets: [
      { type: 'link', title: 'Dataset BPS Indonesia', url: 'https://www.bps.go.id/', meta: 'Data Publik' },
      { type: 'link', title: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets', meta: 'Dataset Global' },
      { type: 'link', title: 'Google Dataset Search', url: 'https://datasetsearch.research.google.com/', meta: 'Search Engine' },
      { type: 'link', title: 'Data Visualization Guide', url: 'https://www.storytellingwithdata.com/', meta: 'Referensi' },
      { type: 'link', title: 'Google Sheets untuk Analisis', url: 'https://www.youtube.com/watch?v=4RpVBy9J1Tg', meta: 'Tutorial' },
    ],
  },
];

export const tasks = [
  {
    id: 't1',
    title: 'Algoritma 0-1 Knapsack',
    subject: 'Strategi Algoritmik',
    className: 'XI-1',
    deadline: '2026-09-20T23:59:00',
    maxScore: 100,
    status: 'Belum dikumpulkan',
    description: 'Implementasikan algoritma 0-1 Knapsack menggunakan dynamic programming dalam bahasa JavaScript atau Python.',
  },
  {
    id: 't2',
    title: 'Analisis Hoaks',
    subject: 'Berpikir Kritis',
    className: 'XI-1',
    deadline: '2026-09-25T23:59:00',
    maxScore: 100,
    status: 'Belum dikumpulkan',
    description: 'Pilih 1 berita viral, verifikasi menggunakan TurnBackHoax, dan buat laporan analisis fakta/opini/disinformasi.',
  },
  {
    id: 't3',
    title: 'Proyek Analisis Data',
    subject: 'Analisis Data',
    className: 'XI-2',
    deadline: '2026-10-05T23:59:00',
    maxScore: 100,
    status: 'Sudah dinilai',
    description: 'Lakukan proyek analisis data dari dataset pilihan, buat visualisasi, dan presentasikan hasil.',
  },
];

export const portfolioItems = [
  { title: 'Aplikasi Mobile AI', type: 'Aplikasi Mobile', desc: 'Aplikasi mobile hasil karya menggunakan MIT App Inventor + AI.', tech: 'MIT App Inventor · Teachable Machine' },
  { title: 'Website Profil Sekolah', type: 'Website', desc: 'Website sederhana untuk memperkenalkan kelas.', tech: 'HTML · CSS' },
  { title: 'Visualisasi Data', type: 'Data Visualization', desc: 'Dashboard interaktif dari analisis dataset.', tech: 'Google Sheets · Data Studio' },
];
