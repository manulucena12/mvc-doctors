import { Router } from "express";
import { appointmentController } from "../controllers/appointments";
import { authMiddleware } from "../middlewares/auth";

const appointmentsRouter = Router();
const {
  createSchedule,
  getSingleAppointment,
  getAppointments,
  putPatient,
  cancelAppointment,
} = appointmentController;
const { verifyDoctor } = authMiddleware;

appointmentsRouter.post("/schedule", verifyDoctor, createSchedule);

appointmentsRouter.get("/:id", verifyDoctor, getSingleAppointment);

appointmentsRouter.get("/", verifyDoctor, getAppointments);

appointmentsRouter.put("/:id", verifyDoctor, putPatient);

appointmentsRouter.delete("/:id", verifyDoctor, cancelAppointment);

export default appointmentsRouter;
