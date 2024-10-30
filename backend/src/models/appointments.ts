import { client } from "../database";
import { AppointmentModel, Appointment } from "../types";

export const appointmentModel: AppointmentModel = {
  async createSameTime(x, y, time, day, id) {
    try {
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
};
