<template>
  <div class="max-w-4xl mx-auto flex flex-col gap-space-lg">
    <!-- Top Nav Back Link -->
    <div class="flex items-center justify-between">
      <button 
        type="button" 
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-outline hover:text-primary transition-colors"
        @click="$router.back()"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Kembali ke Halaman Sebelumnya</span>
      </button>

      <span class="text-xs text-outline font-mono">Barcode: {{ product?.barcode || 'N/A' }}</span>
    </div>

    <!-- Product Not Found State -->
    <div v-if="!product" class="bg-surface-container-lowest rounded-2xl p-space-xl text-center border border-surface-variant">
      <span class="material-symbols-outlined text-[48px] text-outline mb-2">local_cafe</span>
      <h2 class="text-lg font-bold text-on-surface">Minuman Tidak Ditemukan</h2>
      <p class="text-xs text-tertiary mt-1">Produk minuman yang diminta tidak terdaftar di katalog.</p>
      <NuxtLink to="/dashboard" class="mt-4 inline-block px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold">
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Main Drink Card -->
    <div v-else class="flex flex-col gap-space-lg">
      <!-- Hero Overview -->
      <div class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm border border-surface-variant flex flex-col md:flex-row gap-space-xl items-start">
        <div v-if="product.imageUrl" class="w-full md:w-56 h-56 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
          <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover" />
        </div>

        <div class="flex flex-col flex-1 w-full">
          <!-- Nama, Merek, Kategori & Status -->
          <div class="flex items-start justify-between gap-space-md">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-outline">{{ product.brand }}</span>
              <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-0.5">
                {{ product.name }}
              </h1>
              <p class="text-xs text-tertiary mt-1">
                Kategori: {{ product.category }} • Ukuran Kemasan: <strong>{{ packageVolume }} ml</strong>
              </p>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
              :class="getStatusBadgeClass(computedStatus)"
            >
              Status: {{ computedStatus }}
            </span>
          </div>

          <!-- Rincian Nilai Gizi Minuman Asli Kemasan -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-space-lg">
            <!-- Gula per 100ml -->
            <div class="p-3 rounded-xl bg-surface-container-low text-center">
              <span class="text-[11px] text-outline block">Gula per 100 ml</span>
              <span class="text-xl font-bold text-on-surface font-headline tabular-nums">
                {{ product.sugarPer100ml !== undefined ? `${product.sugarPer100ml}g` : 'N/A' }}
              </span>
            </div>

            <!-- Gula per Sajian -->
            <div class="p-3 rounded-xl bg-surface-container-low text-center">
              <span class="text-[11px] text-outline block">Gula per Sajian</span>
              <span class="text-xl font-bold text-primary font-headline tabular-nums">
                {{ product.sugarPerServing !== undefined ? `${product.sugarPerServing}g` : `${product.totalSugarsG}g` }}
              </span>
            </div>

            <!-- Ukuran Kemasan -->
            <div class="p-3 rounded-xl bg-surface-container-low text-center">
              <span class="text-[11px] text-outline block">Ukuran Kemasan</span>
              <span class="text-xl font-bold text-on-surface font-headline tabular-nums">{{ packageVolume }} ml</span>
            </div>

            <!-- Kalori -->
            <div class="p-3 rounded-xl bg-surface-container-low text-center">
              <span class="text-[11px] text-outline block">Kalori</span>
              <span class="text-xl font-bold text-on-surface font-headline tabular-nums">{{ product.calories }} kcal</span>
            </div>
          </div>

          <!-- Section Pengaturan Volume Diminum & Logging -->
          <div class="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-md border border-surface-variant/40">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <!-- Sesi Waktu Minum -->
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-outline">Waktu Minum:</label>
                <select 
                  v-model="selectedSession" 
                  class="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-semibold text-on-surface border border-surface-variant focus:outline-none"
                >
                  <option value="Pagi">Pagi</option>
                  <option value="Siang">Siang</option>
                  <option value="Sore">Sore</option>
                  <option value="Malam">Malam</option>
                </select>
              </div>

              <!-- Pilihan Cepat Porsi Volume -->
              <div class="flex items-center gap-1.5 text-xs">
                <span class="text-outline">Porsi:</span>
                <button 
                  type="button" 
                  class="px-2 py-1 rounded bg-surface-container-lowest border text-xs"
                  :class="consumedVolumeMl === Math.round(packageVolume / 2) ? 'border-primary text-primary font-bold' : 'border-surface-variant'"
                  @click="consumedVolumeMl = Math.round(packageVolume / 2)"
                >
                  ½ Kemasan ({{ Math.round(packageVolume / 2) }}ml)
                </button>
                <button 
                  type="button" 
                  class="px-2 py-1 rounded bg-surface-container-lowest border text-xs"
                  :class="consumedVolumeMl === packageVolume ? 'border-primary text-primary font-bold' : 'border-surface-variant'"
                  @click="consumedVolumeMl = packageVolume"
                >
                  Penuh ({{ packageVolume }}ml)
                </button>
              </div>
            </div>

            <!-- Slider / Pengatur Volume Diminum -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-on-surface">Volume yang Diminum:</span>
                <span class="font-mono font-bold text-primary text-sm">{{ consumedVolumeMl }} ml</span>
              </div>
              <input 
                v-model.number="consumedVolumeMl"
                type="range"
                min="50"
                :max="Math.max(600, packageVolume * 2)"
                step="25"
                class="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer"
              />
            </div>

            <!-- Kalkulasi Total Gula & Tombol Tambahkan ke Daily Tracker -->
            <div class="pt-2 border-t border-surface-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div class="flex items-baseline gap-2 self-start sm:self-auto">
                <span class="text-xs text-outline">Total Gula yang Diminum:</span>
                <span class="text-xl font-bold text-primary font-headline tabular-nums">{{ computedSugar }} g</span>
                <span class="text-[11px] text-tertiary">
                  ({{ Math.round((computedSugar / dailyGoal) * 100) }}% target harian)
                </span>
              </div>

              <button 
                type="button" 
                class="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                @click="logThisProduct"
              >
                <span class="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tambahkan ke Daily Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Composition & Deceptive Sugar Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <!-- Analisis Komposisi Gula -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col justify-between">
          <div>
            <span class="text-xs uppercase tracking-wider text-outline font-semibold">Analisis Dampak Minuman</span>
            <h3 class="font-headline-sm text-sm font-bold text-on-surface mt-1">Rasio Gula &amp; Kapasitas Batas Harian</h3>
            
            <div class="my-space-md">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-outline">Gula Tambahan: <strong>{{ product.addedSugarsG }}g</strong></span>
                <span class="text-outline">Gula Alami: <strong>{{ product.naturalSugarsG }}g</strong></span>
              </div>
              <div class="w-full h-3 rounded-full bg-surface-container flex overflow-hidden">
                <div class="h-full bg-primary-container" :style="{ width: `${addedRatio}%` }"></div>
                <div class="h-full bg-secondary-fixed" :style="{ width: `${100 - addedRatio}%` }"></div>
              </div>
            </div>

            <p class="text-xs text-tertiary">
              Meminum <strong>{{ consumedVolumeMl }} ml</strong> minuman ini menyerap <strong>{{ Math.round((computedSugar / dailyGoal) * 100) }}%</strong> dari batas kuota {{ dailyGoal }}g gula harian Anda.
            </p>
          </div>

          <div class="mt-space-md pt-space-sm border-t border-surface-variant flex items-center justify-between text-xs text-outline">
            <span>Estimasi Beban Glikemik: {{ product.glycemicIndexEstimate || 50 }} / 100</span>
            <span :class="computedStatus === 'Aman' ? 'text-primary font-bold' : 'text-error font-bold'">
              {{ computedStatus === 'Aman' ? 'Kadar Gula Terkendali' : 'Tinggi Kandungan Gula' }}
            </span>
          </div>
        </div>

        <!-- Pemeriksaan Pemanis Tersembunyi -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-outline font-semibold">Pemeriksaan Pemanis Industri</span>
            <span 
              class="material-symbols-outlined text-[20px]"
              :class="product.hiddenSugarsDetected.length > 0 ? 'text-error' : 'text-primary'"
            >
              {{ product.hiddenSugarsDetected.length > 0 ? 'warning' : 'verified' }}
            </span>
          </div>
          <h3 class="font-headline-sm text-sm font-bold text-on-surface mt-1">Verifikasi Bahan Pemanis Kemasan</h3>

          <div class="my-space-md flex-1">
            <div v-if="product.hiddenSugarsDetected.length > 0" class="flex flex-col gap-2">
              <div 
                v-for="alias in product.hiddenSugarsDetected" 
                :key="alias"
                class="p-2.5 rounded-lg bg-error-container text-on-error-container text-xs flex items-center justify-between"
              >
                <span class="font-semibold">{{ alias }}</span>
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-error/20 text-error">Terdeteksi</span>
              </div>
              <p class="text-[11px] text-tertiary mt-1">
                Bahan ini adalah pemanis cair pekat industri yang sering digunakan produsen minuman untuk menghasilkan rasa manis instan.
              </p>
            </div>
            <div v-else class="p-3 rounded-lg bg-secondary-container text-on-secondary-fixed text-xs flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <span>Formulasi bersih. Bebas dari sirup jagung tinggi fruktosa (HFCS), maltodekstrin, atau pemanis buatan pekat.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Deklarasi Komposisi Minuman -->
      <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col">
        <span class="text-xs uppercase tracking-wider text-outline font-semibold mb-2">Komposisi Bahan Minuman</span>
        <div class="flex flex-wrap gap-1.5">
          <span 
            v-for="(ing, idx) in product.ingredients" 
            :key="idx"
            class="px-2.5 py-1 rounded-md text-xs font-medium"
            :class="isFlagged(ing) ? 'bg-error-container text-error font-bold ring-1 ring-error/30' : 'bg-surface-container-low text-on-surface'"
          >
            {{ ing }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DrinkSession, DrinkStatus } from '~/types/sugar'

