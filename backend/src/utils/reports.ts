import { utils } from ".";
import { reportsModel } from "../models/reports";
import { ReportsUtils } from "../types";
import PDFDocument from "pdfkit";
import { recommender } from "./nutrients";
import { proofModel } from "../models/proofs";
import { sendEmail } from "../mailer";

const { bmiCalculator, getUserById } = utils;
const { saveReport } = reportsModel;
const { manageRequest, getProof, newProof } = proofModel;

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
  async updateProof(proofId, doctorId, reason, date) {
    const doc = new PDFDocument();
    const doctor = await getUserById(doctorId);
    const proof = await getProof(proofId, doctorId);
    const patient =
      typeof proof === "string" ? null : await getUserById(proof.patient);
    return new Promise((resolve) => {
      if (!proof || !doctor || !patient) {
        return resolve("Data not found");
      }
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const file = Buffer.concat(buffers);
        const updatedProof = await manageRequest(proofId, doctorId, true, file);
        return resolve(updatedProof);
      });
      doc.on("error", () => {
        resolve("Internal server error");
      });
      doc
        .fontSize(20)
        .text(`Proof report for ${patient.name} by Dr. ${doctor.name}`);
      doc.moveDown(1);
      doc
        .fontSize(18)
        .text(
          `Me, Dr. ${doctor.name}, I created this proof authorization for ${patient.name} attendance on ${date} due to ${reason}`,
        );
      doc.end();
    });
  },
  async createProof(patientId, doctorId, reason, date) {
    const doc = new PDFDocument();
    const doctor = await getUserById(doctorId);
    const patient = await getUserById(patientId);
    return new Promise((resolve) => {
      if (!doctor || !patient) {
        return resolve("Data not found");
      }
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const file = Buffer.concat(buffers);
        const proof = await newProof(patientId, doctorId, file);
        if (typeof proof !== "string") {
          sendEmail(
            "New proof for you",
            patient.email,
            `Hello ${patient.name}, we communicate you that Dr. ${doctor.name} has recently created a new proof for you, if you want you to see/download it go to the app -> 'My proofs'`,
          );
        }
        return resolve(proof);
      });
      doc.on("error", () => {
        resolve("Internal server error");
      });
      doc
        .fontSize(20)
        .text(`Proof report for ${patient.name} by Dr. ${doctor.name}`);
      doc.moveDown(1);
      doc
        .fontSize(18)
        .text(
          `Me, Dr. ${doctor.name}, I created this proof authorization for ${patient.name} attendance on ${date} due to ${reason}`,
        );
      doc.end();
    });
  },
};
