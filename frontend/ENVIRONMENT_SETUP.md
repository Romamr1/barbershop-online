# Environment Configuration Setup

This document explains how to configure the frontend to use different API endpoints for development and production environments.

## Overview

The frontend automatically detects the environment and uses the appropriate API endpoint:

- **Development**: `http://localhost:3001/api`
- **Production**: `https://barbershop-online-production.up.railway.app/api`

## Configuration Methods

### Method 1: Environment Variables (Recommended)

Create a `.env.local` file in the frontend directory:

```bash
# Development Environment
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_ENV=development
```

For production deployment, set these environment variables in your hosting platform:

```bash
# Production Environment
NEXT_PUBLIC_API_URL=https://barbershop-online-production.up.railway.app/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_ENV=production
```

### Method 2: Auto-Detection (Fallback)

If no environment variables are set, the app automatically detects the environment based on the hostname:

- **localhost** or **127.0.0.1** → Development API (`http://localhost:3001/api`)
- **railway.app**, **vercel.app**, **netlify.app** → Production API (`https://barbershop-online-production.up.railway.app/api`)

## Configuration Files

### `lib/config.ts`
Central configuration utility that handles environment detection and provides typed access to all environment variables.

### `lib/api.ts`
Uses the configuration to set the correct API base URL for all API calls.

## Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your development settings:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Railway
Set environment variables in your Railway project dashboard:
- `NEXT_PUBLIC_API_URL=https://barbershop-online-production.up.railway.app/api`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

### Vercel
Set environment variables in your Vercel project settings:
- `NEXT_PUBLIC_API_URL=https://barbershop-online-production.up.railway.app/api`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

### Netlify
Set environment variables in your Netlify site settings:
- `NEXT_PUBLIC_API_URL=https://barbershop-online-production.up.railway.app/api`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

## Verification

In development, you can verify the configuration by checking the browser console. You should see:

```
🔧 Environment Configuration: {
  apiBaseUrl: "http://localhost:3001/api",
  environment: "development",
  googleMapsEnabled: false
}
🌐 API Base URL: http://localhost:3001/api
```

## Troubleshooting

### API Calls Failing
1. Check that your backend is running on the correct port
2. Verify the API URL in the browser console
3. Ensure CORS is properly configured on the backend

### Environment Not Detected
1. Make sure you have a `.env.local` file for development
2. Check that environment variables are set in your hosting platform
3. Verify the hostname detection logic in `lib/config.ts`

### Google Maps Not Working
1. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment variables
2. Ensure the API key has the correct permissions
3. Check the browser console for any Google Maps errors 