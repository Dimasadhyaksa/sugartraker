<template>
  <div class="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col">
    <!-- Sidebar Navigation -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content Shell -->
    <div class="lg:pl-64 min-h-screen flex flex-col">
      <!-- Fixed Top Header -->
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page Content Canvas -->
      <main class="w-full pt-16 bg-surface flex-1 px-space-md sm:px-space-lg py-space-lg">
        <!-- Supabase Status Banner (Informative & Non-intrusive) -->
        <div 
          v-if="!isConfigured && showMockBanner" 
          class="mb-space-lg p-space-md rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm shadow-sm"
        >
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-amber-600 text-[22px] shrink-0">info</span>
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm font-semibold text-amber-900">
                Berjalan dalam Mode Data Simulasi
              </span>
              <span class="text-[11px] sm:text-xs text-amber-700">
                Client Supabase telah disiapkan. Tambahkan <code class="bg-amber-100 px-1 py-0.5 rounded font-mono">NUXT_PUBLIC_SUPABASE_URL</code> dan key pada .env untuk menghubungkan database Anda.
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <NuxtLink 
              to="/settings" 
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
            >
              Pengaturan Profil
            </NuxtLink>
            <button 
              type="button" 
              class="p-1 rounded-md text-amber-700 hover:bg-amber-200 transition-colors"
              @click="showMockBanner = false"
              title="Tutup pemberitahuan"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
const showMockBanner = ref(true)
const { isConfigured } = useSugarTracker()
</script>
