import { Router } from "express";
import { reportsController } from "../controllers/reports";
import { authMiddleware } from "../middlewares/auth";

const reportsRouter = Router();
const { nutritonReport, getReport, getUserReports } = reportsController;
const { verifyDoctor, verifyToken } = authMiddleware;

reportsRouter.get("/:id", verifyToken, getReport);

reportsRouter.post("/nutrition", verifyDoctor, nutritonReport);

reportsRouter.get("/user/doctor", verifyDoctor, getUserReports);

reportsRouter.get("/user/patient", verifyToken, getUserReports);

export default reportsRouter;
