/*
 * PAX A920 Configuration Manager
 * Handles all PAX terminal configuration and validation
 */

import { paxConfig } from './env.js';
import { paxA920Config, PaxA920Helper } from './pax-a920-config.js';
import fs from 'fs';
import path from 'path';

class PaxConfigManager {
  constructor() {
    this.config = paxConfig;
    this.validateConfiguration();
  }

  /**
   * Validate PAX configuration
   */
  validateConfiguration() {
    const errors = [];

    // Validate terminal settings
    if (!this.config.terminal.ip || this.config.terminal.ip === "192.168.1.100") {
      errors.push("PAX_TERMINAL_IP must be configured with your actual terminal IP address");
    }

    if (!this.isValidIP(this.config.terminal.ip)) {
      errors.push("PAX_TERMINAL_IP must be a valid IP address");
    }

    if (this.config.terminal.port < 1 || this.config.terminal.port > 65535) {
      errors.push("PAX_TERMINAL_PORT must be between 1 and 65535");
    }

    // Validate authentication settings for production
    if (this.config.auth.environment === 'production') {
      if (!this.config.auth.url) {
        errors.push("PAX_AUTH_URL is required for production environment");
      }
      if (!this.config.auth.merchantId) {
        errors.push("PAX_MERCHANT_ID is required for production environment");
      }
      if (!this.config.auth.terminalId) {
        errors.push("PAX_TERMINAL_ID is required for production environment");
      }
      if (!this.config.auth.apiKey) {
        errors.push("PAX_API_KEY is required for production environment");
      }
    }

    if (errors.length > 0) {
      console.warn("PAX Configuration Warnings:");
      errors.forEach(error => console.warn(`  - ${error}`));
    }

    return errors.length === 0;
  }

  /**
   * Validate IP address format
   */
  isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * Get terminal connection parameters
   */
  getTerminalConfig() {
    return {
      ip: this.config.terminal.ip,
      port: this.config.terminal.port,
      timeout: this.config.terminal.timeout,
      connectionType: this.config.terminal.connectionType
    };
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig() {
    return {
      AuthUrl: this.config.auth.url,
      merchantId: this.config.auth.merchantId,
      terminalId: this.config.auth.terminalId,
      apiKey: this.config.auth.apiKey,
      environment: this.config.auth.environment
    };
  }

  /**
   * Build transaction request object optimized for PAX A920
   */
  buildTransactionRequest(transactionData) {
    const terminalConfig = this.getTerminalConfig();
    const authConfig = this.getAuthConfig();

    // Validate transaction for A920 compatibility
    const validation = PaxA920Helper.validateTransaction(transactionData);
    if (!validation.valid) {
      throw new Error(`A920 validation failed: ${validation.errors.join(', ')}`);
    }

    // Get optimal timeout for transaction type
    const optimizedTimeout = PaxA920Helper.getOptimalTimeout(transactionData.transType);

    const baseRequest = {
      // Authentication
      AuthUrl: authConfig.AuthUrl,

      // Terminal Connection
      ip: terminalConfig.ip,
      port: terminalConfig.port,
      timeout: optimizedTimeout,

      // Transaction Details
      TenderType: transactionData.tenderType || this.config.transaction.defaultTenderType,
      TransType: transactionData.transType || "SALE",
      Amount: transactionData.amount,
      ECRRefNum: transactionData.referenceNumber || this.generateReferenceNumber(),
      ReportStatus: this.config.transaction.enableStatusReporting,

      // Additional merchant data
      MerchantId: authConfig.merchantId,
      TerminalId: authConfig.terminalId,

      // Optional fields
      ...(transactionData.tip && { TipAmount: transactionData.tip }),
      ...(transactionData.cashback && { CashbackAmount: transactionData.cashback }),
      ...(transactionData.invoice && { InvoiceNumber: transactionData.invoice }),
      ...(transactionData.clerk && { ClerkId: transactionData.clerk })
    };

    // Apply A920 specific optimizations
    return PaxA920Helper.buildOptimizedRequest(baseRequest);
  }

  /**
   * Generate unique reference number
   */
  generateReferenceNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Get sign-on request configuration
   */
  buildSignOnRequest() {
    const terminalConfig = this.getTerminalConfig();
    const authConfig = this.getAuthConfig();

    return {
      AuthUrl: authConfig.AuthUrl,
      ip: terminalConfig.ip,
      port: terminalConfig.port,
      timeout: terminalConfig.timeout,
      MerchantId: authConfig.merchantId,
      TerminalId: authConfig.terminalId
    };
  }

  /**
   * Test terminal connectivity
   */
  async testTerminalConnection() {
    const net = await import('net');
    
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = 5000; // 5 second timeout

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        socket.destroy();
        resolve({
          success: true,
          message: `Successfully connected to PAX A920 at ${this.config.terminal.ip}:${this.config.terminal.port}`
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject({
          success: false,
          message: `Connection timeout to PAX A920 at ${this.config.terminal.ip}:${this.config.terminal.port}`
        });
      });

      socket.on('error', (error) => {
        socket.destroy();
        reject({
          success: false,
          message: `Connection failed to PAX A920: ${error.message}`
        });
      });

      socket.connect(this.config.terminal.port, this.config.terminal.ip);
    });
  }

  /**
   * Get configuration summary for debugging including A920 specific info
   */
  getConfigSummary() {
    return {
      terminal: {
        model: "PAX A920",
        ip: this.config.terminal.ip,
        port: this.config.terminal.port,
        connectionType: this.config.terminal.connectionType,
        capabilities: PaxA920Helper.getDeviceStatus().capabilities
      },
      auth: {
        environment: this.config.auth.environment,
        hasAuthUrl: !!this.config.auth.url,
        hasMerchantId: !!this.config.auth.merchantId,
        hasTerminalId: !!this.config.auth.terminalId,
        hasApiKey: !!this.config.auth.apiKey
      },
      transaction: {
        defaultTenderType: this.config.transaction.defaultTenderType,
        statusReporting: this.config.transaction.enableStatusReporting,
        supportedTypes: paxA920Config.transactions.supportedTypes,
        supportedTenderTypes: paxA920Config.transactions.supportedTenderTypes,
        limits: paxA920Config.transactions.limits
      },
      a920Features: {
        hardware: paxA920Config.hardware,
        peripherals: {
          printer: paxA920Config.peripherals.printer.enabled,
          nfc: paxA920Config.peripherals.nfc.enabled,
          camera: paxA920Config.peripherals.camera.enabled
        }
      }
    };
  }
}

export default new PaxConfigManager();
