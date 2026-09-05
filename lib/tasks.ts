'use client';

import { tasks as fallbackTasks } from '@/lib/data';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export type Task = (typeof fallbackTasks)[number];

type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  classes?: Array<{ name: string }> | null;
};

function mapAssignment(row: AssignmentRow): Task {
  const className = row.classes?.[0]?.name ?? 'Kelas';
  return {
    id: row.id,
    title: row.title,
    subject: className,
    className,
    deadline: row.deadline ?? new Date().toISOString(),
    maxScore: 100,
    status: 'Belum dikumpulkan',
    description: row.description ?? '',
  };
}

/** Public preview of the nearest-deadline tasks (no per-user submission
 * status — that lives on /tugas). Used on the homepage. */
export async function fetchTasks(limit = 3): Promise<{ data: Task[]; source: 'supabase' | 'local' }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { data: fallbackTasks, source: 'local' };

  const { data, error } = await client
    .from('assignments')
    .select('id,title,description,deadline,classes(name)')
    .order('deadline', { ascending: true })
    .limit(limit);

  if (error || !data?.length) return { data: fallbackTasks, source: error ? 'local' : 'supabase' };
  return { data: (data as unknown as AssignmentRow[]).map(mapAssignment), source: 'supabase' };
}
