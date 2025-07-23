import React, { useState, useEffect } from 'react';
import { paxTerminal, PaxTerminalService } from '../services/paxTerminal';
import { PaxTransaction, PaxPaymentRequest } from '../services/api';

interface PaxTerminalPOSProps {
  onBack: () => void;
}

export const PaxTerminalPOS: React.FC<PaxTerminalPOSProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [transType, setTransType] = useState<'SALE' | 'RETURN' | 'VOID' | 'AUTH'>('SALE');
  const [tenderType, setTenderType] = useState<'CREDIT' | 'DEBIT' | 'CASH'>('CREDIT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<PaxTransaction | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [ecrRefNum, setEcrRefNum] = useState('');

  useEffect(() => {
    checkConnection();
    generateRefNumber();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await paxTerminal.connect();
      setIsConnected(connected);
      if (connected) {
        setStatusMessage('Terminal connected and ready');
      } else {
        setStatusMessage('Terminal not connected');
      }
    } catch (error) {
      setIsConnected(false);
      setStatusMessage('Connection failed');
    }
  };

  const generateRefNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setEcrRefNum(`REF${timestamp}`);
  };

  const formatAmount = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return cleaned;
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    setAmount(formatted);
  };

  const addToAmount = (digit: string) => {
    if (digit === '.' && amount.includes('.')) return;
    if (amount.length >= 10) return; // Reasonable limit
    
    const newAmount = amount + digit;
    setAmount(formatAmount(newAmount));
  };

  const clearAmount = () => {
    setAmount('');
  };

  const backspaceAmount = () => {
    setAmount(amount.slice(0, -1));
  };

  const processTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatusMessage('Please enter a valid amount');
      return;
    }

    if (!isConnected) {
      setStatusMessage('Terminal not connected');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Processing transaction...');

    try {
      const request: PaxPaymentRequest = {
        amount: parseFloat(amount),
        transType,
        tenderType,
        ecrRefNum,
        reportStatus: true,
        metadata: {
          timestamp: new Date().toISOString(),
          terminalId: paxTerminal.getConfig().ip
        }
      };

      let result: PaxTransaction | null = null;

      switch (transType) {
        case 'SALE':
          result = await paxTerminal.processPayment(request);
          break;
        case 'RETURN':
          result = await paxTerminal.processReturn(request);
          break;
        case 'VOID':
          if (lastTransaction) {
            const success = await paxTerminal.voidTransaction(lastTransaction.id, parseFloat(amount));
            if (success) {
              setStatusMessage('Transaction voided successfully');
              setLastTransaction(null);
              clearAmount();
            } else {
              setStatusMessage('Void transaction failed');
            }
          } else {
            setStatusMessage('No transaction to void');
          }
          return;
        default:
          result = await paxTerminal.processPayment(request);
      }

      if (result) {
        setLastTransaction(result);
        setStatusMessage(`Transaction ${result.status}: ${result.resultTxt || 'Completed'}`);
        if (result.status === 'success') {
          clearAmount();
          generateRefNumber();
        }
      }
    } catch (error: any) {
      setStatusMessage(`Transaction failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelTransaction = async () => {
    if (!isProcessing) return;

    try {
      const success = await paxTerminal.cancelTransaction();
      if (success) {
        setStatusMessage('Transaction cancelled');
      } else {
        setStatusMessage('Cancel failed');
      }
    } catch (error) {
      setStatusMessage('Cancel failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = ['5.00', '10.00', '20.00', '50.00', '100.00'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PAX A920 Terminal</h1>
            <p className="text-gray-600 mt-1">Payment Processing Interface</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Details</h2>
          
          {/* Amount Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amounts</label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  disabled={isProcessing}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors disabled:opacity-50"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <select
              value={transType}
              onChange={(e) => setTransType(e.target.value as any)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="SALE">Sale</option>
              <option value="RETURN">Return/Refund</option>
              <option value="VOID">Void</option>
              <option value="AUTH">Authorization</option>
            </select>
          </div>

          {/* Tender Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={tenderType}
              onChange={(e) => setTenderType(e.target.value as any)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="CREDIT">Credit Card</option>
              <option value="DEBIT">Debit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          {/* Reference Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
            <input
              type="text"
              value={ecrRefNum}
              onChange={(e) => setEcrRefNum(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="REF123456"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={processTransaction}
              disabled={isProcessing || !isConnected || !amount}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : `Process ${transType}`}
            </button>

            {isProcessing && (
              <button
                onClick={cancelTransaction}
                className="w-full px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Transaction
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={clearAmount}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={generateRefNumber}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                New Ref #
              </button>
            </div>
          </div>
        </div>

        {/* Status and Results */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
            <div className={`p-4 rounded-lg ${
              isProcessing ? 'bg-blue-50 text-blue-800' :
              statusMessage.includes('success') || statusMessage.includes('ready') ? 'bg-green-50 text-green-800' :
              statusMessage.includes('failed') || statusMessage.includes('error') ? 'bg-red-50 text-red-800' :
              'bg-gray-50 text-gray-800'
            }`}>
              <div className="flex items-center space-x-2">
                {isProcessing && <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>}
                <span>{statusMessage || 'Ready'}</span>
              </div>
            </div>
          </div>

          {/* Last Transaction */}
          {lastTransaction && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Last Transaction</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-mono">${lastTransaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span>{lastTransaction.transType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    lastTransaction.status === 'success' ? 'text-green-600' :
                    lastTransaction.status === 'failure' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {lastTransaction.status.toUpperCase()}
                  </span>
                </div>
                {lastTransaction.authCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auth Code:</span>
                    <span className="font-mono">{lastTransaction.authCode}</span>
                  </div>
                )}
                {lastTransaction.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono">{lastTransaction.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{new Date(lastTransaction.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terminal Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono">{paxTerminal.getConfig().ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span className="font-mono">{paxTerminal.getConfig().port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span>{paxTerminal.getConfig().connectionType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
