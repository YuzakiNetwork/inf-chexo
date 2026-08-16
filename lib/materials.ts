'use client';

import { materials as fallbackMaterials, type Material, type MaterialAsset } from '@/lib/data';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type SupabaseMaterial = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  element: string;
  content: string | null;
  tag: string | null;
  type: string | null;
  duration: string | null;
  objectives: string[] | null;
  created_at: string;
  material_assets?: Array<{
    id: string;
    type: MaterialAsset['type'];
    title: string | null;
    url: string;
    meta: string | null;
  }>;
};

type SupabaseMaterialRow = SupabaseMaterial;

function mapMaterial(row: SupabaseMaterial): Material {
  const assets = (row.material_assets ?? []).map((asset) => ({
    type: asset.type,
    title: asset.title ?? 'Sumber materi',
    url: asset.url,
    meta: asset.meta ?? undefined,
  }));

  return {
    id: row.slug,
    title: row.title,
    desc: row.description ?? '',
    type: row.type ?? 'Materi inti',
    tag: row.tag ?? 'Dasar',
    element: row.element,
    duration: row.duration ?? 'Belajar mandiri',
    content: row.content ? row.content.split(/\n\n+/).filter(Boolean) : [],
    objectives: row.objectives ?? [],
    assets,
  };
}

export async function fetchMaterials(): Promise<{ data: Material[]; source: 'supabase' | 'local' }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { data: fallbackMaterials, source: 'local' };

  const { data, error } = await client
    .from('materials')
    .select('id,slug,title,description,element,content,tag,type,duration,objectives,created_at,material_assets(id,type,title,url,meta)')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return { data: fallbackMaterials, source: error ? 'local' : 'supabase' };
  const rows: SupabaseMaterialRow[] = data as unknown as SupabaseMaterialRow[];
  return { data: rows.map((row: SupabaseMaterialRow) => mapMaterial(row)), source: 'supabase' };
}

export async function fetchMaterialBySlug(slug: string): Promise<{ data: Material | null; source: 'supabase' | 'local' }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { data: fallbackMaterials.find((item) => item.id === slug) ?? null, source: 'local' };

  const { data, error } = await client
    .from('materials')
    .select('id,slug,title,description,element,content,tag,type,duration,objectives,created_at,material_assets(id,type,title,url,meta)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return { data: fallbackMaterials.find((item) => item.id === slug) ?? null, source: 'local' };
  return { data: mapMaterial(data as unknown as SupabaseMaterial), source: 'supabase' };
}
