import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for our POS system
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes for most data
      
      // Cache time - how long data stays in cache after becoming unused
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for critical data
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Background refetch interval for real-time data
      refetchInterval: false, // We'll set this per query as needed
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent key patterns
export const queryKeys = {
  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    intents: () => [...queryKeys.payments.all, 'intents'] as const,
    intent: (id: string) => [...queryKeys.payments.intents(), id] as const,
  },
  
  // PAX Terminal
  terminal: {
    all: ['terminal'] as const,
    status: () => [...queryKeys.terminal.all, 'status'] as const,
    connection: () => [...queryKeys.terminal.all, 'connection'] as const,
    config: () => [...queryKeys.terminal.all, 'config'] as const,
    device: () => [...queryKeys.terminal.all, 'device'] as const,
    deviceTest: (testType: string) => [...queryKeys.terminal.device(), testType] as const,
  },
  
  // Logs
  logs: {
    all: ['logs'] as const,
    lists: () => [...queryKeys.logs.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.logs.lists(), filters] as const,
  },
  
  // Receipts
  receipts: {
    all: ['receipts'] as const,
    lists: () => [...queryKeys.receipts.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.receipts.lists(), filters] as const,
    details: () => [...queryKeys.receipts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.receipts.details(), id] as const,
  },
} as const;

// Specialized query configurations for different data types
export const queryConfigs = {
  // Real-time data that needs frequent updates (payment status, live transactions)
  realTime: {
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true, // Continue polling in background
  },

  // Static data that rarely changes (terminal info, configuration)
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchInterval: false,
  },

  // Payment-related data that needs to be fresh
  payments: {
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 1000 * 15, // 15 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false, // Don't poll payments in background
  },

  // Terminal connection data
  terminal: {
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true, // Keep checking terminal status
  },

  // Transaction data with moderate freshness requirements
  transactions: {
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
  },

  // Connection tokens that expire quickly
  connectionToken: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60 * 8, // Refresh every 8 minutes
  },
} as const;
