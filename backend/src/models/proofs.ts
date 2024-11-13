import { client } from "../database";
import { sendEmail } from "../mailer";
import { ProofModel } from "../types";
import { utils } from "../utils";

const { getUserById } = utils;

export const proofModel: ProofModel = {
  async newRequest(userId, doctorId) {
    try {
      const { rows: first } = await client.query(
        "SELECT * FROM proofs WHERE aproved IS NULL AND patient = $1",
        [userId],
      );
      if (first.length !== 0) {
        return "You already have a pending request, please wait to send a new one";
      }
      const { rows: second } = await client.query(
        "INSERT INTO proofs (doctor, patient) VALUES ($1, $2) RETURNING *",
        [doctorId, userId],
      );
      return second[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async manageRequest(requestId, doctorId, aproved, file) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM proofs WHERE id = $1",
        [requestId],
      );
      if (rows.length === 0) {
        return "You cannot cancel a proof that does not exist";
      }
      if (rows[0].doctor !== doctorId) {
        return "You cannot cancel a proof that is not requested to you";
      }
      const patient = await getUserById(rows[0].patient);
      const doctor = await getUserById(doctorId);
      if (aproved === false) {
        if (patient && doctor) {
          sendEmail(
            `Proof request denied`,
            patient.email,
            `Hi ${patient.name}, we communicate you that the request you sent to Dr. ${doctor.name} has ben canceled, if you want to contact him, you can do it via app -> 'Messages'`,
          );
        }
        await client.query("DELETE FROM proofs WHERE id = $1", [requestId]);
        return null;
      }
      const { rows: updatedProof } = await client.query(
        "UPDATE proofs SET aproved = true, file = $1 WHERE id = $2 RETURNING *",
        [file, requestId],
      );
      if (patient && doctor) {
        sendEmail(
          `Proof request accepted`,
          patient.email,
          `Hi ${patient.name}, we communicate you that the request you sent to Dr. ${doctor.name} has ben accepted, if you want to see/download it, you can do it via app -> 'My proofs'`,
        );
      }
      return updatedProof[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async getProof(proofId) {
    try {
      const { rows: first } = await client.query(
        "SELECT * FROM proofs WHERE id = $1",
        [proofId],
      );
      if (first.length === 0) {
        return "Proof not found";
      }
      return first[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
