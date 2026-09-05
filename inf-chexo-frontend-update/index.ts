// Supabase Edge Function: admin-manage-user
// Update atau delete user (hanya untuk admin)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ManageUserPayload {
  action: 'update' | 'delete';
  user_id: string;
  full_name?: string;
  role?: 'siswa' | 'guru' | 'administrator';
  class_id?: string | null;
  password?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: callerProfile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerProfile?.role !== 'administrator') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Hanya administrator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: ManageUserPayload = await req.json();

    if (!payload.action || !payload.user_id) {
      return new Response(
        JSON.stringify({ error: 'action dan user_id wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cegah admin menghapus dirinya sendiri
    if (payload.user_id === caller.id) {
      return new Response(
        JSON.stringify({ error: 'Tidak dapat mengubah atau menghapus akun sendiri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payload.action === 'update') {
      // Update profile
      const updateData: Record<string, unknown> = {};
      if (payload.full_name !== undefined) {
        updateData.full_name = payload.full_name;
        updateData.nama = payload.full_name;
      }
      if (payload.role !== undefined) updateData.role = payload.role;
      if (payload.class_id !== undefined) updateData.class_id = payload.class_id;

      const { error: profileError } = await serviceClient
        .from('profiles')
        .update(updateData)
        .eq('id', payload.user_id);

      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update password jika diisi
      if (payload.password && payload.password.length >= 6) {
        const { error: pwError } = await serviceClient.auth.admin.updateUserById(
          payload.user_id,
          { password: payload.password }
        );
        if (pwError) {
          return new Response(
            JSON.stringify({ error: `Profile updated, tapi password gagal: ${pwError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Update role di auth metadata juga
      if (payload.role) {
        await serviceClient.auth.admin.updateUserById(payload.user_id, {
          user_metadata: { role: payload.role },
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User berhasil diperbarui' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payload.action === 'delete') {
      // Hapus dari auth (cascade akan hapus profile)
      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(payload.user_id);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User berhasil dihapus' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action tidak dikenal' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('admin-manage-user error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
