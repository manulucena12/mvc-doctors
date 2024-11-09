import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingReports = () => {
  let token: string;
  let patientId: number;
  let reportId: number;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester4', 'admintester4@gmail.com', $1, true)`,
      [password],
    );
    const { rows } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester5', 'admintester5@gmail.com', $1, true) RETURNING id`,
      [password],
    );
    patientId = rows[0].id;
    await api
      .post("/auth/signin")
      .send({
        email: "admintester4@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        token = response.body.token;
      });
  });
  describe("Testing reports endpoint", () => {
    it("Creating a report works properly", async () => {
      await api
        .post("/reports/nutrition")
        .set("token", token)
        .send({
          patient: patientId,
          weight: 85,
          height: 174,
          patology: "diabetes",
          bmr: 1500,
          ch: 500,
          lipids: 600,
          proteins: 600,
          goal: "Loose 5 kg in the upcoming 3 months",
          fat: 24,
          recommendations:
            "No high-glucemic foods, such as sugars, cookies, etc.",
        })
        .expect(201)
        .then((response) => {
          reportId = response.body.id;
          expect(response.body.id).toBeDefined();
        });
    });
    it("Getting a report works properly", async () => {
      await api
        .get(`/reports/${reportId}`)
        .set("token", token)
        .expect(200)
        .expect("Content-Type", /pdf/);
    });
    it("A patient or doctor can access to the reports he is in or he has created", async () => {
      await api
        .get(`/reports/user/doctor`)
        .set("token", token)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });
    it("Deleting a report works properly", async () => {
      await api.delete(`/reports/${reportId}`).set("token", token).expect(204);
    });
  });
};
