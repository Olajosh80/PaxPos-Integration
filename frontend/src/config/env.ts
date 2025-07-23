/**
 * Frontend Environment Configuration
 *
 * This file provides access to environment variables that are shared
 * between frontend and backend from the root .env file.
 */

// Environment variables injected by Vite at build time
declare const __PAX_TERMINAL_IP__: string;
declare const __PAX_TERMINAL_PORT__: string;
declare const __BACKEND_PORT__: string;
declare const __FRONTEND_PORT__: string;
declare const __NODE_ENV__: string;

export interface PaxTerminalConfig {
  ip: string;
  port: number;
  timeout: number;
  connectionType: 'WIFI' | 'ETHERNET' | 'CELLULAR';
}

export interface FrontendEnv {
  PAX_TERMINAL_IP: string;
  PAX_TERMINAL_PORT: number;
  BACKEND_PORT: number;
  FRONTEND_PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  PAX_CONFIG: PaxTerminalConfig;
}

function createEnv(): FrontendEnv {
  const backendPort = parseInt(__BACKEND_PORT__ || '3001', 10);
  const frontendPort = parseInt(__FRONTEND_PORT__ || '3000', 10);
  const paxTerminalPort = parseInt(__PAX_TERMINAL_PORT__ || '10009', 10);
  const nodeEnv = (__NODE_ENV__ || 'development') as 'development' | 'production' | 'test';

  // Determine API base URL based on environment
  let apiBaseUrl: string;

  if (nodeEnv === 'production') {
    // In production, assume API is served from the same domain
    apiBaseUrl = '/api';
  } else {
    // In development, use the backend port
    apiBaseUrl = `http://localhost:${backendPort}`;
  }

  const paxConfig: PaxTerminalConfig = {
    ip: __PAX_TERMINAL_IP__ || '192.168.178.24',
    port: paxTerminalPort,
    timeout: 90,
    connectionType: 'WIFI',
  };

  return {
    PAX_TERMINAL_IP: paxConfig.ip,
    PAX_TERMINAL_PORT: paxConfig.port,
    BACKEND_PORT: backendPort,
    FRONTEND_PORT: frontendPort,
    NODE_ENV: nodeEnv,
    API_BASE_URL: apiBaseUrl,
    PAX_CONFIG: paxConfig,
  };
}

export const env = createEnv();

// Log environment info in development
if (env.NODE_ENV === 'development') {
  console.log('🔧 Frontend Environment Configuration:', {
    NODE_ENV: env.NODE_ENV,
    FRONTEND_PORT: env.FRONTEND_PORT,
    BACKEND_PORT: env.BACKEND_PORT,
    API_BASE_URL: env.API_BASE_URL,
    PAX_TERMINAL_IP: env.PAX_TERMINAL_IP,
    PAX_TERMINAL_PORT: env.PAX_TERMINAL_PORT,
    PAX_CONFIG: env.PAX_CONFIG,
  });
}
