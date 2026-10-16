-- ==============================================================================
-- SUGARTRACKER — DATABASE SCHEMA CONTRACT FOR SUPABASE POSTGRESQL
-- ==============================================================================
-- CATATAN PENTING:
-- Script ini HANYA UNTUK DITINJAU DAN DIJALANKAN SECARA MANUAL oleh pemilik project
-- melalui SQL Editor di Supabase Dashboard (https://supabase.com/dashboard).
-- Agent TIDAK MENGEKSEKUSI script ini secara otomatis.
-- ==============================================================================

-- 1. TABEL: PROFILES
-- Menyimpan informasi pengguna tambahan dan target pemantauan gula harian
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    daily_sugar_target NUMERIC(5, 1) NOT NULL DEFAULT 50.0 CHECK (daily_sugar_target > 0),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Komentar Tabel
COMMENT ON TABLE public.profiles IS 'Menyimpan profil pengguna SugarTracker dan target gula harian pribadi.';
COMMENT ON COLUMN public.profiles.daily_sugar_target IS 'Target pemantauan gula harian dalam satuan gram (> 0). Default: 50g.';

-- 2. TABEL: PRODUCTS
-- Menyimpan katalog minuman terverifikasi
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT DEFAULT 'Minuman Lainnya',
    package_volume_ml NUMERIC(7, 1) CHECK (package_volume_ml > 0),
    sugar_per_100ml NUMERIC(5, 2) CHECK (sugar_per_100ml >= 0), -- NULL jika tidak diketahui (unknown). Jangan anggap 0!
    image_url TEXT,
    ingredients TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Komentar Tabel
COMMENT ON TABLE public.products IS 'Katalog minuman terverifikasi beserta kandungan gula per 100 ml.';
COMMENT ON COLUMN public.products.sugar_per_100ml IS 'Kandungan gula per 100 ml dalam gram. Bernilai NULL jika tidak diketahui.';

-- Index untuk pencarian cepat produk
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin (to_tsvector('indonesian', name));
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);

