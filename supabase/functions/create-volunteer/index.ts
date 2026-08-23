// Creates a volunteer's login (Supabase Auth) and their `profiles` row in
// one request, so the admin never has to open the Supabase dashboard or
// handle a UUID by hand. Runs server-side only — this is the one place the
// service-role key is allowed to exist, since it must never reach the
// frontend bundle.
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

  // Verify the caller is an admin using their own token — RLS still applies
  // on this client, so a non-admin simply won't have a 'profiles' row with
  // role='admin' to find.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();
  if (userError || !user) return json({ error: 'Não autenticado' }, 401);

  const { data: callerProfile } = await callerClient.from('profiles').select('role').eq('id', user.id).single();
  if (callerProfile?.role !== 'admin') {
    return json({ error: 'Apenas administradores podem cadastrar voluntários' }, 403);
  }

  const { email, password, name, role } = await req.json();
  if (!email || !password || !name || !role) {
    return json({ error: 'Dados incompletos' }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return json({ error: createError?.message ?? 'Erro ao criar usuário' }, 400);
  }

  const { error: profileError } = await adminClient.from('profiles').insert({ id: created.user.id, name, role });
  if (profileError) {
    // Don't leave an orphaned auth user behind if the profile insert fails.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: profileError.message }, 400);
  }

  return json({ id: created.user.id });
});
