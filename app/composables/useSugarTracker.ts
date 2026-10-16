import { ref, computed, watch } from 'vue'
import type { 
  UserProfile, 
  ConsumptionLogItem, 
  Product, 
  DayTelemetry,
  HiddenSugarAlias,
  DrinkSession,
  DrinkStatus
} from '~/types/sugar'
import { useSupabase } from './useSupabase'

// Profil pengguna mock default
const initialUser: UserProfile = {
  id: 'usr-sarah-jenkins',
  email: 'sarah.jenkins@example.com',
  fullName: 'Sarah Jenkins',
  dailyGoalG: 50,
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  metabolicPhase: 'Aman',
  cgmSyncEnabled: false,
  createdAt: '2026-01-15'
}

// Log konsumsi minuman harian mock (khusus minuman)
const initialLogs: ConsumptionLogItem[] = [
  {
    id: 'log-1',
    name: 'Ito En Green Tea (Tawar)',
    brand: 'Ito En',
    volumeMl: 500,
    packageVolumeMl: 500,
    sugarPer100ml: 0,
    sugarPerServing: 0,
    servingSize: '500 ml (1 botol)',
    servingsConsumed: 1,
    calculationBasis: 'per_100ml',
    sugarGrams: 0,
    addedSugarGrams: 0,
    naturalSugarGrams: 0,
    drinkSession: 'Pagi',
    mealSession: 'Pagi',
    glycemicStatus: 'Zero Sugar',
    status: 'Aman',
    hasHiddenSugars: false,
    hiddenSugarIngredients: [],
    barcode: '851492002011',
    loggedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notes: 'Tanpa gula tambahan',
    icon: 'water_drop'
  },
  {
    id: 'log-2',
    name: 'Teh Botol Sosro Kotak',
    brand: 'Sosro',
    volumeMl: 250,
    packageVolumeMl: 250,
    sugarPer100ml: 6,
    sugarPerServing: 15,
    servingSize: '250 ml (1 kotak)',
    servingsConsumed: 1,
    calculationBasis: 'per_100ml',
    sugarGrams: 15,
    addedSugarGrams: 15,
    naturalSugarGrams: 0,
    drinkSession: 'Siang',
    mealSession: 'Siang',
    glycemicStatus: 'Moderate',
    status: 'Aman',
    hasHiddenSugars: false,
    hiddenSugarIngredients: [],
    barcode: '8992741911019',
    loggedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notes: 'Teh melati manis kemasan',
    icon: 'local_cafe'
  },
  {
    id: 'log-3',
    name: 'Ultra Milk Cokelat',
    brand: 'Ultra Jaya',
    volumeMl: 200,
    packageVolumeMl: 200,
    sugarPer100ml: 7,
    sugarPerServing: 14,
    servingSize: '200 ml (1 kotak)',
    servingsConsumed: 1,
    calculationBasis: 'per_100ml',
    sugarGrams: 14,
    addedSugarGrams: 9,
    naturalSugarGrams: 5,
    drinkSession: 'Sore',
    mealSession: 'Sore',
    glycemicStatus: 'Moderate',
    status: 'Aman',
    hasHiddenSugars: false,
    hiddenSugarIngredients: [],
    barcode: '8992753111018',
    loggedAt: new Date().toISOString(),
    notes: 'Susu UHT cokelat siap minum',
    icon: 'emoji_food_beverage'
  }
]

