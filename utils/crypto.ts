import { EncryptedData } from '../types';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Helper to convert buffer to Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert Base64 to buffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derives a key from a passphrase using PBKDF2
const deriveKey = async (passphrase: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypts data with a passphrase
export const encryptData = async (data: string, passphrase: string): Promise<EncryptedData> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    textEncoder.encode(data)
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
};

// Decrypts data with a passphrase
export const decryptData = async (encryptedData: EncryptedData, passphrase: string): Promise<string> => {
  const salt = base64ToBuffer(encryptedData.salt);
  const iv = base64ToBuffer(encryptedData.iv);
  const ciphertext = base64ToBuffer(encryptedData.ciphertext);
  
  // FIX: The `deriveKey` function expects a Uint8Array for the salt, but `base64ToBuffer` returns an ArrayBuffer.
  // This converts the salt to a Uint8Array to fix the type mismatch.
  const key = await deriveKey(passphrase, new Uint8Array(salt));

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    return textDecoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid passphrase or corrupted data.");
  }
};
