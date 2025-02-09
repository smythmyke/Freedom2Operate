import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Box, Typography, Alert, Button } from '@mui/material';
import F2O from './F2O';

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
  onSubmitForReview: () => void;
}

const PaymentStep = ({ amount, onSuccess, onError, onSubmitForReview }: PaymentStepProps) => {
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <F2O /> Search Service
        </Typography>
        <Typography variant="body1">
          Total Amount: ${amount}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onSubmitForReview}
          >
            Submit for Review
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            or pay now
          </Typography>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={(_data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              application_context: {
                shipping_preference: "NO_SHIPPING"
              },
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: 'USD'
                  },
                  description: 'Freedom2Operate Search Service'
                },
              ],
            });
          }}
          onApprove={async (_data, actions) => {
            try {
              const details = await actions.order?.capture();
              if (details) {
                onSuccess(details as PayPalPaymentDetails);
              }
            } catch (error) {
              console.error('Payment capture failed:', error);
              setError('Payment capture failed. Please try again.');
              onError(new Error('Payment capture failed'));
            }
          }}
          onError={() => {
            setError('Payment failed. Please try again.');
            onError(new Error('Payment failed'));
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
