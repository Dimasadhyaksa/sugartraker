import { ref, computed } from 'vue'
import type { DrinkLogItem, CreateDrinkLogInput, UpdateDrinkLogInput, DrinkSession } from '~/types/drink-log'
import { calculateDrinkSugar, sumKnownSugar } from '~/utils/sugar-calculation'
import { isDateToday, formatDateKey } from '~/utils/date-range'
import { useSupabase } from './useSupabase'

// Initial mock logs explicitly marked for initial state / design testing
const defaultMockLogs: DrinkLogItem[] = [
  {
    id: 'log-1',
    userId: 'usr-default',
    productId: 'prod-ito-en-tawar',
    drinkName: 'Ito En Oi Ocha Green Tea',
    brand: 'Ito En',
    consumedVolumeMl: 500,
    sugarPer100ml: 0,
    totalSugarGrams: 0,
    drinkSession: 'Pagi',
    consumedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notes: 'Seduhan teh hijau tawar',
    icon: 'water_drop'
  },
  {
    id: 'log-2',
    userId: 'usr-default',
    productId: 'prod-teh-botol-kotak',
    drinkName: 'Teh Botol Sosro Kotak',
    brand: 'Sosro',
    consumedVolumeMl: 250,
    sugarPer100ml: 6.0,
    totalSugarGrams: 15.0, // (6.0 * 250) / 100 = 15.0g
    drinkSession: 'Siang',
    consumedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notes: 'Minuman teh kemasan',
    icon: 'local_cafe'
  },
  {
    id: 'log-3',
    userId: 'usr-default',
    productId: 'prod-ultra-milk-cokelat',
    drinkName: 'Ultra Milk Cokelat UHT',
    brand: 'Ultra Jaya',
    consumedVolumeMl: 200,
    sugarPer100ml: 7.0,
    totalSugarGrams: 14.0, // (7.0 * 200) / 100 = 14.0g
    drinkSession: 'Sore',
    consumedAt: new Date().toISOString(),
    notes: 'Susu cokelat UHT',
    icon: 'emoji_food_beverage'
  }
]

const logsState = ref<DrinkLogItem[]>([...defaultMockLogs])
const isLogsLoading = ref<boolean>(false)

