import { Router } from "express";
import { appointmentController } from "../controllers/appointments";
import { authMiddleware } from "../middlewares/auth";

const appointmentsRouter = Router();
const { createAppointment } = appointmentController;
const { verifyDoctor } = authMiddleware;

appointmentsRouter.post("/", verifyDoctor, createAppointment);

export default appointmentsRouter;
