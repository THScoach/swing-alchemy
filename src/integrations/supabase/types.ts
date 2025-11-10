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
      course_modules: {
        Row: {
          action_items: string[] | null
          content: string | null
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          key_points: string[] | null
          module_number: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          action_items?: string[] | null
          content?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          key_points?: string[] | null
          module_number: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          action_items?: string[] | null
          content?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          key_points?: string[] | null
          module_number?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          module_id: string
          player_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          module_id: string
          player_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          module_id?: string
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          level: string | null
          module_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          level?: string | null
          module_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          level?: string | null
          module_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          bats: string | null
          created_at: string
          date_of_birth: string | null
          height: number | null
          id: string
          name: string
          position: string | null
          profile_id: string | null
          sport: string
          throws: string | null
          updated_at: string
        }
        Insert: {
          bats?: string | null
          created_at?: string
          date_of_birth?: string | null
          height?: number | null
          id?: string
          name: string
          position?: string | null
          profile_id?: string | null
          sport?: string
          throws?: string | null
          updated_at?: string
        }
        Update: {
          bats?: string | null
          created_at?: string
          date_of_birth?: string | null
          height?: number | null
          id?: string
          name?: string
          position?: string | null
          profile_id?: string | null
          sport?: string
          throws?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pocket_radar_readings: {
        Row: {
          created_at: string
          exit_velocity: number
          id: string
          notes: string | null
          player_id: string
          reading_date: string
          video_analysis_id: string | null
        }
        Insert: {
          created_at?: string
          exit_velocity: number
          id?: string
          notes?: string | null
          player_id: string
          reading_date?: string
          video_analysis_id?: string | null
        }
        Update: {
          created_at?: string
          exit_velocity?: number
          id?: string
          notes?: string | null
          player_id?: string
          reading_date?: string
          video_analysis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pocket_radar_readings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pocket_radar_readings_video_analysis_id_fkey"
            columns: ["video_analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          date_of_birth: string | null
          dominant_hand: string | null
          gender: string | null
          height: number | null
          id: string
          last_active_at: string | null
          name: string
          phone: string | null
          stripe_customer_id: string | null
          subscription_tier: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_hand?: string | null
          gender?: string | null
          height?: number | null
          id: string
          last_active_at?: string | null
          name: string
          phone?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_hand?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          last_active_at?: string | null
          name?: string
          phone?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_analyses: {
        Row: {
          ball_scores: Json | null
          bat_scores: Json | null
          body_scores: Json | null
          brain_scores: Json | null
          created_at: string
          id: string
          kinetic_sequence: Json | null
          player_id: string
          processing_status: string | null
          session_notes: string | null
          skeleton_data: Json | null
          swing_phases: Json | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          ball_scores?: Json | null
          bat_scores?: Json | null
          body_scores?: Json | null
          brain_scores?: Json | null
          created_at?: string
          id?: string
          kinetic_sequence?: Json | null
          player_id: string
          processing_status?: string | null
          session_notes?: string | null
          skeleton_data?: Json | null
          swing_phases?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          ball_scores?: Json | null
          bat_scores?: Json | null
          body_scores?: Json | null
          brain_scores?: Json | null
          created_at?: string
          id?: string
          kinetic_sequence?: Json | null
          player_id?: string
          processing_status?: string | null
          session_notes?: string | null
          skeleton_data?: Json | null
          swing_phases?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_analyses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "coach" | "admin"
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
    Enums: {
      app_role: ["user", "coach", "admin"],
    },
  },
} as const
