<template>
  <div class="flex flex-col w-full">
    <!-- Top Greeting & Contextual Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg mb-space-xl">
      <div class="flex flex-col">
        <div class="flex items-center gap-space-xs mb-1">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
            :class="statusBadgeClass"
          >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass"></span>
            Status: {{ dailyDrinkStatus }}
          </span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          {{ greeting }}, {{ user.fullName.split(' ')[0] }}!
        </h1>
        <p class="font-body-md text-body-md text-tertiary mt-1">
          {{ contextualMessage }}
        </p>
      </div>

      <!-- Quick Actions: Scan Minuman & Tambah Minuman Manual -->
      <div class="flex items-center gap-space-md shrink-0">
        <button 
          type="button" 
          class="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-all shadow-sm font-semibold"
          @click="openManualModal(null)"
        >
          <span class="material-symbols-outlined text-[18px] text-primary">add_circle</span>
          <span>+ Tambah Minuman Manual</span>
        </button>
        <button 
          type="button" 
          disabled
          class="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-outline font-label-md text-label-md font-semibold cursor-not-allowed opacity-75 select-none"
          title="Fitur pemindai barcode sedang dalam tahap pengembangan dan belum dapat diakses"
        >
          <span class="material-symbols-outlined text-[18px]">barcode_scanner</span>
          <span>Scan Minuman (Segera Hadir)</span>
        </button>
      </div>
    </div>

    <!-- Main Sugar Summary Hero & Biometric KPI Bento -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
      <!-- Left Hero Card: Progress Ring / Gauge -->
      <div class="lg:col-span-6 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col justify-between relative overflow-hidden">
        <!-- Radial gradient background accent -->
        <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-secondary-container/40 blur-2xl pointer-events-none"></div>

        <div class="flex items-start justify-between mb-space-md">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Akumulasi Hari Ini</span>
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold mt-0.5">Konsumsi Gula dari Minuman</span>
          </div>
          <div 
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold"
            :class="statusBadgeClass"
          >
            <span class="w-2 h-2 rounded-full animate-pulse" :class="statusDotClass"></span>
            <span>{{ dailyDrinkStatus }} ({{ percentageUsed }}%)</span>
          </div>
        </div>

        <!-- Main Visual Gauge Ring Area -->
        <div class="flex flex-col md:flex-row items-center justify-around gap-space-lg my-space-md">
          <!-- SVG Semi-gauge / ring -->
          <div class="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <!-- Background Ring -->
              <circle 
                cx="80" 
                cy="80" 
                fill="transparent" 
                r="66" 
                stroke="#eceef0" 
                stroke-width="14" 
              />
              <!-- Animated Progress Ring -->
              <circle 
                cx="80" 
                cy="80" 
                fill="transparent" 
                r="66" 
                :stroke="gaugeStrokeColor" 
                stroke-linecap="round" 
                stroke-width="14"
                stroke-dasharray="414.69" 
                :stroke-dashoffset="gaugeDashoffset"
                class="transition-all duration-700 ease-out"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="font-stat-value text-stat-value text-on-surface leading-none font-bold tabular-nums">
                {{ totalSugarToday }}
              </span>
              <span class="font-stat-unit text-stat-unit text-outline font-medium mt-0.5">gram total gula</span>
            </div>
          </div>

          <!-- Gauge Legend & Sisa Target -->
          <div class="flex flex-col gap-space-sm w-full md:w-auto">
            <div class="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between gap-space-lg">
              <div class="flex flex-col">
                <span class="font-body-sm text-body-sm text-outline">Sisa Target Gula</span>
                <span 
                  class="font-headline-sm text-headline-sm font-bold tabular-nums"
                  :class="remainingSugarToday === 0 ? 'text-error' : 'text-primary'"
                >
                  {{ remainingSugarToday }} g tersisa
                </span>
              </div>
              <span class="material-symbols-outlined text-[28px]" :class="remainingSugarToday === 0 ? 'text-error' : 'text-primary'">
                water_drop
              </span>
            </div>

            <div class="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between gap-space-lg">
              <div class="flex flex-col">
                <span class="font-body-sm text-body-sm text-outline">Target Gula Harian</span>
                <span class="font-headline-sm text-headline-sm text-on-surface font-semibold tabular-nums">
                  {{ dailyGoal }} g / hari
                </span>
              </div>
              <span class="material-symbols-outlined text-outline text-[24px]">flag</span>
            </div>
          </div>
        </div>

        <!-- Bottom Micro Note -->
        <div class="pt-space-md flex flex-col sm:flex-row sm:items-center justify-between text-outline gap-2 border-t border-surface-variant/60">
          <span class="font-body-sm text-body-sm flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">local_cafe</span>
            Dihitung dari <strong class="text-on-surface">{{ logs.length }} minuman</strong> tercatat hari ini
          </span>
          <span class="font-label-sm text-label-sm text-tertiary font-medium">Batas Rekomendasi: ≤ {{ dailyGoal }}g</span>
        </div>
      </div>

      <!-- Right KPI Cards: Analytical Trio -->
      <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <!-- Added vs Natural Sugar Card -->
        <div class="sm:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Komposisi Gula Minuman</span>
            <span class="material-symbols-outlined text-[20px] text-primary">pie_chart</span>
          </div>

          <div class="my-space-md">
            <div class="flex items-baseline justify-between mb-2">
              <div class="flex items-baseline gap-1.5">
                <span class="font-stat-value text-stat-value text-on-surface leading-tight font-bold tabular-nums">
                  {{ addedSugarToday }}g
                </span>
                <span class="font-body-sm text-body-sm text-outline">Gula Tambahan</span>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="font-stat-value text-stat-value text-secondary font-bold tabular-nums">
                  {{ naturalSugarToday }}g
                </span>
                <span class="font-body-sm text-body-sm text-outline">Gula Alami (Susu/Jus)</span>
              </div>
            </div>

            <!-- Dual segment bar -->
            <div class="w-full h-3 rounded-full bg-surface-container flex overflow-hidden">
              <div 
                class="h-full bg-primary-container transition-all duration-500" 
                :style="{ width: `${addedPercentage}%` }"
                title="Gula Tambahan"
              ></div>
              <div 
                class="h-full bg-secondary-fixed transition-all duration-500" 
                :style="{ width: `${naturalPercentage}%` }"
                title="Gula Alami"
              ></div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between font-body-sm text-body-sm text-tertiary gap-2">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              Gula Tambahan (Sirup/Gula Pasir)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span>
              Laktosa Susu &amp; Fruktosa Alami
            </span>
          </div>
        </div>

        <!-- Hidden Sugar Alert Card -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Pemanis Tersembunyi</span>
            <span 
              class="p-1.5 rounded-lg material-symbols-outlined text-[18px]"
              :class="hiddenSugarCount > 0 ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'"
            >
              {{ hiddenSugarCount > 0 ? 'warning' : 'verified' }}
            </span>
          </div>

          <div class="my-space-sm">
            <div class="font-stat-value text-stat-value text-on-surface font-bold">
              {{ hiddenSugarCount }} Minuman
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {{ hiddenSugarCount === 0 
                ? 'Tidak ada pemanis industri tersembunyi (seperti HFCS) terdeteksi hari ini.' 
                : 'Minuman mengandung sirup pekat atau pemanis industri terdeteksi.' }}
            </p>
          </div>

          <div 
            class="pt-2 flex items-center gap-1 font-label-sm text-label-sm"
            :class="hiddenSugarCount === 0 ? 'text-primary' : 'text-error'"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{ hiddenSugarCount === 0 ? 'check_circle' : 'flag' }}
            </span>
            <span>{{ hiddenSugarCount === 0 ? 'Bebas HFCS / Sirup Pekat' : 'Periksa komposisi minuman' }}</span>
          </div>
        </div>

        <!-- Kepatuhan Mingguan -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Kepatuhan 7 Hari</span>
            <span class="p-1.5 rounded-lg bg-surface-container-high text-tertiary material-symbols-outlined text-[18px]">calendar_month</span>
          </div>

          <div class="my-space-sm">
            <div class="font-stat-value text-stat-value text-on-surface font-bold">{{ daysUnderTarget }} / 7 Hari</div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Konsumsi gula dari minuman berada di bawah target {{ dailyGoal }}g selama seminggu terakhir.
            </p>
          </div>

          <div class="pt-2 flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
            <span class="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Rata-rata: {{ weeklyAverage }}g / hari</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Search Minuman & Scan Shortcut -->
    <div class="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-variant mb-space-xl flex flex-col sm:flex-row items-center gap-space-md relative">
      <div class="relative w-full flex-1">
        <span class="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input 
          v-model="searchQuery"
          class="w-full pl-11 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest transition-all focus:outline-none border border-transparent focus:border-surface-variant"
          placeholder="Cari cepat minuman (contoh: Teh Botol, Kopi Susu, Pocari, Ultra Milk, Coca-Cola)..." 
          type="text"
          @focus="showSearchResults = true"
        />

        <!-- Live Search Dropdown Popup -->
        <div 
          v-if="showSearchResults && filteredProducts.length > 0" 
          class="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-variant z-30 max-h-72 overflow-y-auto p-2"
        >
          <div 
            v-for="prod in filteredProducts" 
            :key="prod.id"
            class="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
            @click="selectProductFromSearch(prod)"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-[22px]">local_cafe</span>
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-on-surface">{{ prod.name }}</span>
                <span class="text-xs text-outline">{{ prod.brand }} • {{ prod.servingSize }} ({{ prod.packageVolumeMl || 250 }} ml)</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-on-surface tabular-nums">{{ prod.totalSugarsG }}g gula</span>
              <button 
                type="button" 
                class="px-2.5 py-1 text-xs font-semibold rounded bg-secondary-container text-on-secondary-fixed hover:bg-secondary-fixed"
              >
                + Catat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-space-sm shrink-0 w-full sm:w-auto">
        <button 
          type="button" 
          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-variant font-label-md text-label-md transition-colors"
          @click="searchQuery = 'Teh'; showSearchResults = true"
        >
          <span class="material-symbols-outlined text-[18px]">history</span>
          <span>Contoh: Teh</span>
        </button>
        <button 
          type="button" 
          disabled
          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container text-outline font-label-md text-label-md transition-colors font-semibold cursor-not-allowed opacity-75 select-none"
          title="Fitur pemindai barcode sedang dalam tahap pengembangan dan belum dapat diakses"
        >
          <span class="material-symbols-outlined text-[18px]">barcode_scanner</span>
          <span>Scanner (Segera Hadir)</span>
        </button>
      </div>
    </div>

    <!-- Two-Column Layout: Daftar Minuman Hari Ini & Grafik Tren Mingguan -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
      <!-- Left Column: Daftar Minuman yang Dikonsumsi Hari Ini -->
      <div class="lg:col-span-7 flex flex-col gap-space-md">
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant">
          <div class="flex items-center justify-between pb-space-md mb-space-sm border-b border-surface-variant/40">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[22px]">local_cafe</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Daftar Minuman Hari Ini</h2>
            </div>
            <NuxtLink 
              to="/tracker" 
              class="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Lihat di Daily Tracker</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-if="logs.length === 0" class="py-12 flex flex-col items-center justify-center text-center">
            <span class="material-symbols-outlined text-[48px] text-outline mb-2">water_drop</span>
            <span class="font-headline-sm text-sm font-semibold text-on-surface">Belum ada minuman yang dicatat hari ini</span>
            <p class="font-body-sm text-xs text-outline max-w-xs mt-1">Mulai catat minuman Anda dengan memindai barcode atau menambahkan secara manual.</p>
          </div>

          <!-- Consumption Item List -->
          <div v-else class="flex flex-col gap-space-xs">
            <div 
              v-for="item in logs" 
              :key="item.id"
              class="consumption-row flex items-center justify-between p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
            >
              <div class="flex items-center gap-space-md min-w-0">
                <div class="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                  <span class="material-symbols-outlined text-[20px]">{{ item.icon || 'local_cafe' }}</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-body-md text-body-md text-on-surface font-semibold truncate">{{ item.name }}</span>
                    <span v-if="item.brand" class="text-xs text-outline font-medium truncate">({{ item.brand }})</span>
                  </div>
                  <span class="font-body-sm text-body-sm text-outline truncate">
                    {{ item.drinkSession }} • {{ item.volumeMl }} ml {{ item.notes ? `• ${item.notes}` : '' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-space-md shrink-0">
                <div class="text-right">
                  <div class="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">
                    {{ item.sugarGrams }} g
                  </div>
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm text-[11px] font-semibold"
                    :class="getItemStatusBadgeClass(item.status || 'Aman')"
                  >
                    {{ item.status || 'Aman' }}
                  </span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button" 
                    class="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors" 
                    title="Edit minuman"
                    @click="openManualModal(item)"
                  >
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    type="button" 
                    class="p-1 rounded text-outline hover:text-error hover:bg-error-container transition-colors" 
                    title="Hapus minuman"
                    @click="deleteLog(item.id)"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Item Direct Shortcut -->
          <button 
            type="button" 
            class="w-full mt-space-md py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-all font-semibold"
            @click="openManualModal(null)"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Tambah Minuman Lainnya</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Grafik Tren Konsumsi Gula Mingguan -->
      <div class="lg:col-span-5 flex flex-col gap-space-lg">
        <!-- 7-Day Sugar Intake Trend -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant">
          <div class="flex items-center justify-between mb-space-md">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Tren Mingguan</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Konsumsi Gula 7 Hari</h3>
            </div>
            <span class="font-label-sm text-label-sm text-tertiary">Target: ≤ {{ dailyGoal }}g</span>
          </div>

          <!-- SVG Column Chart with 50g Target Baseline -->
          <div class="w-full bg-surface-container-low rounded-lg p-space-md">
            <div class="relative h-44 w-full flex items-end justify-between pt-6 pb-2 px-2">
              <!-- Dotted Target Line -->
              <div class="absolute left-0 right-0 top-6 border-b border-dashed border-outline-variant/80 z-0">
                <span class="absolute -top-3.5 right-2 font-label-sm text-label-sm text-[10px] text-outline font-semibold uppercase tracking-wider">
                  Batas {{ dailyGoal }}g
                </span>
              </div>

              <!-- Telemetry Day Bars -->
              <div 
                v-for="day in telemetry" 
                :key="day.dayName + day.dateString"
                class="flex flex-col items-center gap-1.5 h-full justify-end z-10 w-8 group"
              >
                <span 
                  class="font-label-sm text-label-sm text-[10px] transition-opacity tabular-nums"
                  :class="day.isToday ? 'text-primary font-bold opacity-100' : 'text-tertiary opacity-0 group-hover:opacity-100'"
                >
                  {{ day.sugarG > 0 ? `${day.sugarG}g` : '0g' }}
                </span>
                
                <div 
                  class="w-full rounded-t-sm transition-all"
                  :class="[
                    day.isToday 
                      ? 'bg-primary-container' 
                      : day.sugarG > dailyGoal 
                        ? 'bg-error-container' 
                        : day.sugarG > 0 ? 'bg-secondary-fixed-dim group-hover:bg-primary' : 'bg-surface-variant'
                  ]"
                  :style="{ height: `${Math.min(100, Math.max(6, (day.sugarG / dailyGoal) * 100))}%` }"
                ></div>

                <span 
                  class="font-label-sm text-label-sm font-semibold"
                  :class="day.isToday ? 'text-primary font-bold' : 'text-outline'"
                >
                  {{ day.dayName }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-space-md flex items-center justify-between text-tertiary font-body-sm text-body-sm">
            <span>Rata-rata 7 Hari: <strong class="text-on-surface">{{ weeklyAverage }}g</strong> / hari</span>
            <span class="text-primary font-semibold">{{ daysUnderTarget }} hari di bawah target</span>
          </div>
        </div>

        <!-- Panduan Pemanis Minuman Kemasan -->
        <div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant">
          <div class="flex items-center gap-space-xs mb-space-sm">
            <span class="material-symbols-outlined text-primary text-[22px]">policy</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Pemanis Minuman Kemasan</h3>
          </div>
          <p class="font-body-sm text-body-sm text-tertiary mb-space-md">
            Waspadai nama lain pemanis cair industri yang kerap digunakan dalam teh kemasan, soda, dan kopi susu:
          </p>

          <div class="grid grid-cols-2 gap-space-xs">
            <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface font-semibold">HFCS</span>
              <span class="font-body-sm text-body-sm text-outline text-[11px]">High-fructose corn syrup</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface font-semibold">Maltodekstrin</span>
              <span class="font-body-sm text-body-sm text-outline text-[11px]">GI rating 110 (Tinggi)</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface font-semibold">Sirup Glukosa</span>
              <span class="font-body-sm text-body-sm text-outline text-[11px]">Pemanis cair instan</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface font-semibold">Gula Aren Pekat</span>
              <span class="font-body-sm text-body-sm text-outline text-[11px]">Kadar sukrosa tinggi</span>
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
import type { ConsumptionLogItem, Product, DrinkStatus } from '~/types/sugar'

const {
  user,
  logs,
  products,
  telemetry,
  dailyGoal,
  totalSugarToday,
  addedSugarToday,
  naturalSugarToday,
  remainingSugarToday,
  percentageUsed,
  dailyDrinkStatus,
  hiddenSugarCount,
  weeklyAverage,
  daysUnderTarget,
  addLog,
  deleteLog
} = useSugarTracker()

const modalOpen = ref(false)
const editingItem = ref<ConsumptionLogItem | null>(null)
const searchQuery = ref('')
const showSearchResults = ref(false)

// Dynamic greeting based on user time
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
})

