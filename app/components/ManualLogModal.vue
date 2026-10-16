<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-md"
    @click.self="close"
  >
    <div class="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg sm:p-space-xl shadow-xl flex flex-col border border-surface-variant max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-variant">
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-primary text-[24px]">local_cafe</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {{ isEditing ? 'Edit Catatan Minuman' : 'Tambah Minuman Manual' }}
          </h3>
        </div>
        <button 
          type="button" 
          class="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          @click="close"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Error Alert -->
      <div 
        v-if="validationError" 
        class="mb-3 p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[16px]">error</span>
        <span>{{ validationError }}</span>
      </div>

      <!-- Modal Form -->
      <form class="flex flex-col gap-space-md" @submit.prevent="handleSubmit">
        <!-- Nama Minuman & Merek -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-label-sm text-on-surface font-semibold">Nama Minuman *</label>
            <input 
              v-model="form.name"
              class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none" 
              placeholder="Contoh: Kopi Susu Aren" 
              required 
              type="text"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-label-sm text-on-surface font-semibold">Merek (Opsional)</label>
            <input 
              v-model="form.brand"
              class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none" 
              placeholder="Contoh: Kedai Kopi / Merek Kemasan" 
              type="text"
            />
          </div>
        </div>

        <!-- Sesi Waktu Minum -->
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Waktu Konsumsi</label>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="session in drinkSessions"
              :key="session.value"
              type="button"
              class="py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all border"
              :class="form.drinkSession === session.value 
                ? 'bg-secondary-container text-on-secondary-fixed border-primary/40 shadow-sm' 
                : 'bg-surface-container-low text-outline border-transparent hover:bg-surface-container'"
              @click="form.drinkSession = session.value"
            >
              <span class="material-symbols-outlined text-[16px]">{{ session.icon }}</span>
              <span>{{ session.label }}</span>
            </button>
          </div>
        </div>

        <!-- Volume Minuman Yang Dikonsumsi -->
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">
            Volume Yang Diminum (ml) *
          </label>
          <div class="flex items-center gap-2">
            <input 
              v-model.number="form.volumeMl"
              class="flex-1 px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none" 
              min="1" 
              placeholder="Contoh: 250" 
              required 
              type="number"
            />
            <div class="flex gap-1">
              <button 
                v-for="vol in [150, 250, 350, 500]" 
                :key="vol"
                type="button"
                class="px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all"
                :class="form.volumeMl === vol ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-tertiary border-outline-variant/30 hover:bg-surface-variant'"
                @click="form.volumeMl = vol"
              >
                {{ vol }}ml
              </button>
            </div>
          </div>
        </div>

        <!-- Unknown Sugar Checkbox -->
        <div class="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input 
              id="isUnknownSugar"
              v-model="form.isUnknownSugar"
              type="checkbox"
              class="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <label for="isUnknownSugar" class="text-xs font-semibold text-on-surface cursor-pointer select-none">
              Kandungan gula tidak diketahui
            </label>
          </div>
          <span class="text-[11px] text-tertiary">
            (Tidak dihitung sebagai 0 gram)
          </span>
        </div>

        <!-- Kandungan Gula Input (Hanya jika diketahui) -->
        <div v-if="!form.isUnknownSugar" class="flex flex-col gap-1 p-space-md rounded-xl bg-surface-container-low border border-surface-variant/40">
          <div class="flex items-center justify-between mb-1">
            <label class="font-label-sm text-label-sm text-on-surface font-semibold">
              Kandungan Gula per 100 ml (gram) *
            </label>
            <span class="text-[11px] text-tertiary">Rumus: (gula × volume) / 100</span>
          </div>
          <input 
            v-model.number="form.sugarPer100ml"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-surface-variant focus:border-primary transition-all focus:outline-none" 
            min="0" 
            placeholder="Contoh: 6.0" 
            required 
            step="0.1" 
            type="number"
          />
        </div>

        <!-- Kalkulasi Banner -->
        <div class="p-space-md rounded-xl border flex items-center justify-between transition-all"
          :class="form.isUnknownSugar ? 'bg-surface-container border-outline-variant/40' : 'bg-secondary-container/40 border-primary/20'"
        >
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-outline uppercase tracking-wider">Hasil Perhitungan Gula</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span v-if="form.isUnknownSugar" class="text-lg font-bold text-tertiary font-headline">
                Tidak Diketahui
              </span>
              <template v-else>
                <span class="text-2xl font-bold text-primary font-headline tabular-nums">
                  {{ computedTotalSugar !== null ? computedTotalSugar : '--' }}
                </span>
                <span class="text-xs font-semibold text-outline">gram gula</span>
              </template>
            </div>
            <span class="text-[11px] text-tertiary">
              <template v-if="form.isUnknownSugar">
                Minuman ini akan dicatat tanpa total gram gula palsu.
              </template>
              <template v-else>
                ({{ form.sugarPer100ml || 0 }}g × {{ form.volumeMl || 0 }}ml) / 100 = {{ computedTotalSugar }}g
              </template>
            </span>
          </div>

          <div class="text-right flex flex-col items-end">
            <span class="text-[11px] font-medium text-outline mb-1">Status Minuman:</span>
            <span 
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="getStatusBadgeClass(computedStatus)"
            >
              {{ computedStatus }}
            </span>
          </div>
        </div>

        <!-- Catatan Opsional -->
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface font-semibold">Catatan Tambahan (Opsional)</label>
          <input 
            v-model="form.notes"
            class="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-all focus:outline-none" 
            placeholder="Contoh: Es sedikit, gula tebu" 
            type="text"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-variant">
          <button 
            type="button" 
            class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors"
            @click="close"
          >
            Batal
          </button>
          <button 
            type="submit" 
            class="px-space-lg py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md transition-colors shadow-sm font-semibold flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[18px]">check</span>
            <span>{{ isEditing ? 'Simpan Perubahan' : 'Catat Minuman' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DrinkSession, DrinkSugarStatus } from '~/types/drink-log'
import { calculateDrinkSugar, getDrinkSugarStatus } from '~/utils/sugar-calculation'

const props = defineProps({ modelValue: { type: Boolean, required: true }, editItem: { type: Object, default: null } });

const emit = defineEmits(['update:modelValue', 'saved']);

const { addLog, updateLog } = useSugarTracker()
const validationError = ref<string | null>(null)

const drinkSessions: { value: DrinkSession; label: string; icon: string }[] = [
  { value: 'Pagi', label: 'Pagi', icon: 'wb_sunny' },
  { value: 'Siang', label: 'Siang', icon: 'light_mode' },
  { value: 'Sore', label: 'Sore', icon: 'wb_twilight' },
  { value: 'Malam', label: 'Malam', icon: 'dark_mode' }
]

const isEditing = computed(() => Boolean(props.editItem?.id))

const form = reactive({
  name: '',
  brand: '',
  drinkSession: 'Siang' as DrinkSession,
  volumeMl: 250,
  isUnknownSugar: false,
  sugarPer100ml: 6.0 as number | null,
  notes: ''
})

const resetForm = () => {
  form.name = ''
  form.brand = ''
  form.drinkSession = 'Siang'
  form.volumeMl = 250
  form.isUnknownSugar = false
  form.sugarPer100ml = 6.0
  form.notes = ''
  validationError.value = null
}

watch(() => props.editItem, (item) => {
  if (item) {
    form.name = item.drinkName || item.name || ''
    form.brand = item.brand || ''
    form.drinkSession = item.drinkSession || 'Siang'
    form.volumeMl = item.consumedVolumeMl || item.volumeMl || 250
    form.isUnknownSugar = item.sugarPer100ml === null || item.sugarPer100ml === undefined
    form.sugarPer100ml = form.isUnknownSugar ? null : Number(item.sugarPer100ml)
    form.notes = item.notes || ''
  } else {
    resetForm()
  }
}, { immediate: true })

const computedTotalSugar = computed<number | null>(() => {
  if (form.isUnknownSugar) return null
  try {
    return calculateDrinkSugar(form.sugarPer100ml, form.volumeMl)
  } catch {
    return null
  }
})

const computedStatus = computed<DrinkSugarStatus>(() => {
  return getDrinkSugarStatus(computedTotalSugar.value)
})

const getStatusBadgeClass = (status: DrinkSugarStatus) => {
  switch (status) {
    case 'Aman':
      return 'bg-secondary-container text-on-secondary-fixed'
    case 'Waspada':
      return 'bg-amber-100 text-amber-900'
    case 'Melebihi Batas':
      return 'bg-error-container text-on-error-container'
    case 'Tidak Diketahui':
      return 'bg-surface-container-high text-tertiary'
    default:
      return 'bg-surface-container text-on-surface'
  }
}

const close = () => {
  emit('update:modelValue', false)
  if (!props.editItem) resetForm()
}

const handleSubmit = async () => {
  validationError.value = null

  if (!form.name.trim()) {
    validationError.value = 'Nama minuman wajib diisi'
    return
  }

  if (!form.volumeMl || form.volumeMl <= 0) {
    validationError.value = 'Volume minuman harus lebih besar dari 0 ml'
    return
  }

  if (!form.isUnknownSugar && (form.sugarPer100ml === null || form.sugarPer100ml === undefined || form.sugarPer100ml < 0)) {
    validationError.value = 'Kandungan gula tidak boleh bernilai negatif'
    return
  }

  const finalSugarPer100ml = form.isUnknownSugar ? null : form.sugarPer100ml
  const totalSugar = form.isUnknownSugar ? null : computedTotalSugar.value

  if (isEditing.value && props.editItem?.id) {
    await updateLog(props.editItem.id, {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      volumeMl: form.volumeMl,
      sugarGrams: totalSugar ?? 0,
      addedSugarGrams: totalSugar ?? 0,
      sugarPer100ml: finalSugarPer100ml,
      drinkSession: form.drinkSession,
      status: computedStatus.value,
      notes: form.notes.trim() || undefined,
      isSugarUnknown: form.isUnknownSugar
    })
    close()
  } else {
    const created = await addLog({
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      volumeMl: form.volumeMl,
      packageVolumeMl: form.volumeMl,
      sugarGrams: totalSugar ?? 0,
      addedSugarGrams: totalSugar ?? 0,
      naturalSugarGrams: 0,
      sugarPer100ml: finalSugarPer100ml,
      drinkSession: form.drinkSession,
      status: computedStatus.value,
      glycemicStatus: computedStatus.value,
      hasHiddenSugars: false,
      hiddenSugarIngredients: [],
      loggedAt: new Date().toISOString(),
      notes: form.notes.trim() || undefined,
      icon: 'local_cafe',
      isSugarUnknown: form.isUnknownSugar
    })
    emit('saved', created)
    close()
  }
}
</script>

