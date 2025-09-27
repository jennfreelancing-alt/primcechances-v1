interface FlutterwaveConfig {
  PBFPubKey: string;
  tx_ref: string;
  amount: number;
  currency: string;
  country: string;
  payment_options: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  meta: {
    consumer_id: string;
    consumer_mac: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
  redirect_url: string;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

// Live Flutterwave Production Keys
// IMPORTANT: Replace the public key below with your actual live public key from Flutterwave dashboard
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-a86bee4861896fde208170d70627a304-X'; 
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
    PBFPubKey: PUBLIC_KEY,
    tx_ref: `primechances_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    currency: 'NGN',
    country: 'NG',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: userEmail,
      name: userName,
      phone_number: '',
    },
    customizations: {
      title: 'PrimeChances Pro Subscription',
      description: 'Upgrade to Pro for premium features',
      logo: 'https://primechances.com/logo.png',
    },
    callback: onSuccess,
    onclose: onClose,
    meta: {
      consumer_id: userEmail,
      consumer_mac: '92a3b912c1d1',
    },
    redirect_url: window.location.origin + '/dashboard',
  };

  console.log('🔧 Flutterwave config:', {
    PBFPubKey: config.PBFPubKey.substring(0, 20) + '...',
    amount: config.amount,
    currency: config.currency,
    tx_ref: config.tx_ref,
    customer_email: config.customer.email
  });

  if (window.FlutterwaveCheckout) {
    console.log('🚀 Calling FlutterwaveCheckout...');
    try {
      window.FlutterwaveCheckout(config);
      console.log('✅ FlutterwaveCheckout called successfully');
    } catch (error) {
      console.error('❌ Error calling FlutterwaveCheckout:', error);
      throw error;
    }
  } else {
    console.error('❌ Flutterwave checkout not loaded - window.FlutterwaveCheckout is undefined');
    throw new Error('Flutterwave checkout not available');
  }
};

export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded and FlutterwaveCheckout is available
    if (document.querySelector('script[src*="flutterwave"]') && window.FlutterwaveCheckout) {
      console.log('✅ Flutterwave script already loaded');
      resolve();
      return;
    }

    // Check if script exists but FlutterwaveCheckout is not available yet
    if (document.querySelector('script[src*="flutterwave"]') && !window.FlutterwaveCheckout) {
      console.log('⏳ Flutterwave script loaded but FlutterwaveCheckout not ready, waiting...');
      // Wait a bit for FlutterwaveCheckout to become available
      const checkInterval = setInterval(() => {
        if (window.FlutterwaveCheckout) {
          clearInterval(checkInterval);
          console.log('✅ FlutterwaveCheckout is now available');
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('FlutterwaveCheckout not available after 10 seconds'));
      }, 10000);
      return;
    }

    console.log('📜 Loading Flutterwave script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Flutterwave script loaded, waiting for FlutterwaveCheckout...');
      // Wait for FlutterwaveCheckout to become available
      const checkInterval = setInterval(() => {
        if (window.FlutterwaveCheckout) {
          clearInterval(checkInterval);
          console.log('✅ FlutterwaveCheckout is now available');
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('FlutterwaveCheckout not available after 10 seconds'));
      }, 10000);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Flutterwave script');
      reject(new Error('Failed to load Flutterwave script'));
    };
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
