export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AwardEditionStatus =
  | "upcoming"
  | "nominations_open"
  | "nominations_closed"
  | "under_evaluation"
  | "completed"
  | "archived";

export type RoleId =
  | "applicant"
  | "verification_team"
  | "jury_member"
  | "admin"
  | "super_admin";

export type QuestionFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "url";

export type UploadType =
  | "cover_image"
  | "project_photo"
  | "interior_photo"
  | "exterior_photo"
  | "floor_plan"
  | "rendering_3d"
  | "portfolio_pdf"
  | "supporting_doc";

export type VerificationDecision =
  | "eligible"
  | "ineligible"
  | "clarification_required";

export type ClarificationStatus = "pending" | "resolved" | "expired";

export type JuryAssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "declined_conflict";

export type JuryEvaluationStatus = "draft" | "submitted";

export type NotificationChannel = "email" | "sms" | "in_app" | "whatsapp";

export type NotificationStatus = "pending" | "sent" | "failed";

export interface Database {
  public: {
    Tables: {
      award_editions: {
        Row: {
          id: string;
          year: number;
          name: string;
          slug: string;
          status: AwardEditionStatus;
          nomination_start_at: string | null;
          nomination_end_at: string | null;
          verification_start_at: string | null;
          verification_end_at: string | null;
          judging_start_at: string | null;
          judging_end_at: string | null;
          ceremony_date: string | null;
          description: string | null;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          name: string;
          slug: string;
          status?: AwardEditionStatus;
          nomination_start_at?: string | null;
          nomination_end_at?: string | null;
          verification_start_at?: string | null;
          verification_end_at?: string | null;
          judging_start_at?: string | null;
          judging_end_at?: string | null;
          ceremony_date?: string | null;
          description?: string | null;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          year?: number;
          name?: string;
          slug?: string;
          status?: AwardEditionStatus;
          nomination_start_at?: string | null;
          nomination_end_at?: string | null;
          verification_start_at?: string | null;
          verification_end_at?: string | null;
          judging_start_at?: string | null;
          judging_end_at?: string | null;
          ceremony_date?: string | null;
          description?: string | null;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: RoleId;
          name: string;
          description: string | null;
        };
        Insert: {
          id: RoleId;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: RoleId;
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: RoleId;
          edition_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: RoleId;
          edition_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: RoleId;
          edition_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      applicant_profiles: {
        Row: {
          id: string;
          user_id: string;
          organization_name: string | null;
          designation: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          address_line: string | null;
          website_url: string | null;
          portfolio_url: string | null;
          terms_accepted_at: string;
          privacy_accepted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_name?: string | null;
          designation?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          address_line?: string | null;
          website_url?: string | null;
          portfolio_url?: string | null;
          terms_accepted_at: string;
          privacy_accepted_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_name?: string | null;
          designation?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          address_line?: string | null;
          website_url?: string | null;
          portfolio_url?: string | null;
          terms_accepted_at?: string;
          privacy_accepted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jury_profiles: {
        Row: {
          id: string;
          user_id: string;
          edition_id: string;
          honorific: string | null;
          organization: string | null;
          designation: string | null;
          bio: string | null;
          photo_url: string | null;
          display_order: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          edition_id: string;
          honorific?: string | null;
          organization?: string | null;
          designation?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          display_order?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          edition_id?: string;
          honorific?: string | null;
          organization?: string | null;
          designation?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          display_order?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          edition_id: string;
          code: string;
          name: string;
          slug: string;
          short_description: string;
          full_description: string | null;
          eligibility_criteria: string | null;
          cover_image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          code: string;
          name: string;
          slug: string;
          short_description: string;
          full_description?: string | null;
          eligibility_criteria?: string | null;
          cover_image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          code?: string;
          name?: string;
          slug?: string;
          short_description?: string;
          full_description?: string | null;
          eligibility_criteria?: string | null;
          cover_image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      category_questions: {
        Row: {
          id: string;
          category_id: string;
          question_key: string;
          question_text: string;
          help_text: string | null;
          placeholder: string | null;
          field_type: QuestionFieldType;
          is_required: boolean;
          validation_rules: Json | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          question_key: string;
          question_text: string;
          help_text?: string | null;
          placeholder?: string | null;
          field_type: QuestionFieldType;
          is_required?: boolean;
          validation_rules?: Json | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          question_key?: string;
          question_text?: string;
          help_text?: string | null;
          placeholder?: string | null;
          field_type?: QuestionFieldType;
          is_required?: boolean;
          validation_rules?: Json | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          value: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          label: string;
          value: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          label?: string;
          value?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      category_upload_requirements: {
        Row: {
          id: string;
          category_id: string;
          upload_type: UploadType;
          title: string;
          description: string | null;
          is_required: boolean;
          min_count: number;
          max_count: number;
          max_file_size_mb: number;
          allowed_mime_types: string[];
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          upload_type: UploadType;
          title: string;
          description?: string | null;
          is_required?: boolean;
          min_count?: number;
          max_count?: number;
          max_file_size_mb?: number;
          allowed_mime_types: string[];
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          upload_type?: UploadType;
          title?: string;
          description?: string | null;
          is_required?: boolean;
          min_count?: number;
          max_count?: number;
          max_file_size_mb?: number;
          allowed_mime_types?: string[];
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_statuses: {
        Row: {
          code: string;
          label: string;
          description: string | null;
          step_order: number;
          is_active: boolean;
          is_terminal: boolean;
        };
        Insert: {
          code: string;
          label: string;
          description?: string | null;
          step_order: number;
          is_active?: boolean;
          is_terminal?: boolean;
        };
        Update: {
          code?: string;
          label?: string;
          description?: string | null;
          step_order?: number;
          is_active?: boolean;
          is_terminal?: boolean;
        };
        Relationships: [];
      };
      status_transitions: {
        Row: {
          from_status: string;
          to_status: string;
          allowed_role: RoleId;
          created_at: string;
        };
        Insert: {
          from_status: string;
          to_status: string;
          allowed_role: RoleId;
          created_at?: string;
        };
        Update: {
          from_status?: string;
          to_status?: string;
          allowed_role?: RoleId;
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          nomination_id: string;
          edition_id: string;
          category_id: string;
          applicant_id: string;
          project_name: string;
          project_city: string;
          project_state: string;
          project_completion_date: string | null;
          built_up_area_sqft: number | null;
          status: string;
          current_wizard_step: number;
          declaration_accepted: boolean;
          declaration_accepted_at: string | null;
          submitted_at: string | null;
          is_locked: boolean;
          reopened_by: string | null;
          reopened_at: string | null;
          reopen_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nomination_id: string;
          edition_id: string;
          category_id: string;
          applicant_id: string;
          project_name: string;
          project_city: string;
          project_state: string;
          project_completion_date?: string | null;
          built_up_area_sqft?: number | null;
          status?: string;
          current_wizard_step?: number;
          declaration_accepted?: boolean;
          declaration_accepted_at?: string | null;
          submitted_at?: string | null;
          is_locked?: boolean;
          reopened_by?: string | null;
          reopened_at?: string | null;
          reopen_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nomination_id?: string;
          edition_id?: string;
          category_id?: string;
          applicant_id?: string;
          project_name?: string;
          project_city?: string;
          project_state?: string;
          project_completion_date?: string | null;
          built_up_area_sqft?: number | null;
          status?: string;
          current_wizard_step?: number;
          declaration_accepted?: boolean;
          declaration_accepted_at?: string | null;
          submitted_at?: string | null;
          is_locked?: boolean;
          reopened_by?: string | null;
          reopened_at?: string | null;
          reopen_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_status_history: {
        Row: {
          id: string;
          application_id: string;
          from_status: string | null;
          to_status: string;
          changed_by: string;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          from_status?: string | null;
          to_status: string;
          changed_by: string;
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          from_status?: string | null;
          to_status?: string;
          changed_by?: string;
          comments?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      application_answers: {
        Row: {
          id: string;
          application_id: string;
          question_id: string;
          answer_text: string | null;
          answer_number: number | null;
          answer_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          question_id: string;
          answer_text?: string | null;
          answer_number?: number | null;
          answer_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          question_id?: string;
          answer_text?: string | null;
          answer_number?: number | null;
          answer_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_files: {
        Row: {
          id: string;
          application_id: string;
          upload_requirement_id: string | null;
          upload_type: UploadType;
          original_filename: string;
          storage_path: string;
          storage_provider: string;
          mime_type: string;
          file_size_bytes: number;
          caption: string | null;
          display_order: number;
          is_cover: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          upload_requirement_id?: string | null;
          upload_type: UploadType;
          original_filename: string;
          storage_path: string;
          storage_provider?: string;
          mime_type: string;
          file_size_bytes: number;
          caption?: string | null;
          display_order?: number;
          is_cover?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          upload_requirement_id?: string | null;
          upload_type?: UploadType;
          original_filename?: string;
          storage_path?: string;
          storage_provider?: string;
          mime_type?: string;
          file_size_bytes?: number;
          caption?: string | null;
          display_order?: number;
          is_cover?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_records: {
        Row: {
          id: string;
          application_id: string;
          verified_by: string;
          decision: VerificationDecision;
          internal_notes: string | null;
          verified_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          verified_by: string;
          decision: VerificationDecision;
          internal_notes?: string | null;
          verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          verified_by?: string;
          decision?: VerificationDecision;
          internal_notes?: string | null;
          verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clarification_requests: {
        Row: {
          id: string;
          application_id: string;
          requested_by: string;
          applicant_message: string;
          internal_note: string | null;
          status: ClarificationStatus;
          due_date: string | null;
          response_text: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          requested_by: string;
          applicant_message: string;
          internal_note?: string | null;
          status?: ClarificationStatus;
          due_date?: string | null;
          response_text?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          requested_by?: string;
          applicant_message?: string;
          internal_note?: string | null;
          status?: ClarificationStatus;
          due_date?: string | null;
          response_text?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jury_category_assignments: {
        Row: {
          jury_profile_id: string;
          category_id: string;
          assigned_by: string;
          assigned_at: string;
        };
        Insert: {
          jury_profile_id: string;
          category_id: string;
          assigned_by: string;
          assigned_at?: string;
        };
        Update: {
          jury_profile_id?: string;
          category_id?: string;
          assigned_by?: string;
          assigned_at?: string;
        };
        Relationships: [];
      };
      jury_assignments: {
        Row: {
          id: string;
          edition_id: string;
          jury_profile_id: string;
          application_id: string;
          assigned_by: string;
          status: JuryAssignmentStatus;
          conflict_declared: boolean;
          conflict_reason: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          jury_profile_id: string;
          application_id: string;
          assigned_by: string;
          status?: JuryAssignmentStatus;
          conflict_declared?: boolean;
          conflict_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          jury_profile_id?: string;
          application_id?: string;
          assigned_by?: string;
          status?: JuryAssignmentStatus;
          conflict_declared?: boolean;
          conflict_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scoring_criteria: {
        Row: {
          id: string;
          edition_id: string;
          category_id: string | null;
          code: string;
          title: string;
          description: string | null;
          weight_percentage: number;
          max_score: number;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          category_id?: string | null;
          code: string;
          title: string;
          description?: string | null;
          weight_percentage: number;
          max_score?: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          category_id?: string | null;
          code?: string;
          title?: string;
          description?: string | null;
          weight_percentage?: number;
          max_score?: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jury_evaluations: {
        Row: {
          id: string;
          jury_assignment_id: string;
          status: JuryEvaluationStatus;
          total_weighted_score: number | null;
          general_comment: string | null;
          is_locked: boolean;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          jury_assignment_id: string;
          status?: JuryEvaluationStatus;
          total_weighted_score?: number | null;
          general_comment?: string | null;
          is_locked?: boolean;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          jury_assignment_id?: string;
          status?: JuryEvaluationStatus;
          total_weighted_score?: number | null;
          general_comment?: string | null;
          is_locked?: boolean;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jury_scores: {
        Row: {
          id: string;
          evaluation_id: string;
          criterion_id: string;
          score: number;
          confidential_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          criterion_id: string;
          score: number;
          confidential_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          criterion_id?: string;
          score?: number;
          confidential_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_shortlists: {
        Row: {
          id: string;
          application_id: string;
          edition_id: string;
          category_id: string;
          shortlisted_by: string;
          decision_notes: string | null;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          edition_id: string;
          category_id: string;
          shortlisted_by: string;
          decision_notes?: string | null;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          edition_id?: string;
          category_id?: string;
          shortlisted_by?: string;
          decision_notes?: string | null;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      winners: {
        Row: {
          id: string;
          application_id: string;
          edition_id: string;
          category_id: string;
          award_title: string;
          citation: string | null;
          project_story: string | null;
          hero_image_url: string | null;
          gallery_urls: string[] | null;
          is_published: boolean;
          published_at: string | null;
          published_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          edition_id: string;
          category_id: string;
          award_title: string;
          citation?: string | null;
          project_story?: string | null;
          hero_image_url?: string | null;
          gallery_urls?: string[] | null;
          is_published?: boolean;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          edition_id?: string;
          category_id?: string;
          award_title?: string;
          citation?: string | null;
          project_story?: string | null;
          hero_image_url?: string | null;
          gallery_urls?: string[] | null;
          is_published?: boolean;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_user_id: string;
          edition_id: string | null;
          application_id: string | null;
          channel: NotificationChannel;
          notification_type: string;
          recipient_address: string;
          subject: string | null;
          body: string;
          status: NotificationStatus;
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_user_id: string;
          edition_id?: string | null;
          application_id?: string | null;
          channel: NotificationChannel;
          notification_type: string;
          recipient_address: string;
          subject?: string | null;
          body: string;
          status?: NotificationStatus;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_user_id?: string;
          edition_id?: string | null;
          application_id?: string | null;
          channel?: NotificationChannel;
          notification_type?: string;
          recipient_address?: string;
          subject?: string | null;
          body?: string;
          status?: NotificationStatus;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cms_content_blocks: {
        Row: {
          id: string;
          edition_id: string;
          block_key: string;
          title: string | null;
          content_json: Json;
          is_published: boolean;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          block_key: string;
          title?: string | null;
          content_json: Json;
          is_published?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          block_key?: string;
          title?: string | null;
          content_json?: Json;
          is_published?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          required_role: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

