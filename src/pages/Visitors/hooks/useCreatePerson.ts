// Libs
import { onlyDigits } from 'bp-kit';
// Local
import { createVisitor } from '../../../repositories/people';
import { CreateVisitorFormValues } from '../validators';

export function useCreatePerson() {
  const createPerson = (values: CreateVisitorFormValues) =>
    createVisitor({
      name: values.name.trim(),
      phone: onlyDigits(values.phone),
      age: values.age ? Number(values.age) : null,
      email: values.email || null,
    });

  return { createPerson };
}
