import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingReports = () => {
  let token: string;
  let patientId: number;
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
          fat: 24,
          recommendations:
            "No high-glucemic foods, such as sugars, cookies, etc.",
        })
        .expect(201)
        .then((response) => {
          expect(response.body.id).toBeDefined();
        });
    });
  });
};
