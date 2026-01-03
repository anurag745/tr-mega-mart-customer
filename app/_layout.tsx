import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CreditsProvider } from '@/contexts/CreditsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <CreditsProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              {/* Entry */}
              <Stack.Screen name="index" />

              {/* Auth */}
              <Stack.Screen name="(auth)/auth" />

              {/* Bottom tabs */}
              <Stack.Screen name="(tabs)" />

              {/* ✅ Product details (STACK, NOT TAB) */}
              <Stack.Screen
                name="products/[id]"
                options={{
                  headerShown: true,
                  title: 'Product',
                }}
              />

              {/* Optional modal */}
              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal' }}
              />
            </Stack>

            <StatusBar style="auto" />
          </CreditsProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
