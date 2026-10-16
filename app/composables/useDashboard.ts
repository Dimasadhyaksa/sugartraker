import { computed } from 'vue'
import { useProfile } from './useProfile'
import { useDrinkLogs } from './useDrinkLogs'
import { getLast7DaysRange, formatDateKey } from '~/utils/date-range'
import type { DayTelemetry, DashboardMetrics } from '~/types/sugar'

export const useDashboard = () => {
  const { profile, dailyGoalG } = useProfile()
  const { logs, todayLogs, todaySugarSummary } = useDrinkLogs()

  // 1. Total gula yang diketahui hari ini
  const totalKnownSugarToday = computed(() => todaySugarSummary.value.totalSugarGrams)

  // 2. Target gula harian
  const dailyTarget = computed(() => dailyGoalG.value || 50)

  // 3. Persentase terhadap target
  const percentageOfTarget = computed(() => {
    if (!dailyTarget.value) return 0
    return Math.round((totalKnownSugarToday.value / dailyTarget.value) * 100)
  })

  // 4. Selisih atau sisa terhadap target (headroom)
  const remainingHeadroomG = computed(() => {
    return Math.max(0, Math.round((dailyTarget.value - totalKnownSugarToday.value) * 10) / 10)
  })

  // 5. Jumlah catatan konsumsi hari ini
  const totalLogsCountToday = computed(() => todayLogs.value.length)

  // 6. Jumlah minuman dengan gula tidak diketahui hari ini
  const unknownSugarCountToday = computed(() => todaySugarSummary.value.unknownCount)

  // 7. Status konsumsi harian
  const dailyStatus = computed<'Aman' | 'Waspada' | 'Melebihi Target'>(() => {
    const ratio = totalKnownSugarToday.value / dailyTarget.value
    if (ratio > 1.0) return 'Melebihi Target'
    if (ratio >= 0.8) return 'Waspada'
    return 'Aman'
  })

  // 8. Grafik konsumsi 7 hari terakhir berdasarkan riwayat aktual
  const sevenDaysTelemetry = computed<DayTelemetry[]>(() => {
    const daysRange = getLast7DaysRange()

    return daysRange.map(day => {
      // Filter logs for this specific day
      const dayLogs = logs.value.filter(l => l.consumedAt.startsWith(day.dateString))
      let daySugarSum = 0
      let hasUnknown = false

      dayLogs.forEach(l => {
        if (l.totalSugarGrams !== null && l.totalSugarGrams !== undefined) {
          daySugarSum += l.totalSugarGrams
        } else {
          hasUnknown = true
        }
      })

      return {
        dayName: day.dayName,
        dateString: day.dateString,
        sugarG: Math.round(daySugarSum * 10) / 10,
        targetG: dailyTarget.value,
        isToday: day.isToday,
        hasUnknownDrinks: hasUnknown
      }
    })
  })

  // 9. Dashboard high-level metrics payload
  const metrics = computed<DashboardMetrics>(() => ({
    totalSugarToday: totalKnownSugarToday.value,
    dailyTargetG: dailyTarget.value,
    percentageOfTarget: percentageOfTarget.value,
    remainingG: remainingHeadroomG.value,
    logCountToday: totalLogsCountToday.value,
    unknownCountToday: unknownSugarCountToday.value,
    status: dailyStatus.value
  }))

  return {
    profile,
    dailyTarget,
    totalKnownSugarToday,
    percentageOfTarget,
    remainingHeadroomG,
    totalLogsCountToday,
    unknownSugarCountToday,
    dailyStatus,
    todayLogs,
    sevenDaysTelemetry,
    metrics
  }
}

