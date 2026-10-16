<template>
  <div>
    <!-- Mobile Backdrop -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden"
      @click="$emit('close')"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed top-0 bottom-0 left-0 w-64 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-surface-variant transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex flex-col">
        <!-- Brand Header -->
        <div class="h-16 px-space-lg flex items-center justify-between border-b border-surface-variant">
          <NuxtLink to="/dashboard" class="flex items-center gap-space-sm group">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <span class="material-symbols-outlined text-[22px]">eco</span>
            </div>
            <span class="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">SugarTracker</span>
          </NuxtLink>
          <button 
            type="button" 
            class="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Navigation Section -->
        <div class="px-space-md py-space-md">
          <span class="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Menu Navigasi</span>
        </div>

        <nav class="flex flex-col gap-space-xs px-space-md">
          <NuxtLink 
            to="/dashboard"
            :class="[
              'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all group font-label-md',
              isActive('/dashboard') 
                ? 'bg-secondary-container text-on-secondary-fixed shadow-sm font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            ]"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined text-[20px] transition-colors" :class="isActive('/dashboard') ? 'text-primary' : 'text-outline group-hover:text-primary'">grid_view</span>
            <span>Dashboard</span>
          </NuxtLink>

          <!-- Menu Pemindai Minuman (Dinonaktifkan / Sedang Dalam Pengembangan) -->
          <div 
            class="flex items-center justify-between px-space-md py-space-sm rounded-lg text-outline bg-surface-container-low/40 cursor-not-allowed opacity-60 font-label-md select-none"
            title="Fitur Pemindai Minuman sedang dalam tahap pengembangan dan belum dapat diakses"
          >
            <div class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-[20px] text-outline">barcode_scanner</span>
              <span>Pemindai Minuman</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-surface-container text-tertiary text-[10px] font-semibold tracking-wide">Segera Hadir</span>
          </div>

          <NuxtLink 
            to="/tracker"
            :class="[
              'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all group font-label-md',
              isActive('/tracker') 
                ? 'bg-secondary-container text-on-secondary-fixed shadow-sm font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            ]"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined text-[20px] transition-colors" :class="isActive('/tracker') ? 'text-primary' : 'text-outline group-hover:text-primary'">local_cafe</span>
            <span>Pencatat Minuman</span>
          </NuxtLink>

          <NuxtLink 
            to="/insights"
            :class="[
              'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all group font-label-md',
              isActive('/insights') 
                ? 'bg-secondary-container text-on-secondary-fixed shadow-sm font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            ]"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined text-[20px] transition-colors" :class="isActive('/insights') ? 'text-primary' : 'text-outline group-hover:text-primary'">monitoring</span>
            <span>Wawasan Mingguan</span>
          </NuxtLink>

          <NuxtLink 
            to="/settings"
            :class="[
              'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all group font-label-md',
              isActive('/settings') 
                ? 'bg-secondary-container text-on-secondary-fixed shadow-sm font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            ]"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined text-[20px] transition-colors" :class="isActive('/settings') ? 'text-primary' : 'text-outline group-hover:text-primary'">settings</span>
            <span>Profil &amp; Pengaturan</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Bottom Card: Device Sync & Supabase Backend Status -->
      <div class="p-space-md border-t border-surface-variant flex flex-col gap-space-sm">
        <div class="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm text-on-surface-variant">Batas Harian</span>
            <span class="font-body-sm text-body-sm text-primary font-semibold">Gula Minuman</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-primary-container ring-4 ring-on-primary-container/30"></span>
        </div>

        <!-- Connection Status Pill -->
        <NuxtLink to="/settings" class="px-2.5 py-1.5 rounded-lg bg-surface-container flex items-center justify-between hover:bg-surface-container-high transition-colors">
          <div class="flex items-center gap-1.5">
            <span 
              class="w-2 h-2 rounded-full" 
              :class="isConfigured ? 'bg-primary-container animate-pulse' : 'bg-amber-500'"
            ></span>
            <span class="text-[11px] font-medium text-tertiary">
              {{ isConfigured ? 'Akun Terhubung' : 'Mode Data Lokal' }}
            </span>
          </div>
          <span class="material-symbols-outlined text-[14px] text-outline">tune</span>
        </NuxtLink>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const { isConfigured } = useSugarTracker()

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/' || route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}
</script>
