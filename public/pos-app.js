/**
 * PAX A920 POS System Frontend Application
 * Handles UI interactions and API communication
 */

class POSApp {
    constructor() {
        this.cart = [];
        this.selectedPaymentType = 'CREDIT';
        this.taxRate = 0.08; // 8% tax rate
        this.currentTransaction = null;
        this.transactionHistory = [];
        
        this.init();
    }

    init() {
        this.checkSystemStatus();
        this.updateCartDisplay();
        this.updatePaymentAmount();
        
        // Auto-refresh status every 30 seconds
        setInterval(() => this.checkSystemStatus(), 30000);
    }

    // System Status and Connection
    async checkSystemStatus() {
        try {
            const response = await fetch('/api/pos/status');
            const status = await response.json();
            
            this.updateConnectionStatus(status.terminal.success);
            
            if (!status.terminal.success) {
                this.showToast('warning', 'Terminal connection issue: ' + status.terminal.message);
            }
        } catch (error) {
            console.error('Status check failed:', error);
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const icon = statusElement.querySelector('i');
        const text = statusElement.querySelector('span');
        
        statusElement.className = 'connection-status ' + (connected ? 'connected' : 'disconnected');
        text.textContent = connected ? 'Connected' : 'Disconnected';
    }

    async testConnection() {
        this.showLoading('Testing terminal connection...');
        
        try {
            const response = await fetch('/api/pos/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('success', 'Terminal connection successful');
                this.updateConnectionStatus(true);
            } else {
                this.showToast('error', 'Connection failed: ' + result.message);
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showToast('error', 'Connection test failed');
            this.updateConnectionStatus(false);
        } finally {
            this.hideLoading();
        }
    }

    // POS Sign-on
    async signOnPOS() {
        this.showLoading('Signing on to POS...');
        
        try {
            const response = await fetch('/api/pos/onsign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('success', 'POS sign-on successful');
                this.updateTransactionStatus('POS signed on successfully');
            } else {
                this.showToast('error', 'Sign-on failed: ' + result.error);
                this.updateTransactionStatus('Sign-on failed');
            }
        } catch (error) {
            console.error('Sign-on failed:', error);
            this.showToast('error', 'Sign-on failed');
        } finally {
            this.hideLoading();
        }
    }

    // Cart Management
    addProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const quantity = parseInt(document.getElementById('productQuantity').value);

        if (!name) {
            this.showToast('warning', 'Please enter a product name');
            return;
        }

        if (!price || price <= 0) {
            this.showToast('warning', 'Please enter a valid price');
            return;
        }

        if (!quantity || quantity <= 0) {
            this.showToast('warning', 'Please enter a valid quantity');
            return;
        }

        const product = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: quantity,
            total: price * quantity
        };

        this.cart.push(product);
        this.updateCartDisplay();
        this.updatePaymentAmount();

        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productQuantity').value = '1';

        this.showToast('success', `Added ${name} to cart`);
    }

    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.updatePaymentAmount();
        this.showToast('info', 'Product removed from cart');
    }

    clearCart() {
        if (this.cart.length === 0) {
            this.showToast('warning', 'Cart is already empty');
            return;
        }

        this.cart = [];
        this.updateCartDisplay();
        this.updatePaymentAmount();
        this.showToast('info', 'Cart cleared');
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Cart is empty</p>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">$${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div class="cart-item-price">$${item.total.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="posApp.removeProduct(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updatePaymentAmount() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        document.getElementById('paymentAmount').textContent = `$${total.toFixed(2)}`;
    }

    // Payment Processing
    selectPaymentType(type) {
        this.selectedPaymentType = type;
        
        // Update UI
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    async processPayment() {
        const total = this.cart.reduce((sum, item) => sum + item.total, 0) * (1 + this.taxRate);
        
        if (this.cart.length === 0) {
            this.showToast('warning', 'Cart is empty');
            return;
        }

        if (total <= 0) {
            this.showToast('warning', 'Invalid transaction amount');
            return;
        }

        this.showLoading('Processing payment...');
        this.updateTransactionStatus('Processing payment on terminal...');
        
        // Enable cancel button
        document.getElementById('cancelBtn').disabled = false;

        try {
            const transactionData = {
                amount: Math.round(total * 100), // Convert to cents
                tenderType: this.selectedPaymentType,
                transType: 'SALE',
                referenceNumber: this.generateReferenceNumber(),
                items: this.cart
            };

            const response = await fetch('/api/pos/trans/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('success', 'Payment processed successfully');
                this.updateTransactionStatus('Payment successful');
                this.addToHistory(result.transaction, transactionData);
                this.clearCart();
            } else {
                this.showToast('error', 'Payment failed: ' + result.error);
                this.updateTransactionStatus('Payment failed: ' + result.error);
            }
        } catch (error) {
            console.error('Payment processing failed:', error);
            this.showToast('error', 'Payment processing failed');
            this.updateTransactionStatus('Payment processing failed');
        } finally {
            this.hideLoading();
            document.getElementById('cancelBtn').disabled = true;
        }
    }

    async cancelTransaction() {
        this.showLoading('Cancelling transaction...');
        this.updateTransactionStatus('Cancelling transaction...');

        try {
            const response = await fetch('/api/pos/trans/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('info', 'Transaction cancelled');
                this.updateTransactionStatus('Transaction cancelled');
            } else {
                this.showToast('error', 'Cancellation failed: ' + result.error);
            }
        } catch (error) {
            console.error('Transaction cancellation failed:', error);
            this.showToast('error', 'Cancellation failed');
        } finally {
            this.hideLoading();
            document.getElementById('cancelBtn').disabled = true;
        }
    }

    async processReturn() {
        const amount = prompt('Enter return amount:');
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            this.showToast('warning', 'Please enter a valid return amount');
            return;
        }

        this.showLoading('Processing return...');
        this.updateTransactionStatus('Processing return...');

        try {
            const returnData = {
                amount: Math.round(parseFloat(amount) * 100), // Convert to cents
                tenderType: this.selectedPaymentType,
                transType: 'RETURN',
                referenceNumber: this.generateReferenceNumber()
            };

            const response = await fetch('/api/pos/trans/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(returnData)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('success', 'Return processed successfully');
                this.updateTransactionStatus('Return successful');
                this.addToHistory(result.result, returnData);
            } else {
                this.showToast('error', 'Return failed: ' + result.error);
                this.updateTransactionStatus('Return failed: ' + result.error);
            }
        } catch (error) {
            console.error('Return processing failed:', error);
            this.showToast('error', 'Return processing failed');
        } finally {
            this.hideLoading();
        }
    }

    // Utility Functions
    generateReferenceNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${timestamp.slice(-6)}-${random}`;
    }

    updateTransactionStatus(message) {
        const statusContent = document.querySelector('.transaction-status .status-content');
        statusContent.innerHTML = `<p>${message}</p>`;
    }

    addToHistory(transaction, originalData) {
        const historyItem = {
            timestamp: new Date().toISOString(),
            transaction: transaction,
            originalData: originalData
        };
        
        this.transactionHistory.unshift(historyItem);
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.transactionHistory.length === 0) {
            historyList.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-history"></i>
                    <p>No recent transactions</p>
                </div>
            `;
            return;
        }

        // Show last 5 transactions
        const recentTransactions = this.transactionHistory.slice(0, 5);
        historyList.innerHTML = recentTransactions.map(item => `
            <div class="history-item">
                <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
                <div class="history-details">
                    ${item.originalData.transType} - $${(item.originalData.amount / 100).toFixed(2)}
                    (${item.originalData.tenderType})
                </div>
            </div>
        `).join('');
    }

    // UI Helper Functions
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageElement = overlay.querySelector('p');
        messageElement.textContent = message;
        overlay.classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showToast(type, message) {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageElement = toast.querySelector('.toast-message');

        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        icon.className = `toast-icon ${icons[type]}`;
        messageElement.textContent = message;
        toast.className = `toast ${type} show`;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
}

// Initialize the POS application
const posApp = new POSApp();

// Global functions for HTML onclick handlers
function testConnection() {
    posApp.testConnection();
}

function signOnPOS() {
    posApp.signOnPOS();
}

function addProduct() {
    posApp.addProduct();
}

function selectPaymentType(type) {
    posApp.selectPaymentType(type);
}

function processPayment() {
    posApp.processPayment();
}

function cancelTransaction() {
    posApp.cancelTransaction();
}

function processReturn() {
    posApp.processReturn();
}

function clearCart() {
    posApp.clearCart();
}
