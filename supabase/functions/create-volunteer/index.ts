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
    return json({ error: 'Apenas administradores ou o pastor podem cadastrar voluntários' }, 403);
  }

  const { personId, password, role } = await req.json();
  if (!personId || !password || !role) {
    return json({ error: 'Dados incompletos' }, 400);
  }

  if (callerProfile.role === 'admin' && !['integration_team', 'teacher'].includes(role)) {
    return json({ error: 'Administradores só podem cadastrar Equipe de Integração ou Professores' }, 403);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: person } = await adminClient
    .from('people')
    .select('id, email, status')
    .eq('id', personId)
    .single();
  if (!person || person.status !== 'member') {
    return json({ error: 'Só membros podem ser voluntários' }, 400);
  }
  if (!person.email) {
    return json({ error: 'Cadastre o e-mail do membro antes, porque ele será o login' }, 400);
  }

  const { data: linked } = await adminClient.from('profiles').select('id').eq('person_id', personId).maybeSingle();
  if (linked) return json({ error: 'Esse membro já é voluntário' }, 400);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: person.email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return json({ error: createError?.message ?? 'Erro ao criar usuário' }, 400);
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({ id: created.user.id, person_id: personId, role, must_change_password: true });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: profileError.message }, 400);
  }

  return json({ id: created.user.id });
});
