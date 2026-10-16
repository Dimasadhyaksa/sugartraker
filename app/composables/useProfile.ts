import { ref, computed } from 'vue'
import type { UserProfile, ProfileUpdateInput } from '~/types/profile'
import { useSupabase } from './useSupabase'

const defaultProfile: UserProfile = {
  id: 'usr-default',
  email: 'pengguna@sugartracker.app',
  fullName: 'Pengguna SugarTracker',
  dailyGoalG: 50,
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  isOnboardingCompleted: false
}

const currentProfile = ref<UserProfile>({ ...defaultProfile })
const isProfileLoading = ref<boolean>(false)

export const useProfile = () => {
  const { client, authUser, isConfigured } = useSupabase()

  /**
   * Fetch profile from Supabase profiles table
   */
  const loadProfile = async (userId?: string): Promise<UserProfile> => {
    const targetId = userId || authUser.value?.id
    if (!targetId || !isConfigured || !client) {
      return currentProfile.value
    }

    isProfileLoading.value = true
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle()

      if (error) {
        console.warn('[useProfile] Could not fetch profile from Supabase:', error.message)
        return currentProfile.value
      }

      if (data) {
        currentProfile.value = {
          id: data.id,
          email: data.email || authUser.value?.email || currentProfile.value.email,
          fullName: data.full_name || authUser.value?.user_metadata?.full_name || 'Pengguna',
          dailyGoalG: Number(data.daily_sugar_target) || 50,
          avatarUrl: data.avatar_url || currentProfile.value.avatarUrl,
          createdAt: data.created_at,
          isOnboardingCompleted: Boolean(data.full_name && data.daily_sugar_target)
        }
      } else {
        // Fallback for new user whose profile row isn't yet created
        currentProfile.value = {
          id: targetId,
          email: authUser.value?.email || 'user@example.com',
          fullName: authUser.value?.user_metadata?.full_name || 'Pengguna Baru',
          dailyGoalG: 50,
          avatarUrl: defaultProfile.avatarUrl,
          isOnboardingCompleted: false
        }
      }
    } catch (err) {
      console.warn('[useProfile] Exception loading profile:', err)
    } finally {
      isProfileLoading.value = false
    }

    return currentProfile.value
  }

  /**
   * Update or upsert profile in Supabase profiles table
   */
  const saveProfile = async (updates: ProfileUpdateInput): Promise<boolean> => {
    const targetId = authUser.value?.id || currentProfile.value.id
    isProfileLoading.value = true

    // Optimistic local update
    if (updates.fullName !== undefined) currentProfile.value.fullName = updates.fullName
    if (updates.dailyGoalG !== undefined) currentProfile.value.dailyGoalG = updates.dailyGoalG
    if (updates.avatarUrl !== undefined) currentProfile.value.avatarUrl = updates.avatarUrl
    currentProfile.value.isOnboardingCompleted = true

    if (!isConfigured || !client || !authUser.value?.id) {
      isProfileLoading.value = false
      return true
    }

    try {
      const payload = {
        id: targetId,
        full_name: currentProfile.value.fullName,
        email: authUser.value.email || null,
        daily_sugar_target: currentProfile.value.dailyGoalG,
        avatar_url: currentProfile.value.avatarUrl || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await client.from('profiles').upsert(payload)
      if (error) {
        console.warn('[useProfile] Failed to upsert profiles table:', error.message)
        return false
      }
      return true
    } catch (err) {
      console.warn('[useProfile] Exception saving profile:', err)
      return false
    } finally {
      isProfileLoading.value = false
    }
  }

  return {
    profile: currentProfile,
    isProfileLoading,
    dailyGoalG: computed(() => currentProfile.value.dailyGoalG),
    fullName: computed(() => currentProfile.value.fullName),
    isOnboardingCompleted: computed(() => currentProfile.value.isOnboardingCompleted),
    loadProfile,
    saveProfile
  }
}

