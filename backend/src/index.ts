import express from "express";
import "dotenv/config";
import { databaseConnection } from "./database";
import authRouter from "./routes/auth";
import { queries } from "./database/queries";
import appointmentsRouter from "./routes/appointments";

export const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use("/auth", authRouter);
app.use("/appointments", appointmentsRouter);

export const server = app.listen(PORT, async () => {
  await databaseConnection();
  await queries();
  console.log(`Running on http://localhost:${PORT}`);
});
