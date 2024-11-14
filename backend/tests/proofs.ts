import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingProofs = () => {
  let patientId: number;
  let doctorId: number;
  let proofId: number;
  let doctorToken: string;
  let patientToken: string;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    const { rows: first } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester8', 'admintester8@gmail.com', $1, true) RETURNING id`,
      [password],
    );
    doctorId = first[0].id;
    const { rows: second } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester9', 'admintester9@gmail.com', $1, false) RETURNING id`,
      [password],
    );
    patientId = second[0].id;
    await api
      .post("/auth/signin")
      .send({
        email: "admintester8@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        doctorToken = response.body.token;
      });
    await api
      .post("/auth/signin")
      .send({
        email: "admintester9@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        patientToken = response.body.token;
      });
  });
  describe("Testing proofs endpoint", () => {
    it("Requesting a proof works properly", async () => {
      await api
        .post(`/proofs/requests/${doctorId}`)
        .set("token", patientToken)
        .expect(201)
        .then((response) => {
          proofId = response.body.id;
          expect(response.body.aproved).toBeNull();
        });
    });
    it("If a patient has a pending requests it returns 400", async () => {
      await api
        .post(`/proofs/requests/${doctorId}`)
        .set("token", patientToken)
        .expect(400)
        .then((response) => {
          expect(response.body).toBe(
            "You already have a pending request, please wait to send a new one",
          );
        });
    });
    it("If a doctor creates a request it returns 403", async () => {
      await api
        .post(`/proofs/requests/${doctorId}`)
        .set("token", doctorToken)
        .expect(403)
        .then((response) => {
          expect(response.body).toBe("Only patient can create requests");
        });
    });
    it("Acepting a proof by being a doctor works properly", async () => {
      await api
        .put(`/proofs/requests/${proofId}`)
        .set("token", doctorToken)
        .send({
          aproved: true,
          reason: "Stomach pain",
          date: "July 12, from 10am to 11am",
        })
        .expect(200);
    });
    it("Retrieving a proof works properly", async () => {
      await api
        .get(`/proofs/${proofId}`)
        .set("token", patientToken)
        .expect(200)
        .expect("Content-Type", /pdf/);
    });
    it("Retrieving a without being a doctor/patient of the proof causes 403", async () => {
      await api.get(`/proofs/${proofId}`).expect(403);
    });
    it("Cancelling a proof by being a doctor works properly", async () => {
      await api
        .put(`/proofs/requests/${proofId}`)
        .set("token", doctorToken)
        .send({ aproved: false })
        .expect(204);
    });
    it("Creating a proof works properly", async () => {
      await api
        .post("/proofs")
        .set("token", doctorToken)
        .send({
          patient: patientId,
          reason: "Stomach pain",
          date: "July 12, from 10am to 11am",
        })
        .expect(201)
        .then((response) => {
          expect(response.body.file).toBeDefined();
        });
    });
  });
};
