import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Box, Typography, Alert } from '@mui/material';

interface PayPalPaymentDetails {
  id: string;
  status: string;
  payer: {
    email_address?: string;
    payer_id: string;
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
  }>;
  create_time: string;
  update_time: string;
}

interface PaymentStepProps {
  amount: number;
  onSuccess: (details: PayPalPaymentDetails) => void;
  onError: (error: Error) => void;
}

const PaymentStep = ({ amount, onSuccess, onError }: PaymentStepProps) => {
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Payment Details
      </Typography>
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
        Total Amount: ${amount}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={(_data: unknown, actions: { 
            order: { 
              create: (order: {
                purchase_units: Array<{
                  amount: {
                    value: string;
                    currency_code: string;
                  };
                  description: string;
                }>;
              }) => Promise<string> 
            } 
          }) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: 'USD'
                  },
                  description: 'Freedom to Operate Search Service'
                },
              ],
            });
          }}
          onApprove={async (_data: unknown, actions: { order?: { capture: () => Promise<PayPalPaymentDetails> } }) => {
            if (actions.order) {
              const details = await actions.order.capture();
              onSuccess(details);
            }
          }}
          onError={(err: Error) => {
            setError('Payment failed. Please try again.');
            onError(err);
          }}
        />
      </PayPalScriptProvider>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
        Secure payment processed by PayPal
      </Typography>
    </Box>
  );
};

export default PaymentStep;
