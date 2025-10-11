# Razorpay Integration Setup Guide

## 🔑 How to Add Your Razorpay API Keys

### Step 1: Get Your Razorpay Keys

1. **Sign up or log in** to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Generate test/live API keys
4. You'll get:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (keep this secure!)

### Step 2: Add Keys to Your Project

1. Open the `.env.local` file in the `client` folder
2. Replace the placeholder values:

```env
# Razorpay API Keys (Demo/Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

⚠️ **Important Notes:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the frontend (that's why it has `NEXT_PUBLIC_` prefix)
- `RAZORPAY_KEY_SECRET` should NEVER be exposed to the frontend (only use in backend API routes)
- Use **test mode keys** for development (start with `rzp_test_`)
- Use **live mode keys** only in production (start with `rzp_live_`)

### Step 3: Restart the Development Server

After adding the keys, restart your Next.js server:

```bash
# Stop the current server (Ctrl + C)
# Then restart:
pnpm dev
```

### Step 4: Test the Payment Flow

1. Go to the signup page: `http://localhost:3000/signup`
2. Fill in Steps 1 and 2
3. In Step 3, select a plan and click "Pay ₹X,XXX"
4. Razorpay payment modal will open
5. Use **test credentials** from [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

## 🧪 Test Payment Credentials

### Test Cards
- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/25`)
- **Name:** Any name

### Test UPI
- **UPI ID:** `success@razorpay`

### Test Net Banking
- Select any bank and use status as **Success**

## 📦 What's Implemented

✅ Razorpay SDK integration
✅ Payment modal with custom branding
✅ Plan-based pricing (₹4,999 / ₹8,999 / ₹15,999)
✅ User data prefill (name, email)
✅ Payment success handler
✅ Payment cancellation handler
✅ Loading states and error handling
✅ Responsive payment UI
✅ Currency in INR (Indian Rupees)

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to Git (it's already in `.gitignore`)
2. **Never expose Key Secret** to the frontend
3. **Verify payment signatures** on the backend before order fulfillment
4. Use **webhook verification** for production
5. Implement **order creation API** on the backend

## 🚀 Next Steps (Production Ready)

For production, you should:

1. **Create an API route** to generate Razorpay orders:
   ```
   POST /api/payment/create-order
   ```

2. **Verify payment signatures** on the backend:
   ```
   POST /api/payment/verify
   ```

3. **Set up Razorpay webhooks** for payment status updates

4. **Store payment data** in your database

5. **Send confirmation emails** after successful payment

## 📚 Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [Payment Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Test Cards & Credentials](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Webhook Setup](https://razorpay.com/docs/webhooks/)

---

**Need Help?** Check the Razorpay documentation or contact their support team.
