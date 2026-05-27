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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_cents: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_cents?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_cents?: number | null
          used_count?: number
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          entregador_id: string | null
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          entregador_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          entregador_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          min_quantity: number
          product_id: string
          quantity: number
          store_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          min_quantity?: number
          product_id: string
          quantity?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          min_quantity?: number
          product_id?: string
          quantity?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          lot: string | null
          movement_type: string
          order_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          store_id: string
          transfer_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          lot?: string | null
          movement_type: string
          order_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          store_id: string
          transfer_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          lot?: string | null
          movement_type?: string
          order_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          store_id?: string
          transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          lifetime_points: number
          tier: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_campaigns: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_active: boolean
          multiplier: number
          name: string
          product_id: string | null
          starts_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          multiplier?: number
          name: string
          product_id?: string | null
          starts_at: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
          name?: string
          product_id?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points_ledger: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          entry_type: string
          expires_at: string | null
          id: string
          order_id: string | null
          points: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          entry_type: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          entry_type?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_redemptions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          reward_id: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          reward_id: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_cost: number
          product_id: string | null
          reward_type: string
          value_cents: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_cost: number
          product_id?: string | null
          reward_type: string
          value_cents?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_cost?: number
          product_id?: string | null
          reward_type?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          created_at: string
          id: string
          min_points: number
          multiplier: number
          name: string
          perks: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          min_points: number
          multiplier?: number
          name: string
          perks?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          min_points?: number
          multiplier?: number
          name?: string
          perks?: Json | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          flavor: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          flavor?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          flavor?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_cents?: number
          unit_price_cents?: number
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
          boleto_barcode: string | null
          coupon_code: string | null
          created_at: string
          customer_id: string | null
          delivery_address: Json | null
          delivery_type: string
          discount_cents: number
          driver_lat: number | null
          driver_lng: number | null
          estimated_delivery_at: string | null
          id: string
          notes: string | null
          pagbank_charge_id: string | null
          pagbank_order_id: string | null
          payment_id: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: string
          payment_url: string | null
          pix_qr_code: string | null
          pix_qr_code_text: string | null
          points_earned: number
          points_redeemed: number
          shipping_address: Json | null
          shipping_cents: number
          status: string
          store_id: string | null
          subtotal_cents: number
          total_cents: number
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          boleto_barcode?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_type?: string
          discount_cents?: number
          driver_lat?: number | null
          driver_lng?: number | null
          estimated_delivery_at?: string | null
          id?: string
          notes?: string | null
          pagbank_charge_id?: string | null
          pagbank_order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_url?: string | null
          pix_qr_code?: string | null
          pix_qr_code_text?: string | null
          points_earned?: number
          points_redeemed?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          store_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          boleto_barcode?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_type?: string
          discount_cents?: number
          driver_lat?: number | null
          driver_lng?: number | null
          estimated_delivery_at?: string | null
          id?: string
          notes?: string | null
          pagbank_charge_id?: string | null
          pagbank_order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string
          payment_url?: string | null
          pix_qr_code?: string | null
          pix_qr_code_text?: string | null
          points_earned?: number
          points_redeemed?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          store_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          event_type: string
          id: string
          order_id: string | null
          processed_at: string | null
          provider: string
          provider_id: string | null
          raw_payload: Json | null
          status: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          event_type: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          provider?: string
          provider_id?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          event_type?: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          provider?: string
          provider_id?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode_ean: string | null
          brand: string
          category_id: string | null
          cost_cents: number | null
          created_at: string
          description: string | null
          emoji: string | null
          flavor: string | null
          flavors: string[] | null
          sizes: string[] | null
          id: string
          image_url: string | null
          is_active: boolean
          is_club_exclusive: boolean
          name: string
          nutritional_info: Json | null
          old_price_cents: number | null
          points_per_unit: number
          price_cents: number
          sku: string | null
          slug: string
          unit: string | null
          updated_at: string
          weight_volume: string | null
          hero_image_url: string | null
          gallery_images: Json | null
          video_urls: Json | null
          short_promise: string | null
          benefits: Json | null
          nutrition_facts: Json | null
          ingredients: string | null
          allergens: string[] | null
          how_to_use: Json | null
          warnings: string | null
          certifications: string[] | null
          faq: Json | null
          rating_average: number | null
          rating_count: number | null
          is_featured: boolean
          is_best_seller: boolean
        }
        Insert: {
          barcode_ean?: string | null
          brand: string
          category_id?: string | null
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          flavor?: string | null
          flavors?: string[] | null
          sizes?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_club_exclusive?: boolean
          name: string
          nutritional_info?: Json | null
          old_price_cents?: number | null
          points_per_unit?: number
          price_cents: number
          sku?: string | null
          slug: string
          unit?: string | null
          updated_at?: string
          weight_volume?: string | null
          hero_image_url?: string | null
          gallery_images?: Json | null
          video_urls?: Json | null
          short_promise?: string | null
          benefits?: Json | null
          nutrition_facts?: Json | null
          ingredients?: string | null
          allergens?: string[] | null
          how_to_use?: Json | null
          warnings?: string | null
          certifications?: string[] | null
          faq?: Json | null
          rating_average?: number | null
          rating_count?: number | null
          is_featured?: boolean
          is_best_seller?: boolean
        }
        Update: {
          barcode_ean?: string | null
          brand?: string
          category_id?: string | null
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          flavor?: string | null
          flavors?: string[] | null
          sizes?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_club_exclusive?: boolean
          name?: string
          nutritional_info?: Json | null
          old_price_cents?: number | null
          points_per_unit?: number
          price_cents?: number
          sku?: string | null
          slug?: string
          unit?: string | null
          updated_at?: string
          weight_volume?: string | null
          hero_image_url?: string | null
          gallery_images?: Json | null
          video_urls?: Json | null
          short_promise?: string | null
          benefits?: Json | null
          nutrition_facts?: Json | null
          ingredients?: string | null
          allergens?: string[] | null
          how_to_use?: Json | null
          warnings?: string | null
          certifications?: string[] | null
          faq?: Json | null
          rating_average?: number | null
          rating_count?: number | null
          is_featured?: boolean
          is_best_seller?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string
          created_by: string | null
          from_store_id: string
          id: string
          product_id: string
          quantity: number
          status: string
          to_store_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_store_id: string
          id?: string
          product_id: string
          quantity: number
          status?: string
          to_store_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_store_id?: string
          id?: string
          product_id?: string
          quantity?: number
          status?: string
          to_store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          driver_id: string | null
          store_id: string | null
          status: string
          address: Json | null
          notes: string | null
          assigned_at: string | null
          picked_at: string | null
          delivered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          driver_id?: string | null
          store_id?: string | null
          status?: string
          address?: Json | null
          notes?: string | null
          assigned_at?: string | null
          picked_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          driver_id?: string | null
          store_id?: string | null
          status?: string
          address?: Json | null
          notes?: string | null
          assigned_at?: string | null
          picked_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      delivery_tracking_events: {
        Row: {
          id: string
          delivery_id: string
          driver_id: string | null
          event_type: string
          latitude: number | null
          longitude: number | null
          speed: number | null
          heading: number | null
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          driver_id?: string | null
          event_type: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          heading?: number | null
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string
          driver_id?: string | null
          event_type?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          heading?: number | null
          data?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      delivery_drivers: {
        Row: {
          id: string
          user_id: string
          store_id: string | null
          name: string | null
          phone: string | null
          status: string
          active: boolean
          latitude: number | null
          longitude: number | null
          current_latitude: number | null
          current_longitude: number | null
          last_seen_at: string | null
          last_location_at: string | null
          updated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_id?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          active?: boolean
          latitude?: number | null
          longitude?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          last_seen_at?: string | null
          last_location_at?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_id?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          active?: boolean
          latitude?: number | null
          longitude?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          last_seen_at?: string | null
          last_location_at?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pickup_points: {
        Row: {
          id: string
          store_id: string
          name: string
          address_line: string | null
          address_number: string | null
          district: string | null
          city: string | null
          state: string | null
          zipcode: string | null
          latitude: number | null
          longitude: number | null
          instructions: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          address_line?: string | null
          address_number?: string | null
          district?: string | null
          city?: string | null
          state?: string | null
          zipcode?: string | null
          latitude?: number | null
          longitude?: number | null
          instructions?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          address_line?: string | null
          address_number?: string | null
          district?: string | null
          city?: string | null
          state?: string | null
          zipcode?: string | null
          latitude?: number | null
          longitude?: number | null
          instructions?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          customer_id: string | null
          provider: string
          method: string
          status: string
          amount_cents: number
          provider_payment_id: string | null
          pix_qr_code: string | null
          pix_copy_paste: string | null
          paid_at: string | null
          failed_reason: string | null
          metadata: Json | null
          provider_order_id: string | null
          idempotency_key: string | null
          payment_url: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_id?: string | null
          provider: string
          method: string
          status?: string
          amount_cents: number
          provider_payment_id?: string | null
          pix_qr_code?: string | null
          pix_copy_paste?: string | null
          paid_at?: string | null
          failed_reason?: string | null
          metadata?: Json | null
          provider_order_id?: string | null
          idempotency_key?: string | null
          payment_url?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_id?: string | null
          provider?: string
          method?: string
          status?: string
          amount_cents?: number
          provider_payment_id?: string | null
          pix_qr_code?: string | null
          pix_copy_paste?: string | null
          paid_at?: string | null
          failed_reason?: string | null
          metadata?: Json | null
          provider_order_id?: string | null
          idempotency_key?: string | null
          payment_url?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_balances: {
        Row: {
          id: string
          product_id: string
          location_id: string
          quantity_available: number
          quantity_reserved: number
          quantity_minimum: number
          quantity_in_transit: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          location_id: string
          quantity_available?: number
          quantity_reserved?: number
          quantity_minimum?: number
          quantity_in_transit?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          location_id?: string
          quantity_available?: number
          quantity_reserved?: number
          quantity_minimum?: number
          quantity_in_transit?: number
          updated_at?: string
        }
        Relationships: []
      }
      seller_commissions: {
        Row: {
          id: string
          seller_id: string
          order_id: string
          order_item_id: string | null
          product_id: string | null
          amount_cents: number
          rate: number
          status: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          order_id: string
          order_item_id?: string | null
          product_id?: string | null
          amount_cents: number
          rate: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          order_id?: string
          order_item_id?: string | null
          product_id?: string | null
          amount_cents?: number
          rate?: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          id: string
          store_id: string
          provider: string
          is_active: boolean
          settings_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          provider: string
          is_active?: boolean
          settings_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          provider?: string
          is_active?: boolean
          settings_json?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      payment_webhook_events: {
        Row: {
          id: string
          provider: string
          event_id: string | null
          event_type: string | null
          payload: Json
          processed: boolean
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          event_id?: string | null
          event_type?: string | null
          payload: Json
          processed?: boolean
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          event_id?: string | null
          event_type?: string | null
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      customer_payment_methods: {
        Row: {
          id: string
          customer_id: string
          provider: string
          token: string
          last4: string | null
          brand: string | null
          is_default: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          provider: string
          token: string
          last4?: string | null
          brand?: string | null
          is_default?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          provider?: string
          token?: string
          last4?: string | null
          brand?: string | null
          is_default?: boolean
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      inventory_locations: {
        Row: {
          id: string
          name: string
          type: string
          store_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          store_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          store_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_coupon_usage: {
        Args: { coupon_code_param: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      get_my_role: { Args: Record<PropertyKey, never>; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
