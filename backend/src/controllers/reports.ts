import { ReportsController } from "../types";
import { utils } from "../utils";
import { reportsUtils } from "../utils/reports";
import { reportsModel } from "../models/reports";
import { sendEmail } from "../mailer";

const { getUserById } = utils;
const { createNutrition } = reportsUtils;
const { findReport, getDoctorReports, getPatientReports, deleteReport } =
  reportsModel;

export const reportsController: ReportsController = {
  async getReport(req, res) {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json("Missing data or invalid input");
    }
    if (!req.userId && !req.doctorId) {
      return res.status(403).json("Unathorized");
    }
    const requestId = req.userId ? req.userId : req.doctorId;
    const report = await findReport(Number(id));
    if (typeof report !== "string") {
      if (report.doctor !== requestId && report.patient !== requestId) {
        return res
          .status(403)
          .json(
            "Only the doctor who created the report and the patient who is in this report can access to it",
          );
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="report_${report.id}.pdf"`,
      );
      return res.status(200).send(report.pdf);
    }
    if (report === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    return res.status(400).json(report);
  },
  async nutritonReport(req, res) {
    const {
      patient,
      weight,
      height,
      patology,
      fat,
      recommendations,
      bmr,
      ch,
      lipids,
      proteins,
      goal,
    } = req.body;
    if (
      !ch ||
      !lipids ||
      !proteins ||
      !bmr ||
      !patient ||
      !weight ||
      !height ||
      !patology ||
      !fat ||
      !goal ||
      !recommendations ||
      typeof weight !== "number" ||
      typeof height !== "number" ||
      typeof fat !== "number" ||
      typeof bmr !== "number" ||
      typeof ch !== "number" ||
      typeof lipids !== "number" ||
      typeof proteins !== "number"
    ) {
      return res.status(400).json("Missing data or invalid types");
    }
    if (!req.doctorId) {
      return res.status(500).json("Internal server error");
    }
    const doctor = await getUserById(req.doctorId);
    const fullPatient = await getUserById(patient);
    if (!doctor || !fullPatient) {
      return res.status(400).json("Patient or doctor not found");
    }
    try {
      const response = await createNutrition(
        fullPatient.name,
        doctor.name,
        weight,
        height,
        fat,
        recommendations,
        patient,
        req.doctorId,
        patology,
        bmr,
        ch,
        lipids,
        proteins,
        goal,
      );
      sendEmail(
        "New report for you",
        fullPatient.email,
        `Hi ${fullPatient.name}, Dr. ${doctor.name} has created a report for you, if you want to read it, you can access to it in the app -> 'My reports'`,
      );
      return res.status(201).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  },
  async getUserReports(req, res) {
    if (!req.doctorId && !req.userId) {
      return res.status(403).json("Unathorized");
    }
    const userReports = req.doctorId
      ? await getDoctorReports(req.doctorId)
      : req.userId
        ? await getPatientReports(req.userId)
        : "Internal server error";
    if (userReports === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof userReports === "string") {
      return res.status(400).json(userReports);
    }
    return res.status(200).json(userReports);
  },
  async deleteReport(req, res) {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json("Missing data or invalid input");
    }
    if (!req.doctorId) {
      return res.status(403).json("Unauthorized");
    }
    const response = await deleteReport(Number(id), req.doctorId);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response === "string") {
      const status =
        response === "You cannot delete a report that is not yours" ? 403 : 400;
      return res.status(status).json(response);
    }
    return res.status(204).end();
  },
};
