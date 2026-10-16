/**
 * Database Contract Types for Supabase PostgreSQL
 * Represents the exact schema contract for:
 * 1. profiles
 * 2. products
 * 3. drink_logs
 */

export interface DbProfile {
  id: string // UUID referencing auth.users.id
  email?: string | null
  full_name: string
  daily_sugar_target: number // Grams (e.g. 50g WHO / 25g AHA)
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface DbProduct {
  id: string
  barcode?: string | null
  name: string
  brand?: string | null
  package_volume_ml?: number | null
  sugar_per_100ml?: number | null // NULL if unknown - NEVER assume 0
  category?: string | null
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface DbDrinkLog {
  id: string
  user_id: string // UUID referencing profiles.id / auth.users.id
  product_id?: string | null // Reference to products.id if from catalog
  drink_name: string // Snapshot name
  brand?: string | null // Snapshot brand
  consumed_volume_ml: number // In ml
  sugar_per_100ml?: number | null // NULL if unknown
  total_sugar_grams?: number | null // NULL if unknown - computed via (sugar_per_100ml * consumed_volume_ml) / 100
  consumed_at: string // ISO timestamptz
  drink_session?: string | null // 'Pagi' | 'Siang' | 'Sore' | 'Malam'
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile
        Insert: Omit<DbProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<DbProfile, 'id'>>
      }
      products: {
        Row: DbProduct
        Insert: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<DbProduct, 'id'>>
      }
      drink_logs: {
        Row: DbDrinkLog
        Insert: Omit<DbDrinkLog, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<DbDrinkLog, 'id'>>
      }
    }
  }
}

