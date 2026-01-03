import { Image } from '@/components/mobile/Image';
import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { View } from '@/components/mobile/View';
import { useCart } from '@/contexts/CartContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { items, addToCart, updateQuantity } = useCart();
  const router = useRouter();

  interface Address {
    id: string;
    name?: string;
    phone?: string;
    house?: string;
    street?: string;
    city?: string;
    pincode?: string;
  }

  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState<Address | null>(null);
  const [addressModalVisible, setAddressModalVisible] = React.useState(false);
  const { credits } = useCredits();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const sessionRes = await supabase.auth.getSession();
      const userId = sessionRes?.data?.session?.user?.id;
      if (!userId) {
        setAddresses([]);
        setSelectedAddress(null);
        return;
      }

      const { data, error: addrErr } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (addrErr) {
        setAddresses([]);
        setSelectedAddress(null);
      } else {
        const mapped = (data || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          house: a.address_line1 || a.house || '',
          street: a.address_line2 || a.street || '',
          city: a.city,
          pincode: a.pincode,
        }));
        setAddresses(mapped);
        setSelectedAddress(mapped[0] || null);
      }
    } catch (err) {
      setAddresses([]);
      setSelectedAddress(null);
    }
  };

  const fetchFeatured = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (fetchErr) {
      setError(fetchErr.message);
      setFeaturedProducts([]);
    } else {
      setFeaturedProducts(
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
    fetchFeatured();
    fetchCategories();
    fetchAddresses();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: theme.spacing.xs, flex: 1 }}>
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>
              Deliver to
            </Text>

            <Pressable onPress={() => setAddressModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.text,
                  flexShrink: 1,
                }}
                numberOfLines={1}
              >
                {selectedAddress ? `${selectedAddress.house || ''} ${selectedAddress.street || ''} ${selectedAddress.city || ''}`.trim() + ' 📍' : '123 Main Street, Apt 4B 📍'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>▾</Text>
            </Pressable>
          </View>

          <View style={{ marginLeft: theme.spacing.md }}>
            <View style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 12, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold }}>{credits}</Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>Credits</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push('/products')}
          style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <Text style={{ fontSize: 20 }}>🔍</Text>
          <Text style={{ color: theme.colors.textMuted }}>
            Search products...
          </Text>
        </Pressable>

        {/* Promo Banner */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            gap: theme.spacing.sm,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold }}>
            LIMITED OFFER
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold }}>
            20% OFF First Order
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: theme.fontSize.sm }}>
            Use code: WELCOME20
          </Text>
        </View>

        {/* Categories */}
        <View style={{ gap: theme.spacing.md }}>
          <Text style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text }}>
            Categories
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    router.push({
                      pathname: '/products',
                      params: { category: category.id },
                    })
                  }
                  style={{ alignItems: 'center', gap: theme.spacing.xs, width: 80 }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{(category.name || '').slice(0,1).toUpperCase()}</Text>
                  </View>

                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: theme.colors.text,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={addressModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: theme.colors.background, padding: theme.spacing.md, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg }}>
              <Text style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text }}>Choose delivery address</Text>

              <View style={{ height: theme.spacing.md }} />

              {addresses.length === 0 ? (
                <View style={{ gap: theme.spacing.md }}>
                  <Text style={{ color: theme.colors.textSecondary }}>No saved addresses.</Text>
                  <Pressable onPress={() => { setAddressModalVisible(false); router.push('/profile'); }}>
                    <Text style={{ color: theme.colors.primary }}>Add address</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ gap: theme.spacing.sm }}>
                  {addresses.map((addr) => (
                    <Pressable key={addr.id} onPress={() => { setSelectedAddress(addr); setAddressModalVisible(false); }}>
                      <View style={{ paddingVertical: theme.spacing.sm }}>
                        <Text style={{ fontWeight: theme.fontWeight.medium, color: theme.colors.text }}>{addr.name || 'Home'}</Text>
                        <Text style={{ color: theme.colors.textSecondary }}>{`${addr.house || ''} ${addr.street || ''}`.trim()}</Text>
                        <Text style={{ color: theme.colors.textSecondary }}>{`${addr.city || ''} ${addr.pincode || ''}`.trim()}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={{ height: theme.spacing.md }} />

              <Pressable onPress={() => setAddressModalVisible(false)} style={{ alignItems: 'center', padding: theme.spacing.md }}>
                <Text style={{ color: theme.colors.primary }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Featured Products */}
        <View style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text }}>
              Popular Items
            </Text>

            <Pressable onPress={() => router.push('/products')}>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.primary }}>
                See All
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {featuredProducts.map((product) => {
              const cartItem = items.find((it) => it.product.id === product.id);

              return (
                <Pressable
                  key={product.id}
                  onPress={() => router.push(`/products/${product.id}`)}
                  style={{
                    width: '48%',
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    gap: theme.spacing.sm,
                    position: 'relative',
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
                    numberOfLines={1}
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
                          onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
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
                          onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
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
                        onPress={() => addToCart(product)}
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
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
