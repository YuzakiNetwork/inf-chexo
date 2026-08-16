export type UserRole = 'student' | 'teacher' | 'administrator';
export function portalForRole(role: UserRole | null | undefined) { if (role === 'student') return '/siswa'; if (role === 'teacher') return '/guru'; if (role === 'administrator') return '/admin'; return '/login'; }
export function roleLabel(role: UserRole | null | undefined) { if (role === 'student') return 'Siswa'; if (role === 'teacher') return 'Guru'; if (role === 'administrator') return 'Administrator'; return 'Pengguna'; }