// Katalog produk minuman terverifikasi
const sampleProducts: Product[] = [
  {
    id: 'prod-teh-botol',
    barcode: '8992741911019',
    name: 'Teh Botol Sosro Kotak',
    brand: 'Sosro',
    category: 'Teh Kemasan & Teh Manis',
    packageVolumeMl: 250,
    servingSizeMl: 250,
    servingSize: '250 ml (1 kotak)',
    sugarPer100ml: 6.0,
    sugarPerServing: 15.0,
    totalSugarsG: 15,
    addedSugarsG: 15,
    naturalSugarsG: 0,
    totalCarbsG: 15,
    calories: 60,
    glycemicIndexEstimate: 65,
    glycemicStatus: 'Moderate',
    ingredients: ['Air', 'Gula Tebu', 'Ekstrak Teh Melati'],
    hiddenSugarsDetected: [],
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-ito-en',
    barcode: '851492002011',
    name: 'Ito En Oi Ocha Green Tea',
    brand: 'Ito En',
    category: 'Teh Kemasan & Teh Manis',
    packageVolumeMl: 500,
    servingSizeMl: 500,
    servingSize: '500 ml (1 botol)',
    sugarPer100ml: 0,
    sugarPerServing: 0,
    totalSugarsG: 0,
    addedSugarsG: 0,
    naturalSugarsG: 0,
    totalCarbsG: 0,
    calories: 0,
    glycemicIndexEstimate: 0,
    glycemicStatus: 'Zero Sugar',
    ingredients: ['Air Murni', 'Seduhan Teh Hijau', 'Vitamin C'],
    hiddenSugarsDetected: [],
    imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-kopi-kenangan',
    barcode: '8997232230018',
    name: 'Kopi Kenangan Mantan RTD',
    brand: 'Kopi Kenangan',
    category: 'Kopi Susu & Kopi Kemasan',
    packageVolumeMl: 220,
    servingSizeMl: 220,
    servingSize: '220 ml (1 botol)',
    sugarPer100ml: 7.3,
    sugarPerServing: 16.0,
    totalSugarsG: 16,
    addedSugarsG: 12,
    naturalSugarsG: 4,
    totalCarbsG: 20,
    calories: 140,
    glycemicIndexEstimate: 60,
    glycemicStatus: 'Moderate',
    ingredients: ['Air', 'Susu Segar', 'Gula Aren', 'Ekstrak Kopi', 'Gula Tebu'],
    hiddenSugarsDetected: ['Gula Aren'],
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-coca-cola',
    barcode: '049000028904',
    name: 'Coca-Cola Original',
    brand: 'Coca-Cola',
    category: 'Minuman Bersoda',
    packageVolumeMl: 330,
    servingSizeMl: 330,
    servingSize: '330 ml (1 kaleng)',
    sugarPer100ml: 10.6,
    sugarPerServing: 35.0,
    totalSugarsG: 35,
    addedSugarsG: 35,
    naturalSugarsG: 0,
    totalCarbsG: 35,
    calories: 140,
    glycemicIndexEstimate: 85,
    glycemicStatus: 'High',
    ingredients: ['Air Berkarbonasi', 'High Fructose Corn Syrup (HFCS)', 'Pewarna Karamel', 'Asam Fosfat', 'Perisa Alami', 'Kafein'],
    hiddenSugarsDetected: ['High-fructose corn syrup'],
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-pocari-sweat',
    barcode: '8993077110156',
    name: 'Pocari Sweat Ion Supply',
    brand: 'Otsuka',
    category: 'Minuman Energi & Olahraga',
    packageVolumeMl: 350,
    servingSizeMl: 350,
    servingSize: '350 ml (1 botol)',
    sugarPer100ml: 6.0,
    sugarPerServing: 21.0,
    totalSugarsG: 21,
    addedSugarsG: 21,
    naturalSugarsG: 0,
    totalCarbsG: 21,
    calories: 90,
    glycemicIndexEstimate: 70,
    glycemicStatus: 'Moderate',
    ingredients: ['Air', 'Gula', 'Sirup Jagung Tinggi Fruktosa', 'Jus Buah Grapefruit', 'Natrium Klorida', 'Kalium Klorida'],
    hiddenSugarsDetected: ['High-fructose corn syrup'],
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-ultra-milk',
    barcode: '8992753111018',
    name: 'Ultra Milk Cokelat UHT',
    brand: 'Ultra Jaya',
    category: 'Susu & Minuman Berbasis Susu',
    packageVolumeMl: 200,
    servingSizeMl: 200,
    servingSize: '200 ml (1 kotak)',
    sugarPer100ml: 7.0,
    sugarPerServing: 14.0,
    totalSugarsG: 14,
    addedSugarsG: 9,
    naturalSugarsG: 5,
    totalCarbsG: 18,
    calories: 140,
    glycemicIndexEstimate: 45,
    glycemicStatus: 'Moderate',
    ingredients: ['Susu Sapi Segar', 'Sukrosa', 'Bubuk Cokelat', 'Penstabil Nabati', 'Garam'],
    hiddenSugarsDetected: ['Sukrosa'],
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-buavita-mango',
    barcode: '8999999014125',
    name: 'Buavita Mango Juice',
    brand: 'Unilever / Buavita',
    category: 'Jus & Minuman Buah',
    packageVolumeMl: 245,
    servingSizeMl: 245,
    servingSize: '245 ml (1 kotak)',
    sugarPer100ml: 9.0,
    sugarPerServing: 22.0,
    totalSugarsG: 22,
    addedSugarsG: 14,
    naturalSugarsG: 8,
    totalCarbsG: 25,
    calories: 110,
    glycemicIndexEstimate: 55,
    glycemicStatus: 'Moderate',
    ingredients: ['Air', 'Konsentrat Pure Mangga (15%)', 'Gula Pasir', 'Sirup Glukosa-Fruktosa', 'Vitamin C'],
    hiddenSugarsDetected: ['Sirup Glukosa-Fruktosa'],
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-oatly-barista',
    barcode: '028400064088',
    name: 'Oatly Barista Edition',
    brand: 'Oatly',
    category: 'Susu & Minuman Berbasis Susu',
    packageVolumeMl: 250,
    servingSizeMl: 250,
    servingSize: '250 ml (1 porsi)',
    sugarPer100ml: 2.8,
    sugarPerServing: 7.0,
    totalSugarsG: 7,
    addedSugarsG: 7,
    naturalSugarsG: 0,
    totalCarbsG: 16,
    calories: 140,
    glycemicIndexEstimate: 60,
    glycemicStatus: 'Safe',
    ingredients: ['Oat Base (Air, Oat)', 'Minyak Rapeseed', 'Dipotassium Phosphate', 'Garam Laut'],
    hiddenSugarsDetected: ['Enzymatic Oat Hydrolysis (Maltose)'],
    imageUrl: 'https://images.unsplash.com/photo-1568651318391-45f8e5309d94?auto=format&fit=crop&w=400&q=80'
  }
]

