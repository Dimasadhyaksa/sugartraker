import { ref, computed } from 'vue'
import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js'
import type { Product, ConsumptionLogItem, UserProfile, DrinkSession, DrinkStatus } from '~/types/sugar'

let cachedClient: SupabaseClient | null = null
const authUser = ref<User | null>(null)
const authSession = ref<Session | null>(null)
const isAuthReady = ref<boolean>(false)

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = (config.public.supabaseUrl as string)?.trim() || ''
  const supabaseKey = (config.public.supabaseKey as string)?.trim() || ''

  const isConfigured = computed(() => {
    return Boolean(
      supabaseUrl && 
      supabaseKey && 
      supabaseUrl !== 'https://your-project.supabase.co' &&
      !supabaseUrl.includes('placeholder')
    )
  })

  const setAuthSession = (session: Session | null) => {
    authSession.value = session
    authUser.value = session?.user || null
    isAuthReady.value = true
  }

  const getClient = (): SupabaseClient | null => {
    if (!isConfigured.value) {
      return null
    }

    if (!cachedClient) {
      try {
        cachedClient = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })

        // Inisialisasi status autentikasi di lingkungan client/browser
        if (import.meta.client) {
          cachedClient.auth.getSession().then(({ data }) => {
            setAuthSession(data.session)
          })

          cachedClient.auth.onAuthStateChange((_event, session) => {
            setAuthSession(session)
          })
        }
      } catch (err) {
        console.warn('[SugarTracker Supabase] Failed to initialize client:', err)
        return null
      }
    }

    return cachedClient
  }

  const client = getClient()

  // Mapper helper: DB Product -> App Product
  const mapDbProductToProduct = (db: any): Product => ({
    id: db.id,
    barcode: db.barcode || '',
    name: db.name || '',
    brand: db.brand || '',
    category: db.category || 'Minuman Lainnya',
    packageVolumeMl: db.package_volume_ml ? Number(db.package_volume_ml) : 250,
    servingSizeMl: db.serving_size_ml ? Number(db.serving_size_ml) : 250,
    servingSize: db.serving_size || `${db.package_volume_ml || 250} ml`,
    sugarPer100ml: db.sugar_per_100ml !== null && db.sugar_per_100ml !== undefined ? Number(db.sugar_per_100ml) : undefined,
    sugarPerServing: db.sugar_per_serving !== null && db.sugar_per_serving !== undefined ? Number(db.sugar_per_serving) : undefined,
    totalSugarsG: Number(db.total_sugars_g) || 0,
    addedSugarsG: Number(db.added_sugars_g) || 0,
    naturalSugarsG: Number(db.natural_sugars_g) || 0,
    totalCarbsG: Number(db.total_carbs_g) || 0,
    calories: Number(db.calories) || 0,
    glycemicIndexEstimate: db.glycemic_index_estimate !== null && db.glycemic_index_estimate !== undefined ? Number(db.glycemic_index_estimate) : 50,
    glycemicStatus: db.glycemic_status || 'Aman',
    ingredients: Array.isArray(db.ingredients) ? db.ingredients : [],
    hiddenSugarsDetected: Array.isArray(db.hidden_sugars_detected) ? db.hidden_sugars_detected : [],
    imageUrl: db.image_url || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80'
  })

  // Mapper helper: DB Drink Log -> App ConsumptionLogItem
  const mapDbDrinkLogToItem = (db: any): ConsumptionLogItem => {
    const vol = Number(db.consumed_volume_ml || db.volume_ml) || 250
    const per100 = db.sugar_per_100ml !== null && db.sugar_per_100ml !== undefined ? Number(db.sugar_per_100ml) : undefined
    const totalG = db.total_sugar_grams !== null && db.total_sugar_grams !== undefined 
      ? Number(db.total_sugar_grams) 
      : (db.sugar_grams !== undefined ? Number(db.sugar_grams) : (per100 !== undefined ? Number(((per100 * vol) / 100).toFixed(1)) : 0))

    return {
      id: db.id,
      userId: db.user_id,
      name: db.drink_name || db.name || 'Minuman',
      brand: db.brand || '',
      volumeMl: vol,
      packageVolumeMl: vol,
      sugarPer100ml: per100,
      sugarPerServing: db.sugar_per_serving !== null && db.sugar_per_serving !== undefined ? Number(db.sugar_per_serving) : undefined,
      servingsConsumed: 1,
      calculationBasis: per100 !== undefined ? 'per_100ml' : 'per_serving',
      sugarGrams: totalG,
      addedSugarGrams: totalG,
      naturalSugarGrams: 0,
      drinkSession: (db.drink_session as DrinkSession) || 'Siang',
      mealSession: (db.drink_session as DrinkSession) || 'Siang',
      status: totalG > 25 ? 'Melebihi Target' : (totalG > 12 ? 'Waspada' : 'Aman'),
      glycemicStatus: totalG > 25 ? 'High' : (totalG > 12 ? 'Moderate' : 'Safe'),
      hasHiddenSugars: Boolean(db.has_hidden_sugars),
      hiddenSugarIngredients: Array.isArray(db.hidden_sugar_ingredients) ? db.hidden_sugar_ingredients : [],
      barcode: db.barcode || undefined,
      loggedAt: db.consumed_at || db.logged_at || db.created_at || new Date().toISOString(),
      notes: db.notes || '',
      icon: db.icon || 'local_cafe'
    }
  }

  // Database Query Helpers
  const fetchProducts = async (): Promise<Product[] | null> => {
    if (!client) return null
    try {
      const { data, error } = await client.from('products').select('*').order('name')
      if (error) {
        console.warn('[Supabase] Error fetching products:', error.message)
        return null
      }
      return (data || []).map(mapDbProductToProduct)
    } catch (err) {
      console.warn('[Supabase] fetchProducts exception:', err)
      return null
    }
  }

  const fetchDrinkLogs = async (userId: string): Promise<ConsumptionLogItem[] | null> => {
    if (!client || !userId) return null
    try {
      // Prioritaskan kolom consumed_at sesuai schema.sql
      let { data, error } = await client
        .from('drink_logs')
        .select('*')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: false })

      if (error) {
        // Fallback jika database menggunakan kolom logged_at
        const fallbackRes = await client
          .from('drink_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (fallbackRes.error) {
          console.warn('[Supabase] Error fetching drink_logs:', error.message)
          return null
        }
        data = fallbackRes.data
      }
      return (data || []).map(mapDbDrinkLogToItem)
    } catch (err) {
      console.warn('[Supabase] fetchDrinkLogs exception:', err)
      return null
    }
  }

  const insertDrinkLog = async (item: Omit<ConsumptionLogItem, 'id'>, userId: string): Promise<ConsumptionLogItem | null> => {
    if (!client || !userId) return null
    try {
      const vol = Number(item.volumeMl) || 250
      const sugarPer100 = item.sugarPer100ml !== undefined ? Number(item.sugarPer100ml) : null
      const totalG = item.sugarGrams !== undefined ? Number(item.sugarGrams) : (sugarPer100 !== null ? Number(((sugarPer100 * vol) / 100).toFixed(1)) : 0)

      const payload: Record<string, any> = {
        user_id: userId,
        drink_name: item.name,
        brand: item.brand || null,
        consumed_volume_ml: vol,
        sugar_per_100ml: sugarPer100,
        total_sugar_grams: totalG,
        drink_session: item.drinkSession || 'Siang',
        notes: item.notes || null,
        consumed_at: item.loggedAt || new Date().toISOString()
      }

      const { data, error } = await client
        .from('drink_logs')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.warn('[Supabase] Error inserting drink log:', error.message)
        return null
      }
      return mapDbDrinkLogToItem(data)
    } catch (err) {
      console.warn('[Supabase] insertDrinkLog exception:', err)
      return null
    }
  }

  const updateDrinkLog = async (id: string, updates: Partial<ConsumptionLogItem>): Promise<boolean> => {
    if (!client || !id) return false
    try {
      const payload: Record<string, any> = {}
      if (updates.name !== undefined) payload.drink_name = updates.name
      if (updates.brand !== undefined) payload.brand = updates.brand
      if (updates.volumeMl !== undefined) payload.consumed_volume_ml = updates.volumeMl
      if (updates.sugarGrams !== undefined) payload.total_sugar_grams = updates.sugarGrams
      if (updates.sugarPer100ml !== undefined) payload.sugar_per_100ml = updates.sugarPer100ml
      if (updates.drinkSession !== undefined) payload.drink_session = updates.drinkSession
      if (updates.notes !== undefined) payload.notes = updates.notes

      const { error } = await client.from('drink_logs').update(payload).eq('id', id)
      if (error) {
        console.warn('[Supabase] Error updating drink log:', error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('[Supabase] updateDrinkLog exception:', err)
      return false
    }
  }

  const deleteDrinkLog = async (id: string): Promise<boolean> => {
    if (!client || !id) return false
    try {
      const { error } = await client.from('drink_logs').delete().eq('id', id)
      if (error) {
        console.warn('[Supabase] Error deleting drink log:', error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('[Supabase] deleteDrinkLog exception:', err)
      return false
    }
  }

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!client || !userId) return null
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[Supabase] Error fetching profile:', error.message)
        return null
      }
      if (!data) return null

      return {
        id: data.id,
        email: data.email || authUser.value?.email || 'user@example.com',
        fullName: data.full_name || authUser.value?.user_metadata?.full_name || 'Pengguna SugarTracker',
        dailyGoalG: Number(data.daily_sugar_target || data.daily_goal_g) || 50,
        avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
        metabolicPhase: 'Aman',
        cgmSyncEnabled: false,
        createdAt: data.created_at
      }
    } catch (err) {
      console.warn('[Supabase] fetchProfile exception:', err)
      return null
    }
  }

  const upsertProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<boolean> => {
    if (!client || !profile.id) return false
    try {
      const payload: Record<string, any> = {
        id: profile.id,
        updated_at: new Date().toISOString()
      }
      if (profile.email !== undefined) payload.email = profile.email
      if (profile.fullName !== undefined) payload.full_name = profile.fullName
      if (profile.dailyGoalG !== undefined) {
        payload.daily_sugar_target = profile.dailyGoalG
      }
      if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl

      const { error } = await client.from('profiles').upsert(payload)
      if (error) {
        console.warn('[Supabase] Error upserting profile:', error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('[Supabase] upsertProfile exception:', err)
      return false
    }
  }

  return {
    client,
    authUser,
    authSession,
    isAuthReady,
    setAuthSession,
    isConfigured: isConfigured.value,
    supabaseUrl,
    supabaseKeyConfigured: Boolean(supabaseKey),
    fetchProducts,
    fetchDrinkLogs,
    insertDrinkLog,
    updateDrinkLog,
    deleteDrinkLog,
    fetchProfile,
    upsertProfile
  }
}
