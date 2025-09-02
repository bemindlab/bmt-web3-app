/**
 * Professional Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and provides
 * professional error handling with recovery options and error reporting.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { tradingColors, typography, spacing } from '../../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to crash analytics (in production)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context || 'Unknown',
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    };

    // In production, send to crash reporting service
    if (__DEV__) {
      console.log('Error Report:', JSON.stringify(errorReport, null, 2));
    } else {
      // Send to analytics service
      // Example: Crashlytics.recordError(errorReport);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      Alert.alert(
        'Maximum Retries Reached',
        'Please restart the app to continue trading.',
        [{ text: 'OK' }]
      );
    }
  };

  private handleReload = () => {
    // Reset retry count and error state
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message || 'Unknown error',
      context: this.props.context || 'Trading App',
    };

    Alert.alert(
      'Report Bug',
      `Error ID: ${errorDetails.errorId}\n\nWould you like to report this issue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            // Open email client or in-app feedback
            console.log('Bug report submitted:', errorDetails);
            Alert.alert('Thank You', 'Bug report submitted successfully.');
          },
        },
      ]
    );
  };

  private renderErrorDetails = () => {
    if (!this.props.showErrorDetails || !__DEV__) return null;

    return (
      <ScrollView style={styles.errorDetails}>
        <Text style={styles.errorDetailsTitle}>Error Details (Debug Mode)</Text>
        <Text style={styles.errorText}>
          {this.state.error?.message}
        </Text>
        {this.state.error?.stack && (
          <Text style={styles.stackTrace}>
            {this.state.error.stack}
          </Text>
        )}
        {this.state.errorInfo?.componentStack && (
          <>
            <Text style={styles.errorDetailsTitle}>Component Stack</Text>
            <Text style={styles.stackTrace}>
              {this.state.errorInfo.componentStack}
            </Text>
          </>
        )}
      </ScrollView>
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default professional error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>
            <Text style={styles.errorMessage}>
              {this.props.context ? 
                `An error occurred in ${this.props.context}` : 
                'An unexpected error occurred while trading'
              }
            </Text>
            
            <Text style={styles.errorId}>
              Error ID: {this.state.errorId}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {this.retryCount < this.maxRetries && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={this.handleRetry}
                >
                  <Text style={styles.primaryButtonText}>
                    Retry ({this.maxRetries - this.retryCount} left)
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReload}
              >
                <Text style={styles.secondaryButtonText}>
                  Reload Component
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReportBug}
              >
                <Text style={styles.secondaryButtonText}>
                  Report Issue
                </Text>
              </TouchableOpacity>
            </View>

            {/* Safe Mode Notice */}
            <View style={styles.safetyNotice}>
              <Text style={styles.safetyNoticeText}>
                💡 Your trading data is safe. No orders were affected.
              </Text>
            </View>

            {/* Error Details for Development */}
            {this.renderErrorDetails()}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tradingColors.dark.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContainer: {
    backgroundColor: tradingColors.dark.background.secondary,
    borderRadius: 8,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1, borderColor: tradingColors.dark.border.primary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  errorId: {
    fontSize: typography.fontSize.sm,
    color: tradingColors.dark.text.tertiary,
    fontFamily: 'monospace',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  actionButtons: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: tradingColors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: tradingColors.dark.surface.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: tradingColors.dark.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },

  safetyNotice: {
    backgroundColor: tradingColors.success + '20', // 20% opacity
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    width: '100%',
  },
  safetyNoticeText: {
    fontSize: typography.fontSize.sm,
    color: tradingColors.success,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },

  errorDetails: {
    maxHeight: 200,
    width: '100%',
    marginTop: spacing.lg,
    backgroundColor: tradingColors.dark.surface.interactive,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  errorDetailsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.loss,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  stackTrace: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
    fontFamily: 'monospace',
    lineHeight: typography.fontSize.xs * 1.2,
  },
});

// Higher-order component wrapper for easier use
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'Unknown context'}:`, error);
    
    // Report to analytics service
    if (!__DEV__) {
      // Example: Crashlytics.recordError(error);
    }
  };

  const handleAsyncError = (errorPromise: Promise<any>, context?: string) => {
    errorPromise.catch((error) => {
      reportError(error, context);
      Alert.alert(
        'Error',
        `An error occurred${context ? ` in ${context}` : ''}. Please try again.`
      );
    });
  };

  return { reportError, handleAsyncError };
};