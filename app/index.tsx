import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(auth)/auth" />;
}
