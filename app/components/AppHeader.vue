<template>
  <header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-variant z-40 px-space-md lg:px-space-lg flex items-center justify-between">
    <!-- Left Section: Mobile Menu Button & Breadcrumb -->
    <div class="flex items-center gap-space-sm">
      <button 
        type="button" 
        class="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
        @click="$emit('toggle-sidebar')"
        aria-label="Buka menu navigasi"
      >
        <span class="material-symbols-outlined text-[22px]">menu</span>
      </button>

      <div class="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
        <NuxtLink to="/dashboard" class="hover:text-primary transition-colors hidden sm:inline">SugarTracker</NuxtLink>
        <span class="hidden sm:inline">/</span>
        <span class="text-on-surface-variant font-medium">{{ currentSectionTitle }}</span>
      </div>
    </div>

    <!-- Right Section: Profile -->
    <div class="flex items-center gap-space-sm sm:gap-space-md">
      <!-- User Profile Link -->
      <NuxtLink to="/settings" class="flex items-center gap-space-sm pl-space-xs group">
        <img 
          :src="user.avatarUrl" 
          :alt="user.fullName" 
          class="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
        />
        <div class="hidden sm:flex flex-col text-left">
          <span class="font-label-md text-label-md text-on-surface leading-tight font-semibold group-hover:text-primary transition-colors">
            {{ user.fullName }}
          </span>
          <span class="font-body-sm text-body-sm text-outline leading-tight">
            Target: {{ user.dailyGoalG }}g / hari
          </span>
        </div>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const route = useRoute()
const { user } = useSugarTracker()

const currentSectionTitle = computed(() => {
  if (route.path === '/' || route.path === '/dashboard') return 'Dashboard'
  if (route.path.startsWith('/scanner')) return 'Pemindai Minuman'
  if (route.path.startsWith('/tracker')) return 'Pencatat Minuman Harian'
  if (route.path.startsWith('/insights')) return 'Wawasan Mingguan'
  if (route.path.startsWith('/settings')) return 'Profil & Pengaturan'
  if (route.path.startsWith('/products')) return 'Rincian Minuman'
  if (route.path.startsWith('/login')) return 'Masuk Akun'
  if (route.path.startsWith('/onboarding')) return 'Penyiapan Awal'
  return 'SugarTracker'
})
</script>