const contextualMessage = computed(() => {
  if (dailyDrinkStatus.value === 'Melebihi Target') {
    return 'Batas konsumsi gula harian dari minuman telah terlampaui. Disarankan memilih air mineral untuk sisa hari ini.'
  }
  if (dailyDrinkStatus.value === 'Waspada') {
    return 'Asupan gula dari minuman mendekati batas target. Prioritaskan minuman tanpa pemanis tambahan.'
  }
  return 'Asupan gula dari minuman Anda hari ini terkontrol dengan baik di batas aman.'
})

const statusBadgeClass = computed(() => {
  if (dailyDrinkStatus.value === 'Melebihi Target') return 'bg-error-container text-on-error-container'
  if (dailyDrinkStatus.value === 'Waspada') return 'bg-amber-100 text-amber-900'
  return 'bg-secondary-container text-on-secondary-fixed'
})

const statusDotClass = computed(() => {
  if (dailyDrinkStatus.value === 'Melebihi Target') return 'bg-error'
  if (dailyDrinkStatus.value === 'Waspada') return 'bg-amber-600'
  return 'bg-primary'
})

// Circular Gauge Calculations (circumference 2 * PI * 66 = 414.69)
const circumference = 414.69
const gaugeDashoffset = computed(() => {
  const fraction = Math.min(1, Math.max(0, totalSugarToday.value / dailyGoal.value))
  return circumference - (circumference * fraction)
})

