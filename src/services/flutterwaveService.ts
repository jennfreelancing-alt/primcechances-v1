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

// Flutterwave Public Key
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-a86bee4861896fde208170d70627a304-X';


// Accepts dynamic price, always pass the price from the hook/service
export const initializeFlutterwavePayment = (
  amount: number,
  userEmail: string,
  userName: string,
  onSuccess: (response: any) => void,
  onClose: () => void
) => {
  const config: FlutterwaveConfig = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
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
    throw new Error('Flutterwave checkout not available');
  }
};

export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }

    if (document.querySelector('script[src*="flutterwave"]')) {
      const checkInterval = setInterval(() => {
        if (window.FlutterwaveCheckout) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('FlutterwaveCheckout not available'));
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Flutterwave script'));
    document.head.appendChild(script);
  });
};

// Export keys for server-side operations
export const getFlutterwaveKeys = () => ({
  publicKey: FLUTTERWAVE_PUBLIC_KEY
});

// Verify if we're using live keys
export const isLiveMode = (): boolean => {
  return !FLUTTERWAVE_PUBLIC_KEY.includes('TEST');
};
