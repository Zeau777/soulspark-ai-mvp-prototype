export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          mood: Database["public"]["Enums"]["mood_type"]
          notes: string | null
          type: Database["public"]["Enums"]["check_in_type"] | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          mood: Database["public"]["Enums"]["mood_type"]
          notes?: string | null
          type?: Database["public"]["Enums"]["check_in_type"] | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"]
          notes?: string | null
          type?: Database["public"]["Enums"]["check_in_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_ai_response: boolean | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_ai_response?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_ai_response?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          admin_email: string
          code: string
          created_at: string
          id: string
          name: string
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          admin_email: string
          code: string
          created_at?: string
          id?: string
          name: string
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      partnership_leads: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          organization_name: string | null
          partnership_type: string
          role: string | null
          updated_at: string
          wants_demo: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          organization_name?: string | null
          partnership_type: string
          role?: string | null
          updated_at?: string
          wants_demo?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          organization_name?: string | null
          partnership_type?: string
          role?: string | null
          updated_at?: string
          wants_demo?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number | null
          display_name: string | null
          faith_background:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id: string
          meals_donated: number | null
          onboarding_completed: boolean | null
          organization_id: string | null
          personality_style:
            | Database["public"]["Enums"]["personality_style"]
            | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          faith_background?:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id?: string
          meals_donated?: number | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          personality_style?:
            | Database["public"]["Enums"]["personality_style"]
            | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          faith_background?:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id?: string
          meals_donated?: number | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          personality_style?:
            | Database["public"]["Enums"]["personality_style"]
            | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      soul_drops: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          organization_id: string | null
          target_moods: Database["public"]["Enums"]["mood_type"][] | null
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
        }
        Insert: {
          content: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          target_moods?: Database["public"]["Enums"]["mood_type"][] | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          target_moods?: Database["public"]["Enums"]["mood_type"][] | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "soul_drops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      soul_profiles: {
        Row: {
          check_in_keywords: string[] | null
          created_at: string
          emotional_state: Database["public"]["Enums"]["mood_type"] | null
          faith_background:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id: string
          personal_goals: string[] | null
          personality_style:
            | Database["public"]["Enums"]["personality_style"]
            | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in_keywords?: string[] | null
          created_at?: string
          emotional_state?: Database["public"]["Enums"]["mood_type"] | null
          faith_background?:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id?: string
          personal_goals?: string[] | null
          personality_style?:
            | Database["public"]["Enums"]["personality_style"]
            | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in_keywords?: string[] | null
          created_at?: string
          emotional_state?: Database["public"]["Enums"]["mood_type"] | null
          faith_background?:
            | Database["public"]["Enums"]["faith_background"]
            | null
          id?: string
          personal_goals?: string[] | null
          personality_style?:
            | Database["public"]["Enums"]["personality_style"]
            | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          action_type: string
          content_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          action_type: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          action_type?: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_soul_drop: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          title: string
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
        }[]
      }
      update_user_engagement: {
        Args: { p_user_id: string; p_action_type: string; p_xp_earned?: number }
        Returns: undefined
      }
    }
    Enums: {
      check_in_type: "daily" | "weekly" | "emergency"
      content_type:
        | "souldrop"
        | "prayer"
        | "meditation"
        | "devotional"
        | "affirmation"
      faith_background:
        | "christian"
        | "spiritual"
        | "exploring"
        | "other"
        | "prefer_not_to_say"
      mood_type:
        | "anxious"
        | "peaceful"
        | "lost"
        | "tired"
        | "joyful"
        | "stressed"
        | "hopeful"
        | "overwhelmed"
        | "grateful"
        | "restless"
      personality_style:
        | "introvert"
        | "extrovert"
        | "thinker"
        | "feeler"
        | "mixed"
      user_role: "student" | "employee" | "athlete"
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
      check_in_type: ["daily", "weekly", "emergency"],
      content_type: [
        "souldrop",
        "prayer",
        "meditation",
        "devotional",
        "affirmation",
      ],
      faith_background: [
        "christian",
        "spiritual",
        "exploring",
        "other",
        "prefer_not_to_say",
      ],
      mood_type: [
        "anxious",
        "peaceful",
        "lost",
        "tired",
        "joyful",
        "stressed",
        "hopeful",
        "overwhelmed",
        "grateful",
        "restless",
      ],
      personality_style: [
        "introvert",
        "extrovert",
        "thinker",
        "feeler",
        "mixed",
      ],
      user_role: ["student", "employee", "athlete"],
    },
  },
} as const
