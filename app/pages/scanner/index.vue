<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto">
    <!-- Development Restricted Access Card -->
    <div class="bg-surface-container-lowest rounded-2xl p-space-xl border border-amber-300/80 shadow-sm mb-space-xl">
      <div class="flex flex-col items-center text-center max-w-xl mx-auto py-4">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-space-md shadow-inner">
          <span class="material-symbols-outlined text-[36px]">construction</span>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3 border border-amber-300">
          <span class="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          Fitur Dalam Tahap Pengembangan
        </span>
        <h2 class="font-headline-md text-headline-md font-bold text-on-surface mb-2">
          Fitur Pemindai Minuman Belum Dapat Diakses
        </h2>
        <p class="font-body-md text-tertiary mb-6 leading-relaxed">
          Modul pemindaian barcode fisik dan pembaca label nutrisi (OCR) saat ini sedang dalam tahap pengembangan dan optimalisasi sistem. Menu ini tidak dapat diakses secara langsung. Anda dapat mencatat konsumsi minuman harian menggunakan fitur input manual atau kembali ke Dashboard.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-space-md w-full">
          <NuxtLink 
            to="/dashboard"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center gap-2 hover:opacity-90 shadow-sm transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Dashboard</span>
          </NuxtLink>
          <button 
            type="button"
            class="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
            @click="openManualLogDirect"
          >
            <span class="material-symbols-outlined text-[18px] text-primary">add_circle</span>
            <span>Input Minuman Manual</span>
          </button>
        </div>

        <!-- Tombol Pratinjau Pengembangan (Simulasi) -->
        <div class="mt-8 pt-4 border-t border-surface-variant w-full flex items-center justify-center">
          <button 
            type="button"
            class="text-xs text-outline hover:text-on-surface flex items-center gap-1.5 transition-colors"
            @click="showDevPreview = !showDevPreview"
          >
            <span class="material-symbols-outlined text-[16px]">{{ showDevPreview ? 'visibility_off' : 'visibility' }}</span>
            <span>{{ showDevPreview ? 'Tutup Pratinjau Pengembang' : 'Buka Pratinjau Pengembang (Simulasi & Pengujian)' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Container Pratinjau Pengembang: seluruh kode asli pemindai dipertahankan 100% -->
    <div v-if="showDevPreview" class="flex flex-col">
      <!-- Header & Mode Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
        <div class="flex flex-col">
          <div class="flex items-center gap-space-xs mb-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
              Drink Scanner
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-300/60">
              <span class="material-symbols-outlined text-[14px] text-amber-700">construction</span>
              <span>Tahap Pengembangan (BETA)</span>
            </span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Pemindai Barcode &amp; Label Minuman
          </h1>
          <p class="font-body-md text-body-md text-tertiary mt-0.5">
            Pindai barcode kemasan minuman atau foto label Informasi Nilai Gizi untuk membaca kandungan gula secara otomatis.
          </p>
        </div>

        <!-- Mode Pill Switcher -->
        <div class="flex items-center p-1 rounded-xl bg-surface-container-high border border-surface-variant shrink-0">
          <button 
            type="button" 
            class="flex items-center gap-1.5 px-space-md py-2 rounded-lg text-xs font-semibold transition-all"
            :class="activeMode === 'barcode' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-on-surface'"
            @click="activeMode = 'barcode'"
          >
            <span class="material-symbols-outlined text-[18px]">barcode_scanner</span>
            <span>Barcode Minuman</span>
          </button>
          <button 
            type="button" 
            class="flex items-center gap-1.5 px-space-md py-2 rounded-lg text-xs font-semibold transition-all"
            :class="activeMode === 'ocr' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-on-surface'"
            @click="activeMode = 'ocr'"
          >
            <span class="material-symbols-outlined text-[18px]">document_scanner</span>
            <span>OCR Label Nutrisi</span>
          </button>
        </div>
      </div>

      <!-- Development Notice Banner -->
      <div class="mb-space-lg p-space-md rounded-2xl bg-amber-50 border border-amber-300/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div class="flex items-start gap-space-sm">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[22px]">construction</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-amber-900">
                Informasi: Fitur Ini Sedang Dalam Tahap Pengembangan
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                BETA
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-amber-800 mt-0.5 leading-relaxed">
              Modul pemindaian barcode fisik dan pembaca label nutrisi (OCR) saat ini sedang dalam tahap pengembangan dan optimalisasi akurasi. Seluruh fungsi dan kode tetap aktif untuk pengujian simulasi, dan Anda juga dapat menggunakan <strong>Input Manual</strong> untuk mencatat minuman harian secara langsung.
            </p>
          </div>
        </div>
        <button 
          type="button" 
          class="shrink-0 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
          @click="openManualLogDirect"
        >
          <span class="material-symbols-outlined text-[16px]">edit_note</span>
          <span>Input Manual Minuman</span>
        </button>
      </div>

    <!-- Main Scanner Canvas & Viewfinder Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
      <!-- Left: Camera Viewfinder & Capture Interface (7 cols) -->
      <div class="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-variant flex flex-col">
        <!-- Viewfinder Box -->
        <div class="relative w-full aspect-video sm:aspect-4/3 rounded-xl bg-inverse-surface overflow-hidden flex items-center justify-center border-2 border-surface-variant">
          <!-- Active Camera Video -->
          <video 
            ref="videoRef" 
            class="w-full h-full object-cover" 
            playsinline 
            autoplay 
            muted
            :class="{ hidden: !cameraActive }"
          ></video>

          <!-- Fallback or Standby Graphic -->
          <div v-if="!cameraActive" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900 text-zinc-300">
            <span class="material-symbols-outlined text-[52px] text-zinc-500 mb-2">
              {{ activeMode === 'barcode' ? 'barcode_scanner' : 'photo_camera' }}
            </span>
            <span class="font-headline-sm text-sm font-semibold text-white">Kamera Pemindai Siaga</span>
            <p class="font-body-sm text-xs text-zinc-400 max-w-sm mt-1">
              Arahkan kamera ke barcode kemasan minuman atau label Informasi Nilai Gizi, atau unggah foto kemasan.
            </p>
          </div>

          <!-- Targeting Reticle Overlay -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div 
              class="relative border-2 border-dashed rounded-xl transition-all duration-300 flex items-center justify-center"
              :class="[
                activeMode === 'barcode' ? 'w-64 h-36 border-primary/90' : 'w-64 h-72 border-emerald-400/90',
                isScanning ? 'shadow-[0_0_25px_rgba(21,128,61,0.5)]' : ''
              ]"
            >
              <!-- Animated Laser line -->
              <div 
                v-if="cameraActive || isScanning" 
                class="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"
              ></div>
              <span class="absolute -bottom-7 px-2.5 py-0.5 rounded-full bg-black/75 text-[10px] text-white font-mono tracking-wider">
                {{ activeMode === 'barcode' ? 'ARAHKAN KE BARCODE MINUMAN' : 'ARAHKAN KE TABEL GULA / NUTRITION FACTS' }}
              </span>
            </div>
          </div>

          <!-- Status Indicator Pill in corner -->
          <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white flex items-center gap-1.5 font-medium">
            <span class="w-2 h-2 rounded-full" :class="cameraActive ? 'bg-primary animate-pulse' : 'bg-zinc-400'"></span>
            <span>{{ cameraActive ? 'Kamera Aktif' : 'Kamera Standby' }}</span>
          </div>
        </div>

        <!-- Camera Controls -->
        <div class="mt-space-md flex flex-wrap items-center justify-between gap-space-sm">
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              class="px-space-md py-2 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              :class="cameraActive ? 'bg-error-container text-on-error-container hover:bg-error-container/80' : 'bg-primary text-on-primary hover:bg-surface-tint'"
              @click="toggleCamera"
            >
              <span class="material-symbols-outlined text-[18px]">{{ cameraActive ? 'videocam_off' : 'videocam' }}</span>
              <span>{{ cameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera' }}</span>
            </button>

            <!-- File Upload alternative -->
            <label class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Unggah Foto</span>
              <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
            </label>
          </div>

          <button 
            type="button" 
            class="px-space-md py-2 rounded-lg bg-secondary-container text-on-secondary-fixed hover:bg-secondary-fixed text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="simulateScan"
          >
            <span class="material-symbols-outlined text-[18px]">bolt</span>
            <span>Simulasi Pindai</span>
          </button>
        </div>

        <!-- Barcode Manual Entry Row -->
        <div v-if="activeMode === 'barcode'" class="mt-space-lg pt-space-md border-t border-surface-variant flex flex-col gap-2">
          <label class="text-xs font-semibold text-on-surface">Atau masukkan kode barcode minuman (UPC-A / EAN-13)</label>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">barcode</span>
              <input 
                v-model="manualBarcode" 
                type="text" 
                placeholder="Contoh: 8992741911019 atau 851492002011" 
                class="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-xs font-mono border border-transparent focus:border-primary focus:outline-none"
                @keyup.enter="handleBarcodeLookup"
              />
            </div>
            <button 
              type="button" 
              class="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold"
              @click="handleBarcodeLookup"
            >
              Cari Produk
            </button>
          </div>

          <!-- Sample Barcode Quick Pills -->
          <div class="flex flex-wrap items-center gap-1.5 mt-1">
            <span class="text-[11px] text-outline">Contoh minuman:</span>
            <button 
              v-for="p in products" 
              :key="p.barcode"
              type="button" 
              class="px-2.5 py-0.5 rounded-full bg-surface-container hover:bg-surface-variant text-[11px] text-on-surface font-medium"
              @click="pickSampleBarcode(p.barcode)"
            >
              {{ p.name.split(' ')[0] }} {{ p.brand ? `(${p.brand})` : '' }}
            </button>
          </div>
        </div>

        <!-- Nutrition OCR Text Input/Extracted Box -->
        <div v-else class="mt-space-lg pt-space-md border-t border-surface-variant flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-on-surface">Teks Hasil Pemindaian OCR Label Nutrisi</label>
            <button 
              type="button" 
              class="text-xs text-primary font-semibold hover:underline"
              @click="loadSampleLabelText"
            >
              Muat Contoh Label
            </button>
          </div>
          <textarea 
            v-model="ocrExtractedText"
            rows="3"
            class="w-full p-2.5 rounded-lg bg-surface-container-low text-xs font-mono text-on-surface border border-transparent focus:border-primary focus:outline-none"
            placeholder="INFORMASI NILAI GIZI: Takaran saji 1 botol (250 ml). Gula total 15g, Gula per 100ml 6g. Komposisi: Air, Gula Tebu, Ekstrak Teh Melati..."
          ></textarea>
          <div class="flex items-center justify-between pt-1">
            <button
              type="button"
              class="text-xs text-outline hover:text-primary flex items-center gap-1"
              @click="openManualLogDirect"
            >
              <span class="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Gagal mendeteksi? Input Manual</span>
            </button>
            <button 
              type="button" 
              class="px-space-md py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-surface-tint transition-colors flex items-center gap-1.5"
              @click="processOCRText"
            >
              <span class="material-symbols-outlined text-[16px]">analytics</span>
              <span>Ekstrak &amp; Verifikasi Hasil OCR</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Recognized Drink & Verification / Logging Card (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-space-md">
        <!-- Recognized Product Card -->
        <div 
          v-if="recognizedProduct" 
          class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-variant flex flex-col"
        >
          <div class="flex items-start justify-between pb-space-sm mb-space-sm border-b border-surface-variant">
            <div class="flex flex-col">
              <span class="text-[11px] uppercase tracking-wider text-outline font-semibold">Minuman Terdeteksi</span>
              <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                {{ recognizedProduct.name }}
              </h3>
              <span class="text-xs text-tertiary">
                {{ recognizedProduct.brand }} • {{ recognizedProduct.category }} • {{ recognizedProduct.servingSize }}
              </span>
            </div>
            <span 
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="getItemStatusBadgeClass(currentDrinkStatus)"
            >
              {{ currentDrinkStatus }}
            </span>
          </div>

          <!-- Product Image if available -->
          <div v-if="recognizedProduct.imageUrl" class="w-full h-36 rounded-xl overflow-hidden mb-space-md bg-surface-container-low">
            <img :src="recognizedProduct.imageUrl" :alt="recognizedProduct.name" class="w-full h-full object-cover" />
          </div>

          <!-- Panel Verifikasi & Koreksi Volume Diminum Pengguna -->
          <div class="p-space-md rounded-xl bg-surface-container-low mb-space-md flex flex-col gap-space-sm">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-on-surface">Verifikasi Volume yang Diminum:</span>
              <span class="font-mono font-bold text-primary">{{ consumedVolumeMl }} ml</span>
            </div>

            <!-- Volume Slider / Input -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="px-2 py-1 rounded bg-surface-container hover:bg-surface-variant text-xs font-bold"
                @click="consumedVolumeMl = Math.max(50, consumedVolumeMl - 50)"
              >
                -50
              </button>
              <input 
                v-model.number="consumedVolumeMl" 
                type="range" 
                min="50" 
                :max="Math.max(600, (recognizedProduct.packageVolumeMl || 250) * 2)" 
                step="25"
                class="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer"
              />
              <button 
                type="button" 
                class="px-2 py-1 rounded bg-surface-container hover:bg-surface-variant text-xs font-bold"
                @click="consumedVolumeMl = consumedVolumeMl + 50"
              >
                +50
              </button>
            </div>

            <!-- Quick volume presets -->
            <div class="flex items-center gap-1.5 text-[11px]">
              <span class="text-outline">Ukuran:</span>
              <button 
                type="button" 
                class="px-2 py-0.5 rounded bg-surface-container-lowest border text-xs"
                :class="consumedVolumeMl === (recognizedProduct.packageVolumeMl || 250) ? 'border-primary text-primary font-bold' : 'border-surface-variant'"
                @click="consumedVolumeMl = recognizedProduct.packageVolumeMl || 250"
              >
                1 Kemasan ({{ recognizedProduct.packageVolumeMl || 250 }}ml)
              </button>
              <button 
                type="button" 
                class="px-2 py-0.5 rounded bg-surface-container-lowest border text-xs"
                :class="consumedVolumeMl === Math.round((recognizedProduct.packageVolumeMl || 250) / 2) ? 'border-primary text-primary font-bold' : 'border-surface-variant'"
                @click="consumedVolumeMl = Math.round((recognizedProduct.packageVolumeMl || 250) / 2)"
              >
                Setengah
              </button>
            </div>
          </div>

          <!-- Rincian Gula Berdasarkan Volume yang Diminum -->
          <div class="grid grid-cols-3 gap-2 p-space-md rounded-xl bg-surface-container-low mb-space-md text-center">
            <div class="flex flex-col">
              <span class="text-[11px] text-outline">Gula per 100ml</span>
              <span class="text-base font-bold text-on-surface font-headline tabular-nums">
                {{ recognizedProduct.sugarPer100ml !== undefined ? `${recognizedProduct.sugarPer100ml}g` : '-' }}
              </span>
            </div>
            <div class="flex flex-col border-x border-surface-variant">
              <span class="text-[11px] text-outline">Gula per Sajian</span>
              <span class="text-base font-bold text-on-surface font-headline tabular-nums">
                {{ recognizedProduct.sugarPerServing !== undefined ? `${recognizedProduct.sugarPerServing}g` : `${recognizedProduct.totalSugarsG}g` }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] text-primary font-semibold">Total Diminum</span>
              <span class="text-lg font-bold text-primary font-headline tabular-nums">
                {{ computedCalculatedSugar }}g
              </span>
            </div>
          </div>

          <!-- Peringatan Pemanis Tersembunyi -->
          <div 
            class="p-space-sm rounded-lg mb-space-md flex items-start gap-2"
            :class="recognizedProduct.hiddenSugarsDetected.length > 0 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-fixed'"
          >
            <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              {{ recognizedProduct.hiddenSugarsDetected.length > 0 ? 'warning' : 'verified' }}
            </span>
            <div class="flex flex-col text-xs">
              <span class="font-semibold">
                {{ recognizedProduct.hiddenSugarsDetected.length > 0 ? 'Mengandung Pemanis Tersembunyi' : 'Bebas Pemanis Buatan/Pekat' }}
              </span>
              <span v-if="recognizedProduct.hiddenSugarsDetected.length > 0" class="text-[11px] mt-0.5">
                Bahan: {{ recognizedProduct.hiddenSugarsDetected.join(', ') }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              class="flex-1 py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
              @click="logRecognizedDrink"
            >
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambahkan ke Daily Tracker ({{ computedCalculatedSugar }}g)</span>
            </button>
            <NuxtLink 
              :to="`/products/${recognizedProduct.id}`"
              class="px-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-semibold text-xs transition-colors flex items-center justify-center"
              title="Lihat Rincian Minuman"
            >
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Standby Placeholder when nothing scanned yet -->
        <div v-else class="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm border border-surface-variant flex flex-col items-center justify-center text-center h-full min-h-[300px]">
          <span class="material-symbols-outlined text-[48px] text-outline mb-2">barcode_scanner</span>
          <span class="font-headline-sm text-sm font-semibold text-on-surface">Belum Ada Minuman Dipindai</span>
          <p class="font-body-sm text-xs text-outline max-w-xs mt-1">
            Arahkan kamera ke barcode botol/kotak minuman, atau klik salah satu contoh minuman di sebelah kiri.
          </p>
          <button
            type="button"
            class="mt-4 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-xs font-semibold text-on-surface flex items-center gap-1.5"
            @click="openManualLogDirect"
          >
            <span class="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Input Minuman Manual</span>
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- Manual Log Modal fallback -->
    <ManualLogModal 
      v-model="modalOpen" 
      :edit-item="manualModalItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, ConsumptionLogItem, DrinkStatus } from '~/types/sugar'

const showDevPreview = ref(false)
const activeMode = ref<'barcode' | 'ocr'>('barcode')
const cameraActive = ref(false)
const isScanning = ref(false)
const manualBarcode = ref('')
const ocrExtractedText = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)
let streamInstance: MediaStream | null = null

const modalOpen = ref(false)
const manualModalItem = ref<ConsumptionLogItem | null>(null)

const { products, dailyGoal, findProductByBarcode, addLog, detectHiddenSugars, calculateDrinkSugar, getDrinkStatus } = useSugarTracker()

// Default minuman awal untuk UX yang responsif
const recognizedProduct = ref<Product | null>(products.value[0])
const consumedVolumeMl = ref<number>(products.value[0]?.packageVolumeMl || 250)

// Hitung total gula secara real-time berdasarkan volume yang diminum
const computedCalculatedSugar = computed(() => {
  if (!recognizedProduct.value) return 0
  const p = recognizedProduct.value
  if (p.sugarPer100ml !== undefined) {
    return calculateDrinkSugar({
      basis: 'per_100ml',
      sugarPer100ml: p.sugarPer100ml,
      volumeMl: consumedVolumeMl.value
    })
  } else {
    const pkgVol = p.packageVolumeMl || 250
    const ratio = consumedVolumeMl.value / pkgVol
    return Number(((p.sugarPerServing || p.totalSugarsG) * ratio).toFixed(1))
  }
})

const currentDrinkStatus = computed<DrinkStatus>(() => {
  return getDrinkStatus(computedCalculatedSugar.value)
})

const toggleCamera = async () => {
  if (cameraActive.value) {
    if (streamInstance) {
      streamInstance.getTracks().forEach(track => track.stop())
      streamInstance = null
    }
    cameraActive.value = false
  } else {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        streamInstance = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.value) {
          videoRef.value.srcObject = streamInstance
        }
        cameraActive.value = true
      } else {
        alert('API Kamera tidak didukung di peramban ini. Anda dapat mengunggah gambar atau menggunakan simulasi!')
      }
    } catch (err) {
      console.warn('Gagal mengakses kamera:', err)
      alert('Tidak dapat mengaktifkan kamera. Menggunakan mode simulasi instan!')
      simulateScan()
    }
  }
}

const simulateScan = () => {
  isScanning.value = true
  setTimeout(() => {
    isScanning.value = false
    const randomProduct = products.value[Math.floor(Math.random() * products.value.length)]
    recognizedProduct.value = randomProduct
    consumedVolumeMl.value = randomProduct.packageVolumeMl || 250
  }, 600)
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    simulateScan()
  }
}

