import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface SettingsHeaderProps {
  showApiKeys: boolean;
  onToggleVisibility: (value: boolean) => void;
  unsavedChanges: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  showApiKeys,
  onToggleVisibility,
  unsavedChanges,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your API keys and preferences</Text>

        {unsavedChanges && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ You have unsaved changes</Text>
          </View>
        )}
      </View>

      <View style={styles.toggleSection}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleLabelContainer}>
            <Text style={styles.toggleLabel}>Show API Keys</Text>
            <Text style={styles.toggleDescription}>
              Toggle to reveal/hide your API keys and secrets
            </Text>
          </View>
          <Switch
            value={showApiKeys}
            onValueChange={onToggleVisibility}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={showApiKeys ? '#FFF' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  warningBanner: {
    backgroundColor: '#FEF3CD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  toggleSection: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
});
