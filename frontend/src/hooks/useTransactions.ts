import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, PaxTransaction } from '../services/api';
import { queryKeys, queryConfigs } from '../lib/queryClient';

// Types for transaction operations
export interface TransactionFilters {
  limit?: number;
  offset?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateTransactionRequest {
  amount: number;
  currency?: string;
  description?: string;
  paymentIntentId?: string;
  status?: 'success' | 'failure' | 'pending';
  metadata?: Record<string, any>;
}

// Hook for fetching transactions list
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      const response = await apiService.getTransactions(filters?.limit, filters?.offset);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch transactions');
      }
      return response.data;
    },
    ...queryConfigs.transactions,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching a specific transaction
export function useTransaction(transactionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId || ''),
    queryFn: async () => {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
      
      const response = await apiService.getTransactionById(transactionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch transaction');
      }
      return response.data;
    },
    enabled: !!transactionId,
    ...queryConfigs.payments,
  });
}

// Hook for creating a new transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTransactionRequest) => {
      const response = await apiService.createTransaction(request);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create transaction');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Add the new transaction to the cache
      if (data?.transaction) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(data.transaction.id),
          data.transaction
        );
      }

      // Invalidate transactions list to refetch with new data
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() });

      // Also invalidate payments if this transaction has a payment intent
      if (data?.transaction?.authCode) {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      }
    },
    onError: (error) => {
      console.error('Transaction creation failed:', error);
    },
  });
}

// Hook for updating a transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaxTransaction> }) => {
      const response = await apiService.request(`/transaction/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update transaction');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific transaction in cache
      queryClient.setQueryData(
        queryKeys.transactions.detail(variables.id),
        data
      );
      
      // Invalidate transactions list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() });
    },
  });
}

// Hook for deleting a transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiService.request(`/transaction/${transactionId}`, {
        method: 'DELETE',
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete transaction');
      }
      return response.data;
    },
    onSuccess: (_, transactionId) => {
      // Remove the transaction from cache
      queryClient.removeQueries({ queryKey: queryKeys.transactions.detail(transactionId) });

      // Invalidate transactions list
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() });
    },
  });
}

// Hook for real-time transaction updates (useful for payment status monitoring)
export function useTransactionRealTime(transactionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId || ''),
    queryFn: async () => {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
      
      const response = await apiService.getTransactionById(transactionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch transaction');
      }
      return response.data;
    },
    enabled: !!transactionId && enabled,
    ...queryConfigs.realTime,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
    refetchIntervalInBackground: false,
  });
}

// Hook for transaction statistics/summary
export function useTransactionStats(filters?: TransactionFilters) {
  return useQuery({
    queryKey: [...queryKeys.transactions.all, 'stats', filters],
    queryFn: async () => {
      const response = await apiService.request('/transaction/stats', {
        method: 'POST',
        body: JSON.stringify(filters || {}),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch transaction stats');
      }
      return response.data;
    },
    ...queryConfigs.realTime,
    // Refresh stats every minute
    refetchInterval: 1000 * 60,
  });
}
