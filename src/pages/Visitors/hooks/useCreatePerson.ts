// Local
import { supabase } from '../../../lib/supabase';
import { CreateVisitorFormValues } from '../validators';

export function useCreatePerson() {
  const createPerson = async (values: CreateVisitorFormValues) => {
    const { error } = await supabase.from('people').insert({
      name: values.name.trim(),
      phone: values.phone,
      age: values.age ? Number(values.age) : null,
      email: values.email || null,
    });
    if (error) throw error;
  };

  return { createPerson };
}