const route = useRoute()
const { products, dailyGoal, addLog, calculateDrinkSugar, getDrinkStatus } = useSugarTracker()

const productId = route.params.id as string
const product = computed(() => products.value.find(p => p.id === productId || p.barcode === productId) || products.value[0])

const selectedSession = ref<DrinkSession>('Siang')
const packageVolume = computed(() => product.value?.packageVolumeMl || 250)
const consumedVolumeMl = ref<number>(250)

// Inisialisasi volume minuman default sesuai kemasan produk
watch(product, (p) => {
  if (p) {
    consumedVolumeMl.value = p.packageVolumeMl || 250
  }
}, { immediate: true })

// Perhitungan gula total berdasarkan volume yang diminum
const computedSugar = computed(() => {
  if (!product.value) return 0
  const p = product.value
  if (p.sugarPer100ml !== undefined) {
    return calculateDrinkSugar({
      basis: 'per_100ml',
      sugarPer100ml: p.sugarPer100ml,
      volumeMl: consumedVolumeMl.value
    })
  } else {
    const pkgVol = packageVolume.value
    const ratio = consumedVolumeMl.value / pkgVol
    return Number(((p.sugarPerServing || p.totalSugarsG) * ratio).toFixed(1))
  }
})

const computedStatus = computed<DrinkStatus>(() => {
  return getDrinkStatus(computedSugar.value)
})

