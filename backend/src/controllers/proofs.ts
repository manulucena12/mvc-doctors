import { sendEmail } from "../mailer";
import { proofModel } from "../models/proofs";
import { ProofController } from "../types";
import { utils } from "../utils";
import { reportsUtils } from "../utils/reports";

const { getUserById } = utils;
const { newRequest, manageRequest, getProof } = proofModel;
const { updateProof, createProof } = reportsUtils;

export const proofController: ProofController = {
  async requestProof(req, res) {
    const { doctorId } = req.params;
    if (!doctorId || isNaN(Number(doctorId))) {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.userId) {
      return res.status(403).json("Unauthorized");
    }
    const fullUser = await getUserById(req.userId);
    const fullDoctor = await getUserById(Number(doctorId));
    if (!fullUser || fullUser.doctor === true) {
      return res.status(403).json("Only patient can create requests");
    }
    if (!fullDoctor) {
      return res
        .status(400)
        .json("You cannot send a request to a doctor that not exists");
    }
    const response = await newRequest(req.userId, Number(doctorId));
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response === "string") {
      return res.status(400).json(response);
    }
    sendEmail(
      `New proof request from ${fullUser.name}`,
      fullDoctor.email,
      `Hi Dr. ${fullDoctor.name}, your patient ${fullUser.name} has recently created a new proof request, if you want to accept or deny it go to the app -> 'My requests'`,
    );
    return res.status(201).json(response);
  },
  async manageRequest(req, res) {
    const { proofId } = req.params;
    const { aproved, reason, date } = req.body;
    if (typeof aproved !== "boolean" || !proofId || isNaN(Number(proofId))) {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.doctorId) {
      return res.status(403).json("Unauthorized");
    }
    if (aproved === false) {
      const response = await manageRequest(
        Number(proofId),
        req.doctorId,
        false,
        "none",
      );
      if (!response) {
        return res.status(204).end();
      }
      if (response === "Internal server error") {
        return res.status(500).json("Internal server error");
      }
      if (typeof response === "string") {
        const status =
          response === "You cannot cancel a proof that is not requested to you"
            ? 403
            : 400;
        return res.status(status).json(response);
      }
      return res.status(500).json("Internal server error");
    }
    if (!reason || !date) {
      return res.status(400).json("Missing parameters reason and date");
    }
    const response = await updateProof(
      Number(proofId),
      req.doctorId,
      reason,
      date,
    );
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response === "string") {
      const status =
        response === "You cannot cancel a proof that is not requested to you"
          ? 403
          : 400;
      return res.status(status).json(response);
    }
    return res.status(200).json(response);
  },
  async getProof(req, res) {
    const { proofId } = req.params;
    if (!proofId || isNaN(Number(proofId))) {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.doctorId && !req.userId) {
      return res.status(403).json("Unauthorized");
    }
    const userId = req.doctorId ? req.doctorId : req.userId ? req.userId : 0;
    const response = await getProof(Number(proofId), userId);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response === "string") {
      const status = response === "You cannot access to this proof" ? 403 : 400;
      return res.status(status).json(response);
    }
    if (response.aproved === null) {
      return res
        .status(400)
        .json(
          "This proof is pending to be accepted, you still have no access to it",
        );
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="proof_${response.id}.pdf"`,
    );
    return res.status(200).send(response.file);
  },
  async createProof(req, res) {
    const { reason, date, patient } = req.body;
    if (!reason || !date || !patient || typeof patient !== "number") {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.doctorId) {
      return res.status(403).json("Unauthorized");
    }
    const proof = await createProof(patient, req.doctorId, reason, date);
    if (proof === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof proof === "string") {
      return res.status(400).json(proof);
    }
    return res.status(201).json(proof);
  },
};
