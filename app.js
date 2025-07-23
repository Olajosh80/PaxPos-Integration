/*
 * Author: Ming
 * Email: t8ming@live.com
 * Creation Date:  2025-04-15
 * Description: app.js Start entry
 * Version: 1.0
 */ 
import {
  ProcessTransAsync,
  DoSignOnPOSAsync,
  CancelTransAsync,
  TestTerminalConnectionAsync,
  GetConfigurationAsync,
} from "./pos.js";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for the POS UI
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve the main POS interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// System status and configuration
app.get('/api/pos/status', async (req, res) => {
  try {
    const config = await GetConfigurationAsync();
    const connectionTest = await TestTerminalConnectionAsync();

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      configuration: config,
      terminal: connectionTest,
      version: '2.0.0'
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to get system status'
    });
  }
});

// Test terminal connection
app.post('/api/pos/test-connection', async (req, res) => {
  try {
    const result = await TestTerminalConnectionAsync();
    res.json(result);
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Connection test failed'
    });
  }
});

// Enhanced transaction processing
app.post("/api/pos/trans/process", async (req, res) => {
  try {
    const transactionData = req.body;

    // Validate required fields
    if (!transactionData.amount) {
      return res.status(400).json({
        error: "Transaction amount is required",
        code: "MISSING_AMOUNT"
      });
    }

    if (transactionData.amount <= 0) {
      return res.status(400).json({
        error: "Transaction amount must be greater than 0",
        code: "INVALID_AMOUNT"
      });
    }

    console.log('Processing transaction:', transactionData);
    const result = await ProcessTransAsync(transactionData);

    res.json({
      success: true,
      transaction: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transaction processing failed:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || "Failed to process transaction",
      code: error.code || "TRANSACTION_ERROR",
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced transaction cancellation
app.post("/api/pos/trans/cancel", async (req, res) => {
  try {
    console.log('Cancelling transaction');
    const result = await CancelTransAsync();

    res.json({
      success: true,
      message: "Transaction cancelled successfully",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transaction cancellation failed:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || "Failed to cancel transaction",
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced POS sign-on
app.post("/api/pos/onsign", async (req, res) => {
  try {
    const signOnData = req.body || null;
    console.log('Performing POS sign-on');
    const result = await DoSignOnPOSAsync(signOnData);

    res.json({
      success: true,
      message: "POS sign-on successful",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('POS sign-on failed:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || "Failed to sign on POS",
      timestamp: new Date().toISOString()
    });
  }
});

// Additional POS endpoints for complete system

// Void transaction
app.post("/api/pos/trans/void", async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        error: "Transaction ID is required for void operation",
        code: "MISSING_TRANSACTION_ID"
      });
    }

    // For void, we use ProcessTrans with VOID type
    const voidData = {
      transType: "VOID",
      amount: amount,
      referenceNumber: transactionId,
      reason: reason
    };

    const result = await ProcessTransAsync(voidData);

    res.json({
      success: true,
      message: "Transaction voided successfully",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transaction void failed:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || "Failed to void transaction",
      timestamp: new Date().toISOString()
    });
  }
});

// Return/Refund transaction
app.post("/api/pos/trans/return", async (req, res) => {
  try {
    const returnData = {
      ...req.body,
      transType: "RETURN"
    };

    if (!returnData.amount) {
      return res.status(400).json({
        error: "Return amount is required",
        code: "MISSING_AMOUNT"
      });
    }

    console.log('Processing return:', returnData);
    const result = await ProcessTransAsync(returnData);

    res.json({
      success: true,
      message: "Return processed successfully",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Return processing failed:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message || "Failed to process return",
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Device Testing Endpoints
app.post('/api/pos/device/test', async (req, res) => {
  try {
    const { testType, parameters } = req.body;

    // For now, return mock responses since we need to implement these in the C# DLL
    const mockResults = {
      connection: { connected: true, latency: 45 },
      printer: { printed: true, paperLevel: 85 },
      display: { displayed: true, brightness: 100 },
      signature: { captured: true, signatureData: 'base64_signature_data' },
      camera: { scanned: true, barcodeData: '1234567890123', format: 'EAN-13' },
      nfc: { detected: true, cardType: 'contactless', protocol: 'ISO14443A' }
    };

    res.json({
      success: true,
      message: `${testType} test completed`,
      result: mockResults[testType] || { tested: true },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Device test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Device test failed'
    });
  }
});

app.post('/api/pos/device/print', async (req, res) => {
  try {
    const { text, copies = 1 } = req.body;

    // TODO: Implement actual printing via C# DLL
    console.log('Print request:', { text, copies });

    res.json({
      success: true,
      message: `Printed ${copies} copy(ies)`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Print failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Print failed'
    });
  }
});

app.post('/api/pos/device/signature', async (req, res) => {
  try {
    const { prompt, timeout = 60 } = req.body;

    // TODO: Implement signature capture via C# DLL
    console.log('Signature capture request:', { prompt, timeout });

    res.json({
      success: true,
      message: 'Signature captured',
      data: {
        signatureData: 'mock_signature_base64_data',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Signature capture failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Signature capture failed'
    });
  }
});

app.post('/api/pos/device/display', async (req, res) => {
  try {
    const { message, timeout = 10 } = req.body;

    // TODO: Implement display message via C# DLL
    console.log('Display message request:', { message, timeout });

    res.json({
      success: true,
      message: 'Message displayed on terminal',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Display message failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Display message failed'
    });
  }
});

app.post('/api/pos/device/scan', async (req, res) => {
  try {
    const { timeout = 30, formats } = req.body;

    // TODO: Implement barcode scanning via C# DLL
    console.log('Barcode scan request:', { timeout, formats });

    res.json({
      success: true,
      message: 'Barcode scanned',
      data: {
        barcodeData: '1234567890123',
        format: 'EAN-13',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Barcode scan failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Barcode scan failed'
    });
  }
});

app.post('/api/pos/device/nfc', async (req, res) => {
  try {
    const { timeout = 30 } = req.body;

    // TODO: Implement NFC testing via C# DLL
    console.log('NFC test request:', { timeout });

    res.json({
      success: true,
      message: 'NFC test completed',
      data: {
        detected: true,
        cardType: 'contactless',
        protocol: 'ISO14443A',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('NFC test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'NFC test failed'
    });
  }
});

app.get('/api/pos/device/battery', async (req, res) => {
  try {
    // TODO: Implement battery status via C# DLL
    res.json({
      success: true,
      data: {
        level: 85,
        charging: false,
        voltage: 4.1,
        temperature: 25,
        health: 'good',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Battery status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Battery status check failed'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`\n🚀 PAX A920 POS System started successfully!`);
  console.log(`📡 Server running on port ${port}`);
  console.log(`🌐 Web interface: http://localhost:${port}`);
  console.log(`🔧 API base URL: http://localhost:${port}/api/pos`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /                          - POS Web Interface`);
  console.log(`   GET  /api/pos/status            - System Status`);
  console.log(`   POST /api/pos/test-connection   - Test Terminal Connection`);
  console.log(`   POST /api/pos/onsign            - POS Sign-on`);
  console.log(`   POST /api/pos/trans/process     - Process Payment`);
  console.log(`   POST /api/pos/trans/cancel      - Cancel Transaction`);
  console.log(`   POST /api/pos/trans/return      - Process Return`);
  console.log(`   POST /api/pos/trans/void        - Void Transaction`);
  console.log(`   POST /api/pos/device/test       - Device Testing`);
  console.log(`   POST /api/pos/device/print      - Print Test Receipt`);
  console.log(`   POST /api/pos/device/signature  - Capture Signature`);
  console.log(`   POST /api/pos/device/display    - Display Message`);
  console.log(`   POST /api/pos/device/scan       - Barcode Scanner`);
  console.log(`   POST /api/pos/device/nfc        - NFC Test`);
  console.log(`   GET  /api/pos/device/battery    - Battery Status`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Configure your PAX A920 IP in .env file`);
  console.log(`   2. Test connection using the web interface`);
  console.log(`   3. Use the Device Test page to test all features`);
  console.log(`   4. Process a test transaction`);
  console.log(`\n📖 For detailed setup instructions, see SETUP_GUIDE.md\n`);
});
