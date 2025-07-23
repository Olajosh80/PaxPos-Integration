import { apiService, PaxTransaction, PaxPaymentRequest, PaxTerminalStatus, PaxDeviceTestRequest } from './api';

export interface PaxTerminalConfig {
  ip: string;
  port: number;
  timeout: number;
  connectionType: 'WIFI' | 'ETHERNET' | 'CELLULAR';
}

export interface PaxCapabilities {
  contactless: boolean;
  emv: boolean;
  magneticStripe: boolean;
  printer: boolean;
  camera: boolean;
  wifi: boolean;
  cellular: boolean;
}

export interface PaxTransactionLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
}

export class PaxTerminalService {
  private config: PaxTerminalConfig;
  private isConnected: boolean = false;
  private capabilities: PaxCapabilities | null = null;

  constructor(config?: Partial<PaxTerminalConfig>) {
    this.config = {
      ip: config?.ip || '192.168.178.24',
      port: config?.port || 10009,
      timeout: config?.timeout || 90,
      connectionType: config?.connectionType || 'WIFI'
    };
  }

  // Terminal Connection Management
  async connect(): Promise<boolean> {
    try {
      const response = await apiService.testTerminalConnection();
      this.isConnected = response.success;
      return this.isConnected;
    } catch (error) {
      console.error('Failed to connect to PAX terminal:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.capabilities = null;
  }

  async getStatus(): Promise<PaxTerminalStatus | null> {
    try {
      const response = await apiService.getTerminalStatus();
      if (response.success && response.data) {
        this.isConnected = response.data.connected;
        this.capabilities = response.data.capabilities;
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get terminal status:', error);
      return null;
    }
  }

  async signOn(): Promise<boolean> {
    try {
      const response = await apiService.signOnTerminal();
      return response.success;
    } catch (error) {
      console.error('Terminal sign-on failed:', error);
      return false;
    }
  }

  // Payment Processing
  async processPayment(request: PaxPaymentRequest): Promise<PaxTransaction | null> {
    try {
      const response = await apiService.processPayment(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Payment processing failed');
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  async cancelTransaction(): Promise<boolean> {
    try {
      const response = await apiService.cancelTransaction();
      return response.success;
    } catch (error) {
      console.error('Transaction cancellation failed:', error);
      return false;
    }
  }

  async processReturn(request: PaxPaymentRequest): Promise<PaxTransaction | null> {
    try {
      const response = await apiService.processReturn(request);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Return processing failed');
    } catch (error) {
      console.error('Return processing failed:', error);
      throw error;
    }
  }

  async voidTransaction(transactionId: string, amount?: number, reason?: string): Promise<boolean> {
    try {
      const response = await apiService.voidTransaction({ transactionId, amount, reason });
      return response.success;
    } catch (error) {
      console.error('Transaction void failed:', error);
      return false;
    }
  }

  // Device Testing and Operations
  async testDevice(testType: PaxDeviceTestRequest['testType'], parameters?: Record<string, any>): Promise<any> {
    try {
      const response = await apiService.testDevice({ testType, parameters });
      return response.data;
    } catch (error) {
      console.error(`Device test (${testType}) failed:`, error);
      throw error;
    }
  }

  async printTestReceipt(text?: string, copies: number = 1): Promise<boolean> {
    try {
      const response = await apiService.printTestReceipt({ text, copies });
      return response.success;
    } catch (error) {
      console.error('Print test failed:', error);
      return false;
    }
  }

  async captureSignature(prompt?: string, timeout: number = 60): Promise<any> {
    try {
      const response = await apiService.captureSignature({ prompt, timeout });
      return response.data;
    } catch (error) {
      console.error('Signature capture failed:', error);
      throw error;
    }
  }

  async displayMessage(message: string, timeout: number = 10): Promise<boolean> {
    try {
      const response = await apiService.displayMessage({ message, timeout });
      return response.success;
    } catch (error) {
      console.error('Display message failed:', error);
      return false;
    }
  }

  async scanBarcode(timeout: number = 30, formats?: string[]): Promise<any> {
    try {
      const response = await apiService.scanBarcode({ timeout, formats });
      return response.data;
    } catch (error) {
      console.error('Barcode scan failed:', error);
      throw error;
    }
  }

  async testNFC(timeout: number = 30): Promise<any> {
    try {
      const response = await apiService.testNFC({ timeout });
      return response.data;
    } catch (error) {
      console.error('NFC test failed:', error);
      throw error;
    }
  }

  async getBatteryStatus(): Promise<any> {
    try {
      const response = await apiService.getBatteryStatus();
      return response.data;
    } catch (error) {
      console.error('Battery status check failed:', error);
      throw error;
    }
  }

  // Utility Methods
  getConfig(): PaxTerminalConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PaxTerminalConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  isTerminalConnected(): boolean {
    return this.isConnected;
  }

  getCapabilities(): PaxCapabilities | null {
    return this.capabilities;
  }

  // Transaction Helpers
  formatAmount(amount: number): number {
    // PAX expects amounts in cents
    return Math.round(amount * 100);
  }

  parseAmount(amount: number): number {
    // Convert from cents to dollars
    return amount / 100;
  }

  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99;
  }

  // Transaction Types
  static readonly TRANSACTION_TYPES = {
    SALE: 'SALE',
    RETURN: 'RETURN',
    VOID: 'VOID',
    AUTH: 'AUTH',
    CAPTURE: 'CAPTURE'
  } as const;

  static readonly TENDER_TYPES = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
    CASH: 'CASH',
    CHECK: 'CHECK'
  } as const;
}

export const paxTerminal = new PaxTerminalService();