const handleBarcodeLookup = () => {
  if (!manualBarcode.value.trim()) return
  const found = findProductByBarcode(manualBarcode.value)
  if (found) {
    recognizedProduct.value = found
    consumedVolumeMl.value = found.packageVolumeMl || 250
  } else {
    const confirmManual = confirm(`Barcode "${manualBarcode.value}" tidak ditemukan di database minuman. Buka input manual?`)
    if (confirmManual) {
      manualModalItem.value = {
        id: '',
        name: `Minuman (${manualBarcode.value})`,
        barcode: manualBarcode.value,
        volumeMl: 250,
        sugarGrams: 10,
        addedSugarGrams: 10,
        naturalSugarGrams: 0,
        drinkSession: 'Siang',
        status: 'Aman',
        glycemicStatus: 'Safe',
        hasHiddenSugars: false,
        hiddenSugarIngredients: [],
        loggedAt: new Date().toISOString()
      }
      modalOpen.value = true
    }
  }
}

const pickSampleBarcode = (code: string) => {
  manualBarcode.value = code
  handleBarcodeLookup()
}

const loadSampleLabelText = () => {
  ocrExtractedText.value = `INFORMASI NILAI GIZI
Ukuran Porsi: 1 botol (250 ml)
Jumlah Sajian per Kemasan: 1
Total Gula: 15g
Gula Pasir / Sukrosa: 15g
Gula per 100ml: 6.0g
Komposisi: Air, Gula Tebu (6%), Ekstrak Daun Teh Melati.`
}

