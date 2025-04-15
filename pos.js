/*
 * Author: Ming
 * Email: t8ming@live.com
 * Creation Date: 2025-04-15
 * Description: invoke c# dll wrapper 
 * Version: 1.0
 */ 
import path from "path";
import edge from "edge-js";
import { fileURLToPath } from "url";
// 获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url); // 当前文件的完整路径
const __dirname = path.dirname(__filename); // 当前文件所在的目录

//配置 Dll所在文件目录
// const libLocation =
//   "C://Users//t8min//Desktop//My//development//backend//express//myapp//lib//PaxWrapperSDK.dll";

// 获取当前项目目录下的路径
const libLocation = path.join(__dirname, "libs", "PaxWrapperSDK.dll");

function createEdgeFunc(methodName) {
  return edge.func({
    assemblyFile: path.resolve(libLocation),
    typeName: "MoleQ.Integration.PaxWrapperSdk.PayApi", //程序集名字，固定
    methodName: methodName,
  });
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

function CreateCaller(mappingMethodName, jsonData) {
  return new Promise((resolve, reject) => {
    const dynamicMethod = createEdgeFunc(mappingMethodName);
    let body = null;
    if (jsonData != null) {
      body = JSON.stringify(jsonData);
    }
    dynamicMethod(
      {
        changed: null,
        request: body,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
  });
}

const DoSignAsync = (jsonData) => {
  return CreateCaller("DoSign", jsonData);
};

const GetSignAsync = (jsonData) => CreateCaller("GetSign", jsonData);

const DoSignOnPOSAsync = (jsonData) => CreateCaller("SignOnPOS", jsonData);

const CancelTransAsync = () => CreateCaller("CancelTrans", null);

const ProcessTransAsync = (jsonData) => CreateCaller("ProcessTrans", jsonData);

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
};
