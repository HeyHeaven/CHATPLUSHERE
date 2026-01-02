export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_analyses: {
        Row: {
          analysis_data: Json
          created_at: string | null
          date_range_end: string
          date_range_start: string
          file_names: string[]
          id: string
          sentiment_negative: number | null
          sentiment_neutral: number | null
          sentiment_positive: number | null
          total_messages: number
          total_users: number
          user_id: string | null
        }
        Insert: {
          analysis_data: Json
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          file_names: string[]
          id?: string
          sentiment_negative?: number | null
          sentiment_neutral?: number | null
          sentiment_positive?: number | null
          total_messages: number
          total_users: number
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          file_names?: string[]
          id?: string
          sentiment_negative?: number | null
          sentiment_neutral?: number | null
          sentiment_positive?: number | null
          total_messages?: number
          total_users?: number
          user_id?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          analysis_id: string | null
          avg_sentiment_score: number | null
          created_at: string | null
          customer_identifier: string
          engagement_level: string | null
          id: string
          key_topics: string[] | null
          last_interaction_date: string | null
          metadata: Json | null
          total_interactions: number | null
          total_messages_sent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          avg_sentiment_score?: number | null
          created_at?: string | null
          customer_identifier: string
          engagement_level?: string | null
          id?: string
          key_topics?: string[] | null
          last_interaction_date?: string | null
          metadata?: Json | null
          total_interactions?: number | null
          total_messages_sent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          avg_sentiment_score?: number | null
          created_at?: string | null
          customer_identifier?: string
          engagement_level?: string | null
          id?: string
          key_topics?: string[] | null
          last_interaction_date?: string | null
          metadata?: Json | null
          total_interactions?: number | null
          total_messages_sent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "chat_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          actionable_recommendations: string[] | null
          analysis_id: string
          created_at: string | null
          description: string
          id: string
          insight_type: string
          priority: string | null
          title: string
        }
        Insert: {
          actionable_recommendations?: string[] | null
          analysis_id: string
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          priority?: string | null
          title: string
        }
        Update: {
          actionable_recommendations?: string[] | null
          analysis_id?: string
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "chat_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_chats: {
        Row: {
          analysis_id: string | null
          analysis_status: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          updated_at: string | null
          upload_date: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          analysis_status?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          updated_at?: string | null
          upload_date?: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          analysis_status?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          updated_at?: string | null
          upload_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_chats_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "chat_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
