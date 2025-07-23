import React, { useState, useEffect } from 'react';
import { paxTerminal } from '../services/paxTerminal';

interface TestResult {
  testName: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  timestamp?: string;
}

export const PaxDeviceTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTerminalStatus();
  }, []);

  const checkTerminalStatus = async () => {
    try {
      const status = await paxTerminal.getStatus();
      setTerminalStatus(status);
      setIsConnected(status?.connected || false);
    } catch (error) {
      console.error('Failed to get terminal status:', error);
      setIsConnected(false);
    }
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [
      { ...result, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19) // Keep last 20 results
    ]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    addTestResult({ testName, status: 'running' });
    setLoading(true);

    try {
      const result = await testFunction();
      addTestResult({
        testName,
        status: 'success',
        message: 'Test completed successfully',
        data: result
      });
    } catch (error: any) {
      addTestResult({
        testName,
        status: 'error',
        message: error.message || 'Test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = () => runTest('Connection Test', async () => {
    const connected = await paxTerminal.connect();
    if (!connected) throw new Error('Failed to connect to terminal');
    await checkTerminalStatus();
    return { connected: true };
  });

  const testSignOn = () => runTest('Terminal Sign-On', async () => {
    const success = await paxTerminal.signOn();
    if (!success) throw new Error('Sign-on failed');
    return { signedOn: true };
  });

  const testPrinter = () => runTest('Printer Test', async () => {
    const testText = `
PAX A920 Printer Test
=====================
Date: ${new Date().toLocaleString()}
Terminal IP: ${paxTerminal.getConfig().ip}
Test Status: SUCCESS
=====================
    `.trim();
    
    const success = await paxTerminal.printTestReceipt(testText, 1);
    if (!success) throw new Error('Print test failed');
    return { printed: true };
  });

  const testDisplay = () => runTest('Display Test', async () => {
    const success = await paxTerminal.displayMessage('PAX A920 Display Test - Hello from Frontend!', 5);
    if (!success) throw new Error('Display test failed');
    return { displayed: true };
  });

  const testSignature = () => runTest('Signature Capture', async () => {
    const result = await paxTerminal.captureSignature('Please sign on the screen', 30);
    return result;
  });

  const testBarcode = () => runTest('Barcode Scanner', async () => {
    const result = await paxTerminal.scanBarcode(15, ['QR Code', 'Code 128', 'EAN-13']);
    return result;
  });

  const testNFC = () => runTest('NFC Reader', async () => {
    const result = await paxTerminal.testNFC(10);
    return result;
  });

  const testBattery = () => runTest('Battery Status', async () => {
    const result = await paxTerminal.getBatteryStatus();
    return result;
  });

  const testDeviceInfo = () => runTest('Device Information', async () => {
    const status = await paxTerminal.getStatus();
    return status;
  });

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PAX A920 Device Testing</h1>
            <p className="text-gray-600 mt-1">Comprehensive testing suite for PAX terminal features</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={checkTerminalStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {terminalStatus && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Terminal Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">IP Address:</span>
                <div className="font-mono">{terminalStatus.ip}</div>
              </div>
              <div>
                <span className="text-gray-600">Port:</span>
                <div className="font-mono">{terminalStatus.port}</div>
              </div>
              <div>
                <span className="text-gray-600">Model:</span>
                <div className="font-mono">{terminalStatus.model}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Tests</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">🔌</div>
            <div className="font-medium text-gray-900">Connection</div>
            <div className="text-sm text-gray-600">Test terminal connection</div>
          </button>

          <button
            onClick={testSignOn}
            disabled={loading || !isConnected}
            className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">🔐</div>
            <div className="font-medium text-gray-900">Sign-On</div>
            <div className="text-sm text-gray-600">Terminal sign-on</div>
          </button>

          <button
            onClick={testPrinter}
            disabled={loading || !isConnected}
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">🖨️</div>
            <div className="font-medium text-gray-900">Printer</div>
            <div className="text-sm text-gray-600">Print test receipt</div>
          </button>

          <button
            onClick={testDisplay}
            disabled={loading || !isConnected}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">📺</div>
            <div className="font-medium text-gray-900">Display</div>
            <div className="text-sm text-gray-600">Show test message</div>
          </button>

          <button
            onClick={testSignature}
            disabled={loading || !isConnected}
            className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-medium text-gray-900">Signature</div>
            <div className="text-sm text-gray-600">Capture signature</div>
          </button>

          <button
            onClick={testBarcode}
            disabled={loading || !isConnected}
            className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">📷</div>
            <div className="font-medium text-gray-900">Barcode</div>
            <div className="text-sm text-gray-600">Scan barcode/QR</div>
          </button>

          <button
            onClick={testNFC}
            disabled={loading || !isConnected}
            className="p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">📡</div>
            <div className="font-medium text-gray-900">NFC</div>
            <div className="text-sm text-gray-600">Test NFC reader</div>
          </button>

          <button
            onClick={testBattery}
            disabled={loading}
            className="p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">🔋</div>
            <div className="font-medium text-gray-900">Battery</div>
            <div className="text-sm text-gray-600">Check battery status</div>
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          <button
            onClick={clearResults}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Results
          </button>
        </div>

        {testResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No test results yet. Run a test to see results here.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div>
                      <div className="font-medium">{result.testName}</div>
                      {result.message && (
                        <div className="text-sm opacity-75">{result.message}</div>
                      )}
                    </div>
                  </div>
                  {result.timestamp && (
                    <div className="text-sm opacity-75">{result.timestamp}</div>
                  )}
                </div>
                {result.data && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
