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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_profile: {
        Row: {
          focus: string | null
          headshot_url: string | null
          id: string
          name: string
          philosophy: string | null
          story: string | null
          title: string
          updated_at: string
          years_experience: string | null
        }
        Insert: {
          focus?: string | null
          headshot_url?: string | null
          id?: string
          name: string
          philosophy?: string | null
          story?: string | null
          title: string
          updated_at?: string
          years_experience?: string | null
        }
        Update: {
          focus?: string | null
          headshot_url?: string | null
          id?: string
          name?: string
          philosophy?: string | null
          story?: string | null
          title?: string
          updated_at?: string
          years_experience?: string | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          achievements: string[]
          bio: string | null
          cover_image: string | null
          created_at: string
          discipline: string
          gallery: string[]
          id: string
          is_published: boolean
          name: string
          short_bio: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          achievements?: string[]
          bio?: string | null
          cover_image?: string | null
          created_at?: string
          discipline: string
          gallery?: string[]
          id?: string
          is_published?: boolean
          name: string
          short_bio?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          achievements?: string[]
          bio?: string | null
          cover_image?: string | null
          created_at?: string
          discipline?: string
          gallery?: string[]
          id?: string
          is_published?: boolean
          name?: string
          short_bio?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      awards_records: {
        Row: {
          artist_id: string | null
          award_body: string
          category: string
          created_at: string
          id: string
          sort_order: number
          updated_at: string
          year: number
        }
        Insert: {
          artist_id?: string | null
          award_body: string
          category: string
          created_at?: string
          id?: string
          sort_order?: number
          updated_at?: string
          year: number
        }
        Update: {
          artist_id?: string | null
          award_body?: string
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "awards_records_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      charity_works: {
        Row: {
          completed_on: string | null
          created_at: string
          evidence_images: string[]
          id: string
          organization: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_on?: string | null
          created_at?: string
          evidence_images?: string[]
          id?: string
          organization: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_on?: string | null
          created_at?: string
          evidence_images?: string[]
          id?: string
          organization?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          artist_id: string | null
          budget: string | null
          created_at: string
          email: string
          event_date: string | null
          id: string
          message: string
          name: string
          organization: string | null
          project_type: string | null
          status: string
        }
        Insert: {
          artist_id?: string | null
          budget?: string | null
          created_at?: string
          email: string
          event_date?: string | null
          id?: string
          message: string
          name: string
          organization?: string | null
          project_type?: string | null
          status?: string
        }
        Update: {
          artist_id?: string | null
          budget?: string | null
          created_at?: string
          email?: string
          event_date?: string | null
          id?: string
          message?: string
          name?: string
          organization?: string | null
          project_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          artist_id: string | null
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          price: number
          sort_order: number
          stock: number
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          sort_order?: number
          stock?: number
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          sort_order?: number
          stock?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author: string
          author_role: string | null
          created_at: string
          id: string
          is_featured: boolean
          quote: string
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author: string
          author_role?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          quote: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string
          author_role?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          quote?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
