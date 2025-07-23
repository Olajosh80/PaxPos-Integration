import React from 'react';
import { useTransactions } from '../hooks';
import { PaxTransaction } from '../services/api';

export const TransactionList: React.FC = () => {
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch
  } = useTransactions({ limit: 50 });

  const transactions = transactionsData?.transactions || [];

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failure':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.message}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No transactions found. Create a payment simulation to get started.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-600">
                    {transaction.id.slice(-8)}
                  </span>
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </span>
                  {transaction.resultCode && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {transaction.resultCode}
                    </span>
                  )}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ${(transaction.amount / 100).toFixed(2)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
                {transaction.authCode && (
                  <div className="flex justify-between">
                    <span>Auth Code:</span>
                    <span className="font-mono text-xs">
                      {transaction.authCode}
                    </span>
                  </div>
                )}
                {transaction.referenceNumber && (
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono text-xs">
                      {transaction.referenceNumber}
                    </span>
                  </div>
                )}
                {transaction.receiptData && (
                  <div className="flex justify-between">
                    <span>Receipt:</span>
                    <span className="text-blue-600 text-xs">
                      Available
                    </span>
                  </div>
                )}
              </div>
              
              {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    Metadata
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
