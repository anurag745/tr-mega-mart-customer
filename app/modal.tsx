import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import { Button } from '@/components/mobile/Button';
import { Text } from '@/components/mobile/Text';
import { View } from '@/components/mobile/View';
import { useCart } from '@/contexts/CartContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ModalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { clearCart } = useCart();
  const { earnCredits } = useCredits();

  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId;

  const handleDone = () => {
    clearCart();
    router.replace('/(tabs)');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
    >
      <Text style={{ fontSize: 64 }}>🎉</Text>

      <Text
        style={{
          fontSize: theme.fontSize.xl,
          fontWeight: theme.fontWeight.bold,
          color: theme.colors.text,
          textAlign: 'center',
        }}
      >
        Order Placed!
      </Text>

      <Text
        style={{
          fontSize: theme.fontSize.md,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}
      >
        Your order has been placed successfully.
      </Text>

      {orderId && (
        <Text style={{ color: theme.colors.textSecondary }}>
          Order ID: {orderId}
        </Text>
      )}

      <Button onPress={handleDone}>
        Back to Home
      </Button>
    </View>
  );
}
