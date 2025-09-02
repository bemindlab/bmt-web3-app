declare module 'crypto-js' {
  export interface WordArray {
    toString(encoding?: any): string;
  }

  export function HmacSHA512(message: string, key: string): WordArray;
  export function HmacSHA256(message: string, key: string): WordArray;
  export function SHA256(message: string): WordArray;

  export const enc: {
    Hex: any;
    Base64: any;
    Utf8: any;
  };

  export default {
    HmacSHA512,
    HmacSHA256,
    SHA256,
    enc,
  };
}
