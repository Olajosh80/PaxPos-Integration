/*
 * PAX A920 Specific Configuration and Optimization
 * Tailored settings for PAX A920 terminal model
 */

export const paxA920Config = {
  // PAX A920 Hardware Specifications
  hardware: {
    model: "A920",
    processor: "ARM Cortex-A7",
    memory: "1GB RAM",
    storage: "8GB",
    display: "5-inch capacitive touchscreen",
    battery: "5250mAh Li-ion",
    connectivity: ["WiFi", "4G LTE", "Bluetooth", "NFC"],
    cardReaders: ["Magnetic Stripe", "EMV Chip", "NFC Contactless"],
    printer: "High-speed thermal printer",
    camera: "Rear-facing for barcode/QR scanning"
  },

  // Optimized Communication Settings for A920
  communication: {
    // WiFi optimization for A920
    wifi: {
      preferredBand: "5GHz", // A920 supports dual-band WiFi
      reconnectInterval: 30000, // 30 seconds
      signalStrengthThreshold: -70, // dBm
      maxConnectionAttempts: 5
    },
    
    // Network timeouts optimized for A920 performance
    timeouts: {
      connection: 10000, // 10 seconds for initial connection
      transaction: 90000, // 90 seconds for transaction processing
      signOn: 30000, // 30 seconds for sign-on
      signature: 60000, // 60 seconds for signature capture
      heartbeat: 5000 // 5 seconds for keep-alive
    },

    // A920 specific ports and protocols
    ports: {
      default: 10009,
      ssl: 10010,
      backup: 10011
    }
  },

  // Transaction Processing Optimization
  transactions: {
    // A920 supports these transaction types
    supportedTypes: [
      "SALE",
      "RETURN", 
      "VOID",
      "PREAUTH",
      "CAPTURE",
      "TIP_ADJUST",
      "BALANCE_INQUIRY"
    ],

    // A920 supported tender types
    supportedTenderTypes: [
      "CREDIT",
      "DEBIT", 
      "EBT",
      "GIFT",
      "LOYALTY"
    ],

    // A920 specific limits
    limits: {
      maxAmount: 999999, // $9,999.99
      minAmount: 1, // $0.01
      maxTipPercent: 30,
      maxItems: 100
    },

    // Retry configuration for A920
    retry: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
      maxDelay: 10000
    }
  },

  // A920 Display and UI Settings
  display: {
    // Customer-facing display messages
    messages: {
      welcome: "Welcome! Please follow prompts on terminal",
      insertCard: "Please insert or tap your card",
      processing: "Processing your payment...",
      approved: "Payment Approved - Thank you!",
      declined: "Payment Declined - Please try another card",
      removeCard: "Please remove your card",
      signatureRequired: "Please sign on the terminal",
      thankYou: "Thank you for your business!"
    },

    // Screen timeout settings
    timeouts: {
      idle: 300000, // 5 minutes
      transaction: 120000, // 2 minutes
      signature: 60000 // 1 minute
    }
  },

  // A920 Security Features
  security: {
    // PCI compliance settings
    pci: {
      version: "PCI PTS 5.x",
      encryption: "AES-256",
      keyManagement: "DUKPT",
      tamperDetection: true
    },

    // Secure boot and authentication
    authentication: {
      secureBootEnabled: true,
      certificateValidation: true,
      deviceAuthentication: true
    }
  },

  // A920 Peripheral Configuration
  peripherals: {
    // Built-in thermal printer
    printer: {
      enabled: true,
      paperWidth: "58mm",
      printSpeed: "90mm/s",
      resolution: "203dpi",
      autocut: true,
      lowPaperWarning: true
    },

    // NFC/Contactless reader
    nfc: {
      enabled: true,
      readRange: "25mm",
      supportedProtocols: ["ISO14443A", "ISO14443B", "ISO15693"],
      emvContactless: true,
      applePay: true,
      googlePay: true,
      samsungPay: true
    },

    // Camera for barcode scanning
    camera: {
      enabled: true,
      resolution: "5MP",
      autofocus: true,
      flashlight: true,
      supportedFormats: [
        "QR Code", "Code 128", "Code 39", "EAN-13", "UPC-A"
      ]
    },

    // Battery management
    battery: {
      capacity: 5250, // mAh
      lowBatteryWarning: 20, // percentage
      criticalBatteryLevel: 10, // percentage
      chargingOptimization: true
    }
  },

  // A920 Performance Optimization
  performance: {
    // Memory management
    memory: {
      maxCacheSize: 100, // MB
      gcInterval: 300000, // 5 minutes
      lowMemoryThreshold: 100 // MB
    },

    // CPU optimization
    cpu: {
      maxCpuUsage: 80, // percentage
      backgroundTaskLimit: 5,
      priorityBoost: true
    },

    // Network optimization
    network: {
      keepAliveEnabled: true,
      compressionEnabled: true,
      maxConcurrentConnections: 3,
      bufferSize: 8192 // bytes
    }
  },

  // A920 Application Settings
  applications: {
    // PAXSTORE integration
    paxstore: {
      enabled: true,
      autoUpdate: true,
      updateCheckInterval: 86400000, // 24 hours
      allowBetaUpdates: false
    },

    // Third-party app support
    thirdParty: {
      allowInstallation: false,
      sandboxMode: true,
      permissionControl: "strict"
    }
  },

  // A920 Maintenance and Monitoring
  maintenance: {
    // Health monitoring
    monitoring: {
      enabled: true,
      reportInterval: 3600000, // 1 hour
      metrics: [
        "battery_level",
        "memory_usage", 
        "cpu_usage",
        "network_signal",
        "transaction_count",
        "error_count"
      ]
    },

    // Automatic maintenance
    automation: {
      dailyReboot: false,
      logRotation: true,
      cacheCleanup: true,
      tempFileCleanup: true
    }
  }
};

