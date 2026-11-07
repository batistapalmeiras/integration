// Local
import { supabase } from '../lib/supabase';

export async function runPipelineMaintenance(): Promise<void> {
  const { error } = await supabase.rpc('run_pipeline_maintenance');
  if (error) throw error;
}
