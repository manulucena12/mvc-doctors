import { Router } from "express";
import { appointmentController } from "../controllers/appointments";
import { authMiddleware } from "../middlewares/auth";

const appointmentsRouter = Router();
const { createSchedule } = appointmentController;
const { verifyDoctor } = authMiddleware;

appointmentsRouter.post("/schedule", verifyDoctor, createSchedule);

export default appointmentsRouter;
