export type UserRole = 'siswa' | 'guru' | 'administrator';
export function portalForRole(role: UserRole | null | undefined) { if (role === 'siswa') return '/siswa'; if (role === 'guru') return '/guru'; if (role === 'administrator') return '/admin'; return '/login'; }
export function roleLabel(role: UserRole | null | undefined) { if (role === 'siswa') return 'Siswa'; if (role === 'guru') return 'Guru'; if (role === 'administrator') return 'Administrator'; return 'Pengguna'; }
