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
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          birth_date: string | null;
          role: string;
          store_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          role?: string;
          store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          role?: string;
          store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          brand: string;
          category_id?: string | null;
          barcode_ean?: string | null;
          sku?: string | null;
          description?: string | null;
          price_cents: number;
          cost_cents?: number | null;
          flavor?: string | null;
          weight_volume?: string | null;
          unit?: string | null;
          is_active?: boolean;
          is_club_exclusive?: boolean;
          image_url?: string | null;
          nutritional_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          brand?: string;
          category_id?: string | null;
          barcode_ean?: string | null;
          sku?: string | null;
          description?: string | null;
          price_cents?: number;
          cost_cents?: number | null;
          flavor?: string | null;
          weight_volume?: string | null;
          unit?: string | null;
          is_active?: boolean;
          is_club_exclusive?: boolean;
          image_url?: string | null;
          nutritional_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt?: string | null;
          sort_order?: number;
        };
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
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          quantity?: number;
          min_quantity?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          product_id?: string;
          quantity?: number;
          min_quantity?: number;
          updated_at?: string;
        };
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
          transfer_id: string | null;
          lot: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          movement_type: string;
          quantity: number;
          reason?: string | null;
          order_id?: string | null;
          transfer_id?: string | null;
          lot?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          product_id?: string;
          movement_type?: string;
          quantity?: number;
          reason?: string | null;
          order_id?: string | null;
          transfer_id?: string | null;
          lot?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      stock_transfers: {
        Row: {
          id: string;
          from_store_id: string;
          to_store_id: string;
          product_id: string;
          quantity: number;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_store_id: string;
          to_store_id: string;
          product_id: string;
          quantity: number;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_store_id?: string;
          to_store_id?: string;
          product_id?: string;
          quantity?: number;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
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
          shipping_cents: number;
          total_cents: number;
          points_earned: number;
          points_redeemed: number;
          delivery_type: string;
          coupon_code: string | null;
          delivery_address: Json | null;
          pagbank_order_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          store_id?: string | null;
          status?: string;
          payment_status?: string;
          subtotal_cents: number;
          discount_cents?: number;
          shipping_cents?: number;
          total_cents: number;
          points_earned?: number;
          points_redeemed?: number;
          delivery_type?: string;
          coupon_code?: string | null;
          delivery_address?: Json | null;
          pagbank_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          store_id?: string | null;
          status?: string;
          payment_status?: string;
          subtotal_cents?: number;
          discount_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          points_earned?: number;
          points_redeemed?: number;
          delivery_type?: string;
          coupon_code?: string | null;
          delivery_address?: Json | null;
          pagbank_order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_cents: number;
          total_cents: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price_cents?: number;
          total_cents?: number;
        };
      };
      payment_events: {
        Row: {
          id: string;
          order_id: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string;
        };
      };
      loyalty_accounts: {
        Row: {
          id: string;
          customer_id: string;
          total_points: number;
          lifetime_points: number;
          tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          total_points?: number;
          lifetime_points?: number;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          total_points?: number;
          lifetime_points?: number;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          customer_id: string;
          entry_type: string;
          points: number;
          order_id?: string | null;
          description?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          entry_type?: string;
          points?: number;
          order_id?: string | null;
          description?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          points_cost: number;
          reward_type: string;
          value_cents?: number | null;
          product_id?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          points_cost?: number;
          reward_type?: string;
          value_cents?: number | null;
          product_id?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
      };
      loyalty_redemptions: {
        Row: {
          id: string;
          customer_id: string;
          reward_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          reward_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          reward_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      loyalty_campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          multiplier: number;
          starts_at: string;
          ends_at: string;
          product_id: string | null;
          category_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          multiplier?: number;
          starts_at: string;
          ends_at: string;
          product_id?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          multiplier?: number;
          starts_at?: string;
          ends_at?: string;
          product_id?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_cents: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_cents?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          min_order_cents?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: {
      increment_coupon_usage: {
        Args: { coupon_code_param: string };
        Returns: void;
      };
    };
    Enums: Record<string, string>;
  };
}