// Riwayat konsumsi gula minuman 7 hari
const initial7Days: DayTelemetry[] = [
  { dayName: 'Sen', dateString: '2026-10-07', sugarG: 32, targetG: 50, isToday: false },
  { dayName: 'Sel', dateString: '2026-10-08', sugarG: 28, targetG: 50, isToday: false },
  { dayName: 'Rab', dateString: '2026-10-09', sugarG: 44, targetG: 50, isToday: false },
  { dayName: 'Kam', dateString: '2026-10-10', sugarG: 25, targetG: 50, isToday: false },
  { dayName: 'Jum', dateString: '2026-10-11', sugarG: 38, targetG: 50, isToday: false },
  { dayName: 'Sab', dateString: '2026-10-12', sugarG: 20, targetG: 50, isToday: false },
  { dayName: 'Min', dateString: '2026-10-13', sugarG: 29, targetG: 50, isToday: true }
]

// Database sinonim gula tersembunyi
export const hiddenSugarAliases: HiddenSugarAlias[] = [
  { alias: 'HFCS', chemicalType: 'High-fructose corn syrup', glycemicImpact: 'Very High', description: 'Sirup jagung tinggi fruktosa cepat diserap hati dan memicu lonjakan glukosa tajam.' },
  { alias: 'Maltodextrin', chemicalType: 'Polisakarida GI 110', glycemicImpact: 'Very High', description: 'Memiliki indeks glikemik lebih tinggi dari glukosa murni meja.' },
  { alias: 'Sukrosa', chemicalType: 'Gula pasir kristal', glycemicImpact: 'High', description: 'Disakarida 50% glukosa dan 50% fruktosa murni.' },
  { alias: 'Dextrose', chemicalType: 'D-Glucose monomer', glycemicImpact: 'Very High', description: 'Memicu lonjakan insulin pasca-minum secara instan.' },
  { alias: 'Gula Aren', chemicalType: 'Palm sugar concentrate', glycemicImpact: 'Moderate', description: 'Sering dipasarkan alami tetapi tetap memiliki kandungan sukrosa tinggi.' },
  { alias: 'Sirup Glukosa-Fruktosa', chemicalType: 'Invert liquid sugar', glycemicImpact: 'High', description: 'Pemanis cair industri yang sangat lazim di minuman kemasan.' },
  { alias: 'Maltose', chemicalType: 'Disakarida maltosa', glycemicImpact: 'Very High', description: 'GI rating 105; meningkatkan kadar gula darah dengan cepat.' },
  { alias: 'Agave Nectar', chemicalType: 'Sirup fruktosa pekat', glycemicImpact: 'High', description: 'Mengandung hingga 85% fruktosa cair pekat.' }
]

