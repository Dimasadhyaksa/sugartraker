<template>
  <div class="min-h-screen bg-background font-sans text-on-surface antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- App Brand / Logo -->
      <div class="flex items-center justify-center gap-2 mb-3">
        <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
          <span class="material-symbols-outlined text-[24px]">water_bottle</span>
        </div>
        <span class="font-headline font-bold text-2xl text-on-surface tracking-tight">SugarTracker</span>
      </div>
      <p class="text-center text-sm text-tertiary">
        Pantau asupan gula dari minuman harian Anda
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-surface-container-lowest py-8 px-6 sm:px-10 shadow-sm border border-outline-variant/30 rounded-2xl">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout for login, register, and onboarding screens
</script>

