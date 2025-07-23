import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

const isProd = process.env.NODE_ENV === "prod";

function parseEnv() {
  const localEnv = path.resolve(".env");
  const prodEnv = path.resolve(".env.prod");

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error("Missing environment configuration file");
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;

  // Load environment variables
  dotenv.config({ path: filePath });

  return { path: filePath };
}

// PAX A920 Configuration
export const paxConfig = {
  // Terminal Communication Settings
  terminal: {
    ip: process.env.PAX_TERMINAL_IP || "192.168.178.24", // Your actual terminal IP
    port: parseInt(process.env.PAX_TERMINAL_PORT) || 10009,
    timeout: parseInt(process.env.PAX_TIMEOUT) || 90,
    connectionType: process.env.PAX_CONNECTION_TYPE || "WIFI", // WIFI, ETHERNET, CELLULAR
  },

  // Authentication Settings
  auth: {
    url: process.env.PAX_AUTH_URL || "", // Remove hardcoded URL
    merchantId: process.env.PAX_MERCHANT_ID || "",
    terminalId: process.env.PAX_TERMINAL_ID || "",
    apiKey: process.env.PAX_API_KEY || "",
    environment: process.env.PAX_ENVIRONMENT || "sandbox", // sandbox, production
  },

  // Transaction Settings
  transaction: {
    defaultTenderType: process.env.PAX_DEFAULT_TENDER_TYPE || "CREDIT",
    enableStatusReporting: process.env.PAX_ENABLE_STATUS_REPORTING === "true",
    maxRetries: parseInt(process.env.PAX_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.PAX_RETRY_DELAY) || 5000, // milliseconds
  },

  // Security Settings
  security: {
    enableEncryption: process.env.PAX_ENABLE_ENCRYPTION === "true",
    certificatePath: process.env.PAX_CERTIFICATE_PATH || "",
    keyPath: process.env.PAX_KEY_PATH || "",
  }
};

export default parseEnv();