const addedRatio = computed(() => {
  if (!product.value || product.value.totalSugarsG === 0) return 0
  return Math.round((product.value.addedSugarsG / product.value.totalSugarsG) * 100)
})

const isFlagged = (ingredient: string) => {
  if (!product.value) return false
  const lower = ingredient.toLowerCase()
  return product.value.hiddenSugarsDetected.some(h => lower.includes(h.toLowerCase())) ||
    lower.includes('gula') || 
    lower.includes('sugar') || 
    lower.includes('sirup') ||
    lower.includes('syrup')
}

const logThisProduct = () => {
  if (!product.value) return
  const p = product.value
  const total = computedSugar.value
  const vol = consumedVolumeMl.value

  addLog({
    name: p.name,
    brand: p.brand,
    volumeMl: vol,
    packageVolumeMl: p.packageVolumeMl,
    sugarPer100ml: p.sugarPer100ml,
    sugarPerServing: p.sugarPerServing,
    sugarGrams: total,
    addedSugarGrams: total,
    naturalSugarGrams: 0,
    servingSize: `${vol} ml`,
    servingsConsumed: 1,
    calculationBasis: p.sugarPer100ml !== undefined ? 'per_100ml' : 'per_serving',
    drinkSession: selectedSession.value,
    mealSession: selectedSession.value,
    glycemicStatus: p.glycemicStatus,
    status: computedStatus.value,
    hasHiddenSugars: p.hiddenSugarsDetected.length > 0,
    hiddenSugarIngredients: p.hiddenSugarsDetected,
    barcode: p.barcode,
    loggedAt: new Date().toISOString(),
    icon: 'local_cafe'
  })

  alert(`Berhasil menambahkan "${p.name}" (${total}g gula / ${vol}ml) ke Daily Tracker!`)
  navigateTo('/dashboard')
}

const getStatusBadgeClass = (status: DrinkStatus | string) => {
  switch (status) {
    case 'Aman':
    case 'Safe':
    case 'Zero Sugar':
      return 'bg-secondary-container text-on-secondary-fixed'
    case 'Waspada':
    case 'Moderate':
      return 'bg-amber-100 text-amber-900'
    case 'Melebihi Target':
    case 'High':
      return 'bg-error-container text-on-error-container'
    default:
      return 'bg-surface-container text-on-surface'
  }
}
</script>
