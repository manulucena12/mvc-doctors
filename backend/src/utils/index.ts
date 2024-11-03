import { sendEmail } from "../mailer";
import { appointmentModel } from "../models/appointments";
import { Utils } from "../types";

const { getCompletedAppointment } = appointmentModel;

export const utils: Utils = {
  getHours(beggin, end) {
    const firstHour =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? Number(beggin.substring(0, 2))
        : Number(beggin.substring(0, 1));
    const firstTime =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? beggin.substring(3)
        : beggin.substring(2);
    const secondHour =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? Number(end.substring(0, 2))
        : Number(end.substring(0, 1));
    const secondTime =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? end.substring(3)
        : end.substring(2);
    return [firstHour, firstTime, secondHour, secondTime];
  },
  async notifyUser(appointmentId, doctorId, reason, cancel) {
    const completeAppointment = await getCompletedAppointment(
      appointmentId,
      doctorId,
    );
    if (typeof completeAppointment !== "string") {
      const subject = cancel
        ? "Appointment canceled"
        : "New appointment assigned";
      const email = completeAppointment.email;
      const message = cancel
        ? `Hello ${completeAppointment.patient}, your appointment with Dr. ${completeAppointment.doctor} on ${completeAppointment.date} has been canceled, if you do not knew about this, you can contact the doctor via the clinic app`
        : `Hello ${completeAppointment.patient}, you have an appointment with Dr. ${completeAppointment.doctor} on ${completeAppointment.date} for ${reason}, if you do not remember according an appointment with that doctor, please, send him a message via the clinic app`;
      sendEmail(subject, email, message);
    }
  },
};
