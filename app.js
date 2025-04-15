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
} from "./pos.js";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();
// const port = 3000;
const port = process.env.PORT;

// 使用内置的解析 JSON 的中间件
app.use(express.json());

// 使用内置的解析 URL 编码数据的中间件
app.use(express.urlencoded({ extended: true }));

app.post("/api/pos/trans/process", async (req, res) => {
  // ProcessTransAsync(param)
  //   .then((result) => {
  //     res.send(result); // 输出 "操作成功！"
  //   })
  //   .catch((error) => {
  //     res.status(500).send({ error: error }); // 输出 "操作失败！" 如果条件为 false
  //   })
  //   .finally(() => {
  //     console.log("操作结束。");
  //   });

  // try {
  //   const body = req.body
  //   const data = await fetchDataAsync(body); // 等待异步操作完成
  //   res.send(data); // 回调完成后返回结果
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send({ error: "Failed to fetch data" }); // 捕获错误并返回
  // }

  try {
    const body = req.body;
    const data = await ProcessTransAsync(body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to process trans." });
  }
});

app.post("/api/pos/trans/cancel", async (req, res) => {
  try {
    const body = req.body;
    const data = await CancelTransAsync(body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to cancel trans." });
  }
});

app.post("/api/pos/onsign", async (req, res) => {
  try {
    const body = req.body;
    const data = await DoSignOnPOSAsync(body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed sign on pos." });
  }
});

app.listen(port, () => {
  console.log(`Pax Wrapper service app listening on port ${port}`);
});
