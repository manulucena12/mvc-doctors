import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingAppointments = () => {
  let token: string;
  let token2: string;
  let appointmentId: number;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester2', 'admintester2@gmail.com', $1, true)`,
      [password],
    );
    await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester3', 'admintester3@gmail.com', $1, true)`,
      [password],
    );
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
    it("Creating an appointment without being a doctor causes 403", async () => {
      await api
        .post("/appointments")
        .send({})
        .expect(403)
        .then((response) => {
          expect(response.body).toBe("Unauthorized");
        });
    });
    it("Creating appointments works properly", async () => {
      await api
        .post("/appointments")
        .set("token", token)
        .send({})
        .expect(201)
        .then((response) => {
          appointmentId = response.body.id;
          expect(response.body.id).toBeDefined();
          expect(response.body.doctor).toBeDefined();
          expect(response.body.reason).toBeDefined();
        });
    });
    it("Once an appointment has been created, a doctor can set any registered patient in it", async () => {
      await api
        .put(`/appointments/${appointmentId}`)
        .set("token", token)
        .send({})
        .expect(201)
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
        .send({})
        .expect(201)
        .then((response) => {
          expect(response.body.id).toBeDefined();
          expect(response.body.doctor).toBeDefined();
          expect(response.body.reason).toBeDefined();
        });
    });
  });
};
