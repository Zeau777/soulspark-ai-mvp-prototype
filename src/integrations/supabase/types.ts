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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_organization_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          organization_id: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          organization_id: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_organization_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_organization_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string
          metadata: Json | null
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          metadata?: Json | null
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          metadata?: Json | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          creator_id: string | null
          description: string
          duration_days: number
          end_date: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          organization_id: string | null
          start_date: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          description: string
          duration_days?: number
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          start_date?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          description?: string
          duration_days?: number
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      circle_memberships: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_memberships_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "spark_circles"
            referencedColumns: ["id"]
          },
        ]
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
      discord_configurations: {
        Row: {
          auto_souldrop_enabled: boolean
          bot_token: string | null
          bot_user_id: string | null
          channels: string[] | null
          checkin_reminder_enabled: boolean
          checkin_reminder_time: string
          created_at: string
          guild_id: string | null
          guild_name: string | null
          id: string
          is_connected: boolean
          organization_id: string
          settings: Json | null
          souldrop_time: string
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          auto_souldrop_enabled?: boolean
          bot_token?: string | null
          bot_user_id?: string | null
          channels?: string[] | null
          checkin_reminder_enabled?: boolean
          checkin_reminder_time?: string
          created_at?: string
          guild_id?: string | null
          guild_name?: string | null
          id?: string
          is_connected?: boolean
          organization_id: string
          settings?: Json | null
          souldrop_time?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          auto_souldrop_enabled?: boolean
          bot_token?: string | null
          bot_user_id?: string | null
          channels?: string[] | null
          checkin_reminder_enabled?: boolean
          checkin_reminder_time?: string
          created_at?: string
          guild_id?: string | null
          guild_name?: string | null
          id?: string
          is_connected?: boolean
          organization_id?: string
          settings?: Json | null
          souldrop_time?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      discord_interactions: {
        Row: {
          content: string | null
          created_at: string
          discord_channel_id: string
          discord_user_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          organization_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          discord_channel_id: string
          discord_user_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          organization_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          discord_channel_id?: string
          discord_user_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          organization_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content_id: string | null
          created_at: string
          feature_type: string
          feedback_category: string | null
          feedback_text: string | null
          id: string
          metadata: Json | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          feature_type: string
          feedback_category?: string | null
          feedback_text?: string | null
          id?: string
          metadata?: Json | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          feature_type?: string
          feedback_category?: string | null
          feedback_text?: string | null
          id?: string
          metadata?: Json | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      impact_action_mappings: {
        Row: {
          action_type: string
          active: boolean
          created_at: string
          credit: number
          notes: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          action_type: string
          active?: boolean
          created_at?: string
          credit?: number
          notes?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          active?: boolean
          created_at?: string
          credit?: number
          notes?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      impact_batches: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          notes: string | null
          partner: string
          period_end: string
          period_start: string
          status: string
          total_amount_cents: number
          total_credits: number
          total_meals: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          notes?: string | null
          partner: string
          period_end: string
          period_start: string
          status?: string
          total_amount_cents?: number
          total_credits?: number
          total_meals?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          notes?: string | null
          partner?: string
          period_end?: string
          period_start?: string
          status?: string
          total_amount_cents?: number
          total_credits?: number
          total_meals?: number
          updated_at?: string
        }
        Relationships: []
      }
      impact_credits: {
        Row: {
          action_type: string
          batched_id: string | null
          created_at: string
          credits: number
          engagement_id: string | null
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          action_type: string
          batched_id?: string | null
          created_at?: string
          credits: number
          engagement_id?: string | null
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          action_type?: string
          batched_id?: string | null
          created_at?: string
          credits?: number
          engagement_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      impact_settings: {
        Row: {
          created_at: string
          donation_rate_cents_per_meal: number
          goal_meals_per_year: number
          id: string
          is_active: boolean
          partner: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          donation_rate_cents_per_meal?: number
          goal_meals_per_year?: number
          id?: string
          is_active?: boolean
          partner?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          donation_rate_cents_per_meal?: number
          goal_meals_per_year?: number
          id?: string
          is_active?: boolean
          partner?: string
          updated_at?: string
        }
        Relationships: []
      }
      legacy_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
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
          annual_contract_value: number | null
          billing_contact_email: string | null
          billing_contact_name: string | null
          code: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          current_seats: number | null
          id: string
          managed_by_admin: string | null
          max_seats: number | null
          name: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          pricing_plan: string | null
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          admin_email: string
          annual_contract_value?: number | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          code: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          current_seats?: number | null
          id?: string
          managed_by_admin?: string | null
          max_seats?: number | null
          name: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pricing_plan?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          annual_contract_value?: number | null
          billing_contact_email?: string | null
          billing_contact_name?: string | null
          code?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          current_seats?: number | null
          id?: string
          managed_by_admin?: string | null
          max_seats?: number | null
          name?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pricing_plan?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_managed_by_admin_fkey"
            columns: ["managed_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
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
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          challenge_id: string | null
          circle_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_story: boolean | null
          post_type: string | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          challenge_id?: string | null
          circle_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_story?: boolean | null
          post_type?: string | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          challenge_id?: string | null
          circle_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_story?: boolean | null
          post_type?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "spark_circles"
            referencedColumns: ["id"]
          },
        ]
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      slack_configurations: {
        Row: {
          auto_souldrop_enabled: boolean
          bot_token: string | null
          bot_user_id: string | null
          channels: string[] | null
          checkin_reminder_enabled: boolean
          checkin_reminder_time: string
          created_at: string
          id: string
          is_connected: boolean
          organization_id: string
          settings: Json | null
          souldrop_time: string
          updated_at: string
          welcome_message: string | null
          workspace_id: string | null
          workspace_name: string | null
        }
        Insert: {
          auto_souldrop_enabled?: boolean
          bot_token?: string | null
          bot_user_id?: string | null
          channels?: string[] | null
          checkin_reminder_enabled?: boolean
          checkin_reminder_time?: string
          created_at?: string
          id?: string
          is_connected?: boolean
          organization_id: string
          settings?: Json | null
          souldrop_time?: string
          updated_at?: string
          welcome_message?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Update: {
          auto_souldrop_enabled?: boolean
          bot_token?: string | null
          bot_user_id?: string | null
          channels?: string[] | null
          checkin_reminder_enabled?: boolean
          checkin_reminder_time?: string
          created_at?: string
          id?: string
          is_connected?: boolean
          organization_id?: string
          settings?: Json | null
          souldrop_time?: string
          updated_at?: string
          welcome_message?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Relationships: []
      }
      slack_interactions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          organization_id: string
          slack_channel_id: string
          slack_user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          organization_id: string
          slack_channel_id: string
          slack_user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          organization_id?: string
          slack_channel_id?: string
          slack_user_id?: string
        }
        Relationships: []
      }
      soul_drops: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          likes_count: number
          metadata: Json | null
          organization_id: string | null
          target_moods: Database["public"]["Enums"]["mood_type"][] | null
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number
          metadata?: Json | null
          organization_id?: string | null
          target_moods?: Database["public"]["Enums"]["mood_type"][] | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number
          metadata?: Json | null
          organization_id?: string | null
          target_moods?: Database["public"]["Enums"]["mood_type"][] | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
          updated_at?: string
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
      spark_circles: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          action_type: string
          content_id: string | null
          created_at: string
          id: string
          impact_processed_at: string | null
          metadata: Json | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          action_type: string
          content_id?: string | null
          created_at?: string
          id?: string
          impact_processed_at?: string | null
          metadata?: Json | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          action_type?: string
          content_id?: string | null
          created_at?: string
          id?: string
          impact_processed_at?: string | null
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
      admin_create_organization: {
        Args: {
          p_admin_email: string
          p_annual_contract_value?: number
          p_billing_contact_email?: string
          p_billing_contact_name?: string
          p_contract_end_date?: string
          p_contract_start_date?: string
          p_max_seats: number
          p_name: string
          p_pricing_plan: string
          p_type: string
        }
        Returns: string
      }
      admin_process_payment: {
        Args: {
          p_organization_id: string
          p_payment_amount: number
          p_payment_method: string
          p_payment_notes?: string
        }
        Returns: boolean
      }
      cleanup_push_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_organizations: number
          pending_payments: number
          recent_actions: Json
          total_organizations: number
          total_revenue_cents: number
        }[]
      }
      get_daily_soul_drop: {
        Args: { p_user_id: string }
        Returns: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          id: string
          title: string
        }[]
      }
      test_user_notification: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_user_engagement: {
        Args: { p_action_type: string; p_user_id: string; p_xp_earned?: number }
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
