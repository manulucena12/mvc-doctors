import { ReportsController } from "../types";
import { utils } from "../utils";
import { reportsUtils } from "../utils/reports";
import { reportsModel } from "../models/reports";
import { sendEmail } from "../mailer";

const { getUserById } = utils;
const { createNutrition } = reportsUtils;
const { findReport } = reportsModel;

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
      return res.send(report.pdf);
    }
    if (report === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    return res.status(400).json(report);
  },
  async nutritonReport(req, res) {
    const { patient, weight, height, patology, fat, recommendations } =
      req.body;
    if (
      !patient ||
      !weight ||
      !height ||
      !patology ||
      !fat ||
      !recommendations ||
      typeof weight !== "number" ||
      typeof height !== "number" ||
      typeof fat !== "number"
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
};
