import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, PaxPaymentRequest, PaxTransaction } from '../services/api';
import { queryKeys, queryConfigs } from '../lib/queryClient';

// Types for PAX payment operations
export interface ProcessPaymentRequest extends PaxPaymentRequest {}

export interface ConfirmPaymentRequest {
  transactionId: string;
  authCode?: string;
}

export interface CapturePaymentRequest {
  transactionId: string;
  amountToCapture?: number;
}

// Hook for processing PAX payments
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ProcessPaymentRequest): Promise<PaxTransaction> => {
      const response = await apiService.processPayment(request);
      if (!response.success) {
        throw new Error(response.error || 'Payment processing failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate payment-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });

      // Set the transaction data in cache
      if (data?.id) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(data.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Payment processing failed:', error);
    },
  });
}

// Hook for confirming payments
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ConfirmPaymentRequest) => {
      const response = await apiService.confirmPayment(request);
      if (!response.success) {
        throw new Error(response.error || 'Payment confirmation failed');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate payment-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      
      // Update the specific payment intent cache
      if (variables.transactionId) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(variables.transactionId),
          data
        );
      }
    },
  });
}

// Hook for capturing payments
export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CapturePaymentRequest) => {
      const response = await apiService.capturePaymentIntent(request);
      if (!response.success) {
        throw new Error(response.error || 'Payment capture failed');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate payment-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      
      // Update the specific payment intent cache
      queryClient.setQueryData(
        queryKeys.transactions.detail(variables.transactionId),
        data
      );
    },
  });
}

// Hook for getting payment intent details
export function usePaymentIntent(paymentIntentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.intent(paymentIntentId || ''),
    queryFn: async () => {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }
      
      const response = await apiService.request(`/payments/intent/${paymentIntentId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment intent');
      }
      return response.data;
    },
    enabled: !!paymentIntentId,
    ...queryConfigs.payments,
  });
}

// Hook for payment status polling (useful for real-time updates)
export function usePaymentStatus(paymentIntentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.intent(paymentIntentId || ''),
    queryFn: async () => {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      const response = await apiService.request(`/payments/status/${paymentIntentId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment status');
      }
      return response.data;
    },
    enabled: !!paymentIntentId && enabled,
    ...queryConfigs.realTime,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchIntervalInBackground: false,
  });
}
