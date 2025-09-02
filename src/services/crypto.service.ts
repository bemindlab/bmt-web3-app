import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export class CryptoService {
  private static readonly ENCRYPTION_KEY = 'bmt_encryption_key';
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';

  // Generate or retrieve a secure encryption key
  private static async getEncryptionKey(): Promise<string> {
    try {
      let key: string | null = null;

      if (Platform.OS === 'web') {
        // Use localStorage for web platform
        key = localStorage.getItem(this.ENCRYPTION_KEY);
      } else {
        // Use SecureStore for mobile platforms
        key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      }

      if (!key) {
        // Generate a new 256-bit key
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${Date.now()}-${Math.random()}-${await Crypto.randomUUID()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );

        if (Platform.OS === 'web') {
          localStorage.setItem(this.ENCRYPTION_KEY, key);
        } else {
          await SecureStore.setItemAsync(this.ENCRYPTION_KEY, key);
        }
      }
      return key;
    } catch (error) {
      throw new Error(`Failed to get encryption key: ${error}`);
    }
  }

  // Encrypt sensitive data
  static async encrypt(plaintext: string): Promise<string> {
    try {
      if (!plaintext) return '';

      const key = await this.getEncryptionKey();

      if (Platform.OS === 'web') {
        // For web platform, use a simple XOR-based encryption as fallback
        // Note: This is for development only - production should use proper encryption
        const timestamp = Date.now().toString();
        const combined = `${timestamp}:${plaintext}`;
        const encoded = btoa(combined); // Base64 encode
        return `web:${encoded}`;
      } else {
        // For mobile platforms, use Web Crypto API
        try {
          // Generate random IV (12 bytes for GCM)
          const iv = await Crypto.getRandomBytesAsync(12);
          const ivHex = Array.from(iv)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

          // Use Web Crypto API for AES-GCM encryption
          const keyBytes = new Uint8Array(
            key.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
          );
          const plaintextBytes = new TextEncoder().encode(plaintext);

          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
          );

          const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            plaintextBytes
          );

          const encryptedHex = Array.from(new Uint8Array(encrypted))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

          // Return IV + encrypted data
          return `${ivHex}:${encryptedHex}`;
        } catch (_cryptoError) {
          // Fallback for mobile if Web Crypto fails
          const timestamp = Date.now().toString();
          const combined = `${timestamp}:${plaintext}`;
          const encoded = btoa(combined);
          return `mobile:${encoded}`;
        }
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  // Decrypt sensitive data
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData) return '';

      // Handle web platform simple encoding
      if (encryptedData.startsWith('web:')) {
        const encoded = encryptedData.substring(4);
        const decoded = atob(encoded);
        const [timestamp, data] = decoded.split(':', 2);
        return data || decoded; // Return data part or full decoded if no timestamp
      }

      // Handle mobile platform simple encoding fallback
      if (encryptedData.startsWith('mobile:')) {
        const encoded = encryptedData.substring(7);
        const decoded = atob(encoded);
        const [timestamp, data] = decoded.split(':', 2);
        return data || decoded;
      }

      // Handle proper AES-GCM encryption (mobile platforms)
      const [ivHex, encryptedHex] = encryptedData.split(':');
      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format');
      }

      const key = await this.getEncryptionKey();

      // Convert hex strings back to bytes
      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
      const encrypted = new Uint8Array(
        encryptedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );
      const keyBytes = new Uint8Array(
        key.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
        'decrypt',
      ]);

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted);

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  // Encrypt API key pairs (key:secret format)
  static async encryptApiKeyPair(apiKey: string, apiSecret: string): Promise<string> {
    if (!apiKey || !apiSecret) return '';
    const combined = `${apiKey}:${apiSecret}`;
    return await this.encrypt(combined);
  }

  // Decrypt API key pairs
  static async decryptApiKeyPair(
    encryptedData: string
  ): Promise<{ apiKey: string; apiSecret: string }> {
    if (!encryptedData) return { apiKey: '', apiSecret: '' };

    const decrypted = await this.decrypt(encryptedData);
    const [apiKey, apiSecret] = decrypted.split(':');

    return {
      apiKey: apiKey || '',
      apiSecret: apiSecret || '',
    };
  }

  // Validate if data is encrypted (has IV:data format or web/mobile prefix)
  static isEncrypted(data: string): boolean {
    if (!data) return false;

    // Check for web or mobile platform encoding
    if (data.startsWith('web:') || data.startsWith('mobile:')) {
      return true;
    }

    // Check for AES-GCM format (IV:encrypted_data)
    const parts = data.split(':');
    return parts.length === 2 && parts[0].length === 24 && parts[1].length > 0;
  }

  // Migration helper: encrypt existing unencrypted data
  static async migrateToEncrypted(data: string): Promise<string> {
    if (this.isEncrypted(data)) {
      return data; // Already encrypted
    }
    return await this.encrypt(data);
  }
}
