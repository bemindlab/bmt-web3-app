import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';

export const InfoSection: React.FC = () => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Handle error silently
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Quick Setup Guide</Text>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Configure <Text style={styles.bold}>exchange API keys</Text> for trading
          </Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            <Text style={styles.bold}>Test connections</Text> before saving
          </Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Start trading with <Text style={styles.bold}>secure local storage</Text>
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Get API Keys</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress('https://www.binance.com/en/my/settings/api-management')}
        >
          <Text style={styles.linkText}>Binance API Management →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress('https://www.gate.io/myaccount/apiv4keys')}
        >
          <Text style={styles.linkText}>Gate.io API Keys →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Required API Permissions</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Binance:</Text> Enable &quot;Enable Reading&quot; and &quot;Enable Futures&quot;
            permissions
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Gate.io:</Text> Enable &quot;Spot trading&quot; and &quot;Futures trading&quot;
            permissions
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>IP Restrictions:</Text> Either disable or add your current
            IP
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Testing:</Text> Connection tests use read-only API calls for
            safety
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Security Information</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoText}>• API keys are stored locally on your device</Text>
          <Text style={styles.infoText}>• We recommend read-only permissions for safety</Text>
          <Text style={styles.infoText}>• Never share your API keys with others</Text>
          <Text style={styles.infoText}>• You can revoke access at any time from the exchange</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    width: 24,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#374151',
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  infoList: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
