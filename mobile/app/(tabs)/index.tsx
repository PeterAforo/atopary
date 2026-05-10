import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: { url: string }[];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/properties?limit=6&status=APPROVED&sort=newest`);
        const data = await response.json();
        setFeaturedProperties(data.properties || []);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      HOUSE: 'House',
      APARTMENT: 'Apartment',
      VILLA: 'Villa',
      CONDO: 'Condo',
      TOWNHOUSE: 'Townhouse',
      LAND: 'Land',
      COMMERCIAL: 'Commercial',
      OFFICE: 'Office',
    };
    return types[type] || type;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        {/* Welcome Section */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: theme.text,
            marginBottom: 8 
          }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: theme.textSecondary,
            marginBottom: 20 
          }}>
            Find your perfect property in Ghana
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginBottom: 30 
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.primary,
              padding: 15,
              borderRadius: 12,
              marginRight: 10,
            }}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={{ 
              color: '#FFFFFF', 
              fontWeight: '600',
              marginLeft: 8 
            }}>
              Search
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              padding: 15,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              marginLeft: 10,
            }}
            onPress={() => router.push('/(tabs)/properties')}
          >
            <Ionicons name="business" size={20} color={theme.primary} />
            <Text style={{ 
              color: theme.primary, 
              fontWeight: '600',
              marginLeft: 8 
            }}>
              Browse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Properties */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: theme.text,
            marginBottom: 15 
          }}>
            Featured Properties
          </Text>
          
          {loading ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProperties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={{
                    width: 280,
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    marginRight: 15,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => router.push(`/property/${property.id}`)}
                >
                  <Image
                    source={{ 
                      uri: property.images?.[0]?.url || 'https://via.placeholder.com/280x180.png?text=No+Image' 
                    }}
                    style={{
                      width: '100%',
                      height: 180,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                  
                  <View style={{ padding: 15 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: 'bold', 
                      color: theme.text,
                      marginBottom: 5 
                    }}>
                      {property.title}
                    </Text>
                    
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8 
                    }}>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: 'bold', 
                        color: theme.primary 
                      }}>
                        {formatCurrency(property.price)}
                      </Text>
                      <View style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}>
                        <Text style={{ 
                          fontSize: 10, 
                          color: '#FFFFFF',
                          fontWeight: '600' 
                        }}>
                          {getPropertyTypeLabel(property.type)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      gap: 15 
                    }}>
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="bed" size={14} color={theme.textSecondary} />
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.textSecondary,
                          marginLeft: 4 
                        }}>
                          {property.bedrooms} beds
                        </Text>
                      </View>
                      
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="water" size={14} color={theme.textSecondary} />
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.textSecondary,
                          marginLeft: 4 
                        }}>
                          {property.bathrooms} baths
                        </Text>
                      </View>
                      
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="resize" size={14} color={theme.textSecondary} />
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.textSecondary,
                          marginLeft: 4 
                        }}>
                          {property.area}m²
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      marginTop: 8 
                    }}>
                      <Ionicons name="location" size={14} color={theme.textSecondary} />
                      <Text style={{ 
                        fontSize: 12, 
                        color: theme.textSecondary,
                        marginLeft: 4 
                      }}>
                        {property.address}, {property.city}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
