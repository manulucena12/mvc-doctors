import { utils } from ".";
import { reportsModel } from "../models/reports";
import { ReportsUtils } from "../types";
import PDFDocument from "pdfkit";

const { bmiCalculator } = utils;
const { saveReport } = reportsModel;

export const reportsUtils: ReportsUtils = {
  async createNutrition(
    patientName,
    doctorName,
    weight,
    height,
    fat,
    recommendations,
    patientId,
    doctorId,
  ) {
    const buffers: Buffer[] = [];
    const doc = new PDFDocument();
    const bmi = bmiCalculator(height, weight);
    return new Promise((resolve, reject) => {
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const response = await saveReport(patientId, doctorId, pdfBuffer);
        if (typeof response !== "string") {
          return resolve(response);
        }
        return reject("Internal server error");
      });
      doc.on("error", () => reject("Internal server error"));
      doc
        .fontSize(25)
        .text(`Nutrion report by Dr. ${doctorName} for patient ${patientName}`);
      doc.fontSize(15).text(`${patientName}'s Cineantropometric Profile`);
      doc.fontSize(12).text(`
            -Weight: ${weight} Cm
            -Height: ${height} Kg
            -BMI: ${bmi}
            -Fat: ${fat}%
        `);
      doc.fontSize(12).text(`Recommendations: ${recommendations}`);
      doc.end();
    });
  },
};
