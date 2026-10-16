<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto gap-space-lg">
    <!-- Header with Date Navigator -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
      <div class="flex flex-col">
        <div class="flex items-center gap-space-xs mb-1">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
            Pelacakan Minuman Harian
          </span>
        </div>
        <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">Daily Drink Tracker</h1>
        <p class="font-body-md text-xs sm:text-sm text-tertiary">Buku catatan konsumsi minuman dan pemantauan akumulasi gula berdasarkan waktu minum.</p>
      </div>

      <!-- Date Switcher Pill -->
      <div class="flex items-center bg-surface-container-lowest border border-surface-variant rounded-xl p-1 shadow-sm shrink-0">
        <button 
          type="button" 
          class="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Hari sebelumnya"
          @click="shiftDay(-1)"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <div class="px-3 flex items-center gap-1.5 text-xs font-semibold text-on-surface">
          <span class="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
          <span>{{ currentDisplayDate }}</span>
        </div>
        <button 
          type="button" 
          class="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Hari berikutnya"
          @click="shiftDay(1)"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Daily Status Summary Strip -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
      <!-- Total Gula -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Total Gula Hari Ini</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold text-on-surface font-headline tabular-nums">{{ totalSugarToday }}</span>
          <span class="text-xs text-outline">/ {{ dailyGoal }}g</span>
        </div>
        <div class="w-full h-1.5 rounded-full bg-surface-container mt-2 overflow-hidden">
          <div 
            class="h-full transition-all duration-500"
            :class="percentageUsed > 100 ? 'bg-error' : 'bg-primary-container'"
            :style="{ width: `${Math.min(100, percentageUsed)}%` }"
          ></div>
        </div>
      </div>

      <!-- Sisa Target Gula -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Sisa Batas Gula</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold font-headline tabular-nums" :class="remainingSugarToday === 0 ? 'text-error' : 'text-primary'">
            {{ remainingSugarToday }}
          </span>
          <span class="text-xs text-outline">gram tersisa</span>
        </div>
        <span class="text-[11px] text-tertiary mt-2 block">{{ percentageUsed }}% batas harian terpakai</span>
      </div>

      <!-- Total Volume Minuman -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Total Cairan Diminum</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold text-on-surface font-headline tabular-nums">{{ totalVolumeToday }}</span>
          <span class="text-xs text-outline">ml</span>
        </div>
        <span class="text-[11px] text-outline mt-2 block">{{ logs.length }} kali minum tercatat</span>
      </div>

      <!-- Status Konsumsi -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Status Konsumsi</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-lg font-bold font-headline" :class="statusTextColor">
            {{ dailyDrinkStatus }}
          </span>
        </div>
        <span class="text-[11px] text-tertiary mt-2 block">
          {{ hiddenSugarCount > 0 ? `${hiddenSugarCount} minuman berpemanis pekat` : 'Pilihan minuman aman' }}
        </span>
      </div>
    </div>

    <!-- Filter & Action Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl border border-surface-variant shadow-sm">
      <div class="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        <button 
          v-for="s in ['Semua', 'Pagi', 'Siang', 'Sore', 'Malam']"
          :key="s"
          type="button" 
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          :class="sessionFilter === s ? 'bg-secondary-container text-on-secondary-fixed shadow-sm' : 'text-outline hover:bg-surface-container-low hover:text-on-surface'"
          @click="sessionFilter = s"
        >
          {{ s }}
        </button>
      </div>

      <button 
        type="button" 
        class="w-full sm:w-auto px-space-md py-2 rounded-lg bg-primary hover:bg-surface-tint text-on-primary text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
        @click="openModal(null)"
      >
        <span class="material-symbols-outlined text-[16px]">add</span>
        <span>+ Catat Minuman Baru</span>
      </button>
    </div>

    <!-- Kelompok Riwayat Berdasarkan Waktu/Sesi Minum -->
    <div class="flex flex-col gap-space-md">
      <div 
        v-for="session in activeSessions" 
        :key="session.name"
        class="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-variant shadow-sm flex flex-col"
      >
        <!-- Session Header -->
        <div class="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-variant/40">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">{{ session.icon }}</span>
            <h3 class="font-headline-sm text-sm font-bold text-on-surface">{{ session.name }}</h3>
            <span class="text-xs text-outline">({{ session.items.length }} minuman)</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-on-surface tabular-nums">
              Total Sesi: {{ session.totalSugar }}g gula
            </span>
            <button 
              type="button" 
              class="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
              @click="openModalWithSession(session.name)"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <!-- Empty Session State -->
        <div v-if="session.items.length === 0" class="py-4 text-center text-xs text-outline italic">
          Belum ada catatan minuman untuk waktu {{ session.name.toLowerCase() }}.
        </div>

        <!-- Session Item Rows -->
        <div v-else class="flex flex-col gap-space-xs">
          <div 
            v-for="item in session.items" 
            :key="item.id"
            class="flex items-center justify-between p-space-sm sm:p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[20px]">{{ item.icon || 'local_cafe' }}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-semibold text-on-surface truncate">{{ item.name }}</span>
                  <span v-if="item.brand" class="text-xs text-outline font-medium truncate">({{ item.brand }})</span>
                </div>
                
                <!-- Rincian Volume & Info Gula -->
                <div class="flex flex-wrap items-center gap-x-2 text-[11px] text-outline mt-0.5">
                  <span class="font-medium text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">water_drop</span>
                    {{ item.volumeMl }} ml
                  </span>
                  <span>•</span>
                  <span>
                    {{ item.sugarPer100ml !== undefined 
                      ? `${item.sugarPer100ml}g per 100ml` 
                      : `${item.sugarPerServing || item.sugarGrams}g per sajian` }}
                  </span>
                  <span>•</span>
                  <span>{{ formatTime(item.loggedAt) }}</span>
                  <span v-if="item.notes" class="truncate">• {{ item.notes }}</span>
                </div>

                <!-- Hidden Sugar Flag Alert -->
                <span v-if="item.hasHiddenSugars" class="text-[10px] text-error font-medium flex items-center gap-1 mt-0.5">
                  <span class="material-symbols-outlined text-[12px]">warning</span>
                  Pemanis tersembunyi: {{ item.hiddenSugarIngredients.join(', ') }}
                </span>
              </div>
            </div>

            <!-- Volume Quick Adjuster & Sugar Value -->
            <div class="flex items-center gap-3 shrink-0">
              <!-- Quick Volume Adjustment Buttons -->
              <div class="hidden sm:flex items-center bg-surface-container-lowest border border-surface-variant rounded-lg p-0.5">
                <button 
                  type="button" 
                  class="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Kurangi volume (-50ml)"
                  @click="adjustVolume(item, -50)"
                >
                  <span class="material-symbols-outlined text-[14px]">remove</span>
                </button>
                <span class="text-[11px] font-mono px-1 font-semibold text-on-surface">{{ item.volumeMl }}ml</span>
                <button 
                  type="button" 
                  class="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Tambah volume (+50ml)"
                  @click="adjustVolume(item, 50)"
                >
                  <span class="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>

              <!-- Nilai Total Gula & Status Badge -->
              <div class="text-right">
                <div class="text-xs sm:text-sm font-bold text-on-surface tabular-nums">{{ item.sugarGrams }} g</div>
                <span 
                  class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
                  :class="getItemStatusBadgeClass(item.status || 'Aman')"
                >
                  {{ item.status || 'Aman' }}
                </span>
              </div>

              <!-- Edit & Delete Buttons -->
              <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  type="button" 
                  class="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
                  title="Edit rincian minuman"
                  @click="openModal(item)"
                >
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button 
                  type="button" 
                  class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors"
                  title="Hapus dari catatan"
                  @click="deleteLog(item.id)"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Log Modal -->
    <ManualLogModal 
      v-model="modalOpen" 
      :edit-item="editingItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { ConsumptionLogItem, DrinkSession, DrinkStatus } from '~/types/sugar'

