import { appointmentModel } from "../models/appointments";
import { AppointmentController } from "../types";

const { createSameTime } = appointmentModel;

export const appointmentController: AppointmentController = {
  async createAppointment(req, res) {
    const { day, beggin, end } = req.body;
    if (
      !day ||
      !beggin ||
      !end ||
      typeof beggin !== "string" ||
      typeof end !== "string" ||
      typeof day !== "string"
    ) {
      return res.status(400).json("Missing data or invalid types");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    const firstHour =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? Number(beggin.substring(0, 2))
        : Number(beggin.substring(0, 1));
    const firstTime =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? beggin.substring(3)
        : beggin.substring(2);
    const secondHour =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? Number(end.substring(0, 2))
        : Number(end.substring(0, 1));
    const secondTime =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? end.substring(3)
        : end.substring(2);
    if (firstTime === secondTime) {
      if (firstHour > secondHour) {
        return res
          .status(400)
          .json(
            `With both hours in ${firstTime}, the first hour must be before the second hour`,
          );
      }
      const schedule = await createSameTime(
        firstHour,
        secondHour,
        firstTime,
        day,
        req.doctorId,
      );
      if (Array.isArray(schedule)) {
        return res.status(201).json(schedule);
      }
    }
    return res.status(201).json("");
  },
};
