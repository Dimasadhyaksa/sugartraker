<template>
  <div>
    <h2 class="text-xl font-bold font-headline text-on-surface mb-2">Buat Akun Baru</h2>
    <p class="text-sm text-tertiary mb-6">Mulai pantau konsumsi gula harian Anda dengan SugarTracker.</p>

    <!-- Error Alert -->
    <div 
      v-if="errorMessage" 
      class="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm flex items-start gap-2"
    >
      <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Success Alert -->
    <div 
      v-if="successMessage" 
      class="mb-4 p-3 rounded-lg bg-secondary-container text-on-secondary-fixed text-sm flex items-start gap-2"
    >
      <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
      <span>{{ successMessage }}</span>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label for="fullName" class="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
          Nama Lengkap
        </label>
        <input
          id="fullName"
          v-model="fullName"
          type="text"
          required
          placeholder="Contoh: Sarah Jenkins"
          class="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
        />
      </div>

      <div>
        <label for="email" class="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
          Alamat Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="nama@email.com"
          class="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
        />
      </div>

      <div>
        <label for="password" class="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
          Kata Sandi
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="6"
          placeholder="Minimal 6 karakter"
          class="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
        />
      </div>

      <div>
        <label for="confirmPassword" class="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
          Konfirmasi Kata Sandi
        </label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          placeholder="Ulangi kata sandi"
          class="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span v-if="isLoading" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        <span>{{ isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}</span>
      </button>
    </form>

    <div class="mt-6 pt-5 border-t border-outline-variant/30 text-center">
      <p class="text-xs text-tertiary">
        Sudah memiliki akun?
        <NuxtLink to="/login" class="text-primary hover:underline font-semibold ml-1">
          Masuk di sini
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { register, isLoading } = useAuth()
const { saveProfile } = useProfile()

const handleRegister = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Kata sandi minimal 6 karakter'
    return
  }

  const res = await register(email.value, password.value, fullName.value)

  if (res.success) {
    if (res.data?.session) {
      await saveProfile({
        fullName: fullName.value,
        dailyGoalG: 50
      })
      navigateTo('/dashboard')
    } else {
      successMessage.value = 'Pendaftaran akun berhasil! Silakan periksa email Anda untuk mengonfirmasi akun sebelum masuk, atau matikan "Confirm email" di Dashboard Supabase.'
      setTimeout(() => {
        navigateTo('/login')
      }, 2500)
    }
  } else {
    errorMessage.value = res.error || 'Terjadi kesalahan saat pendaftaran'
  }
}
</script>

