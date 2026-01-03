import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { View } from '@/components/mobile/View';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Order } from '@/data/orders';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

const getStatusColor = (status: Order['status'], theme: any) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'confirmed':
      return theme.colors.primary;
    case 'preparing':
      return theme.colors.secondary;
    case 'out_for_delivery':
      return theme.colors.primaryLight;
    case 'delivered':
      return theme.colors.success;
    default:
      return theme.colors.textMuted;
  }
};

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'confirmed':
      return '✅';
    case 'preparing':
      return '👨‍🍳';
    case 'out_for_delivery':
      return '🚚';
    case 'delivered':
      return '📦';
    default:
      return '📋';
  }
};

export default function OrdersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapStatus = (s: string) => {
    switch (s) {
      case 'placed':
        return 'pending';
      default:
        return s as Order['status'];
    }
  };

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: ordersData, error: ordersErr } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

      if (ordersErr) {
        setError(ordersErr.message);
        setOrders([]);
        return;
      }

      const ids = (ordersData || []).map((o: any) => o.id);
      if (ids.length === 0) {
        setOrders([]);
        return;
      }

      const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', ids);

      const productIds = Array.from(new Set((itemsData || []).map((it: any) => it.product_id)));
      const { data: productsData } = await supabase.from('products').select('id, name').in('id', productIds);

      const productsMap: Record<string, any> = {};
      (productsData || []).forEach((p: any) => (productsMap[p.id] = p));

      const mapped = (ordersData || []).map((o: any) => {
        const items = (itemsData || []).filter((it: any) => it.order_id === o.id).map((it: any) => ({
          name: productsMap[it.product_id]?.name || it.product_id,
          quantity: it.quantity,
          price: Number(it.price),
        }));

        const metadata = o.metadata || null;
        let addressStr = '';
        if (o.address) addressStr = o.address;
        else if (metadata?.address) {
          if (typeof metadata.address === 'string') addressStr = metadata.address;
          else if (typeof metadata.address === 'object') {
            const a = metadata.address;
            addressStr = `${a.house || ''}${a.street ? ', ' + a.street : ''}${a.city ? ', ' + a.city : ''}${a.pincode ? ' - ' + a.pincode : ''}`.trim();
          }
        }

        const paymentMethod = o.payment_method || metadata?.payment_method || '';

        return {
          id: o.id,
          items,
          total: Number(o.total_amount),
          status: mapStatus(o.status),
          createdAt: o.created_at || new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          address: addressStr,
          paymentMethod,
        } as Order;
      });

      setOrders(mapped);
    } catch (err: any) {
      setError(err?.message || String(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

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
          My Orders
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.md }}>
          {orders.map((order) => (
            <View
              key={order.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                gap: theme.spacing.md,
              }}
            >
              {/* Order Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ gap: theme.spacing.xs }}>
                  <Text
                    style={{
                      fontSize: theme.fontSize.md,
                      fontWeight: theme.fontWeight.semibold,
                      color: theme.colors.text,
                    }}
                  >
                    {order.id}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    backgroundColor:
                      getStatusColor(order.status, theme) + '20',
                    paddingVertical: theme.spacing.xs,
                    paddingHorizontal: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>
                    {getStatusIcon(order.status)}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: getStatusColor(order.status, theme),
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              {/* Delivery Tracking */}
              {order.status === 'out_for_delivery' && (
                <View
                  style={{
                    backgroundColor:
                      theme.colors.primaryLight + '20',
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    gap: theme.spacing.sm,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🚚</Text>
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.semibold,
                        color: theme.colors.primary,
                      }}
                    >
                      Your order is on the way!
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Estimated delivery:{' '}
                    {new Date(
                      order.estimatedDelivery
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>

                  {/* Progress */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                      marginTop: theme.spacing.sm,
                    }}
                  >
                    {[
                      'confirmed',
                      'preparing',
                      'out_for_delivery',
                      'delivered',
                    ].map((step, index) => {
                      const isCompleted =
                        ['confirmed', 'preparing', 'out_for_delivery'].indexOf(
                          order.status
                        ) >= index;

                      return (
                        <React.Fragment key={step}>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: theme.borderRadius.full,
                              backgroundColor: isCompleted
                                ? theme.colors.primary
                                : theme.colors.border,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color: isCompleted
                                  ? '#FFFFFF'
                                  : theme.colors.textMuted,
                              }}
                            >
                              {isCompleted ? '✓' : index + 1}
                            </Text>
                          </View>

                          {index < 3 && (
                            <View
                              style={{
                                flex: 1,
                                height: 2,
                                backgroundColor: isCompleted
                                  ? theme.colors.primary
                                  : theme.colors.border,
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Delivery Address */}
              {order.address ? (
                <View style={{ paddingVertical: theme.spacing.sm }}>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>Deliver to</Text>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.text }}>{order.address}</Text>
                </View>
              ) : null}

              {/* Payment Method */}
              {order.paymentMethod ? (
                <View style={{ paddingVertical: theme.spacing.sm }}>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>Payment</Text>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.text }}>{order.paymentMethod}</Text>
                </View>
              ) : null}

              {/* Order Items */}
              <View style={{ gap: theme.spacing.xs }}>
                {order.items.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {item.quantity}x {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.colors.text,
                      }}
                    >
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: theme.spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.semibold,
                    color: theme.colors.text,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.bold,
                    color: theme.colors.primary,
                  }}
                >
                  ₹{order.total.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
