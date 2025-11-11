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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ball_data: {
        Row: {
          analysis_id: string | null
          barrel_like_rate: number | null
          context_tag: Database["public"]["Enums"]["context_tag"] | null
          created_at: string
          ev90: number | null
          exit_velocities: number[] | null
          hard_hit_rate: number | null
          id: string
          la_sd: number | null
          la90: number | null
          launch_angles: number[] | null
          player_id: string
          source_system: string | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          barrel_like_rate?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          ev90?: number | null
          exit_velocities?: number[] | null
          hard_hit_rate?: number | null
          id?: string
          la_sd?: number | null
          la90?: number | null
          launch_angles?: number[] | null
          player_id: string
          source_system?: string | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          barrel_like_rate?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          ev90?: number | null
          exit_velocities?: number[] | null
          hard_hit_rate?: number | null
          id?: string
          la_sd?: number | null
          la90?: number | null
          launch_angles?: number[] | null
          player_id?: string
          source_system?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ball_data_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      bat_data: {
        Row: {
          analysis_id: string | null
          attack_angle_avg: number | null
          attack_angle_sd: number | null
          avg_bat_speed: number | null
          bat_speed_sd: number | null
          blast_report_url: string | null
          context_tag: Database["public"]["Enums"]["context_tag"] | null
          created_at: string
          id: string
          player_id: string
          time_in_zone_ms: number | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          attack_angle_avg?: number | null
          attack_angle_sd?: number | null
          avg_bat_speed?: number | null
          bat_speed_sd?: number | null
          blast_report_url?: string | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          id?: string
          player_id: string
          time_in_zone_ms?: number | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          attack_angle_avg?: number | null
          attack_angle_sd?: number | null
          avg_bat_speed?: number | null
          bat_speed_sd?: number | null
          blast_report_url?: string | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          id?: string
          player_id?: string
          time_in_zone_ms?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bat_data_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bat_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      body_data: {
        Row: {
          analysis_id: string | null
          back_leg_lift_time: number | null
          com_foot_down_pct: number | null
          com_forward_movement_pct: number | null
          com_max_forward_pct: number | null
          com_negative_move_pct: number | null
          contact_time: number | null
          context_tag: Database["public"]["Enums"]["context_tag"] | null
          created_at: string
          head_movement_inches: number | null
          id: string
          player_id: string
          reboot_report_url: string | null
          sequence_correct: boolean | null
          spine_angle_var_deg: number | null
          spine_stability_score: number | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          back_leg_lift_time?: number | null
          com_foot_down_pct?: number | null
          com_forward_movement_pct?: number | null
          com_max_forward_pct?: number | null
          com_negative_move_pct?: number | null
          contact_time?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          head_movement_inches?: number | null
          id?: string
          player_id: string
          reboot_report_url?: string | null
          sequence_correct?: boolean | null
          spine_angle_var_deg?: number | null
          spine_stability_score?: number | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          back_leg_lift_time?: number | null
          com_foot_down_pct?: number | null
          com_forward_movement_pct?: number | null
          com_max_forward_pct?: number | null
          com_negative_move_pct?: number | null
          contact_time?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          head_movement_inches?: number | null
          id?: string
          player_id?: string
          reboot_report_url?: string | null
          sequence_correct?: boolean | null
          spine_angle_var_deg?: number | null
          spine_stability_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_data_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_data: {
        Row: {
          analysis_id: string | null
          created_at: string
          decision_making: number | null
          id: string
          impulse_control: number | null
          overall_percentile: number | null
          player_id: string
          processing_speed: number | null
          s2_report_url: string | null
          tracking_focus: number | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          decision_making?: number | null
          id?: string
          impulse_control?: number | null
          overall_percentile?: number | null
          player_id: string
          processing_speed?: number | null
          s2_report_url?: string | null
          tracking_focus?: number | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          decision_making?: number | null
          id?: string
          impulse_control?: number | null
          overall_percentile?: number | null
          player_id?: string
          processing_speed?: number | null
          s2_report_url?: string | null
          tracking_focus?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_data_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
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
      drills: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string | null
          duration_minutes: number | null
          focus_metric: string
          id: string
          title: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty?: string | null
          duration_minutes?: number | null
          focus_metric: string
          id?: string
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string | null
          duration_minutes?: number | null
          focus_metric?: string
          id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          organization_id: string
          recurrence_rule: string | null
          start_time: string
          title: string
          updated_at: string
          zoom_link: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id: string
          recurrence_rule?: string | null
          start_time: string
          title: string
          updated_at?: string
          zoom_link?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id?: string
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fourb_scores: {
        Row: {
          analysis_id: string | null
          ball_score: number | null
          ball_state: string | null
          bat_score: number | null
          bat_state: string | null
          body_score: number | null
          body_state: string | null
          brain_score: number | null
          brain_state: string | null
          created_at: string
          focus_area: string | null
          id: string
          overall_score: number | null
          overall_state: string | null
          player_id: string
          session_date: string | null
          strongest_area: string | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          ball_score?: number | null
          ball_state?: string | null
          bat_score?: number | null
          bat_state?: string | null
          body_score?: number | null
          body_state?: string | null
          brain_score?: number | null
          brain_state?: string | null
          created_at?: string
          focus_area?: string | null
          id?: string
          overall_score?: number | null
          overall_state?: string | null
          player_id: string
          session_date?: string | null
          strongest_area?: string | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          ball_score?: number | null
          ball_state?: string | null
          bat_score?: number | null
          bat_state?: string | null
          body_score?: number | null
          body_state?: string | null
          brain_score?: number | null
          brain_state?: string | null
          created_at?: string
          focus_area?: string | null
          id?: string
          overall_score?: number | null
          overall_state?: string | null
          player_id?: string
          session_date?: string | null
          strongest_area?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fourb_scores_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fourb_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          created_by: string | null
          id: string
          level_tags: Database["public"]["Enums"]["player_level"][] | null
          source: Database["public"]["Enums"]["source_platform"] | null
          source_url: string | null
          subtopics: string[] | null
          tags: string[] | null
          title: string | null
          topic: Database["public"]["Enums"]["content_topic"] | null
          updated_at: string
        }
        Insert: {
          body: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          level_tags?: Database["public"]["Enums"]["player_level"][] | null
          source?: Database["public"]["Enums"]["source_platform"] | null
          source_url?: string | null
          subtopics?: string[] | null
          tags?: string[] | null
          title?: string | null
          topic?: Database["public"]["Enums"]["content_topic"] | null
          updated_at?: string
        }
        Update: {
          body?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          level_tags?: Database["public"]["Enums"]["player_level"][] | null
          source?: Database["public"]["Enums"]["source_platform"] | null
          source_url?: string | null
          subtopics?: string[] | null
          tags?: string[] | null
          title?: string | null
          topic?: Database["public"]["Enums"]["content_topic"] | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_equipment_profile: {
        Row: {
          ball_trackers: string[] | null
          created_at: string
          id: string
          motion_tools: string[] | null
          player_id: string
          setup_photo_url: string | null
          swing_sensors: string[] | null
          training_facility: string | null
          updated_at: string
        }
        Insert: {
          ball_trackers?: string[] | null
          created_at?: string
          id?: string
          motion_tools?: string[] | null
          player_id: string
          setup_photo_url?: string | null
          swing_sensors?: string[] | null
          training_facility?: string | null
          updated_at?: string
        }
        Update: {
          ball_trackers?: string[] | null
          created_at?: string
          id?: string
          motion_tools?: string[] | null
          player_id?: string
          setup_photo_url?: string | null
          swing_sensors?: string[] | null
          training_facility?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_equipment_profile_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_activity_date: string | null
          level: string
          player_id: string
          streak: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: string
          player_id: string
          streak?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_activity_date?: string | null
          level?: string
          player_id?: string
          streak?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_points_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          bats: string | null
          contact: string | null
          created_at: string
          date_of_birth: string | null
          has_coach_rick_avatar: boolean | null
          has_reboot_report: boolean | null
          height: number | null
          id: string
          name: string
          organization: string | null
          organization_id: string | null
          player_level: Database["public"]["Enums"]["player_level"] | null
          position: string | null
          profile_id: string | null
          s2_report_url: string | null
          sport: string
          team_id: string | null
          throws: string | null
          updated_at: string
        }
        Insert: {
          bats?: string | null
          contact?: string | null
          created_at?: string
          date_of_birth?: string | null
          has_coach_rick_avatar?: boolean | null
          has_reboot_report?: boolean | null
          height?: number | null
          id?: string
          name: string
          organization?: string | null
          organization_id?: string | null
          player_level?: Database["public"]["Enums"]["player_level"] | null
          position?: string | null
          profile_id?: string | null
          s2_report_url?: string | null
          sport?: string
          team_id?: string | null
          throws?: string | null
          updated_at?: string
        }
        Update: {
          bats?: string | null
          contact?: string | null
          created_at?: string
          date_of_birth?: string | null
          has_coach_rick_avatar?: boolean | null
          has_reboot_report?: boolean | null
          height?: number | null
          id?: string
          name?: string
          organization?: string | null
          organization_id?: string | null
          player_level?: Database["public"]["Enums"]["player_level"] | null
          position?: string | null
          profile_id?: string | null
          s2_report_url?: string | null
          sport?: string
          team_id?: string | null
          throws?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
      points_history: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          player_id: string
          points: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          player_id: string
          points: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          player_id?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "points_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_swings: {
        Row: {
          analysis_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          handedness: string | null
          id: string
          label: string
          level: string | null
          organization_id: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          handedness?: string | null
          id?: string
          label: string
          level?: string | null
          organization_id?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          handedness?: string | null
          id?: string
          label?: string
          level?: string | null
          organization_id?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_swings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_swings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_swings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      progress_email_subscriptions: {
        Row: {
          created_at: string
          email: string
          frequency: string
          id: string
          player_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          frequency?: string
          id?: string
          player_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_email_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      progression_history: {
        Row: {
          ball_score: number | null
          bat_score: number | null
          body_score: number | null
          brain_score: number | null
          context_tag: Database["public"]["Enums"]["context_tag"] | null
          created_at: string
          date: string
          id: string
          notes: string | null
          overall_4b_score: number | null
          player_id: string
        }
        Insert: {
          ball_score?: number | null
          bat_score?: number | null
          body_score?: number | null
          brain_score?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          overall_4b_score?: number | null
          player_id: string
        }
        Update: {
          ball_score?: number | null
          bat_score?: number | null
          body_score?: number | null
          brain_score?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          overall_4b_score?: number | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progression_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          add_ons: Json | null
          created_at: string
          duration_minutes: number
          id: string
          location: string | null
          notes: string | null
          organization_id: string
          payment_status: string
          player_id: string
          scheduled_at: string
          session_type: string
          status: string
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          add_ons?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          organization_id: string
          payment_status?: string
          player_id: string
          scheduled_at: string
          session_type: string
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          add_ons?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          organization_id?: string
          payment_status?: string
          player_id?: string
          scheduled_at?: string
          session_type?: string
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      signed_urls: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_id: string
          organization_id: string
          url: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          media_id: string
          organization_id: string
          url: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_id?: string
          organization_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "signed_urls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          camera_angle: string | null
          contact_frame: number | null
          contact_time_ms: number | null
          context_tag: Database["public"]["Enums"]["context_tag"] | null
          created_at: string
          fps: number | null
          hitter_side: string | null
          id: string
          kinetic_sequence: Json | null
          pitch_type: string | null
          pitch_velocity: number | null
          player_id: string
          processing_status: string | null
          raw_fps_guess: number | null
          session_notes: string | null
          skeleton_data: Json | null
          source_system: string | null
          swing_phases: Json | null
          thumbnail_url: string | null
          updated_at: string
          uploaded_by: string | null
          video_url: string
        }
        Insert: {
          ball_scores?: Json | null
          bat_scores?: Json | null
          body_scores?: Json | null
          brain_scores?: Json | null
          camera_angle?: string | null
          contact_frame?: number | null
          contact_time_ms?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          fps?: number | null
          hitter_side?: string | null
          id?: string
          kinetic_sequence?: Json | null
          pitch_type?: string | null
          pitch_velocity?: number | null
          player_id: string
          processing_status?: string | null
          raw_fps_guess?: number | null
          session_notes?: string | null
          skeleton_data?: Json | null
          source_system?: string | null
          swing_phases?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
          video_url: string
        }
        Update: {
          ball_scores?: Json | null
          bat_scores?: Json | null
          body_scores?: Json | null
          brain_scores?: Json | null
          camera_angle?: string | null
          contact_frame?: number | null
          contact_time_ms?: number | null
          context_tag?: Database["public"]["Enums"]["context_tag"] | null
          created_at?: string
          fps?: number | null
          hitter_side?: string | null
          id?: string
          kinetic_sequence?: Json | null
          pitch_type?: string | null
          pitch_velocity?: number | null
          player_id?: string
          processing_status?: string | null
          raw_fps_guess?: number | null
          session_notes?: string | null
          skeleton_data?: Json | null
          source_system?: string | null
          swing_phases?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
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
      weekly_checkins: {
        Row: {
          created_at: string
          id: string
          player_id: string
          responses: Json
          updated_at: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          responses: Json
          updated_at?: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          responses?: Json
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_player_id_fkey"
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
      user_has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["org_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "coach" | "admin"
      content_topic: "Brain" | "Body" | "Bat" | "Ball"
      content_type: "Video" | "Audio" | "Article" | "Course" | "Drill" | "Note"
      context_tag: "Game" | "Practice" | "Drill"
      org_role: "admin" | "coach" | "player" | "viewer"
      player_level: "Youth (10-13)" | "HS (14-18)" | "College" | "Pro" | "Other"
      source_platform: "Membership.io" | "YouTube" | "Upload" | "Manual"
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
      content_topic: ["Brain", "Body", "Bat", "Ball"],
      content_type: ["Video", "Audio", "Article", "Course", "Drill", "Note"],
      context_tag: ["Game", "Practice", "Drill"],
      org_role: ["admin", "coach", "player", "viewer"],
      player_level: ["Youth (10-13)", "HS (14-18)", "College", "Pro", "Other"],
      source_platform: ["Membership.io", "YouTube", "Upload", "Manual"],
    },
  },
} as const
