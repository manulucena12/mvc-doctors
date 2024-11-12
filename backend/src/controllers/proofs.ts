import { sendEmail } from "../mailer";
import { proofModel } from "../models/proofs";
import { ProofController } from "../types";
import { utils } from "../utils";

const { getUserById } = utils;
const { newRequest } = proofModel;

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
};
