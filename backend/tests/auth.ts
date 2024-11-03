import bcrypt from "bcryptjs";
import { api } from "./app.test";
import { client } from "../src/database";

export const testingAuth = () => {
  let token: string;
  let patientId: number;
  beforeAll(async () => {
    const password = await bcrypt.hash("passwordadmintester", 10);
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ('AdminTester', 'admintester@gmail.com', $1, 'admin')`,
      [password],
    );
    await api
      .post("/auth/signin")
      .send({ email: "admintester@gmail.com", password: "passwordadmintester" })
      .then((response) => {
        token = response.body.token;
      });
  });
  describe("Testing auth endpoint", () => {
    it("Creating an user works properly", async () => {
      await api
        .post("/auth/signup")
        .set("token", token)
        .send({
          name: "firstPatient",
          password: "testing-user-password-1",
          email: "firstpatient@gmail.com",
        })
        .expect(201)
        .then((response) => {
          patientId = response.body.id;
          expect(response.body.name).toBeDefined();
        });
    });
    it("Creating a doctor works properly", async () => {
      await api
        .post("/auth/signup")
        .set("token", token)
        .send({
          name: "firstDoctor",
          password: "testing-user-password-1",
          email: "firstdoctor@gmail.com",
          doctor: true,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.doctor).toBeTruthy();
        });
    });
    it("Creating an user without admin authorization return 403", async () => {
      await api
        .post("/auth/signup")
        .send({
          name: "firstDoctor",
          password: "testing-user-password-1",
          email: "firstdoctor@gmail.com",
          doctor: true,
        })
        .expect(403)
        .then((response) => {
          expect(response.body).toBe("Unauthorized");
        });
    });
    it("Creating a user with an used email causes 400", async () => {
      await api
        .post("/auth/signup")
        .set("token", token)
        .send({
          name: "firstPatient",
          password: "testing-user-password-1",
          email: "firstpatient@gmail.com",
        })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Email already taken");
        });
    });
    it("Creating a user without enough data causes 400", async () => {
      const password = await bcrypt.hash("testing-user-password-1", 10);
      await api
        .post("/auth/signup")
        .set("token", token)
        .send({
          name: "firstPatient",
          password,
        })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Missing Data");
        });
    });
    it("Login with email works properly", async () => {
      await api
        .post("/auth/signin")
        .send({
          email: "firstpatient@gmail.com",
          password: "testing-user-password-1",
        })
        .expect(200)
        .then((response) => {
          expect(response.body.token).toBeDefined();
        });
    });
    it("Login with name works properly", async () => {
      await api
        .post("/auth/signin")
        .send({
          name: "firstPatient",
          password: "testing-user-password-1",
        })
        .expect(200)
        .then((response) => {
          expect(response.body.token).toBeDefined();
        });
    });
    it("Login with wrong data causes 400", async () => {
      await api
        .post("/auth/signin")
        .send({
          email: "firstpatient@gmail.com",
          password: "testing-user-password-10",
        })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Email or password incorrect");
        });
    });
    it("Login with missing data causes 400", async () => {
      await api
        .post("/auth/signin")
        .send({
          email: "firstpatient@gmail.com",
        })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Missing Data");
        });
    });
    it("Deleting an user works properly", async () => {
      await api
        .delete(`/auth/signout/${patientId}`)
        .set("token", token)
        .expect(204);
    });
    it("Deleting an user without being an admin causes 403", async () => {
      await api.delete(`/auth/signout/${patientId}`).expect(403);
    });
  });
};
