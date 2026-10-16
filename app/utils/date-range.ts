/**
 * Date Range & Formatting Utilities for Drink Intake Tracking
 */

const ID_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const ID_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

/**
 * Format a Date object to YYYY-MM-DD local string
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get Indonesian abbreviated day name ('Sen', 'Sel', etc.)
 */
export function getIndonesianDayName(date: Date): string {
  return ID_DAYS[date.getDay()]
}

/**
 * Check if a date string or Date object corresponds to today
 */
export function isDateToday(dateOrString: Date | string): boolean {
  const targetKey = typeof dateOrString === 'string'
    ? dateOrString.slice(0, 10)
    : formatDateKey(dateOrString)
  return targetKey === formatDateKey(new Date())
}

/**
 * Generate 7 days rolling window ending at today
 */
export function getLast7DaysRange(): Array<{
  dateString: string
  dayName: string
  isToday: boolean
}> {
  const result = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateString = formatDateKey(d)
    result.push({
      dateString,
      dayName: getIndonesianDayName(d),
      isToday: i === 0
    })
  }

  return result
}

/**
 * Format timestamp to readable time string (e.g. "14:30")
 */
export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString)
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  } catch {
    return '--:--'
  }
}

/**
 * Format timestamp to readable date string (e.g. "15 Okt 2026, 14:30")
 */
export function formatDateTimeIndo(isoString: string): string {
  try {
    const d = new Date(isoString)
    const day = d.getDate()
    const month = ID_MONTHS[d.getMonth()]
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hours}:${mins}`
  } catch {
    return isoString
  }
}

