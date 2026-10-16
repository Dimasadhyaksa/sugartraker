/**
 * Drink Product Catalog Types
 * Exclusively for beverage products and sugar content per 100ml
 */

export type DrinkCategory =
  | 'Teh Kemasan & Teh Manis'
  | 'Kopi Susu & Kopi Kemasan'
  | 'Minuman Bersoda'
  | 'Minuman Energi & Olahraga'
  | 'Susu & Minuman Berbasis Susu'
  | 'Jus & Minuman Buah'
  | 'Air Mineral & Minuman Tawar'
  | 'Minuman Lainnya'

export interface DrinkProduct {
  id: string
  barcode?: string | null
  name: string
  brand: string
  category: DrinkCategory | string
  packageVolumeMl?: number | null // Ukuran volume kemasan dalam ml
  sugarPer100ml: number | null // null = tidak diketahui (unknown). Jangan anggap 0!
  imageUrl?: string
  ingredients?: string[]
}

