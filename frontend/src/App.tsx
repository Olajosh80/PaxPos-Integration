
import { useState } from 'react';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { ReceiptViewer } from './components/ReceiptViewer';
import { PaxTerminalPOS } from './components/PaxTerminalPOS';
import { PaxDeviceTestPage } from './components/PaxDeviceTestPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ToastProvider } from './components/ui/toast';
import { useRealTimeUpdates } from './hooks';

type ActiveView = 'dashboard' | 'pos' | 'transactions' | 'receipts' | 'device-test';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Enable global real-time updates for background sync
  useRealTimeUpdates({
    enableTransactionUpdates: true,
    enableTerminalUpdates: true,
    enableCacheCleanup: true,
    enableNetworkUpdates: true,
  });

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '🏠' },
    { id: 'pos' as const, label: 'POS Terminal', icon: '💳' },
    { id: 'device-test' as const, label: 'Device Test', icon: '🔧' },
    { id: 'transactions' as const, label: 'Transactions', icon: '📊' },
    { id: 'receipts' as const, label: 'Receipts', icon: '🧾' },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />;
      case 'pos':
        return <PaxTerminalPOS onBack={() => setActiveView('dashboard')} />;
      case 'device-test':
        return <PaxDeviceTestPage />;
      case 'transactions':
        return <TransactionList />;
      case 'receipts':
        return <ReceiptViewer />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  // Show welcome screen on first load
  if (showWelcome) {
    return (
      <ToastProvider>
        <WelcomeScreen onComplete={() => setShowWelcome(false)} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-['Poppins']">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">P</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900">PAX A920 Terminal</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">POS Terminal System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Online</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        {/* Mobile Bottom Navigation / Desktop Sidebar */}
        <nav className="order-2 sm:order-1 bg-white border-t sm:border-t-0 sm:border-r border-slate-200 sm:w-64">
          {/* Mobile Navigation */}
          <div className="sm:hidden flex overflow-x-auto px-2 py-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 mx-1 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:block p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="order-1 sm:order-2 flex-1 overflow-auto">
          <div className="p-3 sm:p-6">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}

export default App;
