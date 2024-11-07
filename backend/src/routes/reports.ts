import { Router } from "express";
import { reportsController } from "../controllers/reports";
import { authMiddleware } from "../middlewares/auth";

const reportsRouter = Router();
const { nutritonReport, getReport } = reportsController;
const { verifyDoctor, verifyToken } = authMiddleware;

reportsRouter.get("/:id", verifyToken, getReport);

reportsRouter.post("/nutrition", verifyDoctor, nutritonReport);

export default reportsRouter;
