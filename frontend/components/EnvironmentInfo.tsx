'use client';

import { config } from '@/lib/config';

export default function EnvironmentInfo() {
  if (!config.env.isDevelopment) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs text-blue-800 shadow-lg z-50">
      <div className="font-semibold mb-1">🌐 Environment Info</div>
      <div>API: {config.api.baseUrl}</div>
      <div>Env: {process.env.NODE_ENV}</div>
      <div>Maps: {config.googleMaps.apiKey ? '✅' : '❌'}</div>
    </div>
  );
} 