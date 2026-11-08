type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type PersonRelationships = [
  {
    foreignKeyName: string;
    columns: ['person_id'];
    isOneToOne: false;
    referencedRelation: 'people';
    referencedColumns: ['id'];
  },
];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      coffee_attendance: {
        Row: { attended: boolean; coffee_event_id: string; id: string; person_id: string };
        Insert: { attended?: boolean; coffee_event_id: string; id?: string; person_id: string };
        Update: { attended?: boolean; coffee_event_id?: string; id?: string; person_id?: string };
        Relationships: [
          {
            foreignKeyName: 'coffee_attendance_coffee_event_id_fkey';
            columns: ['coffee_event_id'];
            isOneToOne: false;
            referencedRelation: 'coffee_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coffee_attendance_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      coffee_events: {
        Row: { created_at: string; event_date: string; event_time: string; id: string };
        Insert: { created_at?: string; event_date: string; event_time?: string; id?: string };
        Update: { created_at?: string; event_date?: string; event_time?: string; id?: string };
        Relationships: [];
      };
      cohorts: {
        Row: { created_at: string; id: string; name: string; status: string };
        Insert: { created_at?: string; id?: string; name: string; status?: string };
        Update: { created_at?: string; id?: string; name?: string; status?: string };
        Relationships: [];
      };
      contact_attempts: {
        Row: {
          channel: string;
          created_at: string;
          id: string;
          made_by: string | null;
          person_id: string;
          result: string;
        };
        Insert: {
          channel: string;
          created_at?: string;
          id?: string;
          made_by?: string | null;
          person_id: string;
          result: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          id?: string;
          made_by?: string | null;
          person_id?: string;
          result?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_attempts_made_by_fkey';
            columns: ['made_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contact_attempts_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      enrollments: {
        Row: { cohort_id: string; created_at: string; id: string; person_id: string };
        Insert: { cohort_id: string; created_at?: string; id?: string; person_id: string };
        Update: { cohort_id?: string; created_at?: string; id?: string; person_id?: string };
        Relationships: [
          {
            foreignKeyName: 'enrollments_cohort_id_fkey';
            columns: ['cohort_id'];
            isOneToOne: false;
            referencedRelation: 'cohorts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'enrollments_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_attendance: {
        Row: { attended: boolean; enrollment_id: string; id: string; lesson_id: string };
        Insert: { attended?: boolean; enrollment_id: string; id?: string; lesson_id: string };
        Update: { attended?: boolean; enrollment_id?: string; id?: string; lesson_id?: string };
        Relationships: [
          {
            foreignKeyName: 'lesson_attendance_enrollment_id_fkey';
            columns: ['enrollment_id'];
            isOneToOne: false;
            referencedRelation: 'enrollments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lesson_attendance_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_makeups: {
        Row: { confirmed_at: string | null; lesson_attendance_id: string; notes: string | null };
        Insert: { confirmed_at?: string | null; lesson_attendance_id: string; notes?: string | null };
        Update: { confirmed_at?: string | null; lesson_attendance_id?: string; notes?: string | null };
        Relationships: [
          {
            foreignKeyName: 'lesson_makeups_lesson_attendance_id_fkey';
            columns: ['lesson_attendance_id'];
            isOneToOne: true;
            referencedRelation: 'lesson_attendance';
            referencedColumns: ['id'];
          },
        ];
      };
      lessons: {
        Row: { cohort_id: string; date: string; id: string; number: number };
        Insert: { cohort_id: string; date: string; id?: string; number: number };
        Update: { cohort_id?: string; date?: string; id?: string; number?: number };
        Relationships: [
          {
            foreignKeyName: 'lessons_cohort_id_fkey';
            columns: ['cohort_id'];
            isOneToOne: false;
            referencedRelation: 'cohorts';
            referencedColumns: ['id'];
          },
        ];
      };
      member_profiles: {
        Row: {
          accepts_visits: boolean | null;
          address_city: string | null;
          address_complement: string | null;
          address_neighborhood: string | null;
          address_number: string | null;
          address_reference: string | null;
          address_state: string | null;
          address_street: string | null;
          address_zip: string | null;
          baptism_church: string | null;
          baptism_date: string | null;
          birth_state: string | null;
          birthplace: string | null;
          children_count: number | null;
          children_names: string | null;
          cpf: string | null;
          education: string | null;
          father_name: string | null;
          gender: string | null;
          legacy_status: string | null;
          marital_status: string | null;
          ministry_background: string | null;
          mother_name: string | null;
          nationality: string | null;
          other_phone: string | null;
          person_id: string;
          preferred_contact: string | null;
          profession: string | null;
          public_notes: string | null;
          reads_email: boolean | null;
          spouse_name: string | null;
          updated_at: string;
          wedding_date: string | null;
          workplace: string | null;
        };
        Insert: Partial<Database['public']['Tables']['member_profiles']['Row']> & { person_id: string };
        Update: Partial<Database['public']['Tables']['member_profiles']['Row']>;
        Relationships: PersonRelationships;
      };
      membership_alert_resolutions: {
        Row: { code: string; person_id: string; resolved_at: string; resolved_by: string | null };
        Insert: { code: string; person_id: string; resolved_at?: string; resolved_by?: string | null };
        Update: { code?: string; person_id?: string; resolved_at?: string; resolved_by?: string | null };
        Relationships: PersonRelationships;
      };
      ministries: {
        Row: { created_at: string; id: string; leaders: string[]; name: string };
        Insert: { created_at?: string; id?: string; leaders?: string[]; name: string };
        Update: { created_at?: string; id?: string; leaders?: string[]; name?: string };
        Relationships: [];
      };
      pastoral_notes: {
        Row: { body: string; created_at: string; created_by: string | null; id: string; person_id: string };
        Insert: { body: string; created_at?: string; created_by?: string | null; id?: string; person_id: string };
        Update: { body?: string; created_at?: string; created_by?: string | null; id?: string; person_id?: string };
        Relationships: PersonRelationships;
      };
      people: {
        Row: {
          age: number | null;
          class_invite_sent_at: string | null;
          coffee_retry_used: boolean;
          created_at: string;
          email: string | null;
          entry_type: string | null;
          id: string;
          legacy_id: number | null;
          membership_interest_sent_at: string | null;
          membership_status: string | null;
          ministry: string | null;
          name: string;
          notes: string | null;
          phone: string | null;
          signup_window_from: string | null;
          small_group: string | null;
          small_group_id: string | null;
          status: string;
          statute_agreed_at: string | null;
          updated_at: string;
          whatsapp_opened_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['people']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['people']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'people_small_group_id_fkey';
            columns: ['small_group_id'];
            isOneToOne: false;
            referencedRelation: 'small_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      person_ministries: {
        Row: { created_at: string; ministry_id: string; person_id: string };
        Insert: { created_at?: string; ministry_id: string; person_id: string };
        Update: { created_at?: string; ministry_id?: string; person_id?: string };
        Relationships: [
          {
            foreignKeyName: 'person_ministries_ministry_id_fkey';
            columns: ['ministry_id'];
            isOneToOne: false;
            referencedRelation: 'ministries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_ministries_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      person_sensitive: {
        Row: {
          attending_since: string | null;
          baptism_info: string | null;
          birth_date: string | null;
          conversion_testimony: string | null;
          marital_status_story: string | null;
          membership_note: string | null;
          ministry_interests: string[] | null;
          origin_church: string | null;
          person_id: string;
          previous_church: string | null;
          secret_society: string | null;
          updated_at: string;
          wants_small_group: string | null;
        };
        Insert: Partial<Database['public']['Tables']['person_sensitive']['Row']> & { person_id: string };
        Update: Partial<Database['public']['Tables']['person_sensitive']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'person_sensitive_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: true;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          must_change_password: boolean;
          name: string;
          role: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id: string;
          must_change_password?: boolean;
          name: string;
          role: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          must_change_password?: boolean;
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
      small_groups: {
        Row: {
          created_at: string;
          hosts: string[];
          id: string;
          leaders: string[];
          meeting_day: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          hosts?: string[];
          id?: string;
          leaders?: string[];
          meeting_day?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          hosts?: string[];
          id?: string;
          leaders?: string[];
          meeting_day?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: string | null;
          id: string;
          note: string | null;
          person_id: string;
          to_status: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          person_id: string;
          to_status: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          person_id?: string;
          to_status?: string;
        };
        Relationships: PersonRelationships;
      };
    };
    Views: {
      enrollment_attendance_summary: {
        Row: {
          cohort_id: string | null;
          enrollment_id: string | null;
          lessons_attended: number | null;
          lessons_recorded: number | null;
          person_id: string | null;
        };
        Relationships: [];
      };
      member_pendencies: {
        Row: {
          membership_status: string | null;
          missing_fields: string[] | null;
          name: string | null;
          person_id: string | null;
        };
        Relationships: [];
      };
      membership_alerts: {
        Row: { answer: string | null; code: string | null; person_id: string | null; resolved: boolean | null };
        Relationships: [];
      };
    };
    Functions: {
      annual_pipeline_counts: {
        Args: { p_year: number };
        Returns: {
          archived: number;
          initial_contact: number;
          integration: number;
          member: number;
          welcome_coffee: number;
        }[];
      };
      check_membership_interest_phone: {
        Args: { p_phone: string };
        Returns: { already_submitted: boolean; lessons_attended: number; lessons_total: number; person_name: string }[];
      };
      check_welcome_coffee_phone: { Args: { p_phone: string }; Returns: { person_name: string }[] };
      count_integration_people_by_status: { Args: never; Returns: { status: string; total: number }[] };
      create_cohort: { Args: { p_lesson_dates: string[]; p_name: string }; Returns: string };
      get_active_cohort_schedule: { Args: never; Returns: { cohort_name: string; lesson_dates: string[] }[] };
      get_makeup_attendance_context: {
        Args: { p_token: string };
        Returns: { already_confirmed: boolean; cohort_name: string; lesson_number: number; person_name: string }[];
      };
      integration_people_years: { Args: never; Returns: { year: number }[] };
      list_ministries: { Args: never; Returns: { id: string; name: string }[] };
      list_small_groups: { Args: never; Returns: { id: string; leaders: string[]; name: string }[] };
      mark_coffee_attended: {
        Args: { p_actor_id?: string; p_attendance_id: string; p_person_id: string };
        Returns: undefined;
      };
      membership_lesson_progress: {
        Args: { p_person_id: string };
        Returns: { lessons_attended: number; lessons_total: number }[];
      };
      place_in_coffee: { Args: { p_coffee_event_id: string; p_person_id: string }; Returns: string };
      run_pipeline_maintenance: { Args: never; Returns: Json };
      set_lesson_dates: { Args: { p_cohort_id: string; p_lesson_dates: string[] }; Returns: undefined };
      submit_integration_signup: {
        Args: {
          p_attending_since: string | null;
          p_baptism_info: string;
          p_conversion_testimony: string;
          p_marital_status_story: string;
          p_phone: string;
          p_previous_church: string;
        };
        Returns: { cohort_name: string; lesson_dates: string[] }[];
      };
      submit_makeup_attendance: { Args: { p_notes: string | null; p_token: string }; Returns: undefined };
      submit_membership_interest: {
        Args: {
          p_birth_date: string;
          p_entry_type: string;
          p_membership_note: string | null;
          p_ministry_interests: string[];
          p_origin_church: string | null;
          p_phone: string;
          p_secret_society: string;
          p_wants_small_group: string;
        };
        Returns: { lessons_attended: number; lessons_total: number }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database['public']['Tables'];

export type TableRow<Name extends keyof PublicTables> = PublicTables[Name]['Row'];
export type TableInsert<Name extends keyof PublicTables> = PublicTables[Name]['Insert'];
export type TableUpdate<Name extends keyof PublicTables> = PublicTables[Name]['Update'];