const processOCRText = () => {
  if (!ocrExtractedText.value.trim()) {
    alert('Masukkan atau pindai teks label nutrisi terlebih dahulu!')
    return
  }
  const text = ocrExtractedText.value
  const hidden = detectHiddenSugars(text)
  
  // Ekstraksi angka gula dan volume
  const sugar100Match = text.match(/gula\s*per\s*100\s*ml\s*:?\s*(\d+(\.\d+)?)/i)
  const totalSugarMatch = text.match(/total\s*gula\s*:?\s*(\d+(\.\d+)?)\s*g/i) || text.match(/gula\s*:?\s*(\d+(\.\d+)?)\s*g/i)
  const volMatch = text.match(/(\d+)\s*ml/i)

  const vol = volMatch ? parseInt(volMatch[1]) : 250
  const sugarPer100 = sugar100Match ? parseFloat(sugar100Match[1]) : (totalSugarMatch ? Number(((parseFloat(totalSugarMatch[1]) / vol) * 100).toFixed(1)) : 6.0)
  const totalSugars = totalSugarMatch ? parseFloat(totalSugarMatch[1]) : Number(((sugarPer100 * vol) / 100).toFixed(1))

  recognizedProduct.value = {
    id: `ocr-${Date.now()}`,
    barcode: 'OCR-LABEL',
    name: 'Minuman Hasil Scan Label OCR',
    brand: 'Label Terbaca',
    category: 'Minuman Kemasan',
    packageVolumeMl: vol,
    servingSizeMl: vol,
    servingSize: `${vol} ml (1 porsi)`,
    sugarPer100ml: sugarPer100,
    sugarPerServing: totalSugars,
    totalSugarsG: totalSugars,
    addedSugarsG: totalSugars,
    naturalSugarsG: 0,
    totalCarbsG: Math.round(totalSugars * 1.1),
    calories: Math.round(totalSugars * 4),
    glycemicStatus: totalSugars > 20 ? 'High' : (totalSugars > 10 ? 'Moderate' : 'Safe'),
    ingredients: text.split('\n').filter(l => l.toLowerCase().includes('komposisi') || l.toLowerCase().includes('ingredients')),
    hiddenSugarsDetected: hidden
  }
  consumedVolumeMl.value = vol
}

