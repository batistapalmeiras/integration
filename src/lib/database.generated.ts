export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      coffee_attendance: {
        Row: {
          attended: boolean
          coffee_event_id: string
          id: string
          person_id: string
        }
        Insert: {
          attended?: boolean
          coffee_event_id: string
          id?: string
          person_id: string
        }
        Update: {
          attended?: boolean
          coffee_event_id?: string
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_attendance_coffee_event_id_fkey"
            columns: ["coffee_event_id"]
            isOneToOne: false
            referencedRelation: "coffee_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coffee_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "coffee_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "coffee_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_events: {
        Row: {
          created_at: string
          event_date: string
          event_time: string
          id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_time?: string
          id?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_time?: string
          id?: string
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      contact_attempts: {
        Row: {
          channel: string
          created_at: string
          id: string
          made_by: string | null
          person_id: string
          result: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          made_by?: string | null
          person_id: string
          result: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          made_by?: string | null
          person_id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_attempts_made_by_fkey"
            columns: ["made_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_attempts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "contact_attempts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "contact_attempts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          person_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          person_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attendance: {
        Row: {
          attended: boolean
          enrollment_id: string
          id: string
          lesson_id: string
        }
        Insert: {
          attended?: boolean
          enrollment_id: string
          id?: string
          lesson_id: string
        }
        Update: {
          attended?: boolean
          enrollment_id?: string
          id?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollment_attendance_summary"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "lesson_attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_makeups: {
        Row: {
          confirmed_at: string | null
          lesson_attendance_id: string
          notes: string | null
        }
        Insert: {
          confirmed_at?: string | null
          lesson_attendance_id: string
          notes?: string | null
        }
        Update: {
          confirmed_at?: string | null
          lesson_attendance_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_makeups_lesson_attendance_id_fkey"
            columns: ["lesson_attendance_id"]
            isOneToOne: true
            referencedRelation: "lesson_attendance"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          cohort_id: string
          date: string
          id: string
          number: number
        }
        Insert: {
          cohort_id: string
          date: string
          id?: string
          number: number
        }
        Update: {
          cohort_id?: string
          date?: string
          id?: string
          number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_reference: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          baptism_church: string | null
          baptism_date: string | null
          birth_state: string | null
          birthplace: string | null
          children_count: number | null
          children_names: string | null
          cpf: string | null
          education: string | null
          father_name: string | null
          gender: string | null
          marital_status: string | null
          mother_name: string | null
          nationality: string | null
          other_phone: string | null
          person_id: string
          profession: string | null
          spouse_name: string | null
          wedding_date: string | null
          workplace: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_reference?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          baptism_church?: string | null
          baptism_date?: string | null
          birth_state?: string | null
          birthplace?: string | null
          children_count?: number | null
          children_names?: string | null
          cpf?: string | null
          education?: string | null
          father_name?: string | null
          gender?: string | null
          marital_status?: string | null
          mother_name?: string | null
          nationality?: string | null
          other_phone?: string | null
          person_id: string
          profession?: string | null
          spouse_name?: string | null
          wedding_date?: string | null
          workplace?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_reference?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          baptism_church?: string | null
          baptism_date?: string | null
          birth_state?: string | null
          birthplace?: string | null
          children_count?: number | null
          children_names?: string | null
          cpf?: string | null
          education?: string | null
          father_name?: string | null
          gender?: string | null
          marital_status?: string | null
          mother_name?: string | null
          nationality?: string | null
          other_phone?: string | null
          person_id?: string
          profession?: string | null
          spouse_name?: string | null
          wedding_date?: string | null
          workplace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "member_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "member_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_alert_resolutions: {
        Row: {
          code: string
          person_id: string
          resolved_at: string
          resolved_by: string | null
        }
        Insert: {
          code: string
          person_id: string
          resolved_at?: string
          resolved_by?: string | null
        }
        Update: {
          code?: string
          person_id?: string
          resolved_at?: string
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_alert_resolutions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "membership_alert_resolutions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "membership_alert_resolutions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_alert_resolutions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          created_at: string
          id: string
          leaders: string[]
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          leaders?: string[]
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          leaders?: string[]
          name?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          child_id: string
          created_at: string
          parent_id: string
          role: string
        }
        Insert: {
          child_id: string
          created_at?: string
          parent_id: string
          role: string
        }
        Update: {
          child_id?: string
          created_at?: string
          parent_id?: string
          role?: string
        }
        Relationships: []
      }
      pastoral_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          person_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          person_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pastoral_notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "pastoral_notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "pastoral_notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          age: number | null
          class_invite_sent_at: string | null
          coffee_retry_used: boolean
          created_at: string
          email: string | null
          entry_type: string | null
          id: string
          imported: boolean
          membership_interest_sent_at: string | null
          membership_status: string | null
          name: string
          phone: string | null
          signup_window_from: string | null
          small_group_id: string | null
          status: string
          statute_agreed_at: string | null
          updated_at: string
          visited_on: string | null
          whatsapp_opened_at: string | null
        }
        Insert: {
          age?: number | null
          class_invite_sent_at?: string | null
          coffee_retry_used?: boolean
          created_at?: string
          email?: string | null
          entry_type?: string | null
          id?: string
          imported?: boolean
          membership_interest_sent_at?: string | null
          membership_status?: string | null
          name: string
          phone?: string | null
          signup_window_from?: string | null
          small_group_id?: string | null
          status?: string
          statute_agreed_at?: string | null
          updated_at?: string
          visited_on?: string | null
          whatsapp_opened_at?: string | null
        }
        Update: {
          age?: number | null
          class_invite_sent_at?: string | null
          coffee_retry_used?: boolean
          created_at?: string
          email?: string | null
          entry_type?: string | null
          id?: string
          imported?: boolean
          membership_interest_sent_at?: string | null
          membership_status?: string | null
          name?: string
          phone?: string | null
          signup_window_from?: string | null
          small_group_id?: string | null
          status?: string
          statute_agreed_at?: string | null
          updated_at?: string
          visited_on?: string | null
          whatsapp_opened_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_small_group_id_fkey"
            columns: ["small_group_id"]
            isOneToOne: false
            referencedRelation: "small_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      person_ministries: {
        Row: {
          created_at: string
          ministry_id: string
          person_id: string
        }
        Insert: {
          created_at?: string
          ministry_id: string
          person_id: string
        }
        Update: {
          created_at?: string
          ministry_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_ministries_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_ministries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_ministries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_ministries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_sensitive: {
        Row: {
          attending_since: string | null
          baptism_info: string | null
          birth_date: string | null
          conversion_testimony: string | null
          marital_status_story: string | null
          membership_note: string | null
          ministry_interests: string[] | null
          origin_church: string | null
          person_id: string
          previous_church: string | null
          secret_society: string | null
          updated_at: string
          wants_small_group: string | null
        }
        Insert: {
          attending_since?: string | null
          baptism_info?: string | null
          birth_date?: string | null
          conversion_testimony?: string | null
          marital_status_story?: string | null
          membership_note?: string | null
          ministry_interests?: string[] | null
          origin_church?: string | null
          person_id: string
          previous_church?: string | null
          secret_society?: string | null
          updated_at?: string
          wants_small_group?: string | null
        }
        Update: {
          attending_since?: string | null
          baptism_info?: string | null
          birth_date?: string | null
          conversion_testimony?: string | null
          marital_status_story?: string | null
          membership_note?: string | null
          ministry_interests?: string[] | null
          origin_church?: string | null
          person_id?: string
          previous_church?: string | null
          secret_society?: string | null
          updated_at?: string
          wants_small_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_sensitive_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_sensitive_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "person_sensitive_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          must_change_password: boolean
          person_id: string
          role: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          must_change_password?: boolean
          person_id: string
          role: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          must_change_password?: boolean
          person_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      spouse_links: {
        Row: {
          created_at: string
          person_a_id: string
          person_b_id: string
        }
        Insert: {
          created_at?: string
          person_a_id: string
          person_b_id: string
        }
        Update: {
          created_at?: string
          person_a_id?: string
          person_b_id?: string
        }
        Relationships: []
      }
      small_groups: {
        Row: {
          created_at: string
          hosts: string[]
          id: string
          leaders: string[]
          meeting_day: string | null
          name: string
        }
        Insert: {
          created_at?: string
          hosts?: string[]
          id?: string
          leaders?: string[]
          meeting_day?: string | null
          name: string
        }
        Update: {
          created_at?: string
          hosts?: string[]
          id?: string
          leaders?: string[]
          meeting_day?: string | null
          name?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          person_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          person_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          person_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "status_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "status_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      enrollment_attendance_summary: {
        Row: {
          cohort_id: string | null
          enrollment_id: string | null
          lessons_attended: number | null
          lessons_recorded: number | null
          person_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "member_pendencies"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "membership_alerts"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      member_pendencies: {
        Row: {
          membership_status: string | null
          missing_fields: string[] | null
          name: string | null
          person_id: string | null
        }
        Relationships: []
      }
      membership_alerts: {
        Row: {
          answer: string | null
          code: string | null
          person_id: string | null
          resolved: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      annual_pipeline_counts: {
        Args: { p_year: number }
        Returns: {
          archived: number
          initial_contact: number
          integration: number
          member: number
          welcome_coffee: number
        }[]
      }
      can_read_person: { Args: { p_status: string }; Returns: boolean }
      can_write_person: { Args: { p_status: string }; Returns: boolean }
      check_membership_interest_phone: {
        Args: { p_phone: string }
        Returns: {
          address_city: string
          address_complement: string
          address_neighborhood: string
          address_number: string
          address_state: string
          address_street: string
          address_zip: string
          already_submitted: boolean
          baptism_church: string
          baptism_date: string
          baptism_info: string
          birth_date: string
          cpf: string
          email: string
          entry_type: string
          father_name: string
          gender: string
          lessons_attended: number
          lessons_total: number
          marital_status: string
          marital_status_story: string
          membership_note: string
          ministry_interests: string[]
          mother_name: string
          origin_church: string
          other_phone: string
          person_name: string
          previous_church: string
          secret_society: string
          small_group_id: string
          wants_small_group: string
        }[]
      }
      check_welcome_coffee_phone: {
        Args: { p_phone: string }
        Returns: {
          person_name: string
        }[]
      }
      count_integration_people_by_status: {
        Args: never
        Returns: {
          status: string
          total: number
        }[]
      }
      create_cohort: {
        Args: { p_lesson_dates: string[]; p_name: string }
        Returns: string
      }
      current_profile: {
        Args: never
        Returns: {
          id: string
          name: string
          role: string
        }[]
      }
      current_role: { Args: never; Returns: string }
      find_membership_interest_person: {
        Args: { p_phone: string }
        Returns: string
      }
      find_welcome_coffee_person: { Args: { p_phone: string }; Returns: string }
      get_active_cohort_schedule: {
        Args: never
        Returns: {
          cohort_name: string
          lesson_dates: string[]
        }[]
      }
      get_makeup_attendance_context: {
        Args: { p_token: string }
        Returns: {
          already_confirmed: boolean
          cohort_name: string
          lesson_number: number
          person_name: string
        }[]
      }
      integration_people_years: {
        Args: never
        Returns: {
          year: number
        }[]
      }
      list_ministries: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      list_person_notes: {
        Args: { p_person_id: string }
        Returns: {
          author_name: string
          body: string
          created_at: string
          id: string
        }[]
      }
      list_small_groups: {
        Args: never
        Returns: {
          id: string
          leaders: string[]
          name: string
        }[]
      }
      mark_coffee_attended: {
        Args: {
          p_actor_id?: string
          p_attendance_id: string
          p_person_id: string
        }
        Returns: undefined
      }
      membership_lesson_progress: {
        Args: { p_person_id: string }
        Returns: {
          lessons_attended: number
          lessons_total: number
        }[]
      }
      place_in_coffee: {
        Args: { p_coffee_event_id: string; p_person_id: string }
        Returns: string
      }
      run_pipeline_maintenance: { Args: never; Returns: Json }
      set_lesson_dates: {
        Args: { p_cohort_id: string; p_lesson_dates: string[] }
        Returns: undefined
      }
      set_family: {
        Args: {
          p_child_ids?: string[]
          p_father_id?: string
          p_mother_id?: string
          p_person_id: string
          p_spouse_id?: string
        }
        Returns: undefined
      }
      submit_integration_signup: {
        Args: {
          p_attending_since: string
          p_baptism_info: string
          p_conversion_testimony: string
          p_marital_status_story: string
          p_phone: string
          p_previous_church: string
        }
        Returns: {
          cohort_name: string
          lesson_dates: string[]
        }[]
      }
      submit_makeup_attendance: {
        Args: { p_notes: string; p_token: string }
        Returns: undefined
      }
      submit_membership_form: {
        Args: {
          p_address_city: string
          p_address_complement: string
          p_address_neighborhood: string
          p_address_number: string
          p_address_state: string
          p_address_street: string
          p_address_zip: string
          p_baptism_church: string
          p_baptism_date: string
          p_birth_date: string
          p_cpf: string
          p_email: string
          p_entry_type: string
          p_father_name: string
          p_gender: string
          p_last_church: string
          p_marital_status: string
          p_membership_note: string
          p_ministry_interests: string[]
          p_mother_name: string
          p_name: string
          p_other_phone: string
          p_phone: string
          p_secret_society: string
          p_small_group_id: string
          p_wants_small_group: string
        }
        Returns: {
          lessons_attended: number
          lessons_total: number
        }[]
      }
      update_volunteer_identity: {
        Args: { p_email: string; p_name: string; p_phone: string; p_profile_id: string }
        Returns: undefined
      }
      team_contacts: {
        Args: { p_stage: string }
        Returns: {
          name: string
          phone: string
        }[]
      }
      update_own_identity: {
        Args: { p_email: string; p_name: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
