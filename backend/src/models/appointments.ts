import { client } from "../database";
import { AppointmentModel, Appointment } from "../types";

export const appointmentModel: AppointmentModel = {
  async createSameTime(x, y, time, day, id) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM appointments WHERE date LIKE $1 AND doctor = $2",
        [`${day}%`, id],
      );
      if (rows.length !== 0) {
        return "A schedule has already been created, if you want to add/delete/modify a single day, try another endpoint";
      }
      const schedule: Appointment[] = [];
      for (x; x < y; ) {
        const { rows } = await client.query(
          "INSERT INTO appointments (doctor, date) VALUES ($1, $2) RETURNING *",
          [id, `${day}, ${x}${time} - ${x + 1}${time}`],
        );
        schedule.push(rows[0]);
        x = x + 1;
      }
      return schedule;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async createDifferentTime(x, y, day, id) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM appointments WHERE date LIKE $1 AND doctor = $2",
        [`${day}%`, id],
      );
      if (rows.length !== 0) {
        return "A schedule has already been created, if you want to add/delete/modify a single day, try another endpoint";
      }
      const schedule: Appointment[] = [];
      let i: number;
      for (x; x <= 12; ) {
        if (x < 12) {
          const { rows } = await client.query(
            "INSERT INTO appointments (doctor, date) VALUES ($1, $2) RETURNING *",
            [id, `${day}, ${x}AM - ${x + 1}AM`],
          );
          schedule.push(rows[0]);
        } else if (x === 12) {
          const { rows } = await client.query(
            "INSERT INTO appointments (doctor, date) VALUES ($1, $2) RETURNING *",
            [id, `${day}, 12AM - 1PM`],
          );
          schedule.push(rows[0]);
        }
        x = x + 1;
      }
      for (i = 1; i < y; ) {
        const { rows } = await client.query(
          "INSERT INTO appointments (doctor, date) VALUES ($1, $2) RETURNING *",
          [id, `${day}, ${i}PM - ${i + 1}PM`],
        );
        schedule.push(rows[0]);
        i = i + 1;
      }
      return schedule;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async getAppointments(day, doctorId) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM appointments WHERE doctor = $1 AND date ILIKE $2",
        [doctorId, `${day}%`],
      );
      if (rows.length === 0) {
        return "Appointments not found";
      }
      return rows;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async getAppointment(appointmentId, doctorId) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM appointments WHERE id = $1",
        [appointmentId],
      );
      if (rows.length === 0) {
        return "Appointment not found";
      }
      if (rows[0].doctor !== doctorId) {
        return "You cannot access this assigment";
      }
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
