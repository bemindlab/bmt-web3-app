import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface SettingsActionsProps {
  loading: boolean;
  unsavedChanges: boolean;
  onSave: () => void;
  onClear: () => void;
}

export const SettingsActions: React.FC<SettingsActionsProps> = ({
  loading,
  unsavedChanges,
  onSave,
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.saveButton,
          (!unsavedChanges || loading) && styles.disabledButton,
        ]}
        onPress={onSave}
        disabled={!unsavedChanges || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Text style={styles.buttonIcon}>💾</Text>
            <Text style={styles.saveButtonText}>Save All Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton, loading && styles.disabledButton]}
        onPress={onClear}
        disabled={loading}
      >
        <Text style={styles.buttonIcon}>🗑️</Text>
        <Text style={styles.clearButtonText}>Clear All Keys</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
