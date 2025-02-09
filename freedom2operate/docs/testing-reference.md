# Testing Reference Guide

## PayPal Sandbox Test Cards

### Credit Cards
- **Visa**
  - Card Number: 4032039999999989
  - Expiration: Any future date
  - CVV: Any 3 digits
  - Status: Payment Success

- **Visa (Failure)**
  - Card Number: 4000000000000002
  - Expiration: Any future date
  - CVV: Any 3 digits
  - Status: Payment Failure

- **Mastercard**
  - Card Number: 5555555555554444
  - Expiration: Any future date
  - CVV: Any 3 digits
  - Status: Payment Success

### Test Addresses
- **US Address**
  - Street: 123 Test St
  - City: San Jose
  - State: CA
  - ZIP: 95131
  - Country: United States

## Test User Profiles

### Regular User
```json
{
  "email": "test.user@example.com",
  "password": "TestUser123!"
}
```

### Admin User Format
```json
{
  "email": "admin@freedom2operate.com",
  "password": "[secure-admin-password]",
  "role": "admin"
}
```

## Common Test Scenarios

### Payment Flow
1. Regular user registration
2. Submit project details
3. Proceed to payment
4. Complete payment with test card
5. Verify payment history
6. Check project status

### Admin Review Flow
1. Admin login
2. Review new submissions
3. Update project status
4. Generate/upload reports
5. Send client notifications

### Document Generation
1. NDA generation
2. Report generation
3. Payment receipts
4. Project status updates

## Testing Notes
- Use incognito/private browsing for testing different user sessions
- Clear browser cache when switching between admin/user roles
- Verify email notifications in development environment
- Check file upload limits with test documents
- Test responsive design with different viewport sizes

## Environment Variables
Make sure these are properly set in the testing environment:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```
