# Clerk Authentication Setup Instructions

## Getting Started with Clerk

To complete the Clerk authentication setup, you need to:

### 1. Create a Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys
1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

### 3. Update Environment Variables
Open `.env.local` and replace the placeholder values:

```env
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# Optional: Customize URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Configure Your Clerk Application
In your Clerk Dashboard:

1. **Set Domain**: Add your local development domain (`http://localhost:3000`)
2. **Configure Redirects**: 
   - Sign-in redirect: `/dashboard`
   - Sign-up redirect: `/dashboard`
3. **Enable Social Providers** (optional):
   - Google, GitHub, Discord, etc.

### 5. Test the Authentication

After updating the environment variables:

```bash
npm run dev
```

Then test:
- Click "Login" to open the sign-in modal
- Click "Start Free Trial" to open the sign-up modal
- Navigate to `/dashboard` to test route protection
- Sign out using the user button

## Features Implemented

✅ **Modal Authentication**: Sign-in and sign-up open in modals
✅ **Route Protection**: Dashboard routes require authentication
✅ **User Management**: UserButton for profile and sign-out
✅ **Responsive Design**: Works on desktop and mobile
✅ **Custom Styling**: Matches your Cynerra theme
✅ **Automatic Redirects**: Users go to dashboard after auth

## Troubleshooting

### Build Errors
- Make sure you have valid Clerk API keys
- Check that `.env.local` exists and has correct keys
- Restart the development server after updating environment variables

### Authentication Issues
- Verify your domain is added in Clerk Dashboard
- Check redirect URLs match your configuration
- Ensure middleware.ts is protecting the right routes

### Styling Issues
- Clerk components are styled to match your theme
- Customization is done via the `appearance` prop
- Background effects are preserved in auth pages