interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

// Live Flutterwave Production Keys
// IMPORTANT: Replace the public key below with your actual live public key from Flutterwave dashboard
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-REPLACE-WITH-YOUR-ACTUAL-LIVE-PUBLIC-KEY'; 
const FLUTTERWAVE_SECRET_KEY = 'VIvvb1RIPRWuIEcbknW6Bvw42k0Xe8ck';
const FLUTTERWAVE_ENCRYPTION_KEY = 'b5ppyrDw/1w9Uc6ufFP4dB1P2bSOVKVOiiXh5NBFsWs=';

// Remove environment variable fallback and use live keys directly
const PUBLIC_KEY = FLUTTERWAVE_PUBLIC_KEY;

// Accepts dynamic price, always pass the price from the hook/service
export const initializeFlutterwavePayment = (
  amount: number,
  userEmail: string,
  userName: string,
  onSuccess: (response: any) => void,
  onClose: () => void
) => {
  const config: FlutterwaveConfig = {
    public_key: PUBLIC_KEY,
    tx_ref: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: userEmail,
      name: userName,
    },
    customizations: {
      title: 'PrimeChances Pro Subscription',
      description: 'Upgrade to Pro for premium features',
      logo: '',
    },
    callback: onSuccess,
    onclose: onClose,
  };

  if (window.FlutterwaveCheckout) {
    window.FlutterwaveCheckout(config);
  } else {
    console.error('Flutterwave checkout not loaded');
  }
};

export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="flutterwave"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Flutterwave script'));
    document.head.appendChild(script);
  });
};

// Export keys for server-side operations (webhook verification, etc.)
export const getFlutterwaveKeys = () => ({
  publicKey: FLUTTERWAVE_PUBLIC_KEY,
  secretKey: FLUTTERWAVE_SECRET_KEY,
  encryptionKey: FLUTTERWAVE_ENCRYPTION_KEY
});

// Verify if we're using live keys
export const isLiveMode = (): boolean => {
  return !FLUTTERWAVE_PUBLIC_KEY.includes('TEST');
};

// Log current configuration for debugging
console.log('🚀 Flutterwave Configuration:', {
  mode: isLiveMode() ? 'LIVE' : 'TEST',
  publicKey: FLUTTERWAVE_PUBLIC_KEY.substring(0, 20) + '...',
  hasSecretKey: !!FLUTTERWAVE_SECRET_KEY,
  hasEncryptionKey: !!FLUTTERWAVE_ENCRYPTION_KEY
});
