import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface DashboardProps {
  onNavigate: (view: 'pos' | 'transactions' | 'receipts') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { transactions, isLoading, fetchTransactions } = useAppStore();

  // Load dashboard data instantly when component mounts
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const recentTransactions = transactions.slice(0, 3);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = transactions.filter(t => t.status === 'success').length;
  const successRate = transactions.length > 0 ? (successfulTransactions / transactions.length) * 100 : 0;

  const quickActions = [
    {
      title: 'POS Terminal',
      description: 'Real-time payment processing',
      icon: '💳',
      color: 'from-green-500 to-emerald-600',
      action: () => onNavigate('pos'),
    },
    {
      title: 'POS Terminal',
      description: 'Process payments',
      icon: '💳',
      color: 'from-blue-500 to-blue-600',
      action: () => onNavigate('pos'),
    },
    {
      title: 'View Transactions',
      description: 'Browse transaction history',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      action: () => onNavigate('transactions'),
    },
    {
      title: 'Generate Receipts',
      description: 'Print and manage receipts',
      icon: '🧾',
      color: 'from-emerald-500 to-emerald-600',
      action: () => onNavigate('receipts'),
    },
    {
      title: 'View Receipts',
      description: 'View and print receipts',
      icon: '📝',
      color: 'from-orange-500 to-orange-600',
      action: () => onNavigate('receipts'),
    },
  ];

  const stats = [
    {
      title: 'Total Transactions',
      value: transactions.length.toString(),
      icon: '📈',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Amount',
      value: `$${(totalAmount / 100).toFixed(2)}`,
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: '✅',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: '🟢',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome to PAX A920 Pro</h1>
        <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
          Your complete POS terminal solution with Stripe integration
        </p>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm">System Online</span>
          </div>
          <div className="text-xs sm:text-sm opacity-75">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center self-start sm:self-auto`}>
                <span className="text-lg sm:text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-xl text-white">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
              <p className="text-sm text-slate-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">#{transaction.id.slice(-8)}</p>
                      <p className="text-sm text-slate-600">{transaction.resultCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ${(transaction.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <span className="text-4xl mb-4 block">📊</span>
              <p>No transactions yet</p>
              <button
                onClick={() => onNavigate('pos')}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first transaction
              </button>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-900">Backend Service</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-900">Database</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-900">Mock Bank</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
