import { appointmentModel } from "../models/appointments";
import { AppointmentController } from "../types";
import { utils } from "../utils";

const { createSameTime, createDifferentTime } = appointmentModel;
const { getHours } = utils;

export const appointmentController: AppointmentController = {
  async createSchedule(req, res) {
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
    const [firstHour, firstTime, secondHour, secondTime] = getHours(
      beggin,
      end,
    );
    if (firstTime === secondTime) {
      if (firstHour > secondHour) {
        return res
          .status(400)
          .json(
            `With both hours in ${firstTime}, the first hour must be before the second hour`,
          );
      }
      const firstSchedule = await createSameTime(
        firstHour,
        secondHour,
        firstTime,
        day,
        req.doctorId,
      );
      if (Array.isArray(firstSchedule)) {
        return res.status(201).json(firstSchedule);
      }
      if (firstSchedule !== "Internal server error") {
        return res.status(400).json(firstSchedule);
      }
      return res.status(500).json("Internal server error");
    }
    if (firstTime !== "AM" || secondTime !== "PM") {
      return res
        .status(400)
        .json(
          "Given different times, first hour must be at morning and second at afternoon",
        );
    }
    const secondSchedule = await createDifferentTime(
      firstHour,
      secondHour,
      day,
      req.doctorId,
    );
    if (Array.isArray(secondSchedule)) {
      return res.status(201).json(secondSchedule);
    }
    if (secondSchedule !== "Internal server error") {
      return res.status(400).json(secondSchedule);
    }
    return res.status(500).json("Internal server error");
  },
};
