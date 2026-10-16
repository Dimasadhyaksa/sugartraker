import { ref, computed } from 'vue'
import type { DrinkProduct } from '~/types/drink'
import { useSupabase } from './useSupabase'

// Catalog mock minuman terverifikasi di Indonesia
const defaultDrinkProducts: DrinkProduct[] = [
  {
    id: 'prod-teh-botol-kotak',
    barcode: '8992741911019',
    name: 'Teh Botol Sosro Kotak',
    brand: 'Sosro',
    category: 'Teh Kemasan & Teh Manis',
    packageVolumeMl: 250,
    sugarPer100ml: 6.0,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air', 'Gula Tebu', 'Ekstrak Teh Melati']
  },
  {
    id: 'prod-ito-en-tawar',
    barcode: '851492002011',
    name: 'Ito En Oi Ocha Green Tea',
    brand: 'Ito En',
    category: 'Teh Kemasan & Teh Manis',
    packageVolumeMl: 500,
    sugarPer100ml: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air Murni', 'Seduhan Teh Hijau', 'Vitamin C']
  },
  {
    id: 'prod-kopi-kenangan-rtd',
    barcode: '8997232230018',
    name: 'Kopi Kenangan Mantan RTD',
    brand: 'Kopi Kenangan',
    category: 'Kopi Susu & Kopi Kemasan',
    packageVolumeMl: 220,
    sugarPer100ml: 7.3,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air', 'Susu Segar', 'Gula Aren', 'Ekstrak Kopi']
  },
  {
    id: 'prod-coca-cola-can',
    barcode: '049000028904',
    name: 'Coca-Cola Original Can',
    brand: 'Coca-Cola',
    category: 'Minuman Bersoda',
    packageVolumeMl: 330,
    sugarPer100ml: 10.6,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air Berkarbonasi', 'Gula', 'Perisa Alami', 'Kafein']
  },
  {
    id: 'prod-pocari-sweat-pet',
    barcode: '8993077110156',
    name: 'Pocari Sweat Ion Supply',
    brand: 'Otsuka',
    category: 'Minuman Energi & Olahraga',
    packageVolumeMl: 350,
    sugarPer100ml: 6.0,
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air', 'Gula', 'Sirup Jagung', 'Elektrolit']
  },
  {
    id: 'prod-ultra-milk-cokelat',
    barcode: '8992753111018',
    name: 'Ultra Milk Cokelat UHT',
    brand: 'Ultra Jaya',
    category: 'Susu & Minuman Berbasis Susu',
    packageVolumeMl: 200,
    sugarPer100ml: 7.0,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Susu Segar', 'Sukrosa', 'Bubuk Cokelat']
  },
  {
    id: 'prod-buavita-mangga',
    barcode: '8999999014125',
    name: 'Buavita Juice Mangga',
    brand: 'Buavita',
    category: 'Jus & Minuman Buah',
    packageVolumeMl: 245,
    sugarPer100ml: 9.0,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Air', 'Konsentrat Mangga', 'Gula Pasir']
  },
  {
    id: 'prod-aqua-danone-botol',
    barcode: '8992752011111',
    name: 'AQUA Air Mineral',
    brand: 'Danone AQUA',
    category: 'Air Mineral & Minuman Tawar',
    packageVolumeMl: 600,
    sugarPer100ml: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    ingredients: ['100% Air Mineral Pegunungan']
  },
  {
    id: 'prod-artisanal-boba-unknown',
    barcode: '9990001112223',
    name: 'Brown Sugar Fresh Milk (Kedai Boba)',
    brand: 'Kedai Minuman Lokal',
    category: 'Minuman Lainnya',
    packageVolumeMl: 450,
    sugarPer100ml: null, // Gula tidak diketahui (unknown)
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b37cfb8f8892?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Susu', 'Sirup Gula Aren', 'Tapioca Pearls']
  }
]

const productsState = ref<DrinkProduct[]>([...defaultDrinkProducts])
const isProductsLoading = ref<boolean>(false)

export const useDrinks = () => {
  const { client, isConfigured } = useSupabase()

  /**
   * Load products from Supabase table `products`
   */
  const loadProducts = async () => {
    if (!isConfigured || !client) return productsState.value
    isProductsLoading.value = true

    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('name')

      if (error) {
        console.warn('[useDrinks] Could not load from Supabase products table:', error.message)
      } else if (data && data.length > 0) {
        productsState.value = data.map((item: any) => ({
          id: item.id,
          barcode: item.barcode || null,
          name: item.name,
          brand: item.brand || '',
          category: item.category || 'Minuman Lainnya',
          packageVolumeMl: item.package_volume_ml ? Number(item.package_volume_ml) : null,
          sugarPer100ml: item.sugar_per_100ml !== null && item.sugar_per_100ml !== undefined
            ? Number(item.sugar_per_100ml)
            : null,
          imageUrl: item.image_url || undefined,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : []
        }))
      }
    } catch (err) {
      console.warn('[useDrinks] Exception loading products:', err)
    } finally {
      isProductsLoading.value = false
    }

    return productsState.value
  }

  /**
   * Search drink products by name, brand, or barcode
   */
  const searchProducts = (keyword: string): DrinkProduct[] => {
    const q = keyword.trim().toLowerCase()
    if (!q) return productsState.value

    return productsState.value.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    )
  }

  /**
   * Find product by exact barcode
   */
  const findByBarcode = (barcode: string): DrinkProduct | undefined => {
    const clean = barcode.trim()
    return productsState.value.find(p => p.barcode === clean)
  }

  /**
   * Find product by ID
   */
  const getProductById = (id: string): DrinkProduct | undefined => {
    return productsState.value.find(p => p.id === id)
  }

  return {
    products: productsState,
    isProductsLoading,
    loadProducts,
    searchProducts,
    findByBarcode,
    getProductById
  }
}

