/*
 * Author: Ming
 * Email: t8ming@live.com
 * Creation Date: 2025-04-15
 * Description: Enhanced PAX A920 C# DLL wrapper with configuration management
 * Version: 2.0
 */
import path from "path";
import edge from "edge-js";
import { fileURLToPath } from "url";
import paxConfig from "./config/pax-config.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure DLL location
const libLocation = path.join(__dirname, "libs", "PaxWrapperSDK.dll");

// Validate DLL exists
import fs from 'fs';
if (!fs.existsSync(libLocation)) {
  throw new Error(`PAX Wrapper SDK not found at: ${libLocation}`);
}

/**
 * Create Edge.js function for calling C# DLL methods
 */
function createEdgeFunc(methodName) {
  try {
    return edge.func({
      assemblyFile: path.resolve(libLocation),
      typeName: "MoleQ.Integration.PaxWrapperSdk.PayApi", // Fixed assembly name
      methodName: methodName,
    });
  } catch (error) {
    throw new Error(`Failed to create Edge function for ${methodName}: ${error.message}`);
  }
}

// function ProcessTransAsync(options, callback) {
//   function triggerResponse(error, result) {
//     if (error) throw error;
//     //此处返回支付结果， result是json字符串
//     console.log(result);
//     callback(null, result);
//   }

//   const mappingMethodName = "ProcessTrans";
//   const ProcessTransInternal = createEdgeFunc(mappingMethodName);
//   ProcessTransInternal(
//     {
//       changed: function (data, cb) {
//         //此处回调状态信息
//         console.log("Received Status", data);
//         cb();
//       },
//       request: JSON.stringify(options),
//     },
//     triggerResponse
//   );
// }

// function CancelTransAsync() {
//   function triggerResponse(error, result) {
//     if (error) throw error;
//     //此处操作结果信息，reslit是一个empty string
//     console.log(result);
//   }

//   const mappingMethodName = "CancelTrans";
//   const CancelTransInternal = createEdgeFunc(mappingMethodName);
//   CancelTransInternal({}, triggerResponse);
// }

/**
 * Enhanced caller with retry logic and better error handling
 */
function CreateCaller(mappingMethodName, jsonData, enableRetry = true) {
  return new Promise((resolve, reject) => {
    const dynamicMethod = createEdgeFunc(mappingMethodName);
    let body = null;

    if (jsonData != null) {
      // Validate and enhance request data using configuration
      if (mappingMethodName === "ProcessTrans") {
        body = JSON.stringify(paxConfig.buildTransactionRequest(jsonData));
      } else if (mappingMethodName === "SignOnPOS") {
        body = JSON.stringify(paxConfig.buildSignOnRequest());
      } else {
        body = JSON.stringify(jsonData);
      }
    }

    const executeCall = (attempt = 1) => {
      dynamicMethod(
        {
          changed: function (data, cb) {
            // Status callback for transaction progress
            console.log(`PAX Status Update (${mappingMethodName}):`, data);
            if (cb) cb();
          },
          request: body,
        },
        (error, result) => {
          if (error) {
            console.error(`PAX ${mappingMethodName} Error (Attempt ${attempt}):`, error);

            // Retry logic for network errors
            if (enableRetry && attempt < paxConfig.config.transaction.maxRetries) {
              console.log(`Retrying ${mappingMethodName} in ${paxConfig.config.transaction.retryDelay}ms...`);
              setTimeout(() => executeCall(attempt + 1), paxConfig.config.transaction.retryDelay);
              return;
            }

            reject({
              error: error.message || error,
              method: mappingMethodName,
              attempt: attempt,
              timestamp: new Date().toISOString()
            });
            return;
          }

          // Parse and validate result
          try {
            const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
            console.log(`PAX ${mappingMethodName} Success:`, parsedResult);
            resolve(parsedResult);
          } catch (parseError) {
            console.error(`Failed to parse PAX response:`, parseError);
            resolve(result); // Return raw result if parsing fails
          }
        }
      );
    };

    executeCall();
  });
}

/**
 * Enhanced PAX A920 API Methods with configuration integration
 */

// Digital signature operations
const DoSignAsync = (jsonData) => {
  return CreateCaller("DoSign", jsonData);
};

const GetSignAsync = (jsonData) => {
  return CreateCaller("GetSign", jsonData);
};

// POS sign-on operation
const DoSignOnPOSAsync = (jsonData = null) => {
  // Use configuration if no data provided
  const signOnData = jsonData || paxConfig.buildSignOnRequest();
  return CreateCaller("SignOnPOS", signOnData);
};

// Transaction cancellation
const CancelTransAsync = () => {
  return CreateCaller("CancelTrans", null, false); // No retry for cancellation
};

// Main transaction processing
const ProcessTransAsync = (transactionData) => {
  // Validate required fields
  if (!transactionData || !transactionData.amount) {
    return Promise.reject({
      error: "Transaction amount is required",
      code: "INVALID_AMOUNT"
    });
  }

  if (transactionData.amount <= 0) {
    return Promise.reject({
      error: "Transaction amount must be greater than 0",
      code: "INVALID_AMOUNT"
    });
  }

  return CreateCaller("ProcessTrans", transactionData);
};

// Terminal connectivity test
const TestTerminalConnectionAsync = async () => {
  try {
    return await paxConfig.testTerminalConnection();
  } catch (error) {
    return error;
  }
};

// Get configuration summary
const GetConfigurationAsync = () => {
  return Promise.resolve(paxConfig.getConfigSummary());
};

// const ProcessTransAsync = (dto) => {
//   return new Promise((resolve, reject) => {
//     ProcessTrans(dto, (error, result) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };

export {
  DoSignAsync,
  GetSignAsync,
  CancelTransAsync,
  ProcessTransAsync,
  DoSignOnPOSAsync,
  TestTerminalConnectionAsync,
  GetConfigurationAsync,
};
