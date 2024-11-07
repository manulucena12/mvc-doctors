import { client } from "../database";
import { ReportsModel } from "../types";

export const reportsModel: ReportsModel = {
  async saveReport(patientId, doctorId, doc) {
    try {
      const { rows } = await client.query(
        "INSERT INTO reports (patient, doctor, pdf) VALUES ($1, $2, $3) RETURNING id, doctor, patient",
        [patientId, doctorId, doc],
      );
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async findReport(id) {
    try {
      const { rows } = await client.query(
        "SELECT pdf, id, patient, doctor FROM reports WHERE id = $1",
        [id],
      );
      if (rows.length === 0) {
        return "Report not found";
      }
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
