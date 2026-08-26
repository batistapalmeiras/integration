// Returns a volunteer's current Auth email so the edit form can show it —
// `profiles` has no email column, and auth.users isn't readable from the
// frontend, so this (like create/delete-volunteer) is the one place the
// service-role key is allowed to exist.
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
    return json({ error: 'Apenas administradores ou o pastor podem ver o e-mail de voluntários' }, 403);
  }

  const { id } = await req.json();
  if (!id) return json({ error: 'Dados incompletos' }, 400);

  // Viewing is open to Admin for anyone (matches the Volunteers list showing
  // every role) — only editing is scoped to integration_team/teacher, see
  // update-volunteer-email.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error: getError } = await adminClient.auth.admin.getUserById(id);
  if (getError || !data.user) return json({ error: getError?.message ?? 'Usuário não encontrado' }, 400);

  return json({ email: data.user.email });
});
