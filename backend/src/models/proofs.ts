import { client } from "../database";
import { ProofModel } from "../types";

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
};
