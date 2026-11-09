// Libs
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrors, Resolver } from 'react-hook-form';
// Local
import { MemberRecord } from '../../domain/memberRecords';
import { markPipelineStale, setQueryData } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { saveMemberRecord } from '../../repositories/memberRecords';
import { memberRecordSchema } from './schema';
import { RecordSection } from './sections';

const fullResolver = zodResolver(memberRecordSchema);

export function sectionResolver(section: RecordSection): Resolver<MemberRecord> {
  return async (values, context, options) => {
    const result = await fullResolver(values, context, options);
    const errors: FieldErrors<MemberRecord> = {};
    section.fields.forEach((field) => {
      const error = result.errors[field.name];
      if (error) errors[field.name] = error;
    });
    return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
  };
}

export async function saveRecord(personId: string, record: MemberRecord): Promise<void> {
  await saveMemberRecord(personId, record);
  setQueryData(queryKeys.memberRecord(personId), record);
  await markPipelineStale();
}
