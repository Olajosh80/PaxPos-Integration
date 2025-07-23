/**
 * Android-style Numeric Keypad Component
 * 
 * Provides a touch-friendly numeric keypad for PAX terminal
 * Optimized for Android POS terminal interaction
 */

import React from 'react';

interface AndroidNumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  maxLength?: number;
  allowDecimal?: boolean;
  placeholder?: string;
  className?: string;
}

export const AndroidNumericKeypad: React.FC<AndroidNumericKeypadProps> = ({
  value,
  onChange,
  onEnter,
  maxLength = 10,
  allowDecimal = true,
  placeholder = "0.00",
  className = ""
}) => {
  
  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }
    
    if (key === 'clear') {
      onChange('');
      return;
    }
    
    if (key === 'enter') {
      onEnter?.();
      return;
    }
    
    if (key === '.' && (!allowDecimal || value.includes('.'))) {
      return;
    }
    
    if (value.length >= maxLength) {
      return;
    }
    
    // Prevent multiple leading zeros
    if (key === '0' && value === '0') {
      return;
    }
    
    // Replace leading zero with number
    if (value === '0' && key !== '.') {
      onChange(key);
      return;
    }
    
    onChange(value + key);
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    return value;
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [allowDecimal ? '.' : '', '0', 'backspace']
  ];

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      {/* Display */}
      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Amount</span>
            <span className="text-3xl font-bold text-gray-800 font-mono">
              ${formatDisplayValue()}
            </span>
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {keypadButtons.flat().map((key, index) => {
          if (!key) return <div key={index} />; // Empty cell

          const isBackspace = key === 'backspace';
          const isNumber = /^\d$/.test(key);
          const isDot = key === '.';

          return (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`
                h-12 rounded-lg font-bold text-lg transition-all duration-150 active:scale-95 touch-manipulation
                ${isNumber || isDot ?
                  'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300' :
                  'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                }
                ${isBackspace ? 'col-span-1' : ''}
              `}
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              {isBackspace ? (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              ) : (
                key
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleKeyPress('clear')}
          className="h-10 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 rounded-lg font-bold text-sm transition-all duration-150 active:scale-95 touch-manipulation"
          style={{ minHeight: '40px' }}
        >
          Clear
        </button>

        {onEnter && (
          <button
            onClick={() => handleKeyPress('enter')}
            className="h-10 bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 rounded-lg font-bold text-sm transition-all duration-150 active:scale-95 touch-manipulation"
            style={{ minHeight: '40px' }}
          >
            Enter
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Android-style Card Number Input
 */
interface AndroidCardInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  type?: string;
}

export const AndroidCardInput: React.FC<AndroidCardInputProps> = ({
  value,
  onChange,
  placeholder = "Card Number",
  className = "",
  label,
  type
}) => {

  const formatCardNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');

    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    return formatted;
  };

  const formatCurrency = (input: string) => {
    // For currency, allow digits and one decimal point
    const cleaned = input.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'currency') {
      const formatted = formatCurrency(e.target.value);
      onChange(formatted);
    } else {
      const formatted = formatCardNumber(e.target.value);
      if (formatted.replace(/\s/g, '').length <= 16) {
        onChange(formatted);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="tel"
        inputMode={type === 'currency' ? 'decimal' : 'numeric'}
        pattern={type === 'currency' ? '[0-9]*\.?[0-9]*' : '[0-9\s]*'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-4 text-lg font-mono border-2 border-gray-300 rounded-xl
          focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent
          touch-manipulation bg-white
        ${className}
      `}
        autoComplete="cc-number"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        style={{ fontSize: '18px' }} // Prevent zoom on Android
      />
    </div>
  );
};

/**
 * Android-style PIN Input
 */
interface AndroidPinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  className?: string;
}

export const AndroidPinInput: React.FC<AndroidPinInputProps> = ({
  length = 4,
  onComplete,
  className = ""
}) => {
  const [pin, setPin] = React.useState('');

  const handleKeyPress = (digit: string) => {
    if (digit === 'backspace') {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      return;
    }
    
    if (digit === 'clear') {
      setPin('');
      return;
    }
    
    if (pin.length >= length) {
      return;
    }
    
    const newPin = pin + digit;
    setPin(newPin);
    
    if (newPin.length === length) {
      onComplete(newPin);
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      {/* PIN Display */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Enter PIN</h3>
          <div className="flex justify-center space-x-3">
            {Array.from({ length }, (_, i) => (
              <div
                key={i}
                className={`
                  w-4 h-4 rounded-full border-2 transition-all duration-200
                  ${i < pin.length ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-300'}
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* PIN Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit, index) => {
          if (!digit) return <div key={index} />; // Empty cell
          
          const isBackspace = digit === 'backspace';
          
          return (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className={`
                h-16 rounded-xl font-bold text-xl transition-all duration-150 active:scale-95 touch-manipulation
                ${isBackspace ? 
                  'bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300' : 
                  'bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300'
                }
              `}
              style={{ minHeight: '64px', minWidth: '64px' }}
            >
              {isBackspace ? (
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              ) : (
                digit
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Android-style Text Keyboard for Product Descriptions
 */
interface AndroidTextKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
}

export const AndroidTextKeyboard: React.FC<AndroidTextKeyboardProps> = ({
  value,
  onChange,
  onEnter,
  placeholder = "Product description",
  className = ""
}) => {

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === 'clear') {
      onChange('');
      return;
    }

    if (key === 'space') {
      onChange(value + ' ');
      return;
    }

    if (key === 'enter') {
      onEnter?.();
      return;
    }

    onChange(value + key);
  };

  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    return value;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-4 ${className}`}>
      {/* Display */}
      <div className="mb-4">
        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
          <div className="text-left">
            <span className="text-sm text-gray-500 block">Product Description</span>
            <span className="text-lg font-medium text-gray-800 min-h-[1.5rem] block">
              {formatDisplayValue()}
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="space-y-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-10 w-8 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 touch-manipulation"
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom row with special keys */}
        <div className="flex justify-center gap-1 mt-3">
          <button
            onClick={() => handleKeyPress('clear')}
            className="h-10 px-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 touch-manipulation"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('space')}
            className="h-10 px-8 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 touch-manipulation"
          >
            Space
          </button>

          <button
            onClick={() => handleKeyPress('backspace')}
            className="h-10 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 touch-manipulation"
          >
            ⌫
          </button>

          {onEnter && (
            <button
              onClick={() => handleKeyPress('enter')}
              className="h-10 px-3 bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 touch-manipulation"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
