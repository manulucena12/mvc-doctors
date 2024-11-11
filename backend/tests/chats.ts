import { client } from "../src/database";
import { api } from "./app.test";
import bcrypt from "bcryptjs";

export const testingChats = () => {
  let chatId: number;
  let patientId: number;
  let doctorToken: string;
  let patientToken: string;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester6', 'admintester6@gmail.com', $1, true) RETURNING id`,
      [password],
    );
    const { rows: second } = await client.query(
      `INSERT INTO users (name, email, password, doctor) VALUES ('AdminTester7', 'admintester7@gmail.com', $1, false) RETURNING id`,
      [password],
    );
    patientId = second[0].id;
    await api
      .post("/auth/signin")
      .send({
        email: "admintester6@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        doctorToken = response.body.token;
      });
    await api
      .post("/auth/signin")
      .send({
        email: "admintester7@gmail.com",
        password: "passwordadmintester",
      })
      .then((response) => {
        patientToken = response.body.token;
      });
  });
  describe("Testing chats endpoint", () => {
    it("Only doctors can create chats", async () => {
      await api
        .post("/chats")
        .set("token", doctorToken)
        .send({ patient: patientId })
        .expect(201)
        .then((response) => {
          chatId = response.body.id;
          expect(Array.isArray(response.body.messages)).toBeTruthy();
          expect(response.body.patient).toBeDefined();
        });
    });
    it("A doctor can access the chat he just created", async () => {
      await api
        .get(`/chats/doctor/${chatId}`)
        .set("token", doctorToken)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBeDefined();
        });
    });
    it("A patient can access the chat a doctor created for him", async () => {
      await api
        .get(`/chats/patient/${chatId}`)
        .set("token", patientToken)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBeDefined();
        });
    });
    it("A person who is not the patient or doctor of the chat cannot access to it", async () => {
      await api.get(`/chats/patient/${chatId}`).expect(403);
    });
    it("A doctor can create a message in the chat", async () => {
      await api
        .post("/chats/doctor/messages")
        .set("token", doctorToken)
        .send({
          chat: chatId,
          content:
            "Hi Bruce, I created this chat to talk about our recent appointments",
        })
        .expect(201)
        .then((response) => {
          expect(response.body.id).toBeDefined();
        });
    });
    it("A patient can create a message in the chat", async () => {
      await api
        .post("/chats/patient/messages")
        .set("token", patientToken)
        .send({
          chat: chatId,
          content:
            "Hi Alfred, thanks for keep an eye on me, I want to make my health better",
        })
        .expect(201)
        .then((response) => {
          expect(response.body.id).toBeDefined();
        });
    });
    it("A person who is not the patient or doctor of the chat cannot access send a message in it", async () => {
      await api
        .post("/chats/patient/messages")
        .send({
          chat: chatId,
          content: "I am a troll and I dont need a token to send messages",
        })
        .expect(403);
    });
  });
};
