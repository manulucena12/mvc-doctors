import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingAppointments = () => {
  let token: string;
  let token2: string;
  let id: number;
  let id2: number;
  let appointmentId: number;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    const { rows } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester2', 'admintester2@gmail.com', $1, true)  RETURNING id`,
      [password],
    );
    const { rows: rows2 } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester3', 'admintester3@gmail.com', $1, true) RETURNING id`,
      [password],
    );
    id = rows[0].id;
    id2 = rows2[0].id;
    await api
      .post("/auth/signin")
      .send({
        email: "admintester2@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        token = response.body.token;
      });
    await api
      .post("/auth/signin")
      .send({
        email: "admintester3@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        token2 = response.body.token;
      });
  });
  describe("Testing appointments endpoint", () => {
    it("Creating a schedule without being a doctor causes 403", async () => {
      await api
        .post("/appointments/schedule")
        .send({})
        .expect(403)
        .then((response) => {
          expect(response.body).toBe("Unauthorized");
        });
    });
    it("Creating a aschedule with same hour periods works properly", async () => {
      await api
        .post("/appointments/schedule")
        .set("token", token)
        .send({ day: "July 12", beggin: "2 PM", end: "8 PM" })
        .expect(201)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
    it("Creating a schedule with differents hours periods works properly", async () => {
      await api
        .post("/appointments/schedule")
        .set("token", token)
        .send({ day: "July 13", beggin: "12 AM", end: "8 PM" })
        .expect(201)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
    it("Two schedules cannot be created for same day, causes 400", async () => {
      await api
        .post("/appointments/schedule")
        .set("token", token)
        .send({ day: "July 13", beggin: "12 AM", end: "8 PM" })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe(
            "A schedule has already been created, if you want to add/delete/modify a single day, try another endpoint",
          );
        });
    });
    it("A doctor who did not create the appointment cannot access to it, causes 403", async () => {
      const { rows } = await client.query(
        "SELECT * FROM appointments WHERE date ILIKE $1",
        ["July 13%"],
      );
      appointmentId = rows[0].id;
      await api
        .get(`/appointments/${appointmentId}`)
        .set("token", token2)
        .expect(403);
    });
    it("Getting an appointment works properly", async () => {
      await api
        .get(`/appointments/${appointmentId}`)
        .set("token", token)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBeDefined();
          expect(response.body.doctor).toBeDefined();
          expect(response.body.date).toBeDefined();
        });
    });
    it("Getting appointments of a day using doctor token works properly", async () => {
      await api
        .get("/appointments/?day=July 12")
        .set("token", token)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
    it("Once an appointment has been created, a doctor can set any registered patient in it", async () => {
      await api
        .put(`/appointments/${appointmentId}`)
        .set("token", token)
        .send({ reason: "Heart attack", patient: id2 })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBeDefined();
          expect(response.body.doctor).toBeDefined();
          expect(response.body.reason).toBeDefined();
        });
    });
    it("If a doctor tries to set a meeting in an appointment that it not his causes 403", async () => {
      await api
        .put(`/appointments/${appointmentId}`)
        .set("token", token2)
        .send({ reason: "Heart attack", patient: id })
        .expect(403)
        .then((response) => {
          expect(response.body).toBe("You cannot modify this appointment");
        });
    });
    it("A doctor cannot set an appointments with himself", async () => {
      await api
        .put(`/appointments/${appointmentId}`)
        .set("token", token)
        .send({ reason: "Heart attack", patient: id })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe(
            "You cannot have an appointment with yourself",
          );
        });
    });
    it("Setting an appointment with a non-existing patient causes 400", async () => {
      await api
        .put(`/appointments/${appointmentId}`)
        .set("token", token)
        .send({ reason: "Heart attack", patient: 99999 })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe(
            "You cannot assign a patient that does not exist to an appointment",
          );
        });
    });
    it("Modifying an appointment that not exists causes 400", async () => {
      await api
        .put(`/appointments/99999`)
        .set("token", token)
        .send({ reason: "Heart attack", patient: id2 })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Appoinment not found");
        });
    });
  });
};