const {
  logs,
  dailyGoal,
  totalSugarToday,
  remainingSugarToday,
  percentageUsed,
  dailyDrinkStatus,
  hiddenSugarCount,
  calculateDrinkSugar,
  updateLog,
  deleteLog
} = useSugarTracker()

const dayOffset = ref(0)
const sessionFilter = ref('Semua')
const modalOpen = ref(false)
const editingItem = ref<ConsumptionLogItem | null>(null)

const shiftDay = (delta: number) => {
  dayOffset.value += delta
}

const currentDisplayDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset.value)
  if (dayOffset.value === 0) return 'Hari ini, ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  if (dayOffset.value === -1) return 'Kemarin, ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
})

// Total volume cairan yang diminum hari ini
const totalVolumeToday = computed(() => {
  return logs.value.reduce((sum, item) => sum + (Number(item.volumeMl) || 0), 0)
})

const statusTextColor = computed(() => {
  if (dailyDrinkStatus.value === 'Melebihi Target') return 'text-error'
  if (dailyDrinkStatus.value === 'Waspada') return 'text-amber-600'
  return 'text-primary'
})

// Sesi waktu konsumsi minuman
const sessionsMeta: { name: DrinkSession; icon: string }[] = [
  { name: 'Pagi', icon: 'wb_sunny' },
  { name: 'Siang', icon: 'light_mode' },
  { name: 'Sore', icon: 'wb_twilight' },
  { name: 'Malam', icon: 'dark_mode' }
]

