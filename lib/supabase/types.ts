export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stores"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["stores"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          brand: string;
          category_id: string | null;
          barcode_ean: string | null;
          sku: string | null;
          description: string | null;
          price_cents: number;
          cost_cents: number | null;
          flavor: string | null;
          weight_volume: string | null;
          unit: string | null;
          is_active: boolean;
          is_club_exclusive: boolean;
          image_url: string | null;
          nutritional_info: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["product_categories"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          quantity: number;
          min_quantity: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      inventory_movements: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          movement_type: string;
          quantity: number;
          reason: string | null;
          order_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_movements"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_movements"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          store_id: string | null;
          status: string;
          payment_status: string;
          subtotal_cents: number;
          discount_cents: number;
          total_cents: number;
          points_earned: number;
          points_redeemed: number;
          delivery_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_cents: number;
          total_cents: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      loyalty_accounts: {
        Row: {
          id: string;
          customer_id: string;
          total_points: number;
          tier: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loyalty_accounts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["loyalty_accounts"]["Insert"]>;
      };
      loyalty_points_ledger: {
        Row: {
          id: string;
          customer_id: string;
          entry_type: string;
          points: number;
          order_id: string | null;
          description: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loyalty_points_ledger"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["loyalty_points_ledger"]["Insert"]>;
      };
      loyalty_rewards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          points_cost: number;
          reward_type: string;
          value_cents: number | null;
          product_id: string | null;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["loyalty_rewards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["loyalty_rewards"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
