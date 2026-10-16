/**
 * User Profile Types
 * Focused strictly on user identification and daily sugar monitoring target
 */

export interface UserProfile {
  id: string
  email: string
  fullName: string
  dailyGoalG: number // Target gula harian dalam gram (default: 50g WHO atau 25g batas ketat)
  avatarUrl?: string
  createdAt?: string
  isOnboardingCompleted?: boolean
}

export interface ProfileUpdateInput {
  fullName?: string
  dailyGoalG?: number
  avatarUrl?: string
}

