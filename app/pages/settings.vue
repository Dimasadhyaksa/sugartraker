<template>
  <div class="flex flex-col w-full max-w-4xl mx-auto gap-space-lg">
    <!-- Header -->
    <div class="flex flex-col">
      <div class="flex items-center gap-space-xs mb-1">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
          Pengaturan Pengguna
        </span>
      </div>
      <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">Pengaturan Profil &amp; Target</h1>
      <p class="font-body-md text-xs sm:text-sm text-tertiary">
        Kelola informasi profil pribadi, target konsumsi gula harian, dan preferensi akun Anda.
      </p>
    </div>

    <!-- Feedback Banner -->
    <div 
      v-if="feedbackMessage" 
      class="p-space-md rounded-xl text-xs flex items-center justify-between shadow-sm transition-all"
      :class="feedbackSuccess ? 'bg-secondary-container text-on-secondary-fixed border border-primary/20' : 'bg-error-container text-on-error-container border border-error/20'"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">
          {{ feedbackSuccess ? 'check_circle' : 'error' }}
        </span>
        <span>{{ feedbackMessage }}</span>
      </div>
      <button type="button" @click="feedbackMessage = null" class="text-xs font-semibold hover:opacity-80">
        Tutup
      </button>
    </div>

    <!-- Section 1: Profil Pengguna & Target Gula Harian -->
    <form class="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl border border-surface-variant shadow-sm flex flex-col gap-space-lg" @submit.prevent="handleSaveProfile">
      <div class="flex items-center justify-between pb-space-sm border-b border-surface-variant/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">person</span>
          <h2 class="font-headline-sm text-sm font-bold text-on-surface">Informasi Profil Pengguna</h2>
        </div>
        <span class="text-xs text-outline font-medium">Data Pribadi</span>
      </div>

      <!-- Avatar Preview & User Identity -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
        <img 
          :src="avatarUrl" 
          :alt="fullName" 
          class="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20 shrink-0"
        />
        <div class="flex flex-col gap-1 flex-1">
          <span class="font-bold text-on-surface text-base">{{ fullName }}</span>
          <span class="text-xs text-outline">{{ email }}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-primary font-semibold text-[11px]">
              Target Aktif: {{ dailyGoalG }}g / hari
            </span>
          </div>
        </div>
      </div>

      <!-- Form Inputs: Nama Lengkap & Email -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-on-surface">Nama Lengkap *</label>
          <input 
            v-model="fullName" 
            type="text" 
            required
            placeholder="Masukkan nama lengkap Anda"
            class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-xs border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-on-surface">Alamat Email</label>
          <input 
            v-model="email" 
            type="email" 
            disabled
            class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-xs text-outline border border-transparent cursor-not-allowed"
          />
          <span class="text-[10px] text-tertiary">Email digunakan sebagai pengenal akun utama Anda.</span>
        </div>
      </div>

      <!-- Target Gula Harian Section -->
      <div class="flex flex-col gap-2 pt-space-sm border-t border-surface-variant/40">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-on-surface">Target Gula Harian (gram per hari) *</label>
          <span class="text-[11px] text-tertiary">Panduan: 50g (Standar WHO) • 25g (AHA Ketat)</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-2">
            <input 
              v-model.number="dailyGoalG" 
              type="number" 
              min="5" 
              max="150"
              required
              class="w-32 px-3 py-2.5 rounded-lg bg-surface-container-low text-sm font-bold text-primary border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all tabular-nums"
            />
            <span class="text-xs font-semibold text-outline">gram/hari</span>
          </div>

          <!-- Quick Presets -->
          <div class="flex flex-wrap gap-1.5">
            <button 
              type="button" 
              class="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
              :class="dailyGoalG === 25 ? 'bg-primary text-on-primary border-primary font-semibold' : 'bg-surface-container text-outline hover:bg-surface-variant'"
              @click="dailyGoalG = 25"
            >
              25g (Target Ketat)
            </button>
            <button 
              type="button" 
              class="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
              :class="dailyGoalG === 50 ? 'bg-primary text-on-primary border-primary font-semibold' : 'bg-surface-container text-outline hover:bg-surface-variant'"
              @click="dailyGoalG = 50"
            >
              50g (Target Standar)
            </button>
            <button 
              type="button" 
              class="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
              :class="dailyGoalG === 75 ? 'bg-primary text-on-primary border-primary font-semibold' : 'bg-surface-container text-outline hover:bg-surface-variant'"
              @click="dailyGoalG = 75"
            >
              75g (Target Fleksibel)
            </button>
          </div>
        </div>

        <p class="text-[11px] text-outline mt-1 leading-relaxed">
          Batas target ini menjadi acuan utama pada Dashboard dan Daily Drink Tracker untuk menentukan sisa kuota gula dan status konsumsi Anda (Aman, Waspada, atau Melebihi Target).
        </p>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end pt-space-sm border-t border-surface-variant/40">
        <button 
          type="submit" 
          :disabled="isSaving"
          class="px-space-xl py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="isSaving" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Pengguna' }}</span>
        </button>
      </div>
    </form>

    <!-- Section 2: Preferensi Notifikasi & Pemantauan Pengguna -->
    <div class="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl border border-surface-variant shadow-sm flex flex-col gap-space-md">
      <div class="flex items-center gap-2 pb-space-sm border-b border-surface-variant/40">
        <span class="material-symbols-outlined text-primary text-[22px]">tune</span>
        <h2 class="font-headline-sm text-sm font-bold text-on-surface">Preferensi Pemantauan Minuman</h2>
      </div>

      <div class="flex flex-col divide-y divide-surface-variant/40">
        <!-- Toggle 1: Peringatan Ambang Batas 80% -->
        <div class="py-3 flex items-center justify-between gap-4">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-on-surface">Peringatan Ambang Batas Gula (Status Waspada)</span>
            <span class="text-[11px] text-tertiary">
              Tampilkan status 'Waspada' otomatis saat konsumsi gula minuman telah mencapai lebih dari 80% dari target harian Anda.
            </span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input v-model="prefWarningAlert" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <!-- Toggle 2: Deteksi Pemanis Tersembunyi -->
        <div class="py-3 flex items-center justify-between gap-4">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-on-surface">Deteksi Pemanis Buatan &amp; Sirup Pekat</span>
            <span class="text-[11px] text-tertiary">
              Pindai dan tandai bahan pemanis industri (seperti sirup jagung fruktosa tinggi / HFCS, maltodekstrin) saat memindai label kemasan.
            </span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input v-model="prefHiddenSugarFlag" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Section 3: Akun & Keamanan Sesi -->
    <div class="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl border border-surface-variant shadow-sm flex flex-col gap-space-md">
      <div class="flex items-center justify-between pb-space-sm border-b border-surface-variant/40">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">manage_accounts</span>
          <h2 class="font-headline-sm text-sm font-bold text-on-surface">Akun &amp; Sesi Pengguna</h2>
        </div>
        <span 
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          :class="authUser ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container text-outline'"
        >
          <span class="w-2 h-2 rounded-full" :class="authUser ? 'bg-primary' : 'bg-outline'"></span>
          <span>{{ authUser ? 'Akun Terdaftar' : 'Mode Tamu' }}</span>
        </span>
      </div>

      <!-- Jika User Login dengan Akun -->
      <div v-if="authUser" class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-semibold text-on-surface">Masuk Sebagai:</span>
          <span class="text-xs font-mono font-bold text-primary">{{ authUser.email }}</span>
          <span class="text-[11px] text-tertiary">Sesi Anda aktif dan riwayat konsumsi tersimpan aman di akun Anda.</span>
        </div>

        <button 
          type="button" 
          class="px-4 py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error-container/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
          @click="handleLogout"
        >
          <span class="material-symbols-outlined text-[16px]">logout</span>
          <span>Keluar Akun (Logout)</span>
        </button>
      </div>

      <!-- Jika User Berjalan di Mode Tamu -->
      <div v-else class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-semibold text-on-surface">Saat Ini Menggunakan Mode Tamu</span>
          <span class="text-[11px] text-tertiary">
            Data pelacakan minuman Anda tersimpan di peramban ini. Buat akun atau masuk untuk menyimpan riwayat secara permanen.
          </span>
        </div>

        <NuxtLink 
          to="/login"
          class="px-4 py-2 rounded-lg bg-primary hover:bg-surface-tint text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm self-start sm:self-auto shrink-0"
        >
          <span class="material-symbols-outlined text-[16px]">login</span>
          <span>Masuk / Buat Akun</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, updateUserProfile, authUser } = useSugarTracker()
