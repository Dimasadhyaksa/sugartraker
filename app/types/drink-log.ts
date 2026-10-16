/**
 * Drink Log Types
 * Represents individual beverage consumption logs recorded by a user
 */

export type DrinkSession = 'Pagi' | 'Siang' | 'Sore' | 'Malam'
export type DrinkSugarStatus = 'Aman' | 'Waspada' | 'Melebihi Batas' | 'Tidak Diketahui'

export interface DrinkLogItem {
  id: string
  userId: string
  productId?: string | null
  drinkName: string
  brand?: string | null
  consumedVolumeMl: number // ml yang benar-benar diminum
  sugarPer100ml: number | null // null jika tidak diketahui (unknown)
  totalSugarGrams: number | null // null jika gula tidak diketahui (unknown), dihitung via formula jika diketahui
  drinkSession: DrinkSession
  consumedAt: string // ISO timestamptz
  notes?: string | null
  icon?: string
}

export interface CreateDrinkLogInput {
  productId?: string | null
  drinkName: string
  brand?: string | null
  consumedVolumeMl: number
  sugarPer100ml: number | null // null = unknown
  drinkSession?: DrinkSession
  consumedAt?: string
  notes?: string | null
  icon?: string
}

export interface UpdateDrinkLogInput {
  drinkName?: string
  brand?: string | null
  consumedVolumeMl?: number
  sugarPer100ml?: number | null
  drinkSession?: DrinkSession
  consumedAt?: string
  notes?: string | null
}

