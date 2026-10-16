<template>
  <div class="min-h-[85vh] flex items-center justify-center py-space-xl">
    <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm border border-surface-variant flex flex-col">
      <!-- Brand Header -->
      <div class="flex flex-col items-center text-center mb-space-lg">
        <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-3 shadow-sm">
          <span class="material-symbols-outlined text-[28px]">water_bottle</span>
        </div>
        <h1 class="font-headline-md text-headline-md font-bold text-on-surface">
          {{ isRegister ? 'Daftar Akun SugarTracker' : 'Masuk ke SugarTracker' }}
        </h1>
        <p class="font-body-sm text-body-sm text-tertiary mt-1">
          {{ isRegister 
            ? 'Buat akun untuk melacak asupan gula dari minuman dan memantau batas target harian Anda.' 
            : 'Masuk dengan akun Anda untuk melihat catatan konsumsi minuman harian.' }}
        </p>
      </div>

      <!-- Backend Connection Status Pill -->
      <div 
        class="mb-space-md p-space-sm rounded-lg flex items-center gap-2 text-xs" 
        :class="isConfigured ? 'bg-secondary-container/60 text-on-secondary-fixed' : 'bg-surface-container-low text-tertiary'"
      >
        <span class="material-symbols-outlined text-[16px]" :class="isConfigured ? 'text-primary' : 'text-outline'">
          {{ isConfigured ? 'database' : 'developer_mode' }}
        </span>
        <span>
          {{ isConfigured ? 'Terhubung ke Database Supabase' : 'Mode Data Lokal / Demo (Dapat langsung digunakan)' }}
        </span>
      </div>

      <!-- Tab Switcher: Masuk vs Daftar -->
      <div class="grid grid-cols-2 p-1 rounded-lg bg-surface-container-low mb-space-lg">
        <button 
          type="button" 
          class="py-2 text-center text-xs font-semibold rounded-md transition-all"
          :class="!isRegister ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-outline hover:text-on-surface'"
          @click="switchToLogin"
        >
          Masuk
        </button>
        <button 
          type="button" 
          class="py-2 text-center text-xs font-semibold rounded-md transition-all"
          :class="isRegister ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-outline hover:text-on-surface'"
          @click="switchToRegister"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Error Message Banner -->
      <div 
        v-if="errorMessage" 
        class="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container text-xs flex items-start gap-2 leading-relaxed"
      >
        <span class="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">error</span>
        <div class="flex flex-col">
          <span class="font-semibold">{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Success Message Banner -->
      <div 
        v-if="successMessage" 
        class="mb-space-md p-space-sm rounded-lg bg-secondary-container text-on-secondary-fixed text-xs flex items-start gap-2 leading-relaxed"
      >
        <span class="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
        <div class="flex flex-col">
          <span>{{ successMessage }}</span>
        </div>
      </div>

      <!-- Form Autentikasi -->
      <form class="flex flex-col gap-space-md" @submit.prevent="handleFormSubmit">
        <!-- Field Nama (Khusus Daftar) -->
        <div v-if="isRegister" class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Nama Lengkap *</label>
          <input 
            v-model="fullName"
            type="text" 
            required 
            placeholder="Contoh: Dimas Setiawan"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none"
          />
        </div>

        <!-- Field Email -->
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Alamat Email *</label>
          <input 
            v-model="email"
            type="email" 
            required 
            placeholder="nama@email.com"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none"
          />
        </div>

        <!-- Field Kata Sandi -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label class="font-label-sm text-label-sm text-on-surface font-semibold">Kata Sandi *</label>
            <span v-if="isRegister" class="text-[11px] text-tertiary">Minimal 6 karakter</span>
          </div>
          <input 
            v-model="password"
            type="password" 
            required 
            minlength="6"
            placeholder="Masukkan kata sandi"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none"
          />
        </div>

        <!-- Field Konfirmasi Kata Sandi (Khusus Daftar) -->
        <div v-if="isRegister" class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Ulangi Kata Sandi *</label>
          <input 
            v-model="confirmPassword"
            type="password" 
            required 
            minlength="6"
            placeholder="Ketik ulang kata sandi"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none"
          />
        </div>

        <!-- Field Target Gula (Khusus Daftar) -->
        <div v-if="isRegister" class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Batas Target Gula Harian (Standar 50g)</label>
          <div class="flex items-center gap-2">
            <input 
              v-model.number="dailyGoalInput"
              type="number" 
              min="10" 
              max="150"
              class="w-28 px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none tabular-nums font-bold text-primary"
            />
            <span class="text-xs text-outline">gram per hari</span>
          </div>
        </div>

        <!-- Tombol Aksi Utama -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full mt-space-sm py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-label-md text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="isLoading" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>{{ isRegister ? 'Daftar Akun Baru' : 'Masuk Sekarang' }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-space-lg flex items-center justify-center">
        <div class="border-t border-surface-variant w-full"></div>
        <span class="bg-surface-container-lowest px-3 text-[11px] text-outline uppercase font-semibold tracking-wider absolute">
          Atau
        </span>
      </div>

      <!-- Akses Mode Tamu (Tanpa Login) -->
      <button 
        type="button" 
        class="w-full py-2.5 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        @click="continueAsGuest"
      >
        <span class="material-symbols-outlined text-[16px] text-primary">person</span>
        <span>Lanjutkan sebagai Tamu (Mode Cepat)</span>
      </button>

      <!-- Petunjuk Supabase Email Confirmation jika Pengembang -->
      <div class="mt-4 p-2.5 rounded-lg bg-surface-container-low text-[11px] text-tertiary flex items-start gap-2">
        <span class="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">info</span>
        <span>
          Catatan: Jika setelah mendaftar muncul pesan "Email belum dikonfirmasi", nonaktifkan toggle <strong>Confirm email</strong> di Dashboard Supabase (<em>Authentication &gt; Providers &gt; Email</em>) agar pengguna dapat langsung masuk.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isRegister = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const dailyGoalInput = ref(50)

const { login, register, isLoading, errorMessage, successMessage, isConfigured } = useAuth()
const { updateUserProfile } = useSugarTracker()

const switchToLogin = () => {
  isRegister.value = false
  errorMessage.value = null
  successMessage.value = null
}

const switchToRegister = () => {
  isRegister.value = true
  errorMessage.value = null
  successMessage.value = null
}

const handleFormSubmit = async () => {
  if (isRegister.value) {
    // Validasi registrasi
    if (!fullName.value.trim()) {
      errorMessage.value = 'Silakan masukkan nama lengkap Anda.'
      return
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Konfirmasi kata sandi tidak cocok. Silakan ketik ulang.'
      return
    }

    if (password.value.length < 6) {
      errorMessage.value = 'Kata sandi minimal 6 karakter.'
      return
    }

    const res = await register(email.value, password.value, fullName.value, dailyGoalInput.value)

    if (res.success) {
      if (res.requiresEmailConfirmation) {
        // Otomatis arahkan ke tab login agar mudah masuk setelah konfirmasi
        isRegister.value = false
        password.value = ''
        confirmPassword.value = ''
      } else {
        // Langsung masuk ke dashboard
        setTimeout(() => {
          navigateTo('/dashboard')
        }, 600)
      }
    }
  } else {
    // Proses Login
    if (!email.value.trim() || !password.value) {
      errorMessage.value = 'Silakan masukkan email dan kata sandi Anda.'
      return
    }

    const res = await login(email.value, password.value)

    if (res.success) {
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 500)
    }
  }
}

const continueAsGuest = () => {
  updateUserProfile({
    email: 'tamu@sugartracker.local',
    fullName: 'Pengguna Tamu',
    dailyGoalG: 50
  })
  navigateTo('/dashboard')
}
</script>
