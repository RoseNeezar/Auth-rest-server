import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { allRouter } from "./router/index";
import { createConnection } from "typeorm";
import { errorHandler } from "./middlewares/errorHandler";

const port = process.env.APP_PORT;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(allRouter);

app.use(errorHandler);

async function createServer() {
  try {
    await createConnection();
    app.listen({ port }, () => {
      console.log(`server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

createServer();
