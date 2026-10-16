<template>
  <div class="max-w-2xl mx-auto py-space-xl px-4 sm:px-6">
    <!-- Progress Indicator -->
    <div class="mb-space-lg bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30">
      <div class="flex items-center justify-between mb-2">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
          Langkah {{ step }} dari 2: {{ step === 1 ? 'Profil Pengguna' : 'Target Gula Harian' }}
        </span>
        <span class="text-xs font-bold text-primary">{{ step === 1 ? '50%' : '100%' }} Selesai</span>
      </div>
      <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
        <div 
          class="h-full bg-primary transition-all duration-300"
          :style="{ width: `${(step / 2) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Onboarding Card -->
    <div class="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col">
      <!-- Error Alert -->
      <div 
        v-if="errorMessage" 
        class="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[16px]">error</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Step 1: User Profile & Name -->
      <div v-if="step === 1" class="flex flex-col gap-space-lg">
        <div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
            Langkah 1
          </span>
          <h2 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-2">
            Selamat Datang di SugarTracker
          </h2>
          <p class="font-body-md text-body-md text-tertiary mt-1">
            Mulai kenali diri Anda dan pantau asupan gula dari setiap minuman yang Anda konsumsi setiap hari.
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
              Nama Lengkap / Panggilan
            </label>
            <input 
              v-model="fullName"
              type="text" 
              required 
              placeholder="Contoh: Sarah Jenkins"
              class="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
            />
          </div>

          <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
            <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
            <div class="text-xs text-tertiary leading-relaxed">
              <strong class="text-on-surface font-semibold">Catatan Penting:</strong> 
              SugarTracker dirancang khusus untuk memantau konsumsi gula dari minuman harian. Aplikasi ini tidak memberikan diagnosis medis atau pengobatan klinis.
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Target Gula Harian -->
      <div v-else-if="step === 2" class="flex flex-col gap-space-lg">
        <div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
            Langkah 2
          </span>
          <h2 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-2">
            Tentukan Target Gula Harian Anda
          </h2>
          <p class="font-body-md text-body-md text-tertiary mt-1">
            Target ini adalah batas pemantauan pribadi Anda dalam aplikasi untuk menjaga asupan minuman manis tetap seimbang.
          </p>
        </div>

        <!-- Slider & Custom Number Input -->
        <div class="p-space-lg rounded-xl bg-surface-container-low flex flex-col gap-space-md">
          <div class="flex items-center justify-between">
            <span class="font-label-md text-label-md font-semibold text-on-surface">Batas Target Harian</span>
            <div class="flex items-baseline gap-1.5">
              <input 
                v-model.number="dailyTargetInput"
                type="number"
                min="5"
                max="150"
                class="w-20 px-2 py-1 text-right font-bold text-lg rounded bg-surface border border-outline-variant text-primary focus:outline-none focus:border-primary"
              />
              <span class="text-xs font-semibold text-outline">gram / hari</span>
            </div>
          </div>

          <input 
            v-model.number="dailyTargetInput"
            type="range" 
            min="10" 
            max="100" 
            step="5"
            class="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer"
          />

          <div class="flex justify-between text-xs text-outline font-medium">
            <span>Ketat (25g)</span>
            <span class="text-primary font-bold">Standar Umum (50g)</span>
            <span>Toleransi Lebih (75g+)</span>
          </div>
        </div>

        <!-- Quick Reference Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div 
            class="p-space-md rounded-xl border transition-all cursor-pointer"
            :class="dailyTargetInput === 50 ? 'border-primary bg-secondary-container/20 ring-2 ring-primary/20' : 'border-outline-variant/40 bg-surface-container-lowest'"
            @click="dailyTargetInput = 50"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-primary text-[20px]">recommend</span>
              <span class="font-label-md text-sm font-bold text-on-surface">50 Gram / Hari</span>
            </div>
            <p class="font-body-sm text-xs text-outline">Batas rekomendasi umum konsumsi gula harian orang dewasa.</p>
          </div>

          <div 
            class="p-space-md rounded-xl border transition-all cursor-pointer"
            :class="dailyTargetInput === 25 ? 'border-primary bg-secondary-container/20 ring-2 ring-primary/20' : 'border-outline-variant/40 bg-surface-container-lowest'"
            @click="dailyTargetInput = 25"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-primary text-[20px]">shield</span>
              <span class="font-label-md text-sm font-bold text-on-surface">25 Gram / Hari</span>
            </div>
            <p class="font-body-sm text-xs text-outline">Batas ketat untuk menjaga kestabilan energi dan metabolisme.</p>
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="flex items-center justify-between pt-space-lg mt-space-lg border-t border-outline-variant/30">
        <button 
          v-if="step > 1"
          type="button" 
          class="px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-variant font-label-md text-sm transition-colors"
          @click="step--"
        >
          Kembali
        </button>
        <div v-else></div>

        <button 
          type="button" 
          :disabled="isSubmitting"
          class="px-space-xl py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-label-md text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          @click="handleNext"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>{{ step === 2 ? 'Selesai & Buka Dashboard' : 'Lanjutkan' }}</span>
          <span v-if="!isSubmitting" class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const step = ref(1)
const fullName = ref('')
const dailyTargetInput = ref(50)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const { profile, saveProfile } = useProfile()
const { updateUserProfile } = useSugarTracker()

onMounted(() => {
  if (profile.value?.fullName) {
    fullName.value = profile.value.fullName
  }
  if (profile.value?.dailyGoalG) {
    dailyTargetInput.value = profile.value.dailyGoalG
  }
})

const handleNext = async () => {
  errorMessage.value = null

  if (step.value === 1) {
    if (!fullName.value.trim()) {
      errorMessage.value = 'Silakan masukkan nama Anda terlebih dahulu'
      return
    }
    step.value = 2
  } else {
    // Validate target
    if (!dailyTargetInput.value || dailyTargetInput.value <= 0) {
      errorMessage.value = 'Target gula harian harus berupa angka positif (> 0 gram)'
      return
    }

    isSubmitting.value = true
    try {
      await saveProfile({
        fullName: fullName.value.trim(),
        dailyGoalG: Number(dailyTargetInput.value)
      })

      // Also update facade state
      await updateUserProfile({
        fullName: fullName.value.trim(),
        dailyGoalG: Number(dailyTargetInput.value)
      })

      navigateTo('/dashboard')
    } catch (err: any) {
      errorMessage.value = err.message || 'Gagal menyimpan target profil'
    } finally {
      isSubmitting.value = false
    }
  }
}
</script>
