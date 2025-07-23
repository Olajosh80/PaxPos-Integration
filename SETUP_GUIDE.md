# PAX A920 POS System Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- PAX A920 terminal on the same network
- Payment processor account and credentials

### 2. Installation
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the server
npm start
```

### 3. Access the System
- Web Interface: http://localhost:3000
- API Documentation: http://localhost:3000/api/pos/status

## 🔧 PAX A920 Terminal Configuration

### Network Setup
1. **Connect PAX A920 to WiFi:**
   - Go to Settings > Network > WiFi
   - Connect to your business network
   - Note the assigned IP address

2. **Configure Terminal IP in .env:**
   ```env
   PAX_TERMINAL_IP=192.168.178.24  # Your actual terminal IP
   PAX_TERMINAL_PORT=10009         # Default port
   PAX_TERMINAL_ID=1A53E8300       # Your terminal ID
   ```

3. **Test Connection:**
   - Open web interface
   - Click "Test Connection" button
   - Verify green "Connected" status

### Finding Your PAX A920 IP Address
1. **Method 1 - Terminal Settings:**
   - Settings > About > Network Information
   - Note the IP address

2. **Method 2 - Router Admin:**
   - Access your router's admin panel
   - Look for "PAX-A920" or similar device name

3. **Method 3 - Network Scanner:**
   ```bash
   # Use nmap to scan your network
   nmap -sn 192.168.1.0/24
   ```

## 🔐 Authentication Configuration

### Remove Hardcoded Values
The system now uses configurable authentication instead of hardcoded URLs.

### Required Credentials
Configure these in your `.env` file:

```env
# Authentication Configuration
PAX_AUTH_URL=https://your-payment-processor-api.com
PAX_MERCHANT_ID=your_merchant_id
PAX_TERMINAL_ID=your_terminal_id
PAX_API_KEY=your_api_key
PAX_ENVIRONMENT=sandbox  # or 'production'
```

### Obtaining Credentials
1. **Contact your payment processor** (e.g., First Data, Worldpay, etc.)
2. **Request PAX integration credentials:**
   - Merchant ID
   - Terminal ID
   - API Key/Secret
   - Authentication URL

3. **Common Payment Processors:**
   - **First Data:** Contact your First Data representative
   - **Worldpay:** Access Worldpay Developer Portal
   - **Chase Paymentech:** Contact Chase support
   - **Elavon:** Contact Elavon integration team

## 🏗️ UI Architecture Decision

### Recommended: Web-Based UI (Current Implementation)
✅ **Advantages:**
- Cross-platform compatibility
- Easy updates and maintenance
- Responsive design for tablets/phones
- No additional software installation
- Remote access capability

### Architecture Overview:
```
Browser (UI) ↔ Node.js Backend ↔ C# DLL ↔ PAX A920 Terminal
```

### Alternative Architectures:

#### 1. Separate Frontend Application
```javascript
// React/Vue/Angular app communicating via REST API
const response = await fetch('http://localhost:3000/api/pos/trans/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(transactionData)
});
```

#### 2. Embedded WebView
```csharp
// C# WPF/WinForms with embedded browser
webBrowser.Navigate("http://localhost:3000");
```

## 🔒 Browser vs Terminal Communication

### Security Model
**Browsers CANNOT directly communicate with PAX A920 terminals.**

### Why Node.js Backend is Required:
1. **CORS Restrictions:** Browsers block direct TCP connections
2. **Security:** Payment terminals require secure, authenticated connections
3. **Protocol:** PAX uses proprietary communication protocols
4. **Compliance:** PCI DSS requires secure server-side processing

### Communication Flow:
```
1. Browser → HTTP Request → Node.js Backend
2. Node.js → C# DLL → PAX Terminal Communication
3. PAX Terminal → Response → C# DLL → Node.js
4. Node.js → HTTP Response → Browser
```

## ⚙️ PAX A920 Specific Configuration

### Terminal Settings
1. **Enable Developer Mode:**
   - Settings > Developer Options
   - Enable "USB Debugging" if needed

2. **Network Configuration:**
   - Ensure stable WiFi connection
   - Configure static IP if needed
   - Open required ports (default: 10009)

3. **Payment Application:**
   - Install required payment app from PAXSTORE
   - Configure merchant settings

### Optimal Settings for Integration:
```env
# PAX A920 Optimized Settings
PAX_TERMINAL_IP=192.168.1.100
PAX_TERMINAL_PORT=10009
PAX_TIMEOUT=90
PAX_CONNECTION_TYPE=WIFI
PAX_ENABLE_STATUS_REPORTING=true
PAX_MAX_RETRIES=3
PAX_RETRY_DELAY=5000
```

### Performance Optimization:
1. **Use 5GHz WiFi** for better performance
2. **Position terminal** close to WiFi router
3. **Minimize network latency** 
4. **Regular terminal updates** via PAXSTORE

## 📋 Complete Implementation Plan

### Phase 1: Basic Setup (1-2 days)
- [ ] Configure terminal network connection
- [ ] Set up authentication credentials
- [ ] Test basic payment processing
- [ ] Verify web interface functionality

### Phase 2: Enhanced Features (3-5 days)
- [ ] Implement product catalog
- [ ] Add inventory management
- [ ] Configure receipt printing
- [ ] Set up reporting system

### Phase 3: Advanced Integration (1-2 weeks)
- [ ] Integrate with accounting system
- [ ] Add customer management
- [ ] Implement loyalty programs
- [ ] Set up multi-terminal support

### Phase 4: Production Deployment (2-3 days)
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Backup and recovery setup
- [ ] Staff training

## 🛠️ Configuration Files

### Environment Variables (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PAX A920 Terminal
PAX_TERMINAL_IP=192.168.1.100
PAX_TERMINAL_PORT=10009
PAX_TIMEOUT=90

# Authentication (REQUIRED for production)
PAX_AUTH_URL=
PAX_MERCHANT_ID=
PAX_TERMINAL_ID=
PAX_API_KEY=
PAX_ENVIRONMENT=sandbox

# Business Settings
POS_BUSINESS_NAME=Your Business Name
POS_TAX_RATE=0.08
POS_CURRENCY=USD
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "node test/connection-test.js"
  }
}
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Terminal Connection Failed
- Verify IP address and port
- Check network connectivity
- Ensure terminal is powered on
- Test with ping command

#### 2. Authentication Errors
- Verify merchant credentials
- Check environment setting (sandbox/production)
- Contact payment processor support

#### 3. Transaction Timeouts
- Increase timeout value
- Check network stability
- Verify terminal responsiveness

#### 4. DLL Loading Errors
- Ensure all DLL files are present in libs/
- Check .NET Framework compatibility
- Verify edge-js installation

### Support Resources:
- PAX Developer Portal: https://developer.pax.us/
- Technical Support: Contact your payment processor
- Community Forums: PAX Technology forums

## 📞 Next Steps

1. **Configure your terminal IP address**
2. **Obtain authentication credentials**
3. **Test the connection**
4. **Process a test transaction**
5. **Customize for your business needs**

For additional support, refer to the API documentation at `/api/pos/status` or contact your payment processor's technical support team.
