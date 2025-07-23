import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ReceiptViewerProps {
  transactionId?: string;
  onClose?: () => void;
}

export function ReceiptViewer({ transactionId, onClose }: ReceiptViewerProps) {
  const [receipt, setReceipt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [receiptType, setReceiptType] = useState<'customer' | 'merchant'>('customer');
  const { transactions } = useAppStore();

  const generateReceipt = async (txnId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/v1/receipts/${txnId}`);
      const data = await response.json();
      
      if (data.success) {
        setReceipt(receiptType === 'customer' ? data.data.customerReceipt : data.data.merchantReceipt);
      } else {
        setError(data.error || 'Failed to generate receipt');
      }
    } catch (err) {
      setError('Failed to fetch receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = async (txnId: string) => {
    try {
      const response = await fetch('/api/v1/receipts/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: txnId,
          copies: 1,
          customerCopy: receiptType === 'customer'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Receipt sent to printer!');
      } else {
        alert('Failed to print receipt: ' + data.error);
      }
    } catch (err) {
      alert('Failed to print receipt');
    }
  };

  const emailReceipt = async (txnId: string) => {
    const email = prompt('Enter email address:');
    if (!email) return;

    try {
      const response = await fetch('/api/v1/receipts/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: txnId,
          email,
          customerCopy: receiptType === 'customer'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Receipt email queued for delivery!');
      } else {
        alert('Failed to email receipt: ' + data.error);
      }
    } catch (err) {
      alert('Failed to email receipt');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧾</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Receipt Viewer</h2>
                <p className="text-green-100">Generate and manage receipts</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Transaction
                </label>
                <select
                  value={transactionId || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      generateReceipt(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                >
                  <option value="">Select a transaction...</option>
                  {transactions.map((txn) => (
                    <option key={txn.id} value={txn.id}>
                      #{txn.id.slice(-8)} - ${txn.amount.toFixed(2)} ({txn.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Receipt Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="customer"
                      checked={receiptType === 'customer'}
                      onChange={(e) => setReceiptType(e.target.value as 'customer' | 'merchant')}
                      className="mr-2"
                    />
                    Customer Copy
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="merchant"
                      checked={receiptType === 'merchant'}
                      onChange={(e) => setReceiptType(e.target.value as 'customer' | 'merchant')}
                      className="mr-2"
                    />
                    Merchant Copy
                  </label>
                </div>
              </div>

              {transactionId && (
                <div className="space-y-3">
                  <button
                    onClick={() => generateReceipt(transactionId)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>🔄</span>
                        <span>Generate Receipt</span>
                      </div>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => printReceipt(transactionId)}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => emailReceipt(transactionId)}
                      className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      📧 Email
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Preview */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span>📄</span>
                <span>Receipt Preview</span>
              </h3>
              <div className="bg-slate-50 rounded-xl p-6 min-h-96">
                {receipt ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap">
                      {receipt}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <span className="text-4xl mb-4 block">🧾</span>
                      <p>Select a transaction to generate receipt</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
