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
  async getDoctorReports(id) {
    try {
      const { rows } = await client.query(
        "SELECT id, patient, doctor, date FROM reports WHERE doctor = $1",
        [id],
      );
      if (rows.length === 0) {
        return "You have not created any report yet";
      }
      return rows;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async getPatientReports(id) {
    try {
      const { rows } = await client.query(
        "SELECT id, patient, doctor, date FROM reports WHERE patient = $1",
        [id],
      );
      if (rows.length === 0) {
        return "You have not created any report yet";
      }
      return rows;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async deleteReport(id, doctorId) {
    try {
      const { rows } = await client.query(
        "SELECT doctor FROM reports WHERE id = $1",
        [id],
      );
      if (rows.length === 0) {
        return "You cannot delete a report that does not exist";
      }
      if (rows[0].doctor !== doctorId) {
        return "You cannot delete a report that is not yours";
      }
      await client.query("DELETE FROM reports WHERE id = $1", [id]);
      return null;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
