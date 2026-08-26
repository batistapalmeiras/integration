// Fully removes a volunteer: deletes their Supabase Auth login (needs the
// service-role key, hence this function) — the `profiles` row goes with it
// via `on delete cascade`.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Não autenticado' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();
  if (userError || !user) return json({ error: 'Não autenticado' }, 401);

  const { data: callerProfile } = await callerClient.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'pastor'].includes(callerProfile?.role)) {
    return json({ error: 'Apenas administradores ou o pastor podem remover voluntários' }, 403);
  }

  const { id } = await req.json();
  if (!id) return json({ error: 'Dados incompletos' }, 400);
  if (id === user.id) return json({ error: 'Você não pode remover a própria conta' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Admin's own reach stops at integration_team/teacher — only Pastor
  // manages Admin/Pastor accounts. Looked up via the service-role client
  // since the target may sit outside what the caller's own RLS view shows.
  if (callerProfile.role === 'admin') {
    const { data: targetProfile } = await adminClient.from('profiles').select('role').eq('id', id).single();
    if (!targetProfile || !['integration_team', 'teacher'].includes(targetProfile.role)) {
      return json({ error: 'Administradores só podem remover Equipe de Integração ou Professores' }, 403);
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(id);
  if (deleteError) return json({ error: deleteError.message }, 400);

  return json({ ok: true });
});
