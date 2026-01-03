import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
} from 'react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AddressInput {
  name?: string;
  phone: string;
  house: string;
  street?: string;
  city?: string;
  pincode?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  placeOrder: (opts?: { storeId?: string; address?: AddressInput; creditsUsed?: number; payment_method?: string; payment_reference?: string; delivery_address_id?: string }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
} 

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.product.id !== productId
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  // NOTE: we import auth & supabase lazily here to avoid circular imports at top
  // (placed below so static imports remain unchanged)
  const placeOrder = async (opts?: { storeId?: string; address?: AddressInput; creditsUsed?: number; payment_method?: string; payment_reference?: string }) => {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      // read current session for user id
      const sessionResult = await supabase.auth.getSession();
      const userId = sessionResult?.data?.session?.user?.id;

      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      if (items.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      const basePayload: any = {
        user_id: userId,
        total_amount: totalPrice,
        store_id: opts?.storeId || null,
        status: 'placed',
        delivery_address_id: opts?.delivery_address_id || null,
      };

      // Try to include address/payment info if provided. This will fail if the DB does not have those columns.
      let orderData: any = null;
      let orderError: any = null;

      if (opts?.address || opts?.payment_method || opts?.payment_reference || opts?.creditsUsed) {
        const payloadWithMeta = {
          ...basePayload,
          // store a metadata object if DB supports a 'metadata' json column
          metadata: {
            address: opts?.address,
            payment_method: opts?.payment_method,
            payment_reference: opts?.payment_reference,
            credits_used: opts?.creditsUsed,
          },
        };

        const res = await supabase.from('orders').insert([payloadWithMeta]).select().single();
        orderData = res.data;
        orderError = res.error;

        // if column doesn't exist or error is due to unknown column, fallback to base payload
        if (orderError) {
          const msg = (orderError.message || '').toLowerCase();
          if (msg.includes('column') || msg.includes('does not exist') || msg.includes('unknown')) {
            const res2 = await supabase.from('orders').insert([basePayload]).select().single();
            orderData = res2.data;
            orderError = res2.error;
          }
        }
      } else {
        const res = await supabase.from('orders').insert([basePayload]).select().single();
        orderData = res.data;
        orderError = res.error;
      }

      if (orderError || !orderData) {
        return { success: false, error: orderError?.message || 'Failed to create order' };
      }

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) {
        // rollback order
        await supabase.from('orders').delete().eq('id', orderData.id);
        return { success: false, error: itemsError.message };
      }

      // Success - clear cart
      clearCart();

      return { success: true, orderId: orderData.id };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }
  return context;
};
