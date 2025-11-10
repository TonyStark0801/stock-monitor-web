# OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Stock Monitor application.

## Prerequisites

- A Google Cloud Platform account
- Your application running locally on http://localhost:3000

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Stock Monitor")
5. Click "Create"

### 2. Enable Google+ API (or Google Identity)

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and press **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Stock Monitor
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Add or Remove Scopes**
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click **Update** and then **Save and Continue**
9. Add test users (your email) if using External type
10. Click **Save and Continue**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application** as the application type
4. Give it a name (e.g., "Stock Monitor Web Client")
5. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** (you'll need these for the next step)

### 5. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-to-random-string-min-32-chars

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-actual-google-client-id-from-step-4
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-from-step-4

# Enable Google Auth
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
```

3. Generate a secure random string for `NEXTAUTH_SECRET`:
   ```bash
   # Using OpenSSL (Mac/Linux)
   openssl rand -base64 32

   # Or using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### 6. Restart Your Development Server

```bash
npm run dev
```

## Testing OAuth Login

1. Navigate to http://localhost:3000
2. Click on "Get Started" or "Sign In"
3. Click the "Continue with Google" button
4. You should be redirected to Google's login page
5. Select your Google account
6. Grant permissions
7. You'll be redirected back to your dashboard

## Production Deployment

When deploying to production:

1. Create new OAuth credentials in Google Cloud Console
2. Update the authorized origins and redirect URIs with your production domain:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`
3. Update your production environment variables with the new credentials
4. Set `NEXTAUTH_URL` to your production domain

## Backend Integration

If you want to sync OAuth users with your backend API, the OAuth callback in [src/lib/auth.ts](src/lib/auth.ts) already includes code to send OAuth user data to your backend:

```typescript
// This endpoint should be implemented in your backend
POST /auth/oauth/google

// Request body:
{
  "email": "user@gmail.com",
  "name": "User Name",
  "avatar": "https://...",
  "googleId": "123456789",
  "accessToken": "google-access-token"
}

// Expected response:
{
  "success": true,
  "data": {
    "token": "your-backend-jwt-token"
  }
}
```

Your backend should:
1. Check if a user with this Google ID exists
2. If not, create a new user account
3. Generate a JWT token for the user
4. Return the token to the frontend

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check that you're using the correct protocol (http vs https)
- Restart your dev server after changing environment variables

### Error: "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user if using External user type

### OAuth button does nothing
- Check browser console for errors
- Verify `NEXTAUTH_URL` is set correctly
- Ensure you've restarted the dev server after adding environment variables

### Session not persisting
- Make sure `NEXTAUTH_SECRET` is set
- Check that cookies are enabled in your browser
- Clear browser cache and cookies

## Security Best Practices

1. **Never commit credentials**: Make sure `.env.local` is in `.gitignore`
2. **Use environment-specific credentials**: Different credentials for dev/staging/production
3. **Rotate secrets regularly**: Especially in production
4. **Use HTTPS in production**: OAuth requires HTTPS in production
5. **Implement CSRF protection**: NextAuth handles this automatically
6. **Add rate limiting**: Protect your auth endpoints from abuse

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
