import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService, PaxTransaction } from '../services/api';

// Mock types for compatibility
interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  metadata?: any;
}

interface CreateSystemLogRequest {
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: any;
}

export interface AppState {
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Transaction State
  transactions: PaxTransaction[];
  currentTransaction: PaxTransaction | null;
  
  // Payment State
  connectionToken: string | null;
  paymentIntent: any | null;
  
  // Protocol State
  protocolLogs: Array<{
    id: string;
    timestamp: string;
    protocolCode: string;
    message: string;
    status: 'success' | 'error' | 'pending';
  }>;

  // System Logs State
  systemLogs: SystemLog[];
  logsLoading: boolean;
}

export interface AppActions {
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  setTransactions: (transactions: PaxTransaction[]) => void;
  setCurrentTransaction: (transaction: PaxTransaction | null) => void;
  addTransaction: (transaction: PaxTransaction) => void;
  updateTransaction: (id: string, updates: Partial<PaxTransaction>) => void;
  
  setConnectionToken: (token: string | null) => void;
  setPaymentIntent: (intent: any | null) => void;
  
  addProtocolLog: (log: Omit<AppState['protocolLogs'][0], 'id' | 'timestamp'>) => void;
  clearProtocolLogs: () => void;

  setSystemLogs: (logs: SystemLog[]) => void;
  addSystemLog: (log: CreateSystemLogRequest) => Promise<void>;
  fetchSystemLogs: (filters?: {
    level?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  clearSystemLogs: () => void;
  
  fetchTransactions: () => Promise<void>;
  simulatePayment: (amount: number, status: 'success' | 'failure', protocolCode?: string) => Promise<PaxTransaction | null>;
  triggerProtocol: (protocolCode: string, transactionId: string, amount: number) => Promise<void>;
  getConnectionToken: () => Promise<string | null>;
  createPaymentIntent: (amount: number, currency: string) => Promise<any>;
}

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  isLoading: false,
  error: null,
  transactions: [],
  currentTransaction: null,
  connectionToken: null,
  paymentIntent: null,
  protocolLogs: [],
  systemLogs: [],
  logsLoading: false,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      setTransactions: (transactions) => set({ transactions }),
      setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [transaction, ...state.transactions] 
      })),
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        ),
        currentTransaction: state.currentTransaction?.id === id
          ? { ...state.currentTransaction, ...updates }
          : state.currentTransaction
      })),
      
      setConnectionToken: (token) => set({ connectionToken: token }),
      setPaymentIntent: (intent) => set({ paymentIntent: intent }),
      
      // Protocol Actions
      addProtocolLog: (log) => set((state) => ({
        protocolLogs: [{
          ...log,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        }, ...state.protocolLogs]
      })),
      clearProtocolLogs: () => set({ protocolLogs: [] }),

      // System Logs Actions
      setSystemLogs: (logs) => set({ systemLogs: logs }),

      addSystemLog: async (logData) => {
        try {
          const response = await fetch('/api/v1/logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              set((state) => ({
                systemLogs: [result.data, ...state.systemLogs]
              }));
            }
          }
        } catch (error) {
          console.error('Failed to add system log:', error);
        }
      },

      fetchSystemLogs: async (filters = {}) => {
        const { setError } = get();

        try {
          set({ logsLoading: true });
          setError(null);

          const queryParams = new URLSearchParams();
          if (filters.level) queryParams.append('level', filters.level);
          if (filters.category) queryParams.append('category', filters.category);
          if (filters.startDate) queryParams.append('startDate', filters.startDate);
          if (filters.endDate) queryParams.append('endDate', filters.endDate);
          if (filters.limit) queryParams.append('limit', filters.limit.toString());
          if (filters.offset) queryParams.append('offset', filters.offset.toString());

          const response = await fetch(`/api/v1/logs?${queryParams}`);

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              set({ systemLogs: result.data.logs });
            } else {
              setError(result.message || 'Failed to fetch system logs');
            }
          } else {
            setError('Failed to fetch system logs');
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch system logs');
        } finally {
          set({ logsLoading: false });
        }
      },

      clearSystemLogs: () => set({ systemLogs: [] }),

      // API Actions
      fetchTransactions: async () => {
        const { setLoading, setError, setTransactions } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const response = await apiService.getTransactions(50, 0);
          
          if (response.success && response.data) {
            setTransactions(response.data.transactions);
          } else {
            setError(response.error || 'Failed to fetch transactions');
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
        } finally {
          setLoading(false);
        }
      },
      
      simulatePayment: async (amount, status, protocolCode) => {
        const { setLoading, setError, addTransaction, addProtocolLog } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const response = await apiService.simulatePayment({
            amount,
            status,
            protocolCode: protocolCode as any,
          });
          
          if (response.success && response.data) {
            const transaction = response.data.transaction;
            addTransaction(transaction);
            
            if (protocolCode) {
              addProtocolLog({
                protocolCode,
                message: `Payment ${status} simulation with protocol ${protocolCode}`,
                status: status === 'success' ? 'success' : 'error',
              });
            }
            
            return transaction;
          } else {
            setError(response.error || 'Failed to simulate payment');
            return null;
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to simulate payment');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      triggerProtocol: async (protocolCode, transactionId, amount) => {
        const { setLoading, setError, addProtocolLog } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          addProtocolLog({
            protocolCode,
            message: `Triggering protocol ${protocolCode} for transaction ${transactionId}`,
            status: 'pending',
          });
          
          const response = await apiService.triggerProtocol({
            protocolEventCode: protocolCode as any,
            transactionId,
            amount,
          });
          
          if (response.success) {
            addProtocolLog({
              protocolCode,
              message: `Protocol ${protocolCode} completed successfully`,
              status: 'success',
            });
          } else {
            addProtocolLog({
              protocolCode,
              message: `Protocol ${protocolCode} failed: ${response.error}`,
              status: 'error',
            });
            setError(response.error || 'Failed to trigger protocol');
          }
        } catch (error) {
          addProtocolLog({
            protocolCode,
            message: `Protocol ${protocolCode} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            status: 'error',
          });
          setError(error instanceof Error ? error.message : 'Failed to trigger protocol');
        } finally {
          setLoading(false);
        }
      },
      
      getConnectionToken: async () => {
        const { setLoading, setError, setConnectionToken } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const response = await apiService.getConnectionToken();
          
          if (response.success && response.data) {
            const token = response.data.secret;
            setConnectionToken(token);
            return token;
          } else {
            setError(response.error || 'Failed to get connection token');
            return null;
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to get connection token');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      createPaymentIntent: async (amount, currency) => {
        const { setLoading, setError, setPaymentIntent } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const response = await apiService.createPaymentIntent({
            amount,
            currency,
          });
          
          if (response.success && response.data) {
            setPaymentIntent(response.data);
            return response.data;
          } else {
            setError(response.error || 'Failed to create payment intent');
            return null;
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to create payment intent');
          return null;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'pax-pos-store',
    }
  )
);
