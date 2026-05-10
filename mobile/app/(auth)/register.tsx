import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER' as 'BUYER' | 'SELLER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, role } = formData;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
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
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFFFFF',
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
              marginBottom: 8,
            }}>
              Create Account
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.textSecondary,
              textAlign: 'center',
            }}>
              Join Atopary and start your property journey
            </Text>
          </View>

          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 8,
            }}>
              Full Name
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
              <Ionicons name="person" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                style={{
                  flex: 1,
                  height: 50,
                  fontSize: 16,
                  color: theme.text,
                }}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 8,
            }}>
              Email Address
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
              <Ionicons name="mail" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                style={{
                  flex: 1,
                  height: 50,
                  fontSize: 16,
                  color: theme.text,
                }}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Role Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 8,
            }}>
              I am a
            </Text>
            <View style={{
              flexDirection: 'row',
              backgroundColor: theme.background,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  backgroundColor: formData.role === 'BUYER' ? theme.primary : 'transparent',
                  borderRadius: 8,
                  borderWidth: formData.role === 'BUYER' ? 0 : 1,
                  borderColor: theme.border,
                }}
                onPress={() => setFormData({ ...formData, role: 'BUYER' })}
              >
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={formData.role === 'BUYER' ? '#FFFFFF' : theme.textSecondary} 
                />
                <Text style={{
                  fontSize: 16,
                  color: formData.role === 'BUYER' ? '#FFFFFF' : theme.text,
                  marginLeft: 8,
                }}>
                  Buyer
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  backgroundColor: formData.role === 'SELLER' ? theme.primary : 'transparent',
                  borderRadius: 8,
                  borderWidth: formData.role === 'SELLER' ? 0 : 1,
                  borderColor: theme.border,
                }}
                onPress={() => setFormData({ ...formData, role: 'SELLER' })}
              >
                <Ionicons 
                  name="business" 
                  size={20} 
                  color={formData.role === 'SELLER' ? '#FFFFFF' : theme.textSecondary} 
                />
                <Text style={{
                  fontSize: 16,
                  color: formData.role === 'SELLER' ? '#FFFFFF' : theme.text,
                  marginLeft: 8,
                }}>
                  Seller
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 8,
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
              <Ionicons name="lock-closed" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                style={{
                  flex: 1,
                  height: 50,
                  fontSize: 16,
                  color: theme.text,
                }}
                placeholder="Create a strong password"
                placeholderTextColor={theme.textSecondary}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
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

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 8,
            }}>
              Confirm Password
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
              <Ionicons name="lock-closed" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <TextInput
                style={{
                  flex: 1,
                  height: 50,
                  fontSize: 16,
                  color: theme.text,
                }}
                placeholder="Confirm your password"
                placeholderTextColor={theme.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 8 }}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
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
                color: '#FFFFFF',
              }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
              Already have an account?{' '}
              <Text
                style={{ fontSize: 14, color: theme.primary, fontWeight: '600' }}
                onPress={() => router.push('/(auth)/login')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
