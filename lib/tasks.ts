'use client';

import { tasks as taskShape } from '@/lib/data';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export type Task = (typeof taskShape)[number];

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

/** Public preview of the nearest-deadline tasks, straight from Supabase —
 * no local placeholder data. Empty in Supabase means empty here too. */
export async function fetchTasks(limit = 3): Promise<{ data: Task[]; source: 'supabase' }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { data: [], source: 'supabase' };

  const { data, error } = await client
    .from('assignments')
    .select('id,title,description,deadline,classes(name)')
    .eq('published', true)
    .order('deadline', { ascending: true })
    .limit(limit);

  if (error || !data?.length) return { data: [], source: 'supabase' };
  return { data: (data as unknown as AssignmentRow[]).map(mapAssignment), source: 'supabase' };
}
