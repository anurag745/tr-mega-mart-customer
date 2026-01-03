import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface CreditTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

interface CreditsContextType {
  credits: number;
  transactions: CreditTransaction[];
  earnCredits: (orderTotal: number, orderId: string) => void;
  redeemCredits: (amount: number) => boolean;
  getCreditsValue: (credits: number) => number;
  getMaxRedeemable: (cartTotal: number) => number;
}

const CreditsContext = createContext<
  CreditsContextType | undefined
>(undefined);

// 10 credits = $1
const CREDITS_TO_DOLLAR = 10;
// Earn 5% of order value
const EARN_RATE = 0.05;

export const CreditsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [credits, setCredits] = useState(50);
  const [transactions, setTransactions] = useState<
    CreditTransaction[]
  >([
    {
      id: 'welcome',
      type: 'earned',
      amount: 50,
      description: 'Welcome bonus',
      date: new Date().toISOString(),
    },
  ]);

  const earnCredits = (
    orderTotal: number,
    orderId: string
  ) => {
    const earnedAmount = Math.floor(
      orderTotal * CREDITS_TO_DOLLAR * EARN_RATE
    );

    if (earnedAmount > 0) {
      setCredits((prev) => prev + earnedAmount);
      setTransactions((prev) => [
        {
          id: `earn-${orderId}`,
          type: 'earned',
          amount: earnedAmount,
          description: `Order ${orderId}`,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const redeemCredits = (amount: number): boolean => {
    if (amount > 0 && amount <= credits) {
      setCredits((prev) => prev - amount);
      setTransactions((prev) => [
        {
          id: `redeem-${Date.now()}`,
          type: 'redeemed',
          amount,
          description: 'Checkout discount',
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
      return true;
    }
    return false;
  };

  const getCreditsValue = (creditAmount: number) =>
    creditAmount / CREDITS_TO_DOLLAR;

  const getMaxRedeemable = (
    cartTotal: number
  ): number => {
    const maxDiscount = cartTotal * 0.5;
    const maxCredits = Math.floor(
      maxDiscount * CREDITS_TO_DOLLAR
    );
    return Math.min(credits, maxCredits);
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        transactions,
        earnCredits,
        redeemCredits,
        getCreditsValue,
        getMaxRedeemable,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error(
      'useCredits must be used within CreditsProvider'
    );
  }
  return context;
};