// State global reaktif
const userState = ref<UserProfile>(JSON.parse(JSON.stringify(initialUser)))
const logsState = ref<ConsumptionLogItem[]>(JSON.parse(JSON.stringify(initialLogs)))
const productsState = ref<Product[]>(JSON.parse(JSON.stringify(sampleProducts)))
const telemetryState = ref<DayTelemetry[]>(JSON.parse(JSON.stringify(initial7Days)))
const isLoading = ref<boolean>(false)
const isSyncing = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
let hasInitializedClient = false

export const useSugarTracker = () => {
  const supabase = useSupabase()
  const { isConfigured, supabaseUrl, authUser, authSession } = supabase

  const refreshFromSupabase = async () => {
    if (!isConfigured) return
    isSyncing.value = true
    try {
      // 1. Fetch live products from Supabase
      const dbProducts = await supabase.fetchProducts()
      if (dbProducts && dbProducts.length > 0) {
        productsState.value = dbProducts
      }

      // 2. If user is authenticated, fetch their personal profile and drink logs
      if (authUser.value?.id) {
        const dbProfile = await supabase.fetchProfile(authUser.value.id)
        if (dbProfile) {
          userState.value = dbProfile
        }
        const dbLogs = await supabase.fetchDrinkLogs(authUser.value.id)
        if (dbLogs) {
          logsState.value = dbLogs
        }
      }
    } catch (err: any) {
      console.warn('[SugarTracker] Supabase sync error:', err)
    } finally {
      isSyncing.value = false
    }
  }

  // Inisialisasi sinkronisasi client otomatis
  if (import.meta.client && !hasInitializedClient) {
    hasInitializedClient = true
    setTimeout(() => {
      refreshFromSupabase()
    }, 100)

    watch(authUser, async (newUser, oldUser) => {
      if (newUser?.id && newUser.id !== oldUser?.id) {
        await refreshFromSupabase()
      } else if (!newUser && oldUser) {
        // Pengguna keluar, kembalikan ke profil dan log default
        userState.value = JSON.parse(JSON.stringify(initialUser))
        logsState.value = JSON.parse(JSON.stringify(initialLogs))
      }
    })
  }

  // 1. Total gula dari minuman yang dikonsumsi hari ini
  const totalSugarToday = computed(() => {
    return Number(logsState.value.reduce((sum, item) => sum + (Number(item.sugarGrams) || 0), 0).toFixed(1))
  })

  // Total gula tambahan (added sugar)
  const addedSugarToday = computed(() => {
    return Number(logsState.value.reduce((sum, item) => sum + (Number(item.addedSugarGrams) || 0), 0).toFixed(1))
  })

  // Total gula alami (intrinsic sugar dari susu/buah)
  const naturalSugarToday = computed(() => {
    return Number(Math.max(0, totalSugarToday.value - addedSugarToday.value).toFixed(1))
  })

  // 2. Target gula harian
  const dailyGoal = computed(() => userState.value.dailyGoalG || 50)

  // 3. Sisa target gula (headroom)
  const remainingSugarToday = computed(() => {
    return Number(Math.max(0, dailyGoal.value - totalSugarToday.value).toFixed(1))
  })

  // 4. Progress konsumsi gula (%)
  const percentageUsed = computed(() => {
    if (!dailyGoal.value) return 0
    return Math.round((totalSugarToday.value / dailyGoal.value) * 100)
  })

  // 5. Status: 'Aman' | 'Waspada' | 'Melebihi Target'
  const dailyDrinkStatus = computed<DrinkStatus>(() => {
    const ratio = totalSugarToday.value / dailyGoal.value
    if (ratio > 1.0) return 'Melebihi Target'
    if (ratio >= 0.8) return 'Waspada'
    return 'Aman'
  })

  // Kompatibilitas untuk kode terdahulu
  const metabolicPhase = computed(() => dailyDrinkStatus.value)

  // Jumlah minuman dengan gula tersembunyi yang diminum hari ini
  const hiddenSugarCount = computed(() => {
    return logsState.value.filter(item => item.hasHiddenSugars).length
  })

  // Sinkronisasi hari ini pada grafik telemetri 7 hari
  const todayTelemetry = computed(() => {
    const todayIndex = telemetryState.value.findIndex(d => d.isToday)
    if (todayIndex !== -1) {
      telemetryState.value[todayIndex].sugarG = totalSugarToday.value
    }
    return telemetryState.value
  })

  // Rata-rata konsumsi gula harian 7 hari
  const weeklyAverage = computed(() => {
    const activeDays = telemetryState.value.filter(d => d.sugarG > 0)
    if (activeDays.length === 0) return 0
    const sum = activeDays.reduce((acc, d) => acc + d.sugarG, 0)
    return Number((sum / activeDays.length).toFixed(1))
  })

  // Jumlah hari di bawah vs di atas target selama 7 hari
  const daysUnderTarget = computed(() => {
    return telemetryState.value.filter(d => d.sugarG <= dailyGoal.value).length
  })

  const daysOverTarget = computed(() => {
    return telemetryState.value.filter(d => d.sugarG > dailyGoal.value).length
  })

  // ATURAN PERHITUNGAN GULA MINUMAN
  // Jika per 100 ml: Total gula = (Gula per 100 ml * Volume diminum) / 100
  // Jika per sajian: Total gula = Gula per sajian * Jumlah sajian yang diminum
  const calculateDrinkSugar = (options: {
    basis: 'per_100ml' | 'per_serving'
    sugarPer100ml?: number
    sugarPerServing?: number
    volumeMl?: number
    servingCount?: number
  }): number => {
    if (options.basis === 'per_100ml') {
      const per100 = Number(options.sugarPer100ml) || 0
      const vol = Number(options.volumeMl) || 0
      return Number(((per100 * vol) / 100).toFixed(1))
    } else {
      const perServing = Number(options.sugarPerServing) || 0
      const count = Number(options.servingCount) || 1
      return Number((perServing * count).toFixed(1))
    }
  }

  // Menentukan status item minuman individual
  const getDrinkStatus = (sugarG: number): DrinkStatus => {
    if (sugarG <= 12) return 'Aman'
    if (sugarG <= 25) return 'Waspada'
    return 'Melebihi Target'
  }

  // Kompatibilitas lama
  const getGlycemicStatus = (sugarG: number): 'Zero Sugar' | 'Safe' | 'Moderate' | 'High' => {
    if (sugarG === 0) return 'Zero Sugar'
    if (sugarG <= 8) return 'Safe'
    if (sugarG <= 20) return 'Moderate'
    return 'High'
  }

  // Deteksi bahan pemanis tersembunyi dari teks komposisi
  const detectHiddenSugars = (textOrIngredients: string | string[]): string[] => {
    const text = Array.isArray(textOrIngredients) ? textOrIngredients.join(' ') : textOrIngredients
    const lower = text.toLowerCase()
    const detected: string[] = []

    hiddenSugarAliases.forEach(alias => {
      if (lower.includes(alias.alias.toLowerCase()) || lower.includes(alias.chemicalType.toLowerCase())) {
        detected.push(alias.alias)
      }
    })

    if (lower.includes('high fructose corn syrup') || lower.includes('hfcs') || lower.includes('sirup jagung')) {
      if (!detected.includes('HFCS')) detected.push('HFCS')
    }
    if (lower.includes('sukrosa') || lower.includes('sucrose')) {
      if (!detected.includes('Sukrosa')) detected.push('Sukrosa')
    }
    if (lower.includes('gula aren') || lower.includes('palm sugar')) {
      if (!detected.includes('Gula Aren')) detected.push('Gula Aren')
    }

    return Array.from(new Set(detected))
  }

  // CRUD Log Minuman dengan sinkronisasi Supabase
  const addLog = async (item: Omit<ConsumptionLogItem, 'id'>) => {
    const newId = `log-${Date.now()}`
    const sugarVal = Number(item.sugarGrams) || 0
    const addedVal = item.addedSugarGrams !== undefined ? Number(item.addedSugarGrams) : sugarVal
    const naturalVal = item.naturalSugarGrams !== undefined ? Number(item.naturalSugarGrams) : Math.max(0, sugarVal - addedVal)
    const vol = Number(item.volumeMl) || 250
    const drinkSession: DrinkSession = item.drinkSession || (item.mealSession as DrinkSession) || 'Siang'

    const hiddenSugars = item.hiddenSugarIngredients && item.hiddenSugarIngredients.length > 0
      ? item.hiddenSugarIngredients
      : detectHiddenSugars(item.name + ' ' + (item.notes || ''))

    const newLog: ConsumptionLogItem = {
      ...item,
      id: newId,
      volumeMl: vol,
      sugarGrams: sugarVal,
      addedSugarGrams: addedVal,
      naturalSugarGrams: naturalVal,
      drinkSession,
      mealSession: drinkSession,
      status: item.status || getDrinkStatus(sugarVal),
      glycemicStatus: item.glycemicStatus || getGlycemicStatus(sugarVal),
      hasHiddenSugars: hiddenSugars.length > 0,
      hiddenSugarIngredients: hiddenSugars,
      loggedAt: item.loggedAt || new Date().toISOString(),
      icon: item.icon || 'local_cafe'
    }

    // Optimistic local update
    logsState.value.unshift(newLog)

    // Jika pengguna terautentikasi ke Supabase, simpan ke tabel drink_logs
    if (authUser.value?.id) {
      try {
        const saved = await supabase.insertDrinkLog(item, authUser.value.id)
        if (saved) {
          const idx = logsState.value.findIndex(l => l.id === newId)
          if (idx !== -1) {
            logsState.value[idx] = saved
          }
        }
      } catch (e) {
        console.warn('[SugarTracker] Failed to insert log to Supabase:', e)
      }
    }

    return newLog
  }

  const updateLog = async (id: string, updates: Partial<ConsumptionLogItem>) => {
    const idx = logsState.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      const existing = logsState.value[idx]
      const updatedSugar = updates.sugarGrams !== undefined ? Number(updates.sugarGrams) : existing.sugarGrams
      const updatedVolume = updates.volumeMl !== undefined ? Number(updates.volumeMl) : existing.volumeMl
      const updatedSession = updates.drinkSession || (updates.mealSession as DrinkSession) || existing.drinkSession

      logsState.value[idx] = {
        ...existing,
        ...updates,
        volumeMl: updatedVolume,
        sugarGrams: updatedSugar,
        drinkSession: updatedSession,
        mealSession: updatedSession,
        status: updates.status || getDrinkStatus(updatedSugar),
        glycemicStatus: updates.glycemicStatus || getGlycemicStatus(updatedSugar)
      }

      if (authUser.value?.id) {
        try {
          await supabase.updateDrinkLog(id, updates)
        } catch (e) {
          console.warn('[SugarTracker] Failed to update log in Supabase:', e)
        }
      }
    }
  }

  const deleteLog = async (id: string) => {
    logsState.value = logsState.value.filter(l => l.id !== id)
    if (authUser.value?.id) {
      try {
        await supabase.deleteDrinkLog(id)
      } catch (e) {
        console.warn('[SugarTracker] Failed to delete log in Supabase:', e)
      }
    }
  }

  const findProductByBarcode = (barcode: string): Product | undefined => {
    const clean = barcode.trim()
    return productsState.value.find(p => p.barcode === clean)
  }

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return productsState.value
    const q = query.toLowerCase()
    return productsState.value.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.barcode.includes(q)
    )
  }

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    userState.value = {
      ...userState.value,
      ...profile
    }
    if (authUser.value?.id) {
      try {
        await supabase.upsertProfile({
          id: authUser.value.id,
          ...profile
        })
      } catch (e) {
        console.warn('[SugarTracker] Failed to upsert profile in Supabase:', e)
      }
    }
  }

  return {
    // State
    user: userState,
    logs: logsState,
    products: productsState,
    telemetry: todayTelemetry,
    hiddenSugarAliases,
    isLoading,
    isSyncing,
    errorMessage,
    successMessage,
    isConfigured,
    supabaseUrl,
    authUser,
    authSession,

    // Computed Metrik Minuman
    totalSugarToday,
    addedSugarToday,
    naturalSugarToday,
    dailyGoal,
    remainingSugarToday,
    percentageUsed,
    dailyDrinkStatus,
    metabolicPhase,
    hiddenSugarCount,
    weeklyAverage,
    daysUnderTarget,
    daysOverTarget,

    // Metrik Kalkulasi & CRUD
    calculateDrinkSugar,
    getDrinkStatus,
    getGlycemicStatus,
    detectHiddenSugars,
    addLog,
    updateLog,
    deleteLog,
    findProductByBarcode,
    searchProducts,
    updateUserProfile,
    refreshFromSupabase
  }
}
