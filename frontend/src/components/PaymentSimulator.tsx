import React, { useState } from 'react';
import { useCreateTransaction } from '../hooks';
import { useSuccessToast, useErrorToast } from './ui/toast';
import { apiService } from '../services/api';

export const PaymentSimulator: React.FC = () => {
  const [amount, setAmount] = useState(10.00);
  const [status, setStatus] = useState<'success' | 'failure'>('success');
  const [protocolCode, setProtocolCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createTransaction = useCreateTransaction();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      // Simulate payment using the API service
      const result = await apiService.simulatePayment({
        amount,
        status,
        protocolCode: protocolCode || undefined,
      });

      if (result.success) {
        showSuccess('Payment Simulated', `Successfully simulated ${status} payment for $${amount.toFixed(2)}`);
      } else {
        showError('Simulation Failed', result.error || 'Failed to simulate payment');
      }
    } catch (error) {
      console.error('Payment simulation failed:', error);
      showError('Simulation Error', error instanceof Error ? error.message : 'Failed to simulate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const protocolOptions = [
    { value: '', label: '🚫 No Protocol' },
    { value: '101.1', label: '🔐 101.1 - Authorization' },
    { value: '101.2', label: '💰 101.2 - Sale' },
    { value: '101.3', label: '❌ 101.3 - Void' },
    { value: '101.4', label: '↩️ 101.4 - Refund' },
    { value: '101.5', label: '🔒 101.5 - Pre-Authorization' },
    { value: '101.6', label: '✅ 101.6 - Completion' },
    { value: '101.7', label: '🔍 101.7 - Inquiry' },
    { value: '101.8', label: '📋 101.8 - Settlement' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Payment Simulator</h2>
              <p className="text-blue-100">Process test transactions</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {createTransaction.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">
                  {createTransaction.error?.message || 'An error occurred'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transaction Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  type="number"
                  value={amount.toFixed(2)}
                  onChange={(e) => setAmount(parseFloat(e.target.value || '0'))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter amount in dollars</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transaction Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'success' | 'failure')}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              >
                <option value="success">✅ Success</option>
                <option value="failure">❌ Failure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Protocol Code (Optional)
              </label>
              <select
                value={protocolCode}
                onChange={e => setProtocolCode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              >
                {protocolOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading || !amount}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Simulate Payment</span>
                </div>
              )}
            </button>
          </div>

          {/* Success/Error feedback is now handled by toast notifications */}
        </div>
      </div>
    </div>
  );
};
