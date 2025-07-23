import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

// Hook for real-time payment status updates
export function usePaymentStatusUpdates(paymentIntentId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!paymentIntentId || !enabled) return;

    // Set up polling for payment status updates
    const interval = setInterval(async () => {
      try {
        // Invalidate payment intent queries to trigger refetch
        await queryClient.invalidateQueries({
          queryKey: queryKeys.payments.intent(paymentIntentId),
        });
        
        // Also invalidate terminal payment intents
        await queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.detail(paymentIntentId),
        });
      } catch (error) {
        console.error('Failed to update payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [paymentIntentId, enabled, queryClient]);
}

// Hook for real-time transaction updates
export function useTransactionUpdates(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // Set up background refetching for transactions
    const interval = setInterval(async () => {
      try {
        // Invalidate transaction lists to get latest data
        await queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.lists(),
        });
      } catch (error) {
        console.error('Failed to update transactions:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [enabled, queryClient]);
}

// Hook for terminal connection status updates
export function useTerminalStatusUpdates(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // Set up background refetching for terminal readers
    const interval = setInterval(async () => {
      try {
        // Invalidate terminal readers to check for new/disconnected readers
        await queryClient.invalidateQueries({
          queryKey: queryKeys.terminal.status(),
        });
      } catch (error) {
        console.error('Failed to update terminal status:', error);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [enabled, queryClient]);
}

// Hook for automatic cache cleanup
export function useCacheCleanup() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up periodic cache cleanup
    const interval = setInterval(() => {
      // Remove old payment intents from cache (older than 1 hour)
      const now = Date.now();
      const oneHour = 1000 * 60 * 60;

      queryClient.getQueryCache().getAll().forEach((query) => {
        if (
          query.queryKey[0] === 'payments' ||
          query.queryKey[0] === 'terminal'
        ) {
          const lastUpdated = query.state.dataUpdatedAt;
          if (lastUpdated && now - lastUpdated > oneHour) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        }
      });
    }, 1000 * 60 * 10); // Run cleanup every 10 minutes

    return () => clearInterval(interval);
  }, [queryClient]);
}

// Hook for handling network status changes
export function useNetworkStatusUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online, refetching queries...');
      // Refetch all queries when coming back online
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      console.log('Network offline, pausing background updates...');
      // Optionally pause background updates when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);
}

// Combined hook for all real-time updates
export function useRealTimeUpdates(options: {
  paymentIntentId?: string;
  enablePaymentUpdates?: boolean;
  enableTransactionUpdates?: boolean;
  enableTerminalUpdates?: boolean;
  enableCacheCleanup?: boolean;
  enableNetworkUpdates?: boolean;
} = {}) {
  const {
    paymentIntentId,
    enablePaymentUpdates = true,
    enableTransactionUpdates = true,
    enableTerminalUpdates = true,
    enableCacheCleanup = true,
    enableNetworkUpdates = true,
  } = options;

  usePaymentStatusUpdates(paymentIntentId, enablePaymentUpdates);
  useTransactionUpdates(enableTransactionUpdates);
  useTerminalStatusUpdates(enableTerminalUpdates);
  
  if (enableCacheCleanup) {
    useCacheCleanup();
  }
  
  if (enableNetworkUpdates) {
    useNetworkStatusUpdates();
  }
}