const openManualLogDirect = () => {
  manualModalItem.value = null
  modalOpen.value = true
}

const logRecognizedDrink = () => {
  if (!recognizedProduct.value) return
  const p = recognizedProduct.value
  const sugar = computedCalculatedSugar.value
  const vol = consumedVolumeMl.value

  addLog({
    name: p.name,
    brand: p.brand,
    volumeMl: vol,
    packageVolumeMl: p.packageVolumeMl,
    sugarPer100ml: p.sugarPer100ml,
    sugarPerServing: p.sugarPerServing,
    sugarGrams: sugar,
    addedSugarGrams: sugar,
    naturalSugarGrams: 0,
    servingSize: `${vol} ml`,
    servingsConsumed: 1,
    calculationBasis: p.sugarPer100ml !== undefined ? 'per_100ml' : 'per_serving',
    drinkSession: 'Siang',
    mealSession: 'Siang',
    glycemicStatus: p.glycemicStatus,
    status: currentDrinkStatus.value,
    hasHiddenSugars: p.hiddenSugarsDetected.length > 0,
    hiddenSugarIngredients: p.hiddenSugarsDetected,
    barcode: p.barcode,
    loggedAt: new Date().toISOString(),
    icon: 'local_cafe'
  })

  alert(`Berhasil mencatat "${p.name}" (${sugar}g gula / ${vol}ml) ke Daily Tracker!`)
  navigateTo('/dashboard')
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

onUnmounted(() => {
  if (streamInstance) {
    streamInstance.getTracks().forEach(track => track.stop())
  }
})
</script>
