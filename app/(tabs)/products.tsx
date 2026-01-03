import { Image } from '@/components/mobile/Image';
import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { TextInput } from '@/components/mobile/TextInput';
import { View } from '@/components/mobile/View';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const { items, addToCart, updateQuantity } = useCart();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
      setAllProducts([]);
    } else {
      setAllProducts(
        (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          mrp: p.price,
          discount_price: p.discount_price,
          price: p.discount_price != null ? p.discount_price : p.price,
          unit: p.unit,
          image: p.image_url || '',
          category: p.category_id || '',
          description: p.description || '',
          raw: p,
        }))
      );
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error: fetchErr } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!fetchErr) {
      setCategories(data || []);
    }
  };

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {/* Search */}
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
        />

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: !selectedCategory
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderRadius: theme.borderRadius.full,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: !selectedCategory ? '#FFFFFF' : theme.colors.text,
                  fontWeight: theme.fontWeight.medium,
                }}
              >
                All
              </Text>
            </Pressable>

            {categories.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={{
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderRadius: theme.borderRadius.full,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: theme.colors.background,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{(category.name || '').slice(0, 1).toUpperCase()}</Text>
                  </View>

                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: isActive ? '#FFFFFF' : theme.colors.text,
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView style={{ flex: 1, padding: theme.spacing.md }}>
        {loading && (
          <View style={{ alignItems: 'center', padding: theme.spacing.lg }}>
            <Text>Loading products…</Text>
          </View>
        )}

        {error && (
          <View style={{ alignItems: 'center', padding: theme.spacing.lg }}>
            <Text style={{ color: theme.colors.primary }}>{error}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          {filteredProducts.map((product) => {
            const cartItem = items.find((it) => it.product.id === product.id);

            return (
              <Pressable
                key={product.id}
                onPress={() => router.push(`/products/${product.id}`)}
                style={{ width: '48%' }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    gap: theme.spacing.sm,
                  }}
                >
                  <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={product.image} style={{ width: '100%', height: 120, borderRadius: theme.borderRadius.md }} />

                    {product.raw && product.raw.discount_price != null && product.raw.price > product.raw.discount_price && (
                      <View style={{ position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.borderRadius.full }}>
                        <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xs }}>
                          -{Math.round(((product.raw.price - (product.raw.discount_price || 0)) / product.raw.price) * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.medium,
                      color: theme.colors.text,
                    }}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>

                  <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>
                    {product.unit}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      {product.raw && product.raw.discount_price != null && product.raw.price > product.raw.discount_price ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, textDecorationLine: 'line-through' }}>₹{product.raw.price.toFixed(2)}</Text>
                          <Text style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.primary }}>₹{product.price.toFixed(2)}</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.primary }}>₹{product.price.toFixed(2)}</Text>
                      )}
                    </View>

                    {cartItem ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, cartItem.quantity - 1);
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: theme.borderRadius.full,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>−</Text>
                        </Pressable>

                        <Text style={{ minWidth: 20, textAlign: 'center' }}>{cartItem.quantity}</Text>

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, cartItem.quantity + 1);
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            backgroundColor: theme.colors.primary,
                            borderRadius: theme.borderRadius.full,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF' }}>+</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: theme.colors.primary,
                          borderRadius: theme.borderRadius.full,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>+</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={{ alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              No products found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
