import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router/index";
import { createConnection } from "typeorm";

async function createServer() {
  try {
    const app = express();
    await createConnection();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(router);

    const port = process.env.APP_PORT;

    app.listen({ port }, () => {
      console.log(`server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

createServer();
