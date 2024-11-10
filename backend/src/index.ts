import express from "express";
import "dotenv/config";
import { databaseConnection } from "./database";
import authRouter from "./routes/auth";
import { queries } from "./database/queries";
import appointmentsRouter from "./routes/appointments";
import reportsRouter from "./routes/reports";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import chatsRouter from "./routes/chats";

export const app = express();
export const server = createServer(app);
export const io = new Server(server);
const file = fs.readFileSync(
  path.join(__dirname, "/documentation/swagger.yaml"),
  "utf-8",
);
const documentation = yaml.parse(file);
const PORT = process.env.PORT || 3002;
export const baseUrl = process.env.API_URL
  ? `${process.env.API_URL}/${PORT}`
  : `http://localhost:${PORT}`;

app.use(express.json());
app.use(cors());
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(documentation));
app.use("/auth", authRouter);
app.use("/appointments", appointmentsRouter);
app.use("/reports", reportsRouter);
app.use("/chats", chatsRouter);

server.listen(PORT, async () => {
  await databaseConnection();
  await queries();
  console.log(`Running on ${baseUrl}`);
  console.log(`Documentation available on ${baseUrl}/documentation`);
});
