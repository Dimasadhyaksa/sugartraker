import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import { useSugarTracker } from './useSugarTracker'

export const useAuth = () => {
  const supabase = useSupabase()
  const { client, authUser, authSession, isAuthReady, isConfigured, setAuthSession } = supabase
  const { updateUserProfile, refreshFromSupabase } = useSugarTracker()

  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(authUser.value))
  const user = computed(() => authUser.value)

  /**
   * Helper format pesan error Supabase ke Bahasa Indonesia yang jelas
   */
  const formatAuthError = (errMessage: string): string => {
    const msg = (errMessage || '').toLowerCase()
    if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
      return 'Email belum dikonfirmasi! Di Supabase, opsi "Confirm email" aktif secara default. Silakan buka kotak masuk email Anda untuk konfirmasi, ATAU buka Dashboard Supabase (Authentication -> Providers -> Email -> matikan "Confirm email") agar user baru dapat langsung login.'
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      return 'Email atau kata sandi tidak valid. Pastikan email terdaftar dan kata sandi benar.'
    }
    if (msg.includes('user already registered') || msg.includes('already registered')) {
      return 'Email ini sudah terdaftar. Silakan pilih tab "Masuk" menggunakan kata sandi Anda.'
    }
    if (msg.includes('password should be at least')) {
      return 'Kata sandi minimal 6 karakter.'
    }
    if (msg.includes('signup requires a valid password')) {
      return 'Kata sandi tidak boleh kosong.'
    }
    return errMessage || 'Terjadi kesalahan pada proses autentikasi'
  }

  /**
   * Register with email and password
   */
  const register = async (email: string, password: string, fullName: string, dailyGoalG = 50) => {
    errorMessage.value = null
    successMessage.value = null
    isLoading.value = true

    const cleanEmail = email.trim()
    const cleanName = fullName.trim()

    // 1. Mode Supabase Terhubung
    if (isConfigured && client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              daily_goal_g: dailyGoalG
            }
          }
        })

        if (error) {
          const formatted = formatAuthError(error.message)
          errorMessage.value = formatted
          return { success: false, error: formatted }
        }

        // Cek apakah Supabase memerlukan konfirmasi email
        if (data.user && !data.session) {
          successMessage.value = 'Pendaftaran berhasil! Akun Anda memerlukan konfirmasi email sebelum dapat login. Silakan periksa inbox email Anda, atau matikan "Confirm email" di Dashboard Supabase.'
          return { success: true, requiresEmailConfirmation: true, data }
        }

        // Sesi aktif langsung (Confirm email dimatikan di Supabase)
        if (data.session) {
          setAuthSession(data.session)

          // Pastikan baris profil dibuat di tabel profiles
          try {
            await client.from('profiles').upsert({
              id: data.user!.id,
              email: cleanEmail,
              full_name: cleanName,
              daily_sugar_target: dailyGoalG
            })
          } catch (e) {
            console.warn('[useAuth] Profile auto-upsert error:', e)
          }

          await updateUserProfile({
            email: cleanEmail,
            fullName: cleanName,
            dailyGoalG
          })

          await refreshFromSupabase()
          successMessage.value = 'Pendaftaran berhasil!'
          return { success: true, requiresEmailConfirmation: false, data }
        }

        return { success: true, requiresEmailConfirmation: false, data }
      } catch (err: any) {
        const formatted = formatAuthError(err.message)
        errorMessage.value = formatted
        return { success: false, error: formatted }
      } finally {
        isLoading.value = false
      }
    }

    // 2. Mode Simulasi / Data Lokal
    await new Promise(resolve => setTimeout(resolve, 500))
    await updateUserProfile({
      email: cleanEmail,
      fullName: cleanName || 'Pengguna Baru',
      dailyGoalG
    })
    successMessage.value = 'Simulasi registrasi berhasil! Masuk ke sistem...'
    isLoading.value = false
    return { 
      success: true, 
      requiresEmailConfirmation: false, 
      data: { user: { id: `mock-${Date.now()}`, email: cleanEmail }, session: null } 
    }
  }

  /**
   * Log in with email and password
   */
  const login = async (email: string, password: string) => {
    errorMessage.value = null
    successMessage.value = null
    isLoading.value = true

    const cleanEmail = email.trim()

    // 1. Mode Supabase Terhubung
    if (isConfigured && client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password
        })

        if (error) {
          const formatted = formatAuthError(error.message)
          errorMessage.value = formatted
          return { success: false, error: formatted }
        }

        if (data.session) {
          setAuthSession(data.session)

          // Ambil nama dari user metadata atau profil
          const metaName = data.user?.user_metadata?.full_name || cleanEmail.split('@')[0]
          await updateUserProfile({
            email: cleanEmail,
            fullName: metaName
          })

          await refreshFromSupabase()
        }

        successMessage.value = 'Berhasil masuk ke SugarTracker!'
        return { success: true, data }
      } catch (err: any) {
        const formatted = formatAuthError(err.message)
        errorMessage.value = formatted
        return { success: false, error: formatted }
      } finally {
        isLoading.value = false
      }
    }

    // 2. Mode Simulasi / Data Lokal
    await new Promise(resolve => setTimeout(resolve, 400))
    await updateUserProfile({
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0] || 'Pengguna'
    })
    successMessage.value = 'Berhasil masuk dalam mode simulasi!'
    isLoading.value = false
    return { 
      success: true, 
      data: { user: { id: `mock-${Date.now()}`, email: cleanEmail }, session: null } 
    }
  }

  /**
   * Log out current session
   */
  const logout = async () => {
    errorMessage.value = null
    isLoading.value = true

    if (client) {
      try {
        await client.auth.signOut()
      } catch (err: any) {
        console.warn('[useAuth] SignOut error:', err)
      }
    }

    setAuthSession(null)
    isLoading.value = false
    navigateTo('/login')
  }

  return {
    user,
    authSession,
    isAuthenticated,
    isAuthReady,
    isConfigured,
    isLoading,
    errorMessage,
    successMessage,
    formatAuthError,
    register,
    login,
    logout
  }
}
