##### **MoleQ.Pay.Wrapper.dll 接口使用说明**

#### **环境要求**

javascript环境使用下，需要安装edge-js模块

npm install edge-js

界面PaxWrapperSDK的压缩文件指定的文件目录下 

需要在javascript中配置指向核心库PaxWrapperSDK.dll，如使用实例中配置。

或者根据自己要求指向正确的路径。

#### **命名空间:** `MoleQ.Integration.PaxWrapperSdk`

---

### **1. ProcessTrans方法**

#### **描述:**

`ProcessTrans` 方法处理支付交易接口 

#### **参数:**

```json
{
  "AuthUrl":"http://www.moleq.com",
  "TenderType": "CREDIT",
  "TransType": "SALE",
  "Amount": 100,
  "ECRRefNum": "09-0001",
  "ReportStatus": false,
  "ip": "192.168.1.23",
  "port": 10009,
  "timeout": 90
}
```

| Name         | Type   | Description                         |
| ------------ | ------ | ----------------------------------- |
| AuthUrl      | string | url字符串，由请联系提供方获取生产环境的url            |
| TenderType   | string | 全大写字符串 ( CREDIT or DEBIT )          |
| TransType    | string | 全大写字符串（ SALE  or  RETURN ）          |
| Amount       | int    | 不含小数点的数字，例如 100代表￥1.00,   23代表￥0.23 |
| ECRRefNum    | string | reference number 是用户自己创建的一个字符串标识    |
| ReportStatus | bool   | true- 状态回调， false-没有状态回调            |
| ip           | string | 设备的ip地址                             |
| port         | int    | 设备端口                                |
| timeout      | int    | 超时时间，单位是秒。 例如 90代表90秒               |

#### **返回值:**

返回一个Json字符串信息

```javascript
{ 
  "ResultTxt": "TIMEOUT",
  "ResultCode": "100001"
   ...
   ...
}
```

#### **使用示例:

```javascript
const path = require("path");
const edge = require("edge-js");

//配置 Dll所在文件目录
const libLocation = "F://MoleQ//PaxWrapperSDK.dll";
function createEdgeFunc(methodName) {
  return edge.func({
    assemblyFile: path.resolve(libLocation),
    typeName: "MoleQ.Integration.PaxWrapperSdk.PayApi", //程序集名字，固定
    methodName: methodName,
  });
}

async function ProcessTransAsync(options) {
  function triggerResponse(error, result) {
    if (error) throw error;
    //此处返回支付结果， result是json字符串
    console.log(result);
  }

  const mappingMethodName = "ProcessTrans";
  const ProcessTransInternal = createEdgeFunc(mappingMethodName);
  ProcessTransInternal(
    {
      changed: function (data, cb) {
        //此处回调状态信息
        console.log("Received Status", data);
        cb();
      },
      request: JSON.stringify(options),
    },
    triggerResponse
  );
}

// 定义变量
const param = {
  AuthUrl:"http://mdmsapidev.azurewebsites.net",
  ip: "192.168.1.23",
  port: 10009,
  timeout: 90,
  TenderType: "CREDIT",
  TransType: "SALE",
  Amount: 199,
  ECRRefNum: "1",
  ReportStatus: false,
};

// 调用process tran 函数
ProcessTransAsync(param);
```

---

### **2. cancelTrans 方法**

#### **描述:**

`CancelTrans` 方法用于取消当前交易的接口

#### **方法签名:**

```csharp
public async Task<object> CancelTrans(dynamic args)
```

#### **参数:**

- 无，但是因为能使javascript调用必须符合其格式要求，在javascript中调用，需要传参{}

#### **返回值:**

- 无返回值。因为是异步调用，当中方法触发后返回信息会在之前ProcessTrans当中结果返回。

#### **使用示例:**