-- 3. TABEL: DRINK_LOGS
-- Menyimpan kejadian konsumsi minuman per pengguna
CREATE TABLE IF NOT EXISTS public.drink_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    drink_name TEXT NOT NULL, -- Snapshot nama minuman saat diminum
    brand TEXT, -- Snapshot merek minuman
    consumed_volume_ml NUMERIC(7, 1) NOT NULL CHECK (consumed_volume_ml > 0), -- ml yang diminum
    sugar_per_100ml NUMERIC(5, 2) CHECK (sugar_per_100ml >= 0), -- NULL jika tidak diketahui
    total_sugar_grams NUMERIC(6, 1) CHECK (total_sugar_grams >= 0), -- NULL jika gula tidak diketahui. Formula: (sugar_per_100ml * consumed_volume_ml) / 100
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    drink_session TEXT NOT NULL DEFAULT 'Siang' CHECK (drink_session IN ('Pagi', 'Siang', 'Sore', 'Malam')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Komentar Tabel
COMMENT ON TABLE public.drink_logs IS 'Catatan konsumsi minuman dan total gula per pengguna.';
COMMENT ON COLUMN public.drink_logs.total_sugar_grams IS 'Total gram gula dikonsumsi. NULL jika kandungan gula produk tidak diketahui.';

-- Index untuk performa query log pengguna
CREATE INDEX IF NOT EXISTS idx_drink_logs_user_date ON public.drink_logs (user_id, consumed_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_logs ENABLE ROW LEVEL SECURITY;

-- B. Kebijakan RLS: PROFILES
-- Pengguna hanya dapat membaca profil mereka sendiri
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Pengguna hanya dapat memperbarui profil mereka sendiri
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Pengguna dapat menambahkan profil mereka sendiri
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- C. Kebijakan RLS: PRODUCTS
-- Katalog produk bersifat publik dan dapat dibaca oleh seluruh pengguna terdaftar maupun publik
CREATE POLICY "Anyone can view products catalog" 
    ON public.products FOR SELECT 
    USING (true);

-- D. Kebijakan RLS: DRINK_LOGS
-- Pengguna hanya dapat melihat catatan minuman milik mereka sendiri
CREATE POLICY "Users can view own drink logs" 
    ON public.drink_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- Pengguna hanya dapat mencatat minuman atas nama mereka sendiri
CREATE POLICY "Users can insert own drink logs" 
    ON public.drink_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Pengguna hanya dapat mengubah catatan minuman milik mereka sendiri
CREATE POLICY "Users can update own drink logs" 
    ON public.drink_logs FOR UPDATE 
    USING (auth.uid() = user_id);

-- Pengguna hanya dapat menghapus catatan minuman milik mereka sendiri
CREATE POLICY "Users can delete own drink logs" 
    ON public.drink_logs FOR DELETE 
    USING (auth.uid() = user_id);

-- ==============================================================================
-- OPTIONAL: TRIGGER OTOMATIS PEMBUATAN PROFIL SAAT USER MENDAFTAR (AUTH)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, daily_sugar_target)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
        COALESCE((new.raw_user_meta_data->>'daily_goal_g')::numeric, 50.0)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA: KATALOG MINUMAN NYATA DI INDONESIA (VERIFIED & UNKNOWN SAMPLE)
-- ==============================================================================
INSERT INTO public.products (barcode, name, brand, category, package_volume_ml, sugar_per_100ml, image_url, ingredients)
VALUES
    ('8992741911019', 'Teh Botol Sosro Kotak', 'Sosro', 'Teh Kemasan & Teh Manis', 250, 6.0, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80', ARRAY['Air', 'Gula Tebu', 'Ekstrak Teh Melati']),
    ('851492002011', 'Ito En Oi Ocha Green Tea', 'Ito En', 'Teh Kemasan & Teh Manis', 500, 0.0, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=400&q=80', ARRAY['Air Murni', 'Seduhan Teh Hijau', 'Vitamin C']),
    ('8997232230018', 'Kopi Kenangan Mantan RTD', 'Kopi Kenangan', 'Kopi Susu & Kopi Kemasan', 220, 7.3, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80', ARRAY['Air', 'Susu Segar', 'Gula Aren', 'Ekstrak Kopi']),
    ('049000028904', 'Coca-Cola Original Can', 'Coca-Cola', 'Minuman Bersoda', 330, 10.6, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', ARRAY['Air Berkarbonasi', 'Gula', 'Perisa Alami', 'Kafein']),
    ('8993077110156', 'Pocari Sweat Ion Supply', 'Otsuka', 'Minuman Energi & Olahraga', 350, 6.0, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80', ARRAY['Air', 'Gula', 'Sirup Jagung', 'Elektrolit']),
    ('8992753111018', 'Ultra Milk Cokelat UHT', 'Ultra Jaya', 'Susu & Minuman Berbasis Susu', 200, 7.0, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', ARRAY['Susu Segar', 'Sukrosa', 'Bubuk Cokelat']),
    ('8999999014125', 'Buavita Juice Mangga', 'Buavita', 'Jus & Minuman Buah', 245, 9.0, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80', ARRAY['Air', 'Konsentrat Mangga', 'Gula Pasir']),
    ('8992752011111', 'AQUA Air Mineral', 'Danone AQUA', 'Air Mineral & Minuman Tawar', 600, 0.0, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80', ARRAY['100% Air Mineral Pegunungan']),
    ('9990001112223', 'Brown Sugar Fresh Milk (Kedai Boba)', 'Kedai Minuman Lokal', 'Minuman Lainnya', 450, NULL, 'https://images.unsplash.com/photo-1558857563-b37cfb8f8892?auto=format&fit=crop&w=400&q=80', ARRAY['Susu Segar', 'Sirup Gula Aren', 'Tapioca Pearls'])
ON CONFLICT (barcode) DO NOTHING;

