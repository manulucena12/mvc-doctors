import { appointmentModel } from "../models/appointments";
import { AppointmentController } from "../types";
import { utils } from "../utils";

const {
  createSameTime,
  createDifferentTime,
  getAppointment,
  getAppointments,
  setAppointment,
  deleteAppointment,
  newAppointment,
} = appointmentModel;
const { getHours, notifyUser } = utils;

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
  async getAppointments(req, res) {
    const { day } = req.query;
    if (!day) {
      return res.status(400).json("Missing data");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    const appointments = await getAppointments(day.toString(), req.doctorId);
    if (appointments === "Internal server error") {
      return res.status(500).json("Internal server error");
    } else if (typeof appointments === "string") {
      return res.status(400).json(appointments);
    }
    return res.status(200).json(appointments);
  },
  async getSingleAppointment(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    const appointment = await getAppointment(id, req.doctorId);
    if (appointment === "Internal server error") {
      return res.status(500).json("Internal server error");
    } else if (typeof appointment === "string") {
      const status =
        appointment === "You cannot access this assigment" ? 403 : 400;
      return res.status(status).json(appointment);
    }
    return res.status(200).json(appointment);
  },
  async putPatient(req, res) {
    const { id } = req.params;
    const { reason, patient } = req.body;
    if (
      !id ||
      !reason ||
      !patient ||
      typeof patient !== "number" ||
      typeof reason !== "string"
    ) {
      return res.status(400).json("Missing data or invalid types");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    if (req.doctorId === patient) {
      return res
        .status(400)
        .json("You cannot have an appointment with yourself");
    }
    const appointment = await setAppointment(id, req.doctorId, patient, reason);
    if (appointment === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof appointment === "string") {
      const status =
        appointment === "You cannot modify this appointment" ? 403 : 400;
      return res.status(status).json(appointment);
    }
    await notifyUser(id, req.doctorId, reason, false);
    return res.status(200).json(appointment);
  },
  async cancelAppointment(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json("Missing data");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    await notifyUser(id, req.doctorId, "none", true);
    const response = await deleteAppointment(id, req.doctorId);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response === "string") {
      const status =
        response === "You cannot delete this appointment" ? 403 : 400;
      return res.status(status).json(response);
    }
    return res.status(204).end();
  },
  async createAppointment(req, res) {
    const { reason, date, patient } = req.body;
    if (
      !reason ||
      !date ||
      !patient ||
      typeof patient !== "number" ||
      typeof reason !== "string" ||
      typeof date !== "string"
    ) {
      return res.status(400).json("Missing data or invalid types");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    if (req.doctorId === patient) {
      return res
        .status(400)
        .json("You cannot have an appointment with yourself");
    }
    const appointment = await newAppointment(
      reason,
      req.doctorId,
      patient,
      date,
    );
    if (appointment === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof appointment === "string") {
      return res.status(400).json(appointment);
    }
    await notifyUser(appointment.id.toString(), req.doctorId, reason, false);
    return res.status(201).json(appointment);
  },
};