```javascript
const path = require("path");
const edge = require("edge-js");

//配置 Dll所在文件目录
const libLocation = "F://MoleQ//PaxWrapperSDK.dll" 
function createEdgeFunc(methodName) {
  return edge.func({
    assemblyFile: path.resolve(libLocation),
    typeName: "MoleQ.Integration.PaxWrapperSdk.PayApi", //程序集名字，固定
    methodName: methodName,
  });
}

async function CancelTransAsync() {
  function triggerResponse(error, result) {
    if (error) throw error; 
    //此处操作结果信息，reslit是一个empty string
    console.log(result);
  }

  const mappingMethodName = "CancelTrans"
  const CancelTransInternal= createEdgeFunc(mappingMethodName);
  CancelTransInternal({}, triggerResponse); 
}

// 调用cancel tran 函数
CancelTransAsync(param);
```

---

### 3.  DoSign 方法

#### **描述:**

`DoSign` 方法用于发起签名

#### 参数：

```json
{
  "AuthUrl":"http://www.moleq.com",
  "ip": "192.168.1.23",
  "port": 10009,
  "timeout": 90
}
```

#### 返回值:

```json
{
  "ResultTxt": "OK",
  "ResultCode": "000000"
}
```

#### 使用示例:

```js
const path = require("path");
const edge = require("edge-js");

//配置 Dll所在文件目录
const libLocation = "F://MoleQ//PaxWrapperSDK.dll";
function createEdgeFunc(methodName) {
  return edge.func({
    assemblyFile: path.resolve(libLocation),
    typeName: "MoleQ.Integration.PaxWrapperSdk.PayApi", //程序集名字，固定
    methodName: methodName,
  });
}

async function DoSignAsync(options) {
  return new Promise((resolve, reject) => {
    const mappingMethodName = "DoSign";
    const DoSignInternal = createEdgeFunc(mappingMethodName);
    DoSignInternal(
      {
        changed: null,
        request: JSON.stringify(options),
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

// 定义变量
const param = {
  AuthUrl:"http://mdmsapidev.azurewebsites.net",
  ip: "192.168.1.23",
  port: 10009,
  timeout: 90 
};

//执行测试结果
(async () => {
  // 调用process tran 函数
  const result = await DoSignAsync(param);

  console.log("Result:", result);
})();
```

---



### 4. GetSign 方法

#### **描述:**

`GetSign` 方法用于获取签名，当DoSign成功后，在调用此方法获取最后的签名

#### 参数：

```json
{
  "AuthUrl":"http://www.moleq.com",
  "ip": "192.168.1.23",
  "port": 10009,
  "timeout": 90
}
```

#### 返回值:

```json
{
  "ResultTxt": "OK",
  "ResultCode": "000000",
  "SignSrc": "data:image/jpg;base64,/9j/**base64 string **4AAQS2Q=="
}
```



---



### **错误处理:**

需要根据实际使用场景处理返回

### **返回内容代码对照表**

| ResultCode | ResultTxt | Description              |
| ---------- | --------- | ------------------------ |
| 000000     | succeed   | 成功                       |
| 100001     | TIMEOUT   | 超时                       |
| 1xxxxx     | any       | 对应其他详细错误，参考ResultTxt中的内容 |
| 200001     | any       | Action超时                 |
| 200002     | any       | payment错误                |
| 200003     | any       | 交易中止                     |
| 200004     | any       | 处理时出错                    |
| 200005     | any       | reponse is null          |
| 200006     | any       | no response              |
| 200008     | any       | Serial number 找不到        |
| 200007     | any       | 签名转换图片失败                 |
| 200009     | any       | 授权成功                     |
| 200010     | any       | 未授权，请联系提供方               |
| 200011     | any       | 自定义错误，保留                 |
| 200012     | any       | 非法设备，设备未授权使用             |
| 200013     | any       | 无效的商家Id，发生于提供方的API       |
| 200014     | any       | 无效的商家Id，发生于在设备上          |
| 200015     | any       | 签名图片转base64字符串失败         |

###### 
