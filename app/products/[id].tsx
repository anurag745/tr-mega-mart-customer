import { Image } from '@/components/mobile/Image';
import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { View } from '@/components/mobile/View';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const { items, addToCart, updateQuantity } = useCart();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [product, setProduct] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProduct = async (id?: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await (await import('@/lib/supabaseClient')).supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) {
      setError(fetchErr.message);
      setProduct(null);
    } else {
      const p = data;
      setProduct({
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
      });
    }

    setLoading(false);
  };

  React.useEffect(() => {
    fetchProduct(params.id);
  }, [params.id]);

  const recommendations = React.useMemo(() => {
    if (!product) return [];
    // Fetching recommendations from supabase could be done, but for now use same-category products from the database
    // (simple client-side filtering not possible without the list, so keep empty or fetch separately if needed)
    return [] as any[];
  }, [product]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: theme.colors.textSecondary }}>{error ?? 'Product not found'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1, padding: theme.spacing.md }}>
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.md, position: 'relative' }}>
          <Image source={product.image} style={{ width: 220, height: 220, borderRadius: theme.borderRadius.md }} />

          {product.raw && product.raw.discount_price != null && product.raw.price > product.raw.discount_price && (
            <View style={{ position: 'absolute', top: theme.spacing.md, right: theme.spacing.md, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.sm, paddingVertical: 6, borderRadius: theme.borderRadius.full }}>
              <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xs }}>
                -{Math.round(((product.raw.price - (product.raw.discount_price || 0)) / product.raw.price) * 100)}%
              </Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold }}>{product.name}</Text>
        <View style={{ marginTop: theme.spacing.xs }}>
          {product.raw && product.raw.discount_price != null && product.raw.price > product.raw.discount_price ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, textDecorationLine: 'line-through' }}>₹{product.raw.price.toFixed(2)}</Text>
              <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.bold }}>₹{product.price.toFixed(2)} • {product.unit}</Text>
            </View>
          ) : (
            <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.bold }}>₹{product.price.toFixed(2)} • {product.unit}</Text>
          )}
        </View>

        <Text style={{ marginTop: theme.spacing.md, color: theme.colors.textSecondary }}>{product.description}</Text>

        {
          (() => {
            const cartItem = items.find((it) => it.product.id === product.id);

            if (cartItem) {
              return (
                <View style={{ marginTop: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <Pressable
                    onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: theme.borderRadius.full,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </Pressable>

                  <Text style={{ minWidth: 28, textAlign: 'center' }}>{cartItem.quantity}</Text>

                  <Pressable
                    onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF' }}>+</Text>
                  </Pressable>
                </View>
              );
            }

            return (
              <Pressable
                onPress={() => addToCart(product)}
                style={{
                  marginTop: theme.spacing.md,
                  backgroundColor: theme.colors.primary,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: theme.fontWeight.medium }}>Add to cart</Text>
              </Pressable>
            );
          })()
        }

        {recommendations.length > 0 && (
          <View style={{ marginTop: theme.spacing.lg }}>
            <Text style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, marginBottom: theme.spacing.sm }}>Similar items</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                {recommendations.map((rec) => (
                  <Pressable
                    key={rec.id}
                    onPress={() => router.push(`/products/${rec.id}`)}
                    style={{ width: 120, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm }}
                  >
                    <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
                      <Image source={rec.image} />
                    </View>

                    <Text numberOfLines={2} style={{ fontSize: theme.fontSize.sm }}>{rec.name}</Text>
                    <Text style={{ color: theme.colors.primary, fontWeight: theme.fontWeight.bold }}>₹{rec.price.toFixed(2)}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
