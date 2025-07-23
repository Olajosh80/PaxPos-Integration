# PAX A920 Complete POS System

## 🚀 Overview
A complete **Point of Sale (POS) system** specifically designed for **PAX A920 terminals**. This system provides a modern web-based interface with robust backend integration using Node.js, Express, and C# DLL wrappers for seamless PAX terminal communication.

---

## ✨ Key Features

- 🏪 **Complete POS Interface**: Modern web-based UI with shopping cart, payment processing, and transaction history
- 📱 **PAX A920 Optimized**: Specifically configured for PAX A920 terminal capabilities
- 🔗 **Secure Integration**: C# DLL wrapper with enhanced error handling and retry logic
- 💳 **Full Payment Support**: Credit, Debit, EMV Chip, NFC Contactless, Apple Pay, Google Pay
- 🧾 **Receipt Management**: Built-in thermal printer support and digital receipts
- 📊 **Real-time Monitoring**: Connection status, transaction tracking, and system health
- 🔧 **Configurable**: Environment-based configuration for development and production

---

## 🎯 PAX A920 Specific Answers

### 1. **Terminal Communication Configuration**

**IP Address & Port Setup:**
```env
# Configure in .env file
PAX_TERMINAL_IP=192.168.178.24  # Your A920's actual IP
PAX_TERMINAL_PORT=10009         # Default PAX port
PAX_CONNECTION_TYPE=WIFI        # A920 supports WiFi/4G
PAX_TERMINAL_ID=1A53E8300       # Your terminal ID
```

**Finding Your A920 IP Address:**
- **Method 1**: Settings → About → Network Information
- **Method 2**: Check your router's connected devices
- **Method 3**: Use network scanner: `nmap -sn 192.168.1.0/24`

### 2. **Authentication Configuration**

**Removed Hardcoded Values:**
```env
# OLD (hardcoded): AuthUrl: "http://www.moleq.com"
# NEW (configurable):
PAX_AUTH_URL=https://your-payment-processor-api.com
PAX_MERCHANT_ID=your_merchant_id
PAX_TERMINAL_ID=your_terminal_id
PAX_API_KEY=your_api_key
PAX_ENVIRONMENT=sandbox  # or 'production'
```

**Obtaining Credentials:**
- Contact your payment processor (First Data, Worldpay, Chase, etc.)
- Request PAX integration credentials
- Get sandbox credentials for testing

### 3. **UI Architecture Decision: Web-Based (Recommended)**

**✅ Chosen Architecture:**
```
Browser (UI) ↔ Node.js Backend ↔ C# DLL ↔ PAX A920 Terminal
```

**Advantages:**
- Cross-platform compatibility
- No software installation required
- Easy updates and maintenance
- Responsive design for tablets/phones
- Remote access capability

### 4. **Browser vs Terminal Communication**

**❌ Browsers CANNOT directly communicate with PAX A920**

**Why Node.js Backend is Required:**
- CORS security restrictions
- Payment terminals require authenticated connections
- PAX uses proprietary TCP/IP protocols
- PCI DSS compliance requirements

**Communication Flow:**
1. Browser → HTTP Request → Node.js Backend
2. Node.js → C# DLL → PAX Terminal
3. PAX Terminal → Response → C# DLL → Node.js
4. Node.js → HTTP Response → Browser

### 5. **PAX A920 Specific Configuration**

**Hardware Capabilities:**
- 5-inch capacitive touchscreen
- ARM Cortex-A7 processor
- 5250mAh battery
- Dual-band WiFi (2.4GHz/5GHz)
- EMV Chip, NFC Contactless, Magnetic Stripe
- Built-in thermal printer
- Rear camera for barcode scanning

**Optimized Settings:**
```env
PAX_TIMEOUT=90              # A920 optimized timeout
PAX_ENABLE_STATUS_REPORTING=true
PAX_MAX_RETRIES=3
PAX_RETRY_DELAY=5000
```

---

## 📦 Quick Setup

### 1. Install and Configure
```bash
# Install dependencies
npm install

# Copy configuration template
cp .env.example .env

# Edit .env with your A920 settings
nano .env
```

