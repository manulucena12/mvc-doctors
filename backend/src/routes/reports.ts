import { Router } from "express";
import { reportsController } from "../controllers/reports";
import { authMiddleware } from "../middlewares/auth";

const reportsRouter = Router();
const { nutritonReport, getReport } = reportsController;
const { verifyDoctor } = authMiddleware;

reportsRouter.get("/:id", getReport);

reportsRouter.post("/nutrition", verifyDoctor, nutritonReport);

export default reportsRouter;
