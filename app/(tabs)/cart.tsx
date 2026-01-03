import { Button } from '@/components/mobile/Button';
import { Image } from '@/components/mobile/Image';
import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { TextInput } from '@/components/mobile/TextInput';
import { View } from '@/components/mobile/View';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';

export default function CartScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { items, updateQuantity, removeFromCart, totalPrice, placeOrder } = useCart();
  const { credits, getCreditsValue, getMaxRedeemable, redeemCredits, earnCredits } =
    useCredits();

  const [creditsToUse, setCreditsToUse] = useState(0);

  type AddressInput = {
    id?: string;
    name: string; // label, e.g. Home, Office
    receiver_name: string;
    phone: string;
    house: string; // address_line1
    street: string; // address_line2 / landmark
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
    address_line1?: string;
    address_line2?: string;
  };

  const [address, setAddress] = useState<AddressInput>({ name: '', receiver_name: '', phone: '', house: '', street: '', city: '', state: '', pincode: '' });
  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');
  const [placing, setPlacing] = React.useState(false);

  const openPaymentGateway = async (method: string) => {
    // Placeholder: open real gateway here. We simulate success for card/upi.
    return new Promise<{ success: boolean; reference?: string }>((resolve) => {
      setTimeout(() => resolve({ success: true, reference: `sim-${method}-${Date.now()}` }), 800);
    });
  };

  const fetchSavedAddresses = async () => {
    if (!user) return setSavedAddresses([]);

    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (!error) {
      setSavedAddresses(data || []);
      // Hide form if user has saved addresses, otherwise show it
      setShowAddressForm(!(data && (data.length > 0)));
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [/* run once, or when user context changes if needed */]);

  // refresh saved addresses after placing an order
  useEffect(() => {
    if (!placing) fetchSavedAddresses();
  }, [placing]);

  const maxRedeemable = getMaxRedeemable(totalPrice);
  const discount = getCreditsValue(creditsToUse);
  const finalTotal = Math.max(0, totalPrice - discount);
  const creditsEarned = Math.floor(finalTotal * 0.5);

  const addressSection = savedAddresses.length > 0 ? (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>Saved Addresses</Text>

      <View style={{ gap: theme.spacing.xs }}>
        {savedAddresses.map((sa) => (
          <Pressable
            key={sa.id}
            onPress={() => {
              setSelectedAddressId(sa.id as string);
              setAddress((prev) => ({
                ...prev,
                id: sa.id,
                name: sa.name,
                receiver_name: sa.receiver_name,
                phone: sa.phone,
                house: sa.address_line1 as string,
                street: sa.address_line2 as string,
                city: sa.city,
                state: sa.state,
                pincode: sa.pincode,
                is_default: sa.is_default,
              }));
              setSaveAddress(false);
              setShowAddressForm(false);
            }}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor: selectedAddressId === sa.id ? theme.colors.surfaceVariant : 'transparent',
            }}
          >
            <Text style={{ fontWeight: theme.fontWeight.semibold }}>{sa.name} {sa.is_default ? '• Default' : ''}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{sa.address_line1}{sa.address_line2 ? ', ' + sa.address_line2 : ''}, {sa.city} {sa.pincode}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>☎ {sa.phone}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            setSelectedAddressId(null);
            setAddress({ name: '', receiver_name: '', phone: '', house: '', street: '', city: '', state: '', pincode: '' });
            setSaveAddress(true);
            setShowAddressForm(true);
          }}
          style={{ paddingVertical: theme.spacing.sm }}
        >
          <Text style={{ color: theme.colors.primary }}>+ Add new address</Text>
        </Pressable>

        <Pressable onPress={() => setSaveAddress((s) => !s)}>
          <Text style={{ color: saveAddress ? theme.colors.primary : theme.colors.textSecondary }}>{saveAddress ? '✔ Save this address' : 'Save this address'}</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <View style={{ gap: theme.spacing.sm }}>
      <Text style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text }}>Delivery address</Text>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <TextInput
          value={address.name}
          onChangeText={(v) => setAddress((prev) => ({ ...prev, name: v }))}
          placeholder="Label (Home / Office)"
          style={{ flex: 1 }}
        />

        <TextInput
          value={address.receiver_name}
          onChangeText={(v) => setAddress((prev) => ({ ...prev, receiver_name: v }))}
          placeholder="Receiver name"
          style={{ width: 160 }}
        />
      </View>

      <TextInput
        value={address.house}
        onChangeText={(v) => setAddress((prev) => ({ ...prev, house: v }))}
        placeholder="House / Street"
      />

      <TextInput
        value={address.street}
        onChangeText={(v) => setAddress((prev) => ({ ...prev, street: v }))}
        placeholder="Street / Landmark (optional)"
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <TextInput
          value={address.city}
          onChangeText={(v) => setAddress((prev) => ({ ...prev, city: v }))}
          placeholder="City"
          style={{ flex: 1 }}
        />
        <TextInput
          value={address.state}
          onChangeText={(v) => setAddress((prev) => ({ ...prev, state: v }))}
          placeholder="State"
          style={{ width: 120 }}
        />
      </View>

      <TextInput
        value={address.pincode}
        onChangeText={(v) => setAddress((prev) => ({ ...prev, pincode: v }))}
        placeholder="Pincode"
        keyboardType={'numeric' as any}
      />

      <TextInput
        value={address.phone}
        onChangeText={(v) => setAddress((prev) => ({ ...prev, phone: v }))}
        placeholder="Phone number"
        keyboardType={'phone-pad' as any}
      />

      <Pressable onPress={() => setSaveAddress((s) => !s)}>
        <Text style={{ color: saveAddress ? theme.colors.primary : theme.colors.textSecondary }}>{saveAddress ? '✔ Save this address' : 'Save this address'}</Text>
      </Pressable>
    </View>
  );

  const handleApplyCredits = () => {
    setCreditsToUse((prev) => (prev === 0 ? maxRedeemable : 0));
  };

  const handleCheckout = async () => {
    setPlacing(true);

    // Basic validation for address
    if (!address.house || !address.phone) {
      Alert.alert('Provide delivery details', 'Please enter your house/street and phone number before checkout.');
      setPlacing(false);
      return;
    }

    // If user decided to use credits, apply them
    if (creditsToUse > 0) {
      const ok = redeemCredits(creditsToUse);
      if (!ok) {
        Alert.alert('Credits', 'Failed to apply credits');
        setPlacing(false);
        return;
      }
    }

    // If payment needs external gateway, open it
    let paymentReference: string | undefined;
    if (paymentMethod !== 'cod') {
      const pay = await openPaymentGateway(paymentMethod);
      if (!pay.success) {
        Alert.alert('Payment failed', 'Payment gateway reported a failure.');
        setPlacing(false);
        return;
      }
      paymentReference = pay.reference;
    }

    // If user chose to save the address, insert into delivery_addresses
    let deliveryAddressId: string | undefined = undefined;
    if (saveAddress && user) {
      // If selectedAddressId is present and it's already saved, reuse it
      if (selectedAddressId) {
        deliveryAddressId = selectedAddressId;
      } else {
        const { data: addrData, error: addrErr } = await supabase
          .from('delivery_addresses')
          .insert([
            {
              user_id: user.id,
              name: address.name || 'Home',
              receiver_name: address.receiver_name || address.name || '',
              phone: address.phone,
              address_line1: address.house,
              address_line2: address.street || null,
              landmark: null,
              city: address.city,
              state: address.state || '',
              pincode: address.pincode,
              is_default: address.is_default || false,
            },
          ])
          .select()
          .single();

        if (addrErr) {
          Alert.alert('Address save failed', addrErr.message || String(addrErr));
          setPlacing(false);
          return;
        }

        deliveryAddressId = addrData?.id;
        // refresh saved addresses
        fetchSavedAddresses();
      }
    }

    try {
      const res = await placeOrder({ creditsUsed: creditsToUse, address, payment_method: paymentMethod, payment_reference: paymentReference, delivery_address_id: deliveryAddressId });

      if (!res.success) {
        Alert.alert('Order failed', res.error || 'Unable to place order');
        setPlacing(false);
        return;
      }

      // award credits
      if (res.orderId) {
        earnCredits(finalTotal, res.orderId);
      }

      // navigate to modal with order info
      router.push({
        pathname: '/modal',
        params: {
          total: finalTotal.toFixed(2),
          creditsUsed: creditsToUse,
          orderId: res.orderId,
        },
      });
    } finally {
      setPlacing(false);
    }
  };

  /* ---------------- EMPTY STATE ---------------- */

  if (items.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
      >
        <Text style={{ fontSize: 80 }}>🛒</Text>
        <Text
          style={{
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.text,
          }}
        >
          Your cart is empty
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            textAlign: 'center',
          }}
        >
          Add some items to get started!
        </Text>
      </View>
    );
  }

  /* ---------------- MAIN CART ---------------- */

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.md }}>
          {/* Credits Banner */}
          {credits > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.secondary + '20',
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🎁</Text>
                  <Text
                    style={{
                      fontSize: theme.fontSize.md,
                      fontWeight: theme.fontWeight.semibold,
                      color: theme.colors.text,
                    }}
                  >
                    {credits} Credits Available
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: theme.fontSize.xs,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Use up to {maxRedeemable} credits (₹{getCreditsValue(maxRedeemable).toFixed(2)} off)
                </Text>
              </View>

              <Pressable
                onPress={handleApplyCredits}
                style={{
                  backgroundColor:
                    creditsToUse > 0
                      ? theme.colors.secondary
                      : theme.colors.surface,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.semibold,
                    color:
                      creditsToUse > 0
                        ? '#FFFFFF'
                        : theme.colors.secondary,
                  }}
                >
                  {creditsToUse > 0 ? 'Remove' : 'Apply'}
                </Text>
              </Pressable>
            </View>
          )}

          {addressSection}

          {/* Payment Method */}
          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
            <Text style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text }}>Payment method</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {(['cod', 'card', 'upi'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setPaymentMethod(m)}
                  style={{
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: paymentMethod === m ? theme.colors.primary : theme.colors.surface,
                  }}
                >
                  <Text style={{ color: paymentMethod === m ? '#FFFFFF' : theme.colors.text, fontWeight: theme.fontWeight.semibold }}>
                    {m === 'cod' ? 'Cash' : m === 'card' ? 'Card' : 'UPI'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {paymentMethod !== 'cod' && (
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.textSecondary }}>
                You will be redirected to a payment gateway after tapping Checkout.
              </Text>
            )}
          </View>

          {/* Cart Items */}
          {items.map((item) => (
            <View
              key={item.product.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={(((item.product as any).image ?? item.product.image_url) as any)} />
              </View>

              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.medium,
                    color: theme.colors.text,
                  }}
                >
                  {item.product.name}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {item.product.unit}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.bold,
                    color: theme.colors.primary,
                  }}
                >
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>

              <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: theme.borderRadius.full,
                    padding: theme.spacing.xs,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity - 1
                      )
                    }
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.lg,
                        color: theme.colors.text,
                      }}
                    >
                      −
                    </Text>
                  </Pressable>

                  <Text
                    style={{
                      fontSize: theme.fontSize.md,
                      fontWeight: theme.fontWeight.semibold,
                      color: theme.colors.text,
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity + 1
                      )
                    }
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.lg,
                        color: theme.colors.text,
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() =>
                    removeFromCart(item.product.id)
                  }
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: theme.colors.error,
                    }}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Checkout */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          borderTopLeftRadius: theme.borderRadius.lg,
          borderTopRightRadius: theme.borderRadius.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.textSecondary }}>
            Subtotal
          </Text>
          <Text style={{ color: theme.colors.text }}>
            ₹{totalPrice.toFixed(2)}
          </Text>
        </View>

        {creditsToUse > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: theme.colors.secondary }}>
              Credits Discount ({creditsToUse} pts)
            </Text>
            <Text style={{ color: theme.colors.secondary }}>
              -₹{discount.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.textSecondary }}>
            Delivery
          </Text>
          <Text style={{ color: theme.colors.success }}>
            FREE
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: theme.colors.border }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.text,
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.primary,
            }}
          >
            ₹{finalTotal.toFixed(2)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.primary + '15',
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <Text style={{ fontSize: 16 }}>⭐</Text>
          <Text
            style={{
              fontSize: theme.fontSize.xs,
              color: theme.colors.primary,
            }}
          >
            Earn {creditsEarned} credits with this order!
          </Text>
        </View>

        <Button onPress={handleCheckout} disabled={placing}>{placing ? 'Placing…' : 'Checkout'}</Button>
      </View>
    </View>
  );
}
