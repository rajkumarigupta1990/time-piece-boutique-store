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
      contact_queries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          order_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_amount: number
          id?: string
          order_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          cap_amount: number | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_order_amount: number | null
          name: string
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          cap_amount?: number | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          name: string
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          cap_amount?: number | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_order_amount?: number | null
          name?: string
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          discount_amount: number | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          shipping_address: Json
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping_address: Json
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipping_address?: Json
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_collection_settings: {
        Row: {
          collect_other_charges_upfront: boolean | null
          collect_shipping_upfront: boolean | null
          id: string
          shipping_charge: number | null
          updated_at: string
        }
        Insert: {
          collect_other_charges_upfront?: boolean | null
          collect_shipping_upfront?: boolean | null
          id?: string
          shipping_charge?: number | null
          updated_at?: string
        }
        Update: {
          collect_other_charges_upfront?: boolean | null
          collect_shipping_upfront?: boolean | null
          id?: string
          shipping_charge?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          cod_enabled: boolean
          id: string
          online_payment_enabled: boolean
          updated_at: string
        }
        Insert: {
          cod_enabled?: boolean
          id?: string
          online_payment_enabled?: boolean
          updated_at?: string
        }
        Update: {
          cod_enabled?: boolean
          id?: string
          online_payment_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_charges: Json | null
          brand: string
          category: string
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          in_stock: boolean
          moq: number | null
          name: string
          original_price: number | null
          price: number
          rating: number
          reviews: number
          updated_at: string
        }
        Insert: {
          additional_charges?: Json | null
          brand: string
          category: string
          created_at?: string
          description: string
          features?: string[]
          id?: string
          images?: string[]
          in_stock?: boolean
          moq?: number | null
          name: string
          original_price?: number | null
          price: number
          rating?: number
          reviews?: number
          updated_at?: string
        }
        Update: {
          additional_charges?: Json | null
          brand?: string
          category?: string
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          images?: string[]
          in_stock?: boolean
          moq?: number | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number
          reviews?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_coupon: {
        Args: { coupon_code_input: string; order_total: number }
        Returns: {
          is_valid: boolean
          discount_amount: number
          message: string
          coupon_data: Json
        }[]
      }
    }
    Enums: {
      coupon_type: "flat_amount" | "percentage" | "free_delivery"
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
      coupon_type: ["flat_amount", "percentage", "free_delivery"],
    },
  },
} as const
