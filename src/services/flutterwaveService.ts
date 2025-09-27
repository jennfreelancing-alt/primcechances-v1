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

const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-ae9bdd6c2623314033efbfee042d90d5-X';

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
