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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      qr_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          is_unique_visitor: boolean | null
          latitude: number | null
          longitude: number | null
          os: string | null
          qr_code_id: string
          referer: string | null
          scanned_at: string
          scanner_ip: unknown
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          is_unique_visitor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          qr_code_id: string
          referer?: string | null
          scanned_at?: string
          scanner_ip?: unknown
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          is_unique_visitor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          qr_code_id?: string
          referer?: string | null
          scanned_at?: string
          scanner_ip?: unknown
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_analytics_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          color_scheme: Json | null
          content_url: string
          created_at: string | null
          creator_ip: unknown
          creator_user_agent: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_dynamic: boolean | null
          logo_url: string | null
          password_hash: string
          qr_type: Database["public"]["Enums"]["qr_type_enum"] | null
          scan_count: number | null
          scan_limit: number | null
          status: Database["public"]["Enums"]["qr_status_enum"] | null
          style_options: Json | null
          title: string | null
          updated_at: string | null
          utm_parameters: Json | null
        }
        Insert: {
          color_scheme?: Json | null
          content_url: string
          created_at?: string | null
          creator_ip?: unknown
          creator_user_agent?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dynamic?: boolean | null
          logo_url?: string | null
          password_hash: string
          qr_type?: Database["public"]["Enums"]["qr_type_enum"] | null
          scan_count?: number | null
          scan_limit?: number | null
          status?: Database["public"]["Enums"]["qr_status_enum"] | null
          style_options?: Json | null
          title?: string | null
          updated_at?: string | null
          utm_parameters?: Json | null
        }
        Update: {
          color_scheme?: Json | null
          content_url?: string
          created_at?: string | null
          creator_ip?: unknown
          creator_user_agent?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_dynamic?: boolean | null
          logo_url?: string | null
          password_hash?: string
          qr_type?: Database["public"]["Enums"]["qr_type_enum"] | null
          scan_count?: number | null
          scan_limit?: number | null
          status?: Database["public"]["Enums"]["qr_status_enum"] | null
          style_options?: Json | null
          title?: string | null
          updated_at?: string | null
          utm_parameters?: Json | null
        }
        Relationships: []
      }
      qr_event_data: {
        Row: {
          all_day: boolean | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          organizer_email: string | null
          organizer_name: string | null
          qr_code_id: string
          start_date: string
          title: string
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          qr_code_id: string
          start_date: string
          title: string
        }
        Update: {
          all_day?: boolean | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          qr_code_id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_event_data_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_file_data: {
        Row: {
          created_at: string
          download_count: number | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          qr_code_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          qr_code_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          download_count?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          qr_code_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_file_data_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_payment_data: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          payment_data: Json | null
          payment_type: string
          qr_code_id: string
          recipient: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_data?: Json | null
          payment_type: string
          qr_code_id: string
          recipient: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_data?: Json | null
          payment_type?: string
          qr_code_id?: string
          recipient?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_payment_data_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_vcard_data: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          note: string | null
          organization: string | null
          phone: string | null
          qr_code_id: string
          title: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          note?: string | null
          organization?: string | null
          phone?: string | null
          qr_code_id: string
          title?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          note?: string | null
          organization?: string | null
          phone?: string | null
          qr_code_id?: string
          title?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_vcard_data_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_wifi_data: {
        Row: {
          created_at: string
          hidden: boolean | null
          id: string
          password: string | null
          qr_code_id: string
          security: string | null
          ssid: string
        }
        Insert: {
          created_at?: string
          hidden?: boolean | null
          id?: string
          password?: string | null
          qr_code_id: string
          security?: string | null
          ssid: string
        }
        Update: {
          created_at?: string
          hidden?: boolean | null
          id?: string
          password?: string | null
          qr_code_id?: string
          security?: string | null
          ssid?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_wifi_data_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_qr_code: {
        Args: {
          content_url_param: string
          expires_in_seconds?: number
          password_text: string
          qr_type_param?: string
        }
        Returns: {
          expires_at: string
          qr_id: string
        }[]
      }
      get_qr_analytics_summary: { Args: { qr_id_param: string }; Returns: Json }
      record_qr_scan: {
        Args: {
          device_info?: Json
          qr_id_param: string
          referer_param?: string
          scanner_ip_param?: unknown
          user_agent_param?: string
        }
        Returns: Json
      }
      verify_qr_password: {
        Args: { password_text: string; qr_id_param: string }
        Returns: {
          content_url: string
          error_message: string
          success: boolean
        }[]
      }
    }
    Enums: {
      qr_status_enum: "active" | "expired" | "single_use_consumed" | "disabled"
      qr_type_enum:
        | "url"
        | "text"
        | "email"
        | "phone"
        | "sms"
        | "wifi"
        | "vcard"
        | "event"
        | "payment"
        | "file"
        | "video"
        | "app_link"
        | "password-protected"
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
      qr_status_enum: ["active", "expired", "single_use_consumed", "disabled"],
      qr_type_enum: [
        "url",
        "text",
        "email",
        "phone",
        "sms",
        "wifi",
        "vcard",
        "event",
        "payment",
        "file",
        "video",
        "app_link",
        "password-protected",
      ],
    },
  },
} as const
