import React from 'react';
import { Pressable } from 'react-native';
import { View } from '@/components/mobile/View';
import { Text } from '@/components/mobile/Text';
import { Button } from '@/components/mobile/Button';
import { ScrollView } from '@/components/mobile/ScrollView';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { credits, getCreditsValue } = useCredits();
  const router = useRouter();

  const menuItems = [
    { icon: '📦', label: 'My Orders', action: () => router.push('/orders') },
    { icon: '🎁', label: 'My Rewards', action: () => router.push('/rewards') },
    { icon: '📍', label: 'Delivery Addresses', action: () => {} },
    { icon: '💳', label: 'Payment Methods', action: () => {} },
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '❓', label: 'Help & Support', action: () => {} },
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        {/* Profile Header */}
        <View
          style={{
            alignItems: 'center',
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.lg,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 36, color: '#FFFFFF' }}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>

          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                fontWeight: theme.fontWeight.bold,
                color: theme.colors.text,
              }}
            >
              {user?.name || 'Guest'}
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              {user?.email || 'Not signed in'}
            </Text>
          </View>
        </View>

        {/* Credits Card */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ gap: theme.spacing.xs }}>
              <Text style={{ fontSize: theme.fontSize.sm, color: 'rgba(255,255,255,0.8)' }}>
                Available Credits
              </Text>
              <Text style={{ fontSize: 36, fontWeight: theme.fontWeight.bold, color: '#FFFFFF' }}>
                {credits}
              </Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.7)' }}>
                Worth ${getCreditsValue(credits).toFixed(2)} in discounts
              </Text>
            </View>
            <Text style={{ fontSize: 40 }}>🏆</Text>
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <Text style={{ fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
            Earn 5% credits on every order • 10 credits = $1 discount
          </Text>
        </LinearGradient>

        {/* Theme Toggle */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Text style={{ fontSize: 24 }}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.text }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>

          <Pressable
            onPress={toggleTheme}
            style={{
              width: 52,
              height: 28,
              backgroundColor: isDark ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.borderRadius.full,
              padding: 2,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#FFFFFF',
                borderRadius: theme.borderRadius.full,
                alignSelf: isDark ? 'flex-end' : 'flex-start',
              }}
            />
          </Pressable>
        </View>

        {/* Menu Items */}
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.action}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.spacing.md,
                gap: theme.spacing.md,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={{ flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text }}>
                {item.label}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Button
          variant="outline"
          onPress={() => {
            logout();
            router.replace('/'); // ⬅️ force re-entry through auth gate
          }}
        >

          <Text style={{ color: theme.colors.error }}>Sign Out</Text>
        </Button>

        {/* App Version */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: theme.fontSize.xs,
            color: theme.colors.textMuted,
          }}
        >
          TR Mega Mart v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