const gaugeStrokeColor = computed(() => {
  if (percentageUsed.value > 100) return '#dc2626'
  if (percentageUsed.value > 80) return '#f59e0b'
  return '#15803d'
})

// Komposisi gula minuman
const addedPercentage = computed(() => {
  if (totalSugarToday.value === 0) return 0
  return Math.round((addedSugarToday.value / totalSugarToday.value) * 100)
})

const naturalPercentage = computed(() => {
  if (totalSugarToday.value === 0) return 0
  return 100 - addedPercentage.value
})

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

// Pencarian produk minuman cepat
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.brand.toLowerCase().includes(q) || 
    p.barcode.includes(q)
  )
})

const selectProductFromSearch = (product: Product) => {
  const vol = product.packageVolumeMl || 250
  addLog({
    name: product.name,
    brand: product.brand,
    volumeMl: vol,
    packageVolumeMl: vol,
    sugarPer100ml: product.sugarPer100ml,
    sugarPerServing: product.sugarPerServing,
    sugarGrams: product.totalSugarsG,
    addedSugarGrams: product.addedSugarsG,
    naturalSugarGrams: product.naturalSugarsG,
    servingSize: product.servingSize,
    servingsConsumed: 1,
    calculationBasis: product.sugarPer100ml !== undefined ? 'per_100ml' : 'per_serving',
    drinkSession: 'Siang',
    mealSession: 'Siang',
    glycemicStatus: product.glycemicStatus,
    status: product.totalSugarsG > 25 ? 'Melebihi Target' : (product.totalSugarsG > 12 ? 'Waspada' : 'Aman'),
    hasHiddenSugars: product.hiddenSugarsDetected.length > 0,
    hiddenSugarIngredients: product.hiddenSugarsDetected,
    barcode: product.barcode,
    loggedAt: new Date().toISOString(),
    icon: 'local_cafe'
  })
  searchQuery.value = ''
  showSearchResults.value = false
}

const openManualModal = (item: ConsumptionLogItem | null) => {
  editingItem.value = item
  modalOpen.value = true
}
</script>
