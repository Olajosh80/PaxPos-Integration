import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const LogViewer: React.FC = () => {
  const { protocolLogs, clearProtocolLogs } = useAppStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Protocol Logs</h2>
        <button
          onClick={clearProtocolLogs}
          disabled={protocolLogs.length === 0}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Logs
        </button>
      </div>

      {protocolLogs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No protocol logs yet. Trigger a protocol to see logs here.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {protocolLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-lg">{getStatusIcon(log.status)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {log.protocolCode}
                  </span>
                  <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-words">
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