### 2. Configure Your PAX A920
```env
# Required: Set your A920's IP address
PAX_TERMINAL_IP=192.168.178.24

# Required: Set authentication (contact your processor)
PAX_AUTH_URL=https://your-processor-api.com
PAX_MERCHANT_ID=your_merchant_id
```

### 3. Test and Start
```bash
# Test your configuration
npm test

# Start the POS system
npm start
```

### 4. Access the System
- **Web Interface**: http://localhost:3000
- **API Status**: http://localhost:3000/api/pos/status

---

## 🛠️ Complete API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | POS Web Interface |
| `/api/pos/status` | GET | System Status & Configuration |
| `/api/pos/test-connection` | POST | Test A920 Connection |
| `/api/pos/onsign` | POST | POS Sign-on |
| `/api/pos/trans/process` | POST | Process Payment |
| `/api/pos/trans/cancel` | POST | Cancel Transaction |
| `/api/pos/trans/return` | POST | Process Return/Refund |
| `/api/pos/trans/void` | POST | Void Transaction |

---

## 📂 Project Structure

```plaintext
PAX-A920-POS/
├── 📁 config/                 # Configuration management
│   ├── env.js                 # Environment configuration
│   ├── pax-config.js          # Main PAX configuration
│   └── pax-a920-config.js     # A920 specific settings
├── 📁 libs/                   # C# DLL files
│   ├── PaxWrapperSDK.dll      # Main PAX wrapper
│   ├── POSLink.dll            # PAX communication library
│   └── ...                    # Supporting DLLs
├── 📁 public/                 # Web interface
│   ├── index.html             # Main POS interface
│   ├── styles.css             # UI styling
│   └── pos-app.js             # Frontend JavaScript
├── 📁 test/                   # Testing utilities
│   └── connection-test.js     # A920 connection tests
├── app.js                     # Express server
├── pos.js                     # Enhanced PAX wrapper
├── .env                       # Configuration file
└── SETUP_GUIDE.md            # Detailed setup instructions
```

---

## 🔧 Step-by-Step Implementation Plan

### Phase 1: Basic Setup (Day 1)
- [x] Configure A920 network connection
- [x] Set up authentication system
- [x] Create web-based POS interface
- [x] Implement basic payment processing

### Phase 2: Enhanced Features (Days 2-3)
- [x] Add shopping cart functionality
- [x] Implement transaction history
- [x] Add connection monitoring
- [x] Create comprehensive error handling

### Phase 3: Production Ready (Days 4-5)
- [ ] Configure production authentication
- [ ] Set up receipt printing
- [ ] Add inventory management
- [ ] Implement reporting system

### Phase 4: Advanced Features (Week 2)
- [ ] Multi-terminal support
- [ ] Customer management
- [ ] Loyalty programs
- [ ] Integration with accounting systems

---

## 🧪 Testing Your Setup

```bash
# Run comprehensive tests
npm test

# Test specific components
npm run test:connection
```

**Test Results Include:**
- ✅ Configuration validation
- ✅ A920 terminal connection
- ✅ API server functionality
- ✅ Transaction validation
- ✅ A920 specific features

---

## 🔒 Security Features

- **PCI PTS 5.x Certified** PAX A920 terminal
- **Encrypted Communication** between all components
- **Secure Authentication** with configurable credentials
- **Input Validation** for all transactions
- **Error Handling** with detailed logging

---

## 📞 Support & Next Steps

### Immediate Actions:
1. **Configure Terminal IP** in `.env` file
2. **Obtain Authentication Credentials** from your payment processor
3. **Test Connection** using the web interface
4. **Process Test Transaction** to verify functionality

### Getting Help:
- 📖 **Detailed Setup**: See `SETUP_GUIDE.md`
- 🧪 **Testing**: Run `npm test` for diagnostics
- 🔧 **Configuration**: Check `/api/pos/status` endpoint
- 📞 **Support**: Contact your payment processor for credentials

### Production Checklist:
- [ ] Production authentication credentials configured
- [ ] Terminal connection tested and stable
- [ ] SSL/HTTPS enabled for production
- [ ] Backup and recovery procedures in place
- [ ] Staff training completed

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

**Built specifically for PAX A920 terminals with modern web technologies.**