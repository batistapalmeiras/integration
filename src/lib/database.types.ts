// Local
import type { Database as GeneratedDatabase } from './database.generated';

type GeneratedFunctions = GeneratedDatabase['public']['Functions'];

interface NullableFunctionArgs {
  submit_integration_signup: 'p_attending_since';
  submit_makeup_attendance: 'p_notes';
  submit_membership_interest: 'p_membership_note' | 'p_origin_church';
}

type WithNullableArgs<
  Name extends keyof NullableFunctionArgs,
  Arg extends keyof GeneratedFunctions[Name]['Args'] = NullableFunctionArgs[Name] &
    keyof GeneratedFunctions[Name]['Args'],
> = Omit<GeneratedFunctions[Name], 'Args'> & {
  Args: Omit<GeneratedFunctions[Name]['Args'], Arg> & { [Key in Arg]: GeneratedFunctions[Name]['Args'][Key] | null };
};

export type Database = Omit<GeneratedDatabase, 'public'> & {
  public: Omit<GeneratedDatabase['public'], 'Functions'> & {
    Functions: Omit<GeneratedFunctions, keyof NullableFunctionArgs> & {
      [Name in keyof NullableFunctionArgs]: WithNullableArgs<Name>;
    };
  };
};

type PublicTables = Database['public']['Tables'];

export type TableRow<Name extends keyof PublicTables> = PublicTables[Name]['Row'];
export type TableInsert<Name extends keyof PublicTables> = PublicTables[Name]['Insert'];
export type TableUpdate<Name extends keyof PublicTables> = PublicTables[Name]['Update'];
