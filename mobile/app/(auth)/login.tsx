import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Keychain from 'react-native-keychain';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  React.useEffect(() => {
    // Check for biometric availability
    const checkBiometric = async () => {
      try {
        const credentials = await Keychain.getSupportedBiometryType();
        setBiometricAvailable(!!credentials);
      } catch (error) {
        console.log('Biometric check error:', error);
        setBiometricAvailable(false);
      }
    };
    
    checkBiometric();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const credentials = await Keychain.getInternetCredentials('atopary_auth');
      
      if (credentials) {
        await login(credentials.username, credentials.password);
        router.replace('/(tabs)');
      } else {
        Alert.alert('No Credentials', 'No saved credentials found for biometric login');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Biometric Login Failed', 'An error occurred during biometric login');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', paddingHorizontal: 24 }}>
      <View style={{ 
        width: '100%', 
        maxWidth: 400, 
        backgroundColor: theme.surface, 
        borderRadius: 16, 
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: theme.primary,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#FFFFFF' 
            }}>
              A
            </Text>
          </View>
        </View>

        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: theme.text,
            textAlign: 'center',
            marginBottom: 8 
          }}>
            Welcome Back
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: theme.textSecondary,
            textAlign: 'center' 
          }}>
            Sign in to your Atopary account
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: theme.text,
            marginBottom: 8 
          }}>
            Email
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 16,
          }}>
            <Ionicons 
              name="mail" 
              size={20} 
              color={theme.textSecondary} 
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={{
                flex: 1,
                height: 50,
                fontSize: 16,
                color: theme.text,
              }}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: theme.text,
            marginBottom: 8 
          }}>
            Password
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 16,
          }}>
            <Ionicons 
              name="lock-closed" 
              size={20} 
              color={theme.textSecondary} 
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={{
                flex: 1,
                height: 50,
                fontSize: 16,
                color: theme.text,
              }}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 8 }}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Biometric Login Button */}
        {biometricAvailable && (
          <TouchableOpacity
            onPress={handleBiometricLogin}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 16,
            }}
          >
            <Ionicons name="finger-print" size={20} color={theme.primary} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: theme.primary,
              marginLeft: 8 
            }}>
              Login with Biometrics
            </Text>
          </TouchableOpacity>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: theme.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#FFFFFF' 
            }}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={{ 
              fontSize: 14, 
              color: theme.primary,
              textDecorationLine: 'underline' 
            }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            Don't have an account?{' '}
            <Text 
              style={{ fontSize: 14, color: theme.primary, fontWeight: '600' }}
              onPress={() => router.push('/(auth)/register')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
