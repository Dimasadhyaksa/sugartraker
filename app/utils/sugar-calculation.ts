/**
 * Sugar Calculation Utility
 * 
 * Core Formula:
 * totalSugarGrams = (sugarPer100ml * consumedVolumeMl) / 100
 * 
 * Rules:
 * - Volume must be valid and positive (> 0).
 * - Sugar content per 100ml must be non-negative (>= 0).
 * - If sugarPer100ml is unknown (null, undefined, or NaN), totalSugarGrams is NULL.
 *   DO NOT assume 0 grams when sugar content is unknown!
 * - Grams and ml are used consistently throughout.
 * - Round final result to 1 decimal place for display/storage consistency.
 */

export interface SugarCalculationResult {
  isKnown: boolean
  totalSugarGrams: number | null
  sugarPer100ml: number | null
  consumedVolumeMl: number
  status: 'Aman' | 'Waspada' | 'Melebihi Batas' | 'Tidak Diketahui'
  formattedSugar: string
}

/**
 * Calculates total sugar consumed from volume (ml) and sugar per 100ml.
 * Returns null if sugarPer100ml is unknown or invalid.
 */
export function calculateDrinkSugar(
  sugarPer100ml: number | null | undefined,
  consumedVolumeMl: number
): number | null {
  // Volume must be positive
  if (typeof consumedVolumeMl !== 'number' || isNaN(consumedVolumeMl) || consumedVolumeMl <= 0) {
    throw new Error(`Volume minuman harus berupa angka positif (> 0 ml). Diberikan: ${consumedVolumeMl}`)
  }

  // If sugar content is unknown, return null
  if (sugarPer100ml === null || sugarPer100ml === undefined || isNaN(sugarPer100ml)) {
    return null
  }

  // Sugar content cannot be negative
  if (sugarPer100ml < 0) {
    throw new Error(`Kandungan gula tidak boleh negatif. Diberikan: ${sugarPer100ml}`)
  }

  // Core formula: (sugarPer100ml * consumedVolumeMl) / 100
  const total = (sugarPer100ml * consumedVolumeMl) / 100

  // Round to 1 decimal place
  return Math.round(total * 10) / 10
}

/**
 * Categorizes single drink sugar intake into status bands:
 * - Aman: <= 12g per minuman
 * - Waspada: > 12g s/d <= 25g
 * - Melebihi Batas: > 25g
 * - Tidak Diketahui: jika total gula tidak diketahui
 */
export function getDrinkSugarStatus(totalSugarGrams: number | null): 'Aman' | 'Waspada' | 'Melebihi Batas' | 'Tidak Diketahui' {
  if (totalSugarGrams === null || totalSugarGrams === undefined) {
    return 'Tidak Diketahui'
  }
  if (totalSugarGrams <= 12) return 'Aman'
  if (totalSugarGrams <= 25) return 'Waspada'
  return 'Melebihi Batas'
}

/**
 * Detailed evaluation function returning structured calculation metadata.
 */
export function evaluateDrinkSugar(
  sugarPer100ml: number | null | undefined,
  consumedVolumeMl: number
): SugarCalculationResult {
  const total = calculateDrinkSugar(sugarPer100ml, consumedVolumeMl)
  const isKnown = total !== null
  const status = getDrinkSugarStatus(total)

  return {
    isKnown,
    totalSugarGrams: total,
    sugarPer100ml: isKnown ? (sugarPer100ml as number) : null,
    consumedVolumeMl,
    status,
    formattedSugar: isKnown ? `${total} g` : 'Tidak Diketahui'
  }
}

/**
 * Calculates sum of known sugars from a list of drink items.
 * Ignores unknown items without treating them as 0 in a misleading way.
 */
export function sumKnownSugar(items: Array<{ totalSugarGrams: number | null }>): {
  totalSugarGrams: number
  knownCount: number
  unknownCount: number
} {
  let sum = 0
  let knownCount = 0
  let unknownCount = 0

  for (const item of items) {
    if (item.totalSugarGrams !== null && item.totalSugarGrams !== undefined && !isNaN(item.totalSugarGrams)) {
      sum += item.totalSugarGrams
      knownCount++
    } else {
      unknownCount++
    }
  }

  return {
    totalSugarGrams: Math.round(sum * 10) / 10,
    knownCount,
    unknownCount
  }
}

