import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface ApiKeySectionProps {
  title: string;
  subtitle?: string;
  apiKey: string;
  apiSecret?: string;
  onApiKeyChange: (value: string) => void;
  onApiSecretChange?: (value: string) => void;
  showApiKeys: boolean;
  testing: boolean;
  onTest: () => void;
  disabled?: boolean;
  helpText?: string;
  singleKey?: boolean;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  title,
  subtitle,
  apiKey,
  apiSecret = '',
  onApiKeyChange,
  onApiSecretChange,
  showApiKeys,
  testing,
  onTest,
  disabled = false,
  helpText,
  singleKey = false,
}) => {
  const isTestDisabled = singleKey ? !apiKey : !apiKey || !apiSecret;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>API Key</Text>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          value={apiKey}
          onChangeText={onApiKeyChange}
          placeholder={`Enter your ${title} API key`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showApiKeys}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
      </View>

      {!singleKey && onApiSecretChange && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>API Secret</Text>
          <TextInput
            style={[styles.input, disabled && styles.disabledInput]}
            value={apiSecret}
            onChangeText={onApiSecretChange}
            placeholder={`Enter your ${title} API secret`}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showApiKeys}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled}
          />
        </View>
      )}

      {helpText && <Text style={styles.helpText}>{helpText}</Text>}

      <TouchableOpacity
        style={[styles.testButton, (testing || isTestDisabled) && styles.testButtonDisabled]}
        onPress={onTest}
        disabled={testing || isTestDisabled}
      >
        {testing ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.testButtonText}>Test {title} Connection</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
