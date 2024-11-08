import { utils } from ".";
import { reportsModel } from "../models/reports";
import { ReportsUtils } from "../types";
import PDFDocument from "pdfkit";
import { recommender } from "./nutrients";

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
    patology,
    bmr,
    ch,
    lipids,
    proteins,
    goal,
  ) {
    const buffers: Buffer[] = [];
    const doc = new PDFDocument();
    const bmi = bmiCalculator(height, weight);
    const recommededCarbohydrates = recommender(ch, "ch");
    const recommededLipids = recommender(lipids, "lipids");
    const recommededProteins = recommender(proteins, "proteins");
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
      doc.moveDown(2);
      doc.fontSize(17).text(`Patology: ${patology}`);
      doc.fontSize(17).text(`Goal: ${goal}`);
      doc.fontSize(17).text(`${patientName}'s Cineantropometric Profile`);
      doc.moveDown(2);
      doc.fontSize(15).text(`
            -Weight: ${weight} Cm
            -Height: ${height} Kg
            -BMI: ${bmi}
            -Fat: ${fat} %
            -BMR: ${bmr} Kcals
        `);
      doc.moveDown(2);
      doc.fontSize(15).text(`Recommendations: ${recommendations}`);
      doc.moveDown(2);
      doc.fontSize(15).text(`Carbohydrates kcals: ${ch}`);
      recommededCarbohydrates.map((ch) => {
        doc.fontSize(13).text(`-${ch.name}, calories: ${ch.calories}`);
      });
      doc.moveDown(2);
      doc.fontSize(15).text(`Lipids kcals: ${lipids}`);
      recommededLipids.map((l) => {
        doc.fontSize(13).text(`-${l.name}, calories: ${l.calories}`);
      });
      doc.moveDown(2);
      doc.fontSize(15).text(`Proteins kcals: ${proteins}`);
      recommededProteins.map((l) => {
        doc.fontSize(13).text(`-${l.name}, calories: ${l.calories}`);
      });
      doc.moveDown(2);
      doc.end();
    });
  },
};
