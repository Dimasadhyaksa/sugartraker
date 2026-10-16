<template>
  <div class="flex flex-col w-full max-w-5xl mx-auto gap-space-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
      <div class="flex flex-col">
        <div class="flex items-center gap-space-xs mb-1">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
            Wawasan Mingguan
          </span>
        </div>
        <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">Weekly Drink Insights</h1>
        <p class="font-body-md text-xs sm:text-sm text-tertiary">
          Evaluasi akumulasi gula dari minuman selama tujuh hari terakhir dibandingkan dengan target harian Anda.
        </p>
      </div>

      <button 
        type="button" 
        class="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold transition-colors self-start sm:self-auto"
        @click="exportSummary"
      >
        <span class="material-symbols-outlined text-[18px]">download</span>
        <span>Unduh Ringkasan</span>
      </button>
    </div>

    <!-- 4 KPI Metrics Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
      <!-- Rata-rata Konsumsi Harian -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Rata-Rata Harian</span>
          <span class="material-symbols-outlined text-primary text-[18px]">analytics</span>
        </div>
        <div class="font-stat-value text-2xl font-bold text-on-surface mt-1 tabular-nums">{{ weeklyAverage }}g</div>
        <span class="text-xs text-outline mt-1 block">Target: ≤ {{ dailyGoal }}g / hari</span>
      </div>

      <!-- Hari di Bawah Target -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Di Bawah Target</span>
          <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
        </div>
        <div class="font-stat-value text-2xl font-bold text-primary mt-1 tabular-nums">{{ daysUnderTarget }} / 7 Hari</div>
        <span class="text-xs text-primary font-semibold mt-1 block">Berhasil memenuhi target</span>
      </div>

      <!-- Hari Melebihi Target -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Melebihi Target</span>
          <span class="material-symbols-outlined text-error text-[18px]">warning</span>
        </div>
        <div class="font-stat-value text-2xl font-bold text-error mt-1 tabular-nums">{{ daysOverTarget }} Hari</div>
        <span class="text-xs text-error font-medium mt-1 block">Konsumsi gula &gt; {{ dailyGoal }}g</span>
      </div>

      <!-- Total Gula Hari Ini -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-variant shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-outline uppercase tracking-wider">Gula Hari Ini</span>
          <span class="material-symbols-outlined text-outline text-[18px]">local_cafe</span>
        </div>
        <div class="font-stat-value text-2xl font-bold text-on-surface mt-1 tabular-nums">{{ totalSugarToday }}g</div>
        <span class="text-xs font-semibold mt-1 block" :class="percentageUsed > 100 ? 'text-error' : 'text-primary'">
          {{ percentageUsed }}% dari target
        </span>
      </div>
    </div>

    <!-- Grafik Konsumsi Gula dari Minuman Selama Tujuh Hari -->
    <div class="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl border border-surface-variant shadow-sm flex flex-col">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md mb-space-md border-b border-surface-variant/40 gap-2">
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-outline">Grafik 7 Hari</span>
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
            Tren Asupan Gula dari Minuman vs Target Harian
          </h2>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5 text-outline">
            <span class="w-2.5 h-2.5 rounded-sm bg-primary-container"></span>
            Gula Minuman (gram)
          </span>
          <span class="flex items-center gap-1.5 text-outline">
            <span class="w-4 h-0.5 border-t border-dashed border-outline-variant"></span>
            Target {{ dailyGoal }}g / Hari
          </span>
        </div>
      </div>

      <!-- Extended Chart Grid -->
      <div class="w-full bg-surface-container-low rounded-xl p-space-lg">
        <div class="relative h-60 w-full flex items-end justify-around pt-8 pb-3 px-2">
          <!-- Target Baseline Dashed Line -->
          <div class="absolute left-0 right-0 top-8 border-b border-dashed border-outline-variant/90 z-0">
            <span class="absolute -top-3.5 right-3 font-label-sm text-[10px] text-outline font-semibold uppercase tracking-wider">
              Batas Target {{ dailyGoal }}g
            </span>
          </div>

          <!-- Day Columns -->
          <div 
            v-for="day in telemetry" 
            :key="day.dayName + day.dateString"
            class="flex flex-col items-center gap-2 h-full justify-end z-10 w-12 group"
          >
            <!-- Value Hover Badge -->
            <span 
              class="font-label-sm text-[11px] font-bold transition-all tabular-nums"
              :class="day.isToday ? 'text-primary' : 'text-tertiary opacity-0 group-hover:opacity-100'"
            >
              {{ day.sugarG > 0 ? `${day.sugarG}g` : '0g' }}
            </span>

            <!-- Column Bar -->
            <div 
              class="w-full rounded-t-md transition-all duration-300 relative group-hover:scale-105"
              :class="[
                day.isToday 
                  ? 'bg-primary-container shadow-md' 
                  : day.sugarG > dailyGoal 
                    ? 'bg-error-container' 
                    : day.sugarG > 0 ? 'bg-secondary-fixed group-hover:bg-primary' : 'bg-surface-variant'
              ]"
              :style="{ height: `${Math.min(100, Math.max(6, (day.sugarG / dailyGoal) * 85))}%` }"
            ></div>

            <div class="flex flex-col items-center">
              <span class="font-label-sm text-xs font-semibold" :class="day.isToday ? 'text-primary font-bold' : 'text-on-surface'">
                {{ day.dayName }}
              </span>
              <span class="text-[10px] text-outline font-mono">{{ formatDateShort(day.dateString) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabel Rincian Total Gula dari Minuman per Hari -->
    <div class="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-variant shadow-sm flex flex-col">
      <div class="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-variant/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">table_chart</span>
          <h3 class="font-headline-sm text-sm font-bold text-on-surface">Rincian Total Gula dari Minuman per Hari</h3>
        </div>
        <span class="text-xs text-outline">Periode: 7 Hari Terakhir</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-surface-variant text-outline uppercase tracking-wider font-semibold">
              <th class="py-2.5 px-3">Hari &amp; Tanggal</th>
              <th class="py-2.5 px-3 text-right">Total Gula Minuman</th>
              <th class="py-2.5 px-3 text-right">Target Harian</th>
              <th class="py-2.5 px-3 text-right">Selisih</th>
              <th class="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-variant/50">
            <tr 
              v-for="d in telemetry" 
              :key="d.dateString"
              class="hover:bg-surface-container-low transition-colors"
              :class="d.isToday ? 'bg-secondary-container/20 font-semibold' : ''"
            >
              <td class="py-3 px-3 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="d.sugarG > dailyGoal ? 'bg-error' : 'bg-primary'"></span>
                <span>{{ d.dayName }}, {{ d.dateString }}</span>
                <span v-if="d.isToday" class="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">Hari Ini</span>
              </td>
              <td class="py-3 px-3 text-right font-bold tabular-nums text-on-surface">
                {{ d.sugarG }} g
              </td>
              <td class="py-3 px-3 text-right text-outline tabular-nums">
                {{ dailyGoal }} g
              </td>
              <td class="py-3 px-3 text-right font-mono tabular-nums" :class="d.sugarG > dailyGoal ? 'text-error font-bold' : 'text-primary'">
                {{ d.sugarG > dailyGoal ? `+${(d.sugarG - dailyGoal).toFixed(1)}g` : `-${(dailyGoal - d.sugarG).toFixed(1)}g` }}
              </td>
              <td class="py-3 px-3 text-center">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="d.sugarG > dailyGoal ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-fixed'"
                >
                  {{ d.sugarG > dailyGoal ? 'Melebihi Target' : 'Di Bawah Target' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  telemetry, 
  dailyGoal, 
  totalSugarToday, 
  percentageUsed, 
  weeklyAverage, 
  daysUnderTarget, 
  daysOverTarget 
} = useSugarTracker()

const formatDateShort = (dateStr: string) => {
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`
    return dateStr
  } catch {
    return dateStr
  }
}

const exportSummary = () => {
  alert('Menyiapkan unduhan ringkasan konsumsi gula minuman mingguan...')
}
</script>