export const useDrinkLogs = () => {
  const { client, authUser, isConfigured } = useSupabase()

  /**
   * Load drink logs for the current user from Supabase `drink_logs` table
   */
  const loadUserLogs = async (userId?: string) => {
    const targetUserId = userId || authUser.value?.id
    if (!targetUserId || !isConfigured || !client) {
      return logsState.value
    }

    isLogsLoading.value = true
    try {
      const { data, error } = await client
        .from('drink_logs')
        .select('*')
        .eq('user_id', targetUserId)
        .order('consumed_at', { ascending: false })

      if (error) {
        console.warn('[useDrinkLogs] Supabase query error:', error.message)
      } else if (data) {
        logsState.value = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          productId: d.product_id || null,
          drinkName: d.drink_name,
          brand: d.brand || null,
          consumedVolumeMl: Number(d.consumed_volume_ml) || 250,
          sugarPer100ml: d.sugar_per_100ml !== null && d.sugar_per_100ml !== undefined
            ? Number(d.sugar_per_100ml)
            : null,
          totalSugarGrams: d.total_sugar_grams !== null && d.total_sugar_grams !== undefined
            ? Number(d.total_sugar_grams)
            : null,
          drinkSession: (d.drink_session as DrinkSession) || 'Siang',
          consumedAt: d.consumed_at || new Date().toISOString(),
          notes: d.notes || null,
          icon: d.icon || 'local_cafe'
        }))
      }
    } catch (err) {
      console.warn('[useDrinkLogs] Exception fetching drink logs:', err)
    } finally {
      isLogsLoading.value = false
    }

    return logsState.value
  }

  /**
   * Add a new drink log
   */
  const addDrinkLog = async (input: CreateDrinkLogInput): Promise<DrinkLogItem> => {
    const targetUserId = authUser.value?.id || 'usr-default'
    const newId = `log-${Date.now()}`

    // Calculate total sugar via verified utility function
    const totalSugar = calculateDrinkSugar(input.sugarPer100ml, input.consumedVolumeMl)

    const newLog: DrinkLogItem = {
      id: newId,
      userId: targetUserId,
      productId: input.productId || null,
      drinkName: input.drinkName.trim(),
      brand: input.brand?.trim() || null,
      consumedVolumeMl: input.consumedVolumeMl,
      sugarPer100ml: input.sugarPer100ml,
      totalSugarGrams: totalSugar,
      drinkSession: input.drinkSession || 'Siang',
      consumedAt: input.consumedAt || new Date().toISOString(),
      notes: input.notes?.trim() || null,
      icon: input.icon || 'local_cafe'
    }

    // Optimistic local update
    logsState.value.unshift(newLog)

    // Sync to Supabase if authenticated and configured
    if (isConfigured && client && authUser.value?.id) {
      try {
        const payload = {
          user_id: authUser.value.id,
          product_id: newLog.productId,
          drink_name: newLog.drinkName,
          brand: newLog.brand,
          consumed_volume_ml: newLog.consumedVolumeMl,
          sugar_per_100ml: newLog.sugarPer100ml,
          total_sugar_grams: newLog.totalSugarGrams,
          drink_session: newLog.drinkSession,
          consumed_at: newLog.consumedAt,
          notes: newLog.notes
        }

        const { data, error } = await client
          .from('drink_logs')
          .insert(payload)
          .select()
          .single()

        if (error) {
          console.warn('[useDrinkLogs] Error inserting to Supabase:', error.message)
        } else if (data) {
          const idx = logsState.value.findIndex(l => l.id === newId)
          if (idx !== -1) {
            logsState.value[idx].id = data.id
          }
        }
      } catch (err) {
        console.warn('[useDrinkLogs] Exception adding log to Supabase:', err)
      }
    }

    return newLog
  }

  /**
   * Update an existing drink log
   */
  const updateDrinkLog = async (id: string, updates: UpdateDrinkLogInput): Promise<boolean> => {
    const idx = logsState.value.findIndex(l => l.id === id)
    if (idx === -1) return false

    const existing = logsState.value[idx]
    const updatedVolume = updates.consumedVolumeMl !== undefined ? updates.consumedVolumeMl : existing.consumedVolumeMl
    const updatedSugarPer100ml = updates.sugarPer100ml !== undefined ? updates.sugarPer100ml : existing.sugarPer100ml
    const updatedTotalSugar = calculateDrinkSugar(updatedSugarPer100ml, updatedVolume)

    logsState.value[idx] = {
      ...existing,
      ...updates,
      consumedVolumeMl: updatedVolume,
      sugarPer100ml: updatedSugarPer100ml,
      totalSugarGrams: updatedTotalSugar
    }

    if (isConfigured && client && authUser.value?.id) {
      try {
        const payload: Record<string, any> = {
          consumed_volume_ml: updatedVolume,
          sugar_per_100ml: updatedSugarPer100ml,
          total_sugar_grams: updatedTotalSugar,
          updated_at: new Date().toISOString()
        }
        if (updates.drinkName !== undefined) payload.drink_name = updates.drinkName
        if (updates.brand !== undefined) payload.brand = updates.brand
        if (updates.drinkSession !== undefined) payload.drink_session = updates.drinkSession
        if (updates.consumedAt !== undefined) payload.consumed_at = updates.consumedAt
        if (updates.notes !== undefined) payload.notes = updates.notes

        const { error } = await client.from('drink_logs').update(payload).eq('id', id)
        if (error) {
          console.warn('[useDrinkLogs] Error updating Supabase drink_logs:', error.message)
          return false
        }
      } catch (err) {
        console.warn('[useDrinkLogs] Exception updating log:', err)
        return false
      }
    }

    return true
  }

  /**
   * Delete an existing drink log
   */
  const deleteDrinkLog = async (id: string): Promise<boolean> => {
    logsState.value = logsState.value.filter(l => l.id !== id)

    if (isConfigured && client && authUser.value?.id) {
      try {
        const { error } = await client.from('drink_logs').delete().eq('id', id)
        if (error) {
          console.warn('[useDrinkLogs] Error deleting from Supabase:', error.message)
          return false
        }
      } catch (err) {
        console.warn('[useDrinkLogs] Exception deleting log:', err)
        return false
      }
    }

    return true
  }

  // Filter logs for today
  const todayLogs = computed(() => {
    return logsState.value.filter(log => isDateToday(log.consumedAt))
  })

  // Aggragation of today's sugar intake
  const todaySugarSummary = computed(() => {
    return sumKnownSugar(todayLogs.value)
  })

  return {
    logs: logsState,
    isLogsLoading,
    todayLogs,
    todaySugarSummary,
    loadUserLogs,
    addDrinkLog,
    updateDrinkLog,
    deleteDrinkLog
  }
}

