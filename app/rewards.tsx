import React from 'react';
import { Pressable } from 'react-native';
import { View } from '@/components/mobile/View';
import { Text } from '@/components/mobile/Text';
import { ScrollView } from '@/components/mobile/ScrollView';
import { useTheme } from '@/contexts/ThemeContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function RewardsScreen() {
  const { theme } = useTheme();
  const { credits, transactions, getCreditsValue } = useCredits();
  const router = useRouter();

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.md,
          gap: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </Pressable>

        <Text
          style={{
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.text,
          }}
        >
          My Rewards
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.lg }}>
          {/* Credits Summary */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <Text style={{ fontSize: 48 }}>🏆</Text>

            <Text
              style={{
                fontSize: 48,
                fontWeight: theme.fontWeight.bold,
                color: '#FFFFFF',
              }}
            >
              {credits}
            </Text>

            <Text
              style={{
                fontSize: theme.fontSize.md,
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Credits Available
            </Text>

            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Worth ${getCreditsValue(credits).toFixed(2)} in discounts
            </Text>
          </LinearGradient>

          {/* How It Works */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              How Credits Work
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text style={{ fontSize: 20 }}>⭐</Text>
                <Text style={{ flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>
                  Earn 5% credits on every order
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text style={{ fontSize: 20 }}>💰</Text>
                <Text style={{ flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>
                  10 credits = $1 discount
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text style={{ fontSize: 20 }}>🎯</Text>
                <Text style={{ flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>
                  Use up to 50% of cart value in credits
                </Text>
              </View>
            </View>
          </View>

          {/* Transactions */}
          <View style={{ gap: theme.spacing.md }}>
            <Text
              style={{
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              Recent Activity
            </Text>

            {transactions.length === 0 ? (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.xl,
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                }}
              >
                <Text style={{ fontSize: 40 }}>📋</Text>
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  No transactions yet
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                }}
              >
                {transactions.map((transaction, index) => (
                  <View
                    key={transaction.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: theme.spacing.md,
                      gap: theme.spacing.md,
                      borderBottomWidth:
                        index < transactions.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor:
                          transaction.type === 'earned'
                            ? theme.colors.success + '20'
                            : theme.colors.secondary + '20',
                        borderRadius: theme.borderRadius.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>
                        {transaction.type === 'earned' ? '⭐' : '🎁'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          fontSize: theme.fontSize.sm,
                          fontWeight: theme.fontWeight.medium,
                          color: theme.colors.text,
                        }}
                      >
                        {transaction.description}
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.fontSize.xs,
                          color: theme.colors.textMuted,
                        }}
                      >
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: theme.fontSize.md,
                        fontWeight: theme.fontWeight.semibold,
                        color:
                          transaction.type === 'earned'
                            ? theme.colors.success
                            : theme.colors.secondary,
                      }}
                    >
                      {transaction.type === 'earned' ? '+' : '-'}
                      {transaction.amount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
