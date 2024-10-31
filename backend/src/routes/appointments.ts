import { Router } from "express";
import { appointmentController } from "../controllers/appointments";
import { authMiddleware } from "../middlewares/auth";

const appointmentsRouter = Router();
const { createSchedule, getSingleAppointment, getAppointments } =
  appointmentController;
const { verifyDoctor } = authMiddleware;

appointmentsRouter.post("/schedule", verifyDoctor, createSchedule);

appointmentsRouter.get("/:id", verifyDoctor, getSingleAppointment);

appointmentsRouter.get("/", verifyDoctor, getAppointments);

export default appointmentsRouter;
