import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const protocolOptions = [
  { code: '101.1', label: '🔐 101.1 - Authorization' },
  { code: '101.2', label: '💰 101.2 - Sale' },
  { code: '101.3', label: '❌ 101.3 - Void' },
  { code: '101.4', label: '↩️ 101.4 - Refund' },
  { code: '101.5', label: '🔒 101.5 - Pre-Authorization' },
  { code: '101.6', label: '✅ 101.6 - Completion' },
  { code: '101.7', label: '🔍 101.7 - Inquiry' },
  { code: '101.8', label: '📋 101.8 - Settlement' },
];

export const ProtocolTrigger: React.FC = () => {
  const [protocol, setProtocol] = useState('101.1');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(1000);

  const { triggerProtocol, isLoading, error, transactions } = useAppStore();

  const handleTrigger = async () => {
    if (!transactionId.trim()) {
      alert('Please enter a transaction ID');
      return;
    }

    await triggerProtocol(protocol, transactionId, amount);
  };

  const handleUseLatestTransaction = () => {
    if (transactions.length > 0) {
      const latest = transactions[0];
      setTransactionId(latest.id);
      setAmount(latest.amount);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Protocol Trigger</h2>
              <p className="text-purple-100">Test protocol communication</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Protocol Code
              </label>
              <select
                value={protocol}
                onChange={e => setProtocol(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              >
                {protocolOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transaction ID
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-mono"
                />
                <button
                  type="button"
                  onClick={handleUseLatestTransaction}
                  disabled={transactions.length === 0}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔗 Use Latest Transaction
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  type="number"
                  value={amount ? (amount / 100).toFixed(2) : ''}
                  onChange={(e) => setAmount(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter amount in dollars</p>
            </div>

            <button
              onClick={handleTrigger}
              disabled={isLoading || !transactionId.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>⚡</span>
                  <span>Trigger Protocol</span>
                </div>
              )}
            </button>
          </div>

          {transactions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span>📊</span>
                <span>Recent Transactions</span>
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {transactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                      onClick={() => {
                        setTransactionId(transaction.id);
                        setAmount(transaction.amount);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-mono text-sm text-slate-600">#{transaction.id.slice(-8)}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${(transaction.amount / 100).toFixed(2)}</p>
                        <p className={`text-xs font-medium ${
                          transaction.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.status === 'success' ? '✅ Success' : '❌ Failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
