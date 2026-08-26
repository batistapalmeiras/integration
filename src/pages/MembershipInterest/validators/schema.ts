// Libs
import { z } from 'zod';
import { text } from 'bp-kit';

export const membershipInterestSchema = z
  .object({
    birthDate: z.string().min(1, text.validation.required('sua data de nascimento')),
    entryType: z.enum(['baptism', 'transfer_letter', 'acclamation', 'reconciliation'], {
      message: 'Selecione como você se tornará membro',
    }),
    originChurch: z.string().optional(),
    statuteAgreed: z.literal(true, 'É necessário concordar com o Estatuto para continuar.'),
    ministryInterests: z.array(z.string()),
    noMinistryInterest: z.boolean(),
    secretSociety: z.string().min(1, text.validation.required('esta resposta')),
    wantsSmallGroup: z.enum(['yes', 'not_now', 'already'], {
      message: 'Selecione uma opção',
    }),
    membershipNote: z.string().optional(),
  })
  .refine((values) => values.entryType === 'baptism' || !!values.originChurch, {
    message: 'Informe de qual igreja você está vindo',
    path: ['originChurch'],
  })
  .refine((values) => values.noMinistryInterest || values.ministryInterests.length >= 3, {
    message: 'Selecione ao menos 3 ministérios, ou marque que não deseja servir agora',
    path: ['ministryInterests'],
  });

export type MembershipInterestFormValues = z.infer<typeof membershipInterestSchema>;
