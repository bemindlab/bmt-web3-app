import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are displayed
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }) as Notifications.NotificationBehavior,
});

class NotificationService {
  private pushToken: string | null = null;

  async initialize() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    this.pushToken = token.data;

    // Save token to AsyncStorage
    if (this.pushToken) {
      await AsyncStorage.setItem('pushToken', this.pushToken);
    }

    // Configure notification categories
    await this.setupNotificationCategories();

    // Setup notification listeners
    this.setupListeners();

    return this.pushToken;
  }

  private async setupNotificationCategories() {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('TRADING_ALERT', [
        {
          identifier: 'VIEW_POSITION',
          buttonTitle: 'View Position',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'CLOSE_POSITION',
          buttonTitle: 'Close Position',
          options: {
            opensAppToForeground: true,
            isDestructive: true,
          },
        },
      ]);
    }
  }

  private setupListeners() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification received:', notification);
      this.handleNotification(notification);
    });

    // Handle notification clicked
    Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification clicked:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotification(notification: Notifications.Notification) {
    const { data } = notification.request.content;

    // Handle different notification types
    if (data?.type === 'position_alert') {
      this.handlePositionAlert(data);
    } else if (data?.type === 'price_alert') {
      this.handlePriceAlert(data);
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { actionIdentifier } = response;
    const { data } = response.notification.request.content;

    switch (actionIdentifier) {
      case 'VIEW_POSITION':
        // Navigate to position details
        if (data?.positionId && typeof data.positionId === 'string') {
          this.navigateToPosition(data.positionId);
        }
        break;
      case 'CLOSE_POSITION':
        // Trigger position close
        if (data?.positionId && typeof data.positionId === 'string') {
          this.closePositionFromNotification(data.positionId);
        }
        break;
      default:
        // Default action - open app
        break;
    }
  }

  private handlePositionAlert(data: any) {
    // Handle position-related alerts
    console.log('Position alert:', data);
  }

  private handlePriceAlert(data: any) {
    // Handle price alerts
    console.log('Price alert:', data);
  }

  private navigateToPosition(positionId: string) {
    // Implement navigation to position details
    console.log('Navigate to position:', positionId);
  }

  private closePositionFromNotification(positionId: string) {
    // Implement position closing from notification
    console.log('Close position:', positionId);
  }

  // Send local notification
  async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    categoryIdentifier?: string
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        categoryIdentifier,
        sound: true,
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  }

  // Position notifications
  async notifyPositionOpened(symbol: string, side: string, amount: number) {
    await this.sendLocalNotification(
      'Position Opened',
      `${side.toUpperCase()} ${symbol} - Amount: $${amount.toFixed(2)}`,
      { type: 'position_alert', action: 'opened' }
    );
  }

  async notifyPositionClosed(symbol: string, pnl: number) {
    const pnlText = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
    await this.sendLocalNotification('Position Closed', `${symbol} closed with PnL: ${pnlText}`, {
      type: 'position_alert',
      action: 'closed',
      pnl,
    });
  }

  async notifyStopLossHit(symbol: string, loss: number) {
    await this.sendLocalNotification(
      '⚠️ Stop Loss Triggered',
      `${symbol} stop loss hit. Loss: -$${Math.abs(loss).toFixed(2)}`,
      { type: 'position_alert', action: 'stop_loss' },
      'TRADING_ALERT'
    );
  }

  async notifyTakeProfitHit(symbol: string, profit: number) {
    await this.sendLocalNotification(
      '✅ Take Profit Triggered',
      `${symbol} take profit hit. Profit: +$${profit.toFixed(2)}`,
      { type: 'position_alert', action: 'take_profit' }
    );
  }

  async notifyLiquidationWarning(symbol: string, markPrice: number, liquidationPrice: number) {
    await this.sendLocalNotification(
      '🚨 Liquidation Warning',
      `${symbol} approaching liquidation. Mark: $${markPrice.toFixed(2)}, Liq: $${liquidationPrice.toFixed(2)}`,
      { type: 'position_alert', action: 'liquidation_warning' },
      'TRADING_ALERT'
    );
  }

  // Price alerts
  async notifyPriceAlert(symbol: string, currentPrice: number, targetPrice: number) {
    await this.sendLocalNotification(
      'Price Alert',
      `${symbol} reached $${currentPrice.toFixed(2)} (Target: $${targetPrice.toFixed(2)})`,
      { type: 'price_alert', symbol, currentPrice, targetPrice }
    );
  }

  // Account alerts
  async notifyLowBalance(balance: number, threshold: number) {
    await this.sendLocalNotification(
      '💰 Low Balance Warning',
      `Account balance ($${balance.toFixed(2)}) below threshold ($${threshold.toFixed(2)})`,
      { type: 'account_alert', action: 'low_balance' }
    );
  }

  async notifyHighDrawdown(drawdown: number, maxDrawdown: number) {
    await this.sendLocalNotification(
      '📉 High Drawdown Alert',
      `Current drawdown (${drawdown.toFixed(2)}%) exceeds maximum (${maxDrawdown.toFixed(2)}%)`,
      { type: 'account_alert', action: 'high_drawdown' }
    );
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  // Get push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Register token with backend
  async registerTokenWithBackend(userId: string) {
    if (!this.pushToken) return;

    try {
      // Send token to your backend
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            token: this.pushToken,
            platform: Platform.OS,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to register push token');
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }
}

export default new NotificationService();
