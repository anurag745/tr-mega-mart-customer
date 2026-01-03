import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Image as RNImage } from 'react-native';

import { Button } from '@/components/mobile/Button';
import { ScrollView } from '@/components/mobile/ScrollView';
import { Text } from '@/components/mobile/Text';
import { TextInput } from '@/components/mobile/TextInput';
import { View } from '@/components/mobile/View';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthScreen() {
  const { theme } = useTheme();
  const { login, loginWithGoogle, signup } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email || !password || (!isLogin && !name) || (!isLogin && !phone)) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(email, password, name, phone);
    }

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Authentication failed. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Google login failed.');
    }
    setLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          padding: theme.spacing.lg,
          alignItems: 'center',
          gap: theme.spacing.lg,
          paddingTop: 60,
          flex: 1,
        }}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <RNImage
            source={require('../../assets/images/icon.png')}
            style={{ width: 48, height: 48 }}
          />
          <Text
            style={{
              fontSize: theme.fontSize.xxl,
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.primary,
            }}
          >
            TR Mega Mart
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Your neighborhood supermarket
          </Text>
        </View>

        {/* Form */}
        <View
          style={{
            width: '100%',
            maxWidth: 400,
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.text,
              textAlign: 'center',
            }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>

          {!isLogin && (
            <>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </>
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          {error !== '' && (
            <Text
              style={{
                color: theme.colors.error,
                fontSize: theme.fontSize.sm,
                textAlign: 'center',
              }}
            >
              {error}
            </Text>
          )}

          <Button onPress={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>

          {/* Divider */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </View>

          <Button
            variant="outline"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </Button>

          {/* Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: theme.spacing.xs,
              marginTop: theme.spacing.md,
            }}
          >
            <Text style={{ color: theme.colors.textSecondary }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>

            <Pressable
              onPress={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: theme.fontWeight.semibold,
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
