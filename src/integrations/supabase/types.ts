export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      application_details: {
        Row: {
          additional_documents: string[] | null
          applied_at: string | null
          cover_letter: string
          created_at: string | null
          id: string
          opportunity_id: string
          opportunity_title: string
          organization: string
          resume_filename: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_documents?: string[] | null
          applied_at?: string | null
          cover_letter: string
          created_at?: string | null
          id?: string
          opportunity_id: string
          opportunity_title: string
          organization: string
          resume_filename?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_documents?: string[] | null
          applied_at?: string | null
          cover_letter?: string
          created_at?: string | null
          id?: string
          opportunity_id?: string
          opportunity_title?: string
          organization?: string
          resume_filename?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_details_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_scraping_configs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          websites: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          websites?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          websites?: Json
        }
        Relationships: []
      }
      bulk_scraping_jobs: {
        Row: {
          completed_at: string | null
          config_id: string
          created_at: string
          error_message: string | null
          errors_count: number | null
          id: string
          results: Json | null
          started_at: string | null
          status: string
          total_jobs_found: number | null
          total_jobs_published: number | null
        }
        Insert: {
          completed_at?: string | null
          config_id: string
          created_at?: string
          error_message?: string | null
          errors_count?: number | null
          id?: string
          results?: Json | null
          started_at?: string | null
          status?: string
          total_jobs_found?: number | null
          total_jobs_published?: number | null
        }
        Update: {
          completed_at?: string | null
          config_id?: string
          created_at?: string
          error_message?: string | null
          errors_count?: number | null
          id?: string
          results?: Json | null
          started_at?: string | null
          status?: string
          total_jobs_found?: number | null
          total_jobs_published?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_scraping_jobs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "bulk_scraping_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      feature_toggles: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          id: string
          is_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_count: number | null
          application_deadline: string | null
          application_url: string | null
          approved_at: string | null
          approved_by: string | null
          author: string | null
          benefits: string[] | null
          category_id: string
          created_at: string
          description: string
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          is_remote: boolean | null
          location: string | null
          metadata: Json | null
          organization: string
          preview_text: string | null
          published_at: string | null
          rejection_reason: string | null
          requirements: string[] | null
          salary_range: string | null
          source: Database["public"]["Enums"]["opportunity_source"]
          source_url: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          submitted_by: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          application_count?: number | null
          application_deadline?: string | null
          application_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          benefits?: string[] | null
          category_id: string
          created_at?: string
          description: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          metadata?: Json | null
          organization: string
          preview_text?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          source?: Database["public"]["Enums"]["opportunity_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          application_count?: number | null
          application_deadline?: string | null
          application_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          benefits?: string[] | null
          category_id?: string
          created_at?: string
          description?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          metadata?: Json | null
          organization?: string
          preview_text?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          source?: Database["public"]["Enums"]["opportunity_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_embeddings: {
        Row: {
          combined_hash: string
          created_at: string
          description_embedding: string | null
          id: string
          opportunity_id: string
          title_embedding: string | null
        }
        Insert: {
          combined_hash: string
          created_at?: string
          description_embedding?: string | null
          id?: string
          opportunity_id: string
          title_embedding?: string | null
        }
        Update: {
          combined_hash?: string
          created_at?: string
          description_embedding?: string | null
          id?: string
          opportunity_id?: string
          title_embedding?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_embeddings_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_analytics: {
        Row: {
          avg_processing_time_ms: number | null
          created_at: string
          date: string
          duplicates_detected: number
          errors_count: number
          id: string
          opportunities_published: number
          opportunities_scraped: number
          source_name: string
        }
        Insert: {
          avg_processing_time_ms?: number | null
          created_at?: string
          date?: string
          duplicates_detected?: number
          errors_count?: number
          id?: string
          opportunities_published?: number
          opportunities_scraped?: number
          source_name: string
        }
        Update: {
          avg_processing_time_ms?: number | null
          created_at?: string
          date?: string
          duplicates_detected?: number
          errors_count?: number
          id?: string
          opportunities_published?: number
          opportunities_scraped?: number
          source_name?: string
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          opportunities_found: number | null
          opportunities_published: number | null
          source_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          opportunities_found?: number | null
          opportunities_published?: number | null
          source_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          opportunities_found?: number | null
          opportunities_published?: number | null
          source_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scraping_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_sources: {
        Row: {
          category_mapping: Json | null
          created_at: string
          id: string
          is_active: boolean
          last_scraped_at: string | null
          name: string
          scraping_frequency: number
          selector_config: Json
          success_rate: number | null
          updated_at: string
          url: string
        }
        Insert: {
          category_mapping?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          name: string
          scraping_frequency?: number
          selector_config?: Json
          success_rate?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          category_mapping?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          name?: string
          scraping_frequency?: number
          selector_config?: Json
          success_rate?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          external_subscription_id: string | null
          id: string
          payment_provider: string | null
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          status?: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          application_date: string
          application_status: string | null
          created_at: string
          follow_up_date: string | null
          id: string
          notes: string | null
          opportunity_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_date?: string
          application_status?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_date?: string
          application_status?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_interested: boolean
          priority_level: number | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_interested?: boolean
          priority_level?: number | null
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_interested?: boolean
          priority_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          education_level: string | null
          email_notifications: boolean
          field_of_study: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          push_notifications: boolean
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email_notifications?: boolean
          field_of_study?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          push_notifications?: boolean
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email_notifications?: boolean
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          push_notifications?: boolean
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_activity: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      user_submissions: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          benefits: string[] | null
          category_id: string
          created_at: string
          description: string
          id: string
          is_remote: boolean | null
          location: string | null
          opportunity_id: string | null
          organization: string
          requirements: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          salary_range: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          submission_notes: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string[] | null
          category_id: string
          created_at?: string
          description: string
          id?: string
          is_remote?: boolean | null
          location?: string | null
          opportunity_id?: string | null
          organization: string
          requirements?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submission_notes?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string[] | null
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          is_remote?: boolean | null
          location?: string | null
          opportunity_id?: string | null
          organization?: string
          requirements?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submission_notes?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_submissions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      expire_past_deadline_opportunities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["subscription_tier"]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin_email: {
        Args: { email_address: string; admin_emails_list: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_scraping_analytics: {
        Args: {
          p_source_name: string
          p_scraped: number
          p_published: number
          p_duplicates: number
          p_errors: number
          p_processing_time: number
        }
        Returns: undefined
      }
      upgrade_user_to_pro: {
        Args: { _user_id: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "user" | "staff_admin" | "admin"
      opportunity_source: "scraped" | "user_submitted" | "bulk_scraped"
      opportunity_status: "pending" | "approved" | "rejected"
      subscription_tier: "free" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "staff_admin", "admin"],
      opportunity_source: ["scraped", "user_submitted", "bulk_scraped"],
      opportunity_status: ["pending", "approved", "rejected"],
      subscription_tier: ["free", "pro"],
    },
  },
} as const
