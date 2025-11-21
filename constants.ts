import { Candidate, Position } from './types';

export const CANDIDATES: Candidate[] = [
  // Ketua Candidates
  {
    id: 'k1',
    name: 'Daniel Rantetondok',
    position: Position.KETUA,
    photoUrl: 'https://picsum.photos/id/1005/400/400',
    vision: 'Mewujudkan PPGT Jemaat Tangerang yang solid, inovatif, dan berakar dalam Kristus.',
    mission: ['Mengaktifkan kembali kegiatan sel grup.', 'Membangun kolaborasi dengan pemuda lintas gereja.', 'Digitalisasi pelayanan administrasi.']
  },
  {
    id: 'k2',
    name: 'Sarah Panggua',
    position: Position.KETUA,
    photoUrl: 'https://picsum.photos/id/1011/400/400',
    vision: 'PPGT sebagai rumah bagi setiap pemuda untuk bertumbuh dan berkarya.',
    mission: ['Peningkatan kualitas ibadah pemuda.', 'Program mentoring untuk anggota baru.', 'Pelayanan kasih yang berdampak bagi masyarakat.']
  },
  {
    id: 'k3',
    name: 'Michael Palamba',
    position: Position.KETUA,
    photoUrl: 'https://picsum.photos/id/1025/400/400',
    vision: 'Menjadikan pemuda gereja yang tangguh menghadapi tantangan zaman.',
    mission: ['Seminar pengembangan diri dan rohani.', 'Olahraga dan seni sebagai sarana kebersamaan.', 'Penguatan literasi Alkitab.']
  },

  // Sekretaris Candidates
  {
    id: 's1',
    name: 'Jessica Tandi',
    position: Position.SEKRETARIS,
    photoUrl: 'https://picsum.photos/id/1027/400/400',
    vision: 'Tertib administrasi untuk pelayanan yang lebih efektif.',
    mission: ['Digitalisasi arsip surat menyurat.', 'Pelatihan sekretaris untuk cabang.', 'Update database anggota secara berkala.']
  },
  {
    id: 's2',
    name: 'David Limbong',
    position: Position.SEKRETARIS,
    photoUrl: 'https://picsum.photos/id/1003/400/400',
    vision: 'Kesekretariatan yang responsif dan informatif.',
    mission: ['Membuat buletin bulanan PPGT.', 'Notulensi rapat yang transparan.', 'Kalender kegiatan terintegrasi.']
  },

  // Bendahara Candidates
  {
    id: 'b1',
    name: 'Rini Pasauran',
    position: Position.BENDAHARA,
    photoUrl: 'https://picsum.photos/id/1012/400/400',
    vision: 'Transparansi dan akuntabilitas dalam pengelolaan dana Tuhan.',
    mission: ['Laporan keuangan real-time via web.', 'Program penggalangan dana kreatif.', 'Edukasi manajemen keuangan untuk anggota.']
  },
  {
    id: 'b2',
    name: 'Andre Batusura',
    position: Position.BENDAHARA,
    photoUrl: 'https://picsum.photos/id/1013/400/400',
    vision: 'Kemandirian finansial organisasi untuk menopang pelayanan.',
    mission: ['Optimalisasi iuran anggota.', 'Merchandise PPGT Official.', 'Audit internal berkala.']
  }
];