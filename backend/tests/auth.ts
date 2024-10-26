import bcrypt from "bcryptjs";
import { api } from "./app.test";

export const testingAuth = () => {
  describe("Testing auth endpoint", () => {
    it("Creating a user works properly", async () => {
      const password = await bcrypt.hash("testing-user-password-1", 10);
      await api
        .post("/auth/signup")
        .send({
          name: "firstPatient",
          password,
          email: "firstpatient@gmail.com",
        })
        .expect(201)
        .then((response) => {
          expect(response.body.name).toBeDefined();
        });
    });
    it("Creating a doctor works properly", async () => {
      const password = await bcrypt.hash("testing-user-password-1", 10);
      await api
        .post("/auth/signup")
        .send({
          name: "firstDoctor",
          password,
          email: "firstdoctor@gmail.com",
          doctor: true,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.doctor).toBeDefined();
        });
    });
    it("Creating a user with an used email causes 400", async () => {
      const password = await bcrypt.hash("testing-user-password-1", 10);
      await api
        .post("/auth/signup")
        .send({
          name: "firstPatient",
          password,
          email: "firstpatient@gmail.com",
        })
        .expect(400)
        .then((response) => {
          expect(response.body).toBe("Email already taken");
        });
    });
  });
};
