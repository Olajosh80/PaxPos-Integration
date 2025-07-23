import React from 'react';

interface TerminalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'initializing' | 'connected' | 'no-terminal' | 'error';
  terminalName?: string;
  errorMessage?: string;
}

export const TerminalStatusModal: React.FC<TerminalStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  terminalName,
  errorMessage,
}) => {
  if (!isOpen) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'initializing':
        return {
          icon: '🔄',
          title: 'Initializing Terminal',
          message: 'Setting up Stripe Terminal connection...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          showSpinner: true,
        };
      case 'connected':
        return {
          icon: '✅',
          title: 'Terminal Connected',
          message: `Successfully connected to ${terminalName}`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          showSpinner: false,
        };
      case 'no-terminal':
        return {
          icon: '⚠️',
          title: 'No Terminal Found',
          message: 'No physical terminal detected. Manual entry and simulation available.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          showSpinner: false,
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Terminal Error',
          message: errorMessage || 'Failed to initialize terminal. Using fallback mode.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          showSpinner: false,
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown Status',
          message: 'Terminal status unknown',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          showSpinner: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{config.icon}</div>
              <h2 className={`text-xl font-bold ${config.textColor}`}>
                {config.title}
              </h2>
              {config.showSpinner && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {!config.showSpinner && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className={`text-base ${config.textColor} leading-relaxed`}>
            {config.message}
          </p>

          {status === 'no-terminal' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Available Options:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Manual card entry for testing</li>
                <li>• Payment simulation</li>
                <li>• Stripe Elements integration</li>
              </ul>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Fallback Mode Active:</h4>
              <p className="text-sm text-orange-700">
                The system will continue to work with manual payment entry and simulation features.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!config.showSpinner && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