// A920 Specific Helper Functions
export class PaxA920Helper {
  
  /**
   * Validate A920 specific transaction parameters
   */
  static validateTransaction(transactionData) {
    const errors = [];
    
    // Check transaction type support
    if (!paxA920Config.transactions.supportedTypes.includes(transactionData.transType)) {
      errors.push(`Transaction type ${transactionData.transType} not supported on A920`);
    }
    
    // Check tender type support
    if (!paxA920Config.transactions.supportedTenderTypes.includes(transactionData.tenderType)) {
      errors.push(`Tender type ${transactionData.tenderType} not supported on A920`);
    }
    
    // Check amount limits
    const amount = transactionData.amount;
    if (amount < paxA920Config.transactions.limits.minAmount) {
      errors.push(`Amount too small. Minimum: $${paxA920Config.transactions.limits.minAmount / 100}`);
    }
    
    if (amount > paxA920Config.transactions.limits.maxAmount) {
      errors.push(`Amount too large. Maximum: $${paxA920Config.transactions.limits.maxAmount / 100}`);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get optimal timeout for transaction type
   */
  static getOptimalTimeout(transactionType) {
    const timeouts = paxA920Config.communication.timeouts;
    
    switch (transactionType) {
      case 'SALE':
      case 'RETURN':
        return timeouts.transaction;
      case 'VOID':
        return timeouts.transaction / 2; // Voids are typically faster
      case 'PREAUTH':
        return timeouts.transaction;
      case 'SIGNATURE':
        return timeouts.signature;
      case 'SIGNON':
        return timeouts.signOn;
      default:
        return timeouts.transaction;
    }
  }

  /**
   * Get A920 device status
   */
  static getDeviceStatus() {
    return {
      model: paxA920Config.hardware.model,
      capabilities: {
        contactless: true,
        emv: true,
        magneticStripe: true,
        printer: true,
        camera: true,
        wifi: true,
        cellular: true
      },
      limits: paxA920Config.transactions.limits,
      supportedTransactions: paxA920Config.transactions.supportedTypes,
      supportedTenderTypes: paxA920Config.transactions.supportedTenderTypes
    };
  }

  /**
   * Generate A920 optimized transaction request
   */
  static buildOptimizedRequest(baseRequest) {
    return {
      ...baseRequest,
      
      // A920 specific optimizations
      timeout: this.getOptimalTimeout(baseRequest.transType),
      
      // Enable A920 features
      enableContactless: true,
      enableEmv: true,
      enableMagstripe: true,
      
      // A920 display settings
      customerDisplay: true,
      merchantDisplay: true,
      
      // A920 receipt settings
      printReceipt: paxA920Config.peripherals.printer.enabled,
      
      // A920 signature settings
      signatureCapture: true,
      signatureTimeout: paxA920Config.communication.timeouts.signature
    };
  }

  /**
   * Check A920 compatibility
   */
  static checkCompatibility(requirements) {
    const device = paxA920Config.hardware;
    const compatibility = {
      compatible: true,
      warnings: [],
      requirements: requirements
    };

    // Check if requirements are met
    if (requirements.minMemory && parseInt(device.memory) < requirements.minMemory) {
      compatibility.compatible = false;
      compatibility.warnings.push(`Insufficient memory: ${device.memory} < ${requirements.minMemory}GB`);
    }

    if (requirements.requiredConnectivity) {
      const missing = requirements.requiredConnectivity.filter(
        conn => !device.connectivity.includes(conn)
      );
      if (missing.length > 0) {
        compatibility.compatible = false;
        compatibility.warnings.push(`Missing connectivity: ${missing.join(', ')}`);
      }
    }

    return compatibility;
  }
}

export default paxA920Config;