const activeSessions = computed(() => {
  let list = sessionsMeta
  if (sessionFilter.value !== 'Semua') {
    list = sessionsMeta.filter(s => s.name === sessionFilter.value)
  }

  return list.map(session => {
    const items = logs.value.filter(item => (item.drinkSession || item.mealSession) === session.name)
    const total = items.reduce((sum, i) => sum + i.sugarGrams, 0)
    return {
      ...session,
      items,
      totalSugar: Number(total.toFixed(1))
    }
  })
})

const formatTime = (isoString?: string) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Fitur pengaturan volume minuman cepat
const adjustVolume = (item: ConsumptionLogItem, delta: number) => {
  const currentVol = Number(item.volumeMl) || 250
  const newVol = Math.max(50, currentVol + delta)
  
  let newSugar = item.sugarGrams
  if (item.sugarPer100ml !== undefined) {
    newSugar = calculateDrinkSugar({
      basis: 'per_100ml',
      sugarPer100ml: item.sugarPer100ml,
      volumeMl: newVol
    })
  } else if (item.packageVolumeMl && item.packageVolumeMl > 0) {
    const ratio = newVol / item.packageVolumeMl
    newSugar = Number(((item.sugarPerServing || item.sugarGrams) * ratio).toFixed(1))
  }

  updateLog(item.id, {
    volumeMl: newVol,
    sugarGrams: newSugar
  })
}

const openModal = (item: ConsumptionLogItem | null) => {
  editingItem.value = item
  modalOpen.value = true
}

const openModalWithSession = (sessionName: DrinkSession) => {
  editingItem.value = {
    id: '',
    name: '',
    brand: '',
    volumeMl: 250,
    packageVolumeMl: 250,
    sugarGrams: 0,
    addedSugarGrams: 0,
    naturalSugarGrams: 0,
    drinkSession: sessionName,
    mealSession: sessionName,
    status: 'Aman',
    glycemicStatus: 'Safe',
    hasHiddenSugars: false,
    hiddenSugarIngredients: [],
    loggedAt: new Date().toISOString()
  }
  modalOpen.value = true
}

const getItemStatusBadgeClass = (status: DrinkStatus | string) => {
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