const { saveProfile } = useProfile()
const { logout } = useAuth()

const fullName = ref(user.value.fullName)
const email = ref(user.value.email)
const dailyGoalG = ref(user.value.dailyGoalG || 50)
const avatarUrl = ref(user.value.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80')

// Preferensi pemantauan pengguna lokal
const prefWarningAlert = ref(true)
const prefHiddenSugarFlag = ref(true)

const isSaving = ref(false)
const feedbackMessage = ref<string | null>(null)
const feedbackSuccess = ref(true)

watch(user, (newUser) => {
  if (newUser) {
    fullName.value = newUser.fullName
    email.value = newUser.email
    dailyGoalG.value = newUser.dailyGoalG
    avatarUrl.value = newUser.avatarUrl || avatarUrl.value
  }
}, { deep: true })

const handleSaveProfile = async () => {
  feedbackMessage.value = null
  if (!fullName.value.trim()) {
    feedbackMessage.value = 'Nama lengkap tidak boleh kosong'
    feedbackSuccess.value = false
    return
  }

  if (!dailyGoalG.value || dailyGoalG.value <= 0) {
    feedbackMessage.value = 'Target gula harian harus berupa angka positif (> 0 gram)'
    feedbackSuccess.value = false
    return
  }

  isSaving.value = true
  try {
    await saveProfile({
      fullName: fullName.value.trim(),
      dailyGoalG: Number(dailyGoalG.value)
    })
    await updateUserProfile({
      fullName: fullName.value.trim(),
      dailyGoalG: Number(dailyGoalG.value)
    })

    feedbackSuccess.value = true
    feedbackMessage.value = 'Pengaturan profil dan target gula harian berhasil disimpan!'
  } catch (err: any) {
    feedbackSuccess.value = false
    feedbackMessage.value = err.message || 'Gagal menyimpan profil'
  } finally {
    isSaving.value = false
  }
}

const handleLogout = async () => {
  await logout()
}
</script>
