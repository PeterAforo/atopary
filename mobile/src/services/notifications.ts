import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | 'none';
  priority?: 'high' | 'normal' | 'low';
}

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: notification.sound || 'default',
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger: {
          seconds: 1, // Show immediately
        },
        data: notification.data,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async sendPropertyAlert(property: any): Promise<void> {
    const notification: NotificationData = {
      title: 'New Property Alert!',
      body: `A new property "${property.title}" is now available in ${property.city}!`,
      data: {
        type: 'property_alert',
        propertyId: property.id,
        city: property.city,
        price: property.price,
      },
      sound: 'default',
      priority: 'high',
    };

    await this.sendLocalNotification(notification);
  }

  async sendInquiryAlert(inquiry: any): Promise<void> {
    const notification: NotificationData = {
      title: 'New Inquiry!',
      body: `You have a new inquiry about "${inquiry.propertyTitle}"`,
      data: {
        type: 'inquiry_alert',
        inquiryId: inquiry.id,
        propertyId: inquiry.propertyId,
      },
      sound: 'default',
      priority: 'high',
    };

    await this.sendLocalNotification(notification);
  }

  async sendMortgageUpdate(mortgage: any): Promise<void> {
    const notification: NotificationData = {
      title: 'Mortgage Update',
      body: `Your mortgage application status has been updated to: ${mortgage.status}`,
      data: {
        type: 'mortgage_update',
        mortgageId: mortgage.id,
        status: mortgage.status,
      },
      sound: 'default',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  async sendWelcomeMessage(user: any): Promise<void> {
    const notification: NotificationData = {
      title: 'Welcome to Atopary!',
      body: `Hello ${user.name}, welcome to the Atopary mobile app!`,
      data: {
        type: 'welcome',
        userId: user.id,
      },
      sound: 'default',
      priority: 'normal',
    };

    await this.sendLocalNotification(notification);
  }

  async setupNotificationListeners(): Promise<void> {
    // Handle notification responses
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    // Handle notification interactions
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Store notification for badge count
      this.updateBadgeCount();
    });

    // Handle when notification is tapped
    Notifications.addNotificationClickedListener(notification => {
      console.log('Notification clicked:', notification);
      
      // Navigate based on notification type
      if (notification.request?.content?.data?.type) {
        this.handleNotificationNavigation(notification.request.content.data);
      }
    });

    // Handle when notification is dismissed
    Notifications.addNotificationDismissedListener(notification => {
      console.log('Notification dismissed:', notification);
      this.updateBadgeCount();
    });
  }

  private async updateBadgeCount(): Promise<void> {
    try {
      const badgeCount = await Notifications.getBadgeCountAsync();
      // You can store this count in AsyncStorage for persistence
      await AsyncStorage.setItem('notification_badge_count', badgeCount.toString());
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  private async getStoredBadgeCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem('notification_badge_count');
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting stored badge count:', error);
      return 0;
    }
  }

  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      await AsyncStorage.removeItem('notification_badge_count');
    } catch (error) {
      console.error('Error clearing badge count:', error);
    }
  }

  async initialize(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (hasPermission) {
        const token = await this.getDeviceToken();
        
        if (token) {
          console.log('Device push token:', token);
          // Store token for server registration
          await AsyncStorage.setItem('device_token', token);
        }

        // Setup notification listeners
        await this.setupNotificationListeners();

        // Restore badge count
        const storedCount = await this.getStoredBadgeCount();
        await Notifications.setBadgeCountAsync(storedCount);
      } else {
        console.log('Notification permissions denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private handleNotificationNavigation(data: any): void {
    // This would integrate with your navigation system
    // For example, navigate to specific screens based on notification type
    switch (data.type) {
      case 'property_alert':
        // Navigate to property details
        // router.push(`/property/${data.propertyId}`);
        break;
      case 'inquiry_alert':
        // Navigate to inquiries
        // router.push('/(tabs)/inquiries');
        break;
      case 'mortgage_update':
        // Navigate to mortgage status
        // router.push('/(tabs)/mortgage');
        break;
      case 'welcome':
        // Navigate to home
        // router.push('/(tabs)/');
        break;
      default:
        // Navigate to notifications
        // router.push('/(tabs)/notifications');
        break;
    }
  }
}

export default NotificationService;
