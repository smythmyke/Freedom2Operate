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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        <F2O /> Search Service
      </Typography>
      <Typography variant="h6" align="center" color="primary" gutterBottom>
        Total Amount: ${amount}
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 4, 
        mt: 4,
        mb: 4,
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#f8f8f8'
      }}>
        {/* Review Option */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Submit for Review
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, minHeight: '80px' }}>
            Let us review your project first to ensure all features are well-defined and clear. 
            We'll provide feedback and suggestions before proceeding with the search.
            No payment required at this stage.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onSubmitForReview}
            sx={{ 
              width: '100%',
              fontWeight: 'bold',
              py: 1.5
            }}
          >
            Submit for Review
          </Button>
        </Box>

        {/* Payment Option */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Pay Now
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, minHeight: '80px' }}>
            Proceed directly with the payment to start the search process immediately. 
            You can still refine the project details during the search process if needed.
          </Typography>
          
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

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Secure payment processed by PayPal
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentStep;
