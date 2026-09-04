export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_builder_requests: {
        Row: {
          created_at: string;
          generated_world_version: number | null;
          id: string;
          prompt: string;
          safety_result: string;
          status: string;
          updated_at: string;
          user_id: string;
          world_plan: Json | null;
        };
        Insert: {
          created_at?: string;
          generated_world_version?: number | null;
          id?: string;
          prompt: string;
          safety_result?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
          world_plan?: Json | null;
        };
        Update: {
          created_at?: string;
          generated_world_version?: number | null;
          id?: string;
          prompt?: string;
          safety_result?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
          world_plan?: Json | null;
        };
        Relationships: [];
      };
      ai_requests: {
        Row: {
          created_at: string;
          id: string;
          latency_ms: number;
          model: string;
          provider: string;
          safety_outcome: string;
          success: boolean;
          task_class: string;
          usage_metadata: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          latency_ms?: number;
          model: string;
          provider: string;
          safety_outcome?: string;
          success?: boolean;
          task_class: string;
          usage_metadata?: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          latency_ms?: number;
          model?: string;
          provider?: string;
          safety_outcome?: string;
          success?: boolean;
          task_class?: string;
          usage_metadata?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          details: Json;
          id: string;
          resource: string;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          details?: Json;
          id?: string;
          resource: string;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          details?: Json;
          id?: string;
          resource?: string;
        };
        Relationships: [];
      };
      guardian_links: {
        Row: {
          created_at: string;
          guardian_user_id: string;
          id: string;
          learner_user_id: string;
          status: Database["public"]["Enums"]["link_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          guardian_user_id: string;
          id?: string;
          learner_user_id: string;
          status?: Database["public"]["Enums"]["link_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          guardian_user_id?: string;
          id?: string;
          learner_user_id?: string;
          status?: Database["public"]["Enums"]["link_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      guardian_mastery: {
        Row: {
          confidence: number;
          created_at: string;
          demonstrated_count: number;
          evidence_version: number;
          id: string;
          last_demonstrated_at: string;
          mastery_score: number;
          skill_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          confidence?: number;
          created_at?: string;
          demonstrated_count?: number;
          evidence_version?: number;
          id?: string;
          last_demonstrated_at?: string;
          mastery_score?: number;
          skill_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          confidence?: number;
          created_at?: string;
          demonstrated_count?: number;
          evidence_version?: number;
          id?: string;
          last_demonstrated_at?: string;
          mastery_score?: number;
          skill_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      guardian_profiles: {
        Row: {
          cosmetics: Json;
          created_at: string;
          display_name: string;
          id: string;
          progression_summary: Json;
          selected_guardian: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cosmetics?: Json;
          created_at?: string;
          display_name: string;
          id?: string;
          progression_summary?: Json;
          selected_guardian?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cosmetics?: Json;
          created_at?: string;
          display_name?: string;
          id?: string;
          progression_summary?: Json;
          selected_guardian?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      guardian_state: {
        Row: {
          completed_missions: string[];
          cosmetics: Json;
          created_at: string;
          guardian_id: string | null;
          guardian_name: string;
          home_decor: Json;
          updated_at: string;
          user_id: string;
          xp: number;
        };
        Insert: {
          completed_missions?: string[];
          cosmetics?: Json;
          created_at?: string;
          guardian_id?: string | null;
          guardian_name?: string;
          home_decor?: Json;
          updated_at?: string;
          user_id: string;
          xp?: number;
        };
        Update: {
          completed_missions?: string[];
          cosmetics?: Json;
          created_at?: string;
          guardian_id?: string | null;
          guardian_name?: string;
          home_decor?: Json;
          updated_at?: string;
          user_id?: string;
          xp?: number;
        };
        Relationships: [];
      };
      isla_progress: {
        Row: {
          class_complete: boolean;
          created_at: string;
          crystals: string[];
          hints: Json;
          mastery: Json;
          secrets: string[];
          solved: string[];
          updated_at: string;
          user_id: string;
          visited: string[];
          xp: number;
        };
        Insert: {
          class_complete?: boolean;
          created_at?: string;
          crystals?: string[];
          hints?: Json;
          mastery?: Json;
          secrets?: string[];
          solved?: string[];
          updated_at?: string;
          user_id: string;
          visited?: string[];
          xp?: number;
        };
        Update: {
          class_complete?: boolean;
          created_at?: string;
          crystals?: string[];
          hints?: Json;
          mastery?: Json;
          secrets?: string[];
          solved?: string[];
          updated_at?: string;
          user_id?: string;
          visited?: string[];
          xp?: number;
        };
        Relationships: [];
      };
      learner_profiles: {
        Row: {
          created_at: string;
          grade_band: Database["public"]["Enums"]["grade_band"];
          interests: string[];
          matching_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          grade_band: Database["public"]["Enums"]["grade_band"];
          interests?: string[];
          matching_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          interests?: string[];
          matching_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      mastery_events: {
        Row: {
          confidence: number;
          evidence_reference: string | null;
          id: string;
          result: string;
          skill_id: string;
          source: string;
          timestamp: string;
          user_id: string;
          validation_state: string;
          version: number;
        };
        Insert: {
          confidence?: number;
          evidence_reference?: string | null;
          id?: string;
          result: string;
          skill_id: string;
          source: string;
          timestamp?: string;
          user_id: string;
          validation_state?: string;
          version?: number;
        };
        Update: {
          confidence?: number;
          evidence_reference?: string | null;
          id?: string;
          result?: string;
          skill_id?: string;
          source?: string;
          timestamp?: string;
          user_id?: string;
          validation_state?: string;
          version?: number;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          level: number;
          status: Database["public"]["Enums"]["membership_status"];
          tier: Database["public"]["Enums"]["membership_tier"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          level?: number;
          status?: Database["public"]["Enums"]["membership_status"];
          tier?: Database["public"]["Enums"]["membership_tier"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          level?: number;
          status?: Database["public"]["Enums"]["membership_status"];
          tier?: Database["public"]["Enums"]["membership_tier"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      mission_attempts: {
        Row: {
          created_at: string;
          id: string;
          learning_evidence: Json;
          mission_id: string;
          outcome: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          learning_evidence?: Json;
          mission_id: string;
          outcome: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          learning_evidence?: Json;
          mission_id?: string;
          outcome?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_attempts_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      missions: {
        Row: {
          briefing: string;
          created_at: string;
          difficulty: number;
          id: string;
          title: string;
          xp_reward: number;
          zone: string;
        };
        Insert: {
          briefing: string;
          created_at?: string;
          difficulty: number;
          id: string;
          title: string;
          xp_reward?: number;
          zone: string;
        };
        Update: {
          briefing?: string;
          created_at?: string;
          difficulty?: number;
          id?: string;
          title?: string;
          xp_reward?: number;
          zone?: string;
        };
        Relationships: [];
      };
      moderation_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          room_id: string | null;
          severity: number;
          summary: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          room_id?: string | null;
          severity?: number;
          summary: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          room_id?: string | null;
          severity?: number;
          summary?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_events_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_guardian: string;
          created_at: string;
          display_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_guardian?: string;
          created_at?: string;
          display_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_guardian?: string;
          created_at?: string;
          display_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      room_members: {
        Row: {
          is_speaking: boolean;
          joined_at: string;
          last_seen_at: string;
          position_x: number;
          position_y: number;
          position_z: number;
          room_id: string;
          rotation_y: number;
          session_started_at: string;
          user_id: string;
        };
        Insert: {
          is_speaking?: boolean;
          joined_at?: string;
          last_seen_at?: string;
          position_x?: number;
          position_y?: number;
          position_z?: number;
          room_id: string;
          rotation_y?: number;
          session_started_at?: string;
          user_id: string;
        };
        Update: {
          is_speaking?: boolean;
          joined_at?: string;
          last_seen_at?: string;
          position_x?: number;
          position_y?: number;
          position_z?: number;
          room_id?: string;
          rotation_y?: number;
          session_started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      room_messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          moderation_reason: string | null;
          moderation_status: Database["public"]["Enums"]["moderation_status"];
          room_id: string;
          sender_user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          moderation_reason?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          room_id: string;
          sender_user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          moderation_reason?: string | null;
          moderation_status?: Database["public"]["Enums"]["moderation_status"];
          room_id?: string;
          sender_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          capacity: number;
          created_at: string;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id: string;
          interest_tags: string[];
          minimum_level: number;
          minimum_tier: Database["public"]["Enums"]["membership_tier"];
          status: Database["public"]["Enums"]["room_status"];
          updated_at: string;
          world_id: string;
        };
        Insert: {
          capacity?: number;
          created_at?: string;
          grade_band: Database["public"]["Enums"]["grade_band"];
          id?: string;
          interest_tags?: string[];
          minimum_level?: number;
          minimum_tier?: Database["public"]["Enums"]["membership_tier"];
          status?: Database["public"]["Enums"]["room_status"];
          updated_at?: string;
          world_id: string;
        };
        Update: {
          capacity?: number;
          created_at?: string;
          grade_band?: Database["public"]["Enums"]["grade_band"];
          id?: string;
          interest_tags?: string[];
          minimum_level?: number;
          minimum_tier?: Database["public"]["Enums"]["membership_tier"];
          status?: Database["public"]["Enums"]["room_status"];
          updated_at?: string;
          world_id?: string;
        };
        Relationships: [];
      };
      safety_events: {
        Row: {
          created_at: string;
          details: Json;
          event_type: string;
          id: string;
          reason_code: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          details?: Json;
          event_type: string;
          id?: string;
          reason_code: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          details?: Json;
          event_type?: string;
          id?: string;
          reason_code?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      safety_reports: {
        Row: {
          category: string;
          created_at: string;
          details: string | null;
          id: string;
          reported_user_id: string | null;
          reporter_user_id: string;
          resolved_at: string | null;
          room_id: string | null;
          status: Database["public"]["Enums"]["report_status"];
        };
        Insert: {
          category: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          reported_user_id?: string | null;
          reporter_user_id: string;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Update: {
          category?: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          reported_user_id?: string | null;
          reporter_user_id?: string;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: [
          {
            foreignKeyName: "safety_reports_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      safety_settings: {
        Row: {
          activity_reports_enabled: boolean;
          allowed_end: string | null;
          allowed_start: string | null;
          daily_limit_minutes: number;
          learner_user_id: string;
          multiplayer_consent: boolean;
          updated_at: string;
          updated_by: string | null;
          voice_enabled: boolean;
        };
        Insert: {
          activity_reports_enabled?: boolean;
          allowed_end?: string | null;
          allowed_start?: string | null;
          daily_limit_minutes?: number;
          learner_user_id: string;
          multiplayer_consent?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          voice_enabled?: boolean;
        };
        Update: {
          activity_reports_enabled?: boolean;
          allowed_end?: string | null;
          allowed_start?: string | null;
          daily_limit_minutes?: number;
          learner_user_id?: string;
          multiplayer_consent?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          voice_enabled?: boolean;
        };
        Relationships: [];
      };
      user_blocks: {
        Row: {
          blocked_user_id: string;
          blocker_user_id: string;
          created_at: string;
        };
        Insert: {
          blocked_user_id: string;
          blocker_user_id: string;
          created_at?: string;
        };
        Update: {
          blocked_user_id?: string;
          blocker_user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      world_change_events: {
        Row: {
          change_type: string;
          created_at: string;
          details: Json;
          id: string;
          performed_by: string;
          world_id: string;
        };
        Insert: {
          change_type: string;
          created_at?: string;
          details?: Json;
          id?: string;
          performed_by: string;
          world_id: string;
        };
        Update: {
          change_type?: string;
          created_at?: string;
          details?: Json;
          id?: string;
          performed_by?: string;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "world_change_events_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      world_objects: {
        Row: {
          asset_type: string;
          created_at: string;
          id: string;
          object_id: string;
          properties: Json;
          validated: boolean;
          world_id: string;
        };
        Insert: {
          asset_type: string;
          created_at?: string;
          id?: string;
          object_id: string;
          properties?: Json;
          validated?: boolean;
          world_id: string;
        };
        Update: {
          asset_type?: string;
          created_at?: string;
          id?: string;
          object_id?: string;
          properties?: Json;
          validated?: boolean;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "world_objects_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      world_versions: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          state: Json;
          version: number;
          world_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          state: Json;
          version: number;
          world_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          state?: Json;
          version?: number;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "world_versions_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      worlds: {
        Row: {
          created_at: string;
          current_version: number;
          id: string;
          state: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_version?: number;
          id?: string;
          state?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_version?: number;
          id?: string;
          state?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_approved_guardian: {
        Args: { _guardian: string; _learner: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "guardian" | "learner" | "moderator" | "admin";
      grade_band: "k_2" | "3_5" | "6_8" | "9_12";
      link_status: "pending" | "approved" | "revoked";
      membership_status: "active" | "paused" | "cancelled";
      membership_tier: "free" | "explorer" | "guardian" | "academy";
      moderation_status: "pending" | "approved" | "blocked";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      room_status: "open" | "full" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["guardian", "learner", "moderator", "admin"],
      grade_band: ["k_2", "3_5", "6_8", "9_12"],
      link_status: ["pending", "approved", "revoked"],
      membership_status: ["active", "paused", "cancelled"],
      membership_tier: ["free", "explorer", "guardian", "academy"],
      moderation_status: ["pending", "approved", "blocked"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      room_status: ["open", "full", "closed"],
    },
  },
} as const;
