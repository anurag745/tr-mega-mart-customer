export interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  address?: string;
  paymentMethod?: string;
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [
      { name: 'Whole Milk 1L', quantity: 2, price: 3.99 },
      { name: 'White Bread', quantity: 1, price: 2.99 },
      { name: 'Cheddar Cheese', quantity: 1, price: 6.99 },
    ],
    total: 17.96,
    status: 'out_for_delivery',
    createdAt: '2024-01-15T10:30:00',
    estimatedDelivery: '2024-01-15T12:00:00',
    address: '123 Main Street, Apt 4B',
  },
  {
    id: 'ORD-002',
    items: [
      { name: 'Orange Juice', quantity: 1, price: 4.99 },
      { name: 'Frozen Pizza', quantity: 2, price: 8.99 },
    ],
    total: 22.97,
    status: 'delivered',
    createdAt: '2024-01-14T15:00:00',
    estimatedDelivery: '2024-01-14T17:30:00',
    address: '123 Main Street, Apt 4B',
  },
];
