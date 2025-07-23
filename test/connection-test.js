/**
 * PAX A920 Connection and Integration Test Suite
 * Run this to verify your setup is working correctly
 */

import { TestTerminalConnectionAsync, GetConfigurationAsync } from '../pos.js';
import paxConfig from '../config/pax-config.js';

class PaxA920TestSuite {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 PAX A920 Integration Test Suite');
    console.log('=====================================\n');

    await this.testConfiguration();
    await this.testTerminalConnection();
    await this.testSystemStatus();
    await this.testTransactionValidation();

    this.printSummary();
  }

  async testConfiguration() {
    console.log('📋 Testing Configuration...');
    
    try {
      const config = await GetConfigurationAsync();
      
      // Test 1: Basic configuration
      this.test('Configuration loaded', !!config);
      
      // Test 2: Terminal IP configured
      this.test('Terminal IP configured',
        config.terminal.ip !== '192.168.1.100' &&
        config.terminal.ip !== '' &&
        config.terminal.ip === '192.168.178.24'
      );
      
      // Test 3: Port configuration
      this.test('Terminal port configured', 
        config.terminal.port === 10009
      );
      
      // Test 4: A920 capabilities
      this.test('A920 capabilities detected', 
        config.terminal.capabilities && 
        config.terminal.capabilities.contactless === true
      );

      console.log('✅ Configuration tests completed\n');
    } catch (error) {
      this.test('Configuration loading', false, error.message);
      console.log('❌ Configuration tests failed\n');
    }
  }

  async testTerminalConnection() {
    console.log('🔌 Testing Terminal Connection...');
    
    try {
      const result = await TestTerminalConnectionAsync();
      
      // Test 1: Connection successful
      this.test('Terminal connection', result.success, result.message);
      
      if (result.success) {
        console.log(`   ✓ Connected to PAX A920 at ${paxConfig.config.terminal.ip}:${paxConfig.config.terminal.port}`);
      } else {
        console.log(`   ✗ Connection failed: ${result.message}`);
        console.log('   💡 Check your terminal IP address and network connection');
      }

      console.log('✅ Connection tests completed\n');
    } catch (error) {
      this.test('Terminal connection', false, error.message);
      console.log('❌ Connection tests failed\n');
    }
  }

  async testSystemStatus() {
    console.log('⚡ Testing System Status...');
    
    try {
      // Test API endpoint
      const response = await fetch('http://localhost:3000/api/pos/status');
      
      this.test('API server running', response.ok);
      
      if (response.ok) {
        const status = await response.json();
        
        this.test('Status response valid', 
          status.status === 'online' && !!status.configuration
        );
        
        this.test('Terminal status included', 
          !!status.terminal
        );
        
        console.log(`   ✓ API server responding on port 3000`);
        console.log(`   ✓ System status: ${status.status}`);
      }

      console.log('✅ System status tests completed\n');
    } catch (error) {
      this.test('API server connection', false, error.message);
      console.log('❌ System status tests failed\n');
      console.log('   💡 Make sure the server is running with "npm start"\n');
    }
  }

  async testTransactionValidation() {
    console.log('💳 Testing Transaction Validation...');
    
    try {
      // Import A920 helper for validation
      const { PaxA920Helper } = await import('../config/pax-a920-config.js');
      
      // Test 1: Valid transaction
      const validTransaction = {
        amount: 1000, // $10.00
        transType: 'SALE',
        tenderType: 'CREDIT'
      };
      
      const validResult = PaxA920Helper.validateTransaction(validTransaction);
      this.test('Valid transaction validation', validResult.valid);
      
      // Test 2: Invalid amount (too small)
      const invalidTransaction = {
        amount: 0,
        transType: 'SALE',
        tenderType: 'CREDIT'
      };
      
      const invalidResult = PaxA920Helper.validateTransaction(invalidTransaction);
      this.test('Invalid transaction rejection', !invalidResult.valid);
      
      // Test 3: Unsupported transaction type
      const unsupportedTransaction = {
        amount: 1000,
        transType: 'INVALID_TYPE',
        tenderType: 'CREDIT'
      };
      
      const unsupportedResult = PaxA920Helper.validateTransaction(unsupportedTransaction);
      this.test('Unsupported transaction type rejection', !unsupportedResult.valid);
      
      console.log('✅ Transaction validation tests completed\n');
    } catch (error) {
      this.test('Transaction validation', false, error.message);
      console.log('❌ Transaction validation tests failed\n');
    }
  }

  test(name, condition, message = '') {
    const result = {
      name,
      passed: !!condition,
      message
    };
    
    this.results.push(result);
    
    if (result.passed) {
      this.passed++;
      console.log(`   ✓ ${name}`);
    } else {
      this.failed++;
      console.log(`   ✗ ${name}${message ? ': ' + message : ''}`);
    }
  }

  printSummary() {
    console.log('📊 Test Summary');
    console.log('===============');
    console.log(`Total tests: ${this.results.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Success rate: ${Math.round((this.passed / this.results.length) * 100)}%\n`);

    if (this.failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`   • ${r.name}${r.message ? ': ' + r.message : ''}`));
      console.log('');
    }

    if (this.passed === this.results.length) {
      console.log('🎉 All tests passed! Your PAX A920 integration is ready.');
      console.log('💡 Next steps:');
      console.log('   1. Configure your merchant credentials in .env');
      console.log('   2. Test a real transaction');
      console.log('   3. Customize the POS interface for your business');
    } else {
      console.log('⚠️  Some tests failed. Please review the configuration and try again.');
      console.log('💡 Common issues:');
      console.log('   • Terminal IP address not configured correctly');
      console.log('   • Terminal not connected to network');
      console.log('   • Server not running');
      console.log('   • Missing authentication credentials');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new PaxA920TestSuite();
  testSuite.runAllTests().catch(console.error);
}

export default PaxA920TestSuite;
