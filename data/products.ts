export interface Product {
  id: string;
  category_id?: string | null;
  name: string;
  price: number;
  discount_price?: number | null;
  unit?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  barcode?: string | null;
  stock?: number | null;
  quantity?: string | null;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'cereals', name: 'Cereals', icon: '🥣' },
  { id: 'canned', name: 'Canned Goods', icon: '🥫' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'condiments', name: 'Condiments', icon: '🧂' },
];

// NOTE: products list is intentionally not exported here — products are fetched from Supabase at runtime.

