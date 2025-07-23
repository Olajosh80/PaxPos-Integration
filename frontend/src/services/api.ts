import axios, { AxiosResponse } from 'axios';
import { env } from '../config/env';

const API_BASE = env.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaxTransaction {
  id: string;
  amount: number;
  transType: 'SALE' | 'RETURN' | 'VOID' | 'AUTH' | 'CAPTURE';
  tenderType: 'CREDIT' | 'DEBIT' | 'CASH' | 'CHECK';
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  resultCode?: string;
  resultTxt?: string;
  referenceNumber?: string;
  authCode?: string;
  receiptData?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaxPaymentRequest {
  amount: number;
  transType?: 'SALE' | 'RETURN' | 'VOID' | 'AUTH' | 'CAPTURE';
  tenderType?: 'CREDIT' | 'DEBIT' | 'CASH' | 'CHECK';
  ecrRefNum?: string;
  reportStatus?: boolean;
  metadata?: Record<string, any>;
}

export interface PaxTerminalStatus {
  connected: boolean;
  ip: string;
  port: number;
  model: string;
  capabilities: {
    contactless: boolean;
    emv: boolean;
    magneticStripe: boolean;
    printer: boolean;
    camera: boolean;
    wifi: boolean;
    cellular: boolean;
  };
  lastResponse?: any;
}

export interface PaxDeviceTestRequest {
  testType: 'connection' | 'printer' | 'display' | 'signature' | 'camera' | 'nfc';
  parameters?: Record<string, any>;
}

export class ApiService {
  async request(url: string, options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: string;
    headers?: Record<string, string>;
  }): Promise<ApiResponse<any>> {
    const { method = 'GET', body, headers = {} } = options || {};

    try {
      let response: AxiosResponse<ApiResponse<any>>;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      switch (method) {
        case 'POST':
          response = await api.post(url, body ? JSON.parse(body) : undefined, config);
          break;
        case 'PUT':
          response = await api.put(url, body ? JSON.parse(body) : undefined, config);
          break;
        case 'DELETE':
          response = await api.delete(url, config);
          break;
        default:
          response = await api.get(url, config);
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }

  // PAX Terminal Operations
  async getTerminalStatus(): Promise<ApiResponse<PaxTerminalStatus>> {
    const response: AxiosResponse<ApiResponse<PaxTerminalStatus>> = await api.get('/api/pos/status');
    return response.data;
  }

  async testTerminalConnection(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/test-connection');
    return response.data;
  }

  async signOnTerminal(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/onsign');
    return response.data;
  }

  // PAX Payment Processing
  async processPayment(request: PaxPaymentRequest): Promise<ApiResponse<PaxTransaction>> {
    const response: AxiosResponse<ApiResponse<PaxTransaction>> = await api.post('/api/pos/trans/process', request);
    return response.data;
  }

  async cancelTransaction(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/trans/cancel');
    return response.data;
  }

  async processReturn(request: PaxPaymentRequest): Promise<ApiResponse<PaxTransaction>> {
    const response: AxiosResponse<ApiResponse<PaxTransaction>> = await api.post('/api/pos/trans/return', request);
    return response.data;
  }

  async voidTransaction(request: { transactionId: string; amount?: number; reason?: string }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/trans/void', request);
    return response.data;
  }

  // PAX Device Testing
  async testDevice(request: PaxDeviceTestRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/test', request);
    return response.data;
  }

  async printTestReceipt(request: { text?: string; copies?: number }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/print', request);
    return response.data;
  }

  async captureSignature(request: { prompt?: string; timeout?: number }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/signature', request);
    return response.data;
  }

  async displayMessage(request: { message: string; timeout?: number }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/display', request);
    return response.data;
  }

  async scanBarcode(request: { timeout?: number; formats?: string[] }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/scan', request);
    return response.data;
  }

  async testNFC(request: { timeout?: number }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/device/nfc', request);
    return response.data;
  }

  async getBatteryStatus(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/api/pos/device/battery');
    return response.data;
  }

  // Transaction Management
  async getTransactions(limit?: number, offset?: number): Promise<ApiResponse<{ transactions: PaxTransaction[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response: AxiosResponse<ApiResponse<{ transactions: PaxTransaction[]; pagination: any }>> =
      await api.get(`/api/pos/transactions?${params.toString()}`);
    return response.data;
  }

  async getTransactionById(id: string): Promise<ApiResponse<PaxTransaction>> {
    const response: AxiosResponse<ApiResponse<PaxTransaction>> = await api.get(`/api/pos/transactions/${id}`);
    return response.data;
  }

  // Configuration Management
  async getConfiguration(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/api/pos/config');
    return response.data;
  }

  async updateConfiguration(config: Record<string, any>): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/api/pos/config', config);
    return response.data;
  }

  // Legacy methods for compatibility (will be removed)
  async confirmPayment(request: { transactionId: string; authCode?: string }): Promise<ApiResponse<any>> {
    // For PAX, confirmation is typically part of the initial transaction
    return { success: true, message: 'PAX transactions are confirmed during processing' };
  }

  async capturePaymentIntent(request: { transactionId: string; amountToCapture?: number }): Promise<ApiResponse<any>> {
    // For PAX, capture is typically part of the initial transaction
    return { success: true, message: 'PAX transactions are captured during processing' };
  }

  async createTransaction(request: Partial<PaxTransaction>): Promise<ApiResponse<{ transaction: PaxTransaction; receipt: string }>> {
    // Mock implementation - this would typically be handled by processPayment
    const mockTransaction: PaxTransaction = {
      id: `txn_${Date.now()}`,
      amount: request.amount || 0,
      transType: request.transType || 'SALE',
      tenderType: request.tenderType || 'CREDIT',
      status: 'success',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...request
    };

    return {
      success: true,
      data: {
        transaction: mockTransaction,
        receipt: 'Mock receipt data'
      }
    };
  }

  // Mock methods for compatibility (these would be implemented with actual PAX functionality)
  async simulatePayment(request: any): Promise<ApiResponse<{ transaction: PaxTransaction }>> {
    const mockTransaction: PaxTransaction = {
      id: `sim_${Date.now()}`,
      amount: request.amount,
      transType: 'SALE',
      tenderType: 'CREDIT',
      status: request.status || 'success',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { success: true, data: { transaction: mockTransaction } };
  }

  async triggerProtocol(request: any): Promise<ApiResponse<any>> {
    return { success: true, message: 'Protocol triggered', data: request };
  }

  async getConnectionToken(): Promise<ApiResponse<{ secret: string }>> {
    return { success: true, data: { secret: 'mock_connection_token' } };
  }

  async createPaymentIntent(request: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: `pi_${Date.now()}`,
        amount: request.amount,
        currency: request.currency || 'usd',
        status: 'requires_payment_method'
      }
    };
  }
}

export const apiService = new ApiService();
