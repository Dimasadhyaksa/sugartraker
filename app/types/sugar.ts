export * from './database'
export * from './drink'
export * from './profile'
export * from './drink-log'

// UI and Dashboard Aggregate Types
export interface DayTelemetry {
  dayName: string // 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'
  dateString: string // 'YYYY-MM-DD'
  sugarG: number // Total gula yang diketahui pada hari ini
  targetG: number
  isToday: boolean
  hasUnknownDrinks?: boolean
}

export interface DashboardMetrics {
  totalSugarToday: number
  dailyTargetG: number
  percentageOfTarget: number
  remainingG: number
  logCountToday: number
  unknownCountToday: number
  status: 'Aman' | 'Waspada' | 'Melebihi Target'
}

export interface HiddenSugarAlias {
  alias: string
  chemicalType: string
  glycemicImpact: 'High' | 'Moderate' | 'Very High'
  description: string
}

// Backward compatibility aliases for existing components
export type ConsumptionLogItem = {
  id: string
  userId?: string
  name: string
  brand?: string
  volumeMl: number
  packageVolumeMl?: number
  sugarPer100ml?: number | null
  sugarPerServing?: number | null
  servingSize?: string
  servingsConsumed?: number
  calculationBasis?: 'per_100ml' | 'per_serving'
  sugarGrams: number
  addedSugarGrams: number
  naturalSugarGrams: number
  drinkSession: import('./drink-log').DrinkSession
  mealSession?: string
  glycemicStatus?: string
  status?: string
  hasHiddenSugars: boolean
  hiddenSugarIngredients: string[]
  barcode?: string
  loggedAt: string
  notes?: string
  icon?: string
  isSugarUnknown?: boolean
}

export type Product = {
  id: string
  barcode: string
  name: string
  brand: string
  category: string
  packageVolumeMl?: number
  servingSizeMl?: number
  servingSize: string
  sugarPer100ml?: number | null
  sugarPerServing?: number | null
  totalSugarsG: number
  addedSugarsG: number
  naturalSugarsG: number
  totalCarbsG: number
  calories: number
  glycemicIndexEstimate?: number
  glycemicStatus?: string
  ingredients: string[]
  hiddenSugarsDetected: string[]
  isOrganic?: boolean
  imageUrl?: string
  isSugarUnknown?: boolean
}
