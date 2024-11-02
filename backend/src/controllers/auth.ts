import { sendEmail } from "../mailer";
import { authModel } from "../models/auth";
import { AuthController } from "../types";
import bcrypt from "bcryptjs";

const { createUser, createDoctor, emailLogin, nameLogin } = authModel;

export const authController: AuthController = {
  async signup(req, res) {
    const { email, name, password, doctor } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json("Missing Data");
    }
    if (doctor && typeof doctor !== "boolean") {
      return res.status(400).json("Doctor value must be a boolean");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = doctor
        ? await createDoctor({ email, name, password: hashedPassword })
        : await createUser({ email, name, password: hashedPassword });
      if (typeof user !== "string" && user.email) {
        const welcomeText = user.doctor
          ? `Welcome ${name} to our clinic, we are glad that you are going to work with us, we hope you get along with the other doctors and enjoy your labor.`
          : `Welcome ${name} to our clinic, we are glad that you purchased our services, we will not disappoint you, thanks`;
        await sendEmail("Welcome to BetterClinic", email, welcomeText);
        return res.status(201).json(user);
      }
      if (user === "Email already taken") {
        return res.status(400).json(user);
      }
      return res.status(500).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  },
  async signin(req, res) {
    const { name, email, password } = req.body;
    if ((!name && !email) || !password) {
      return res.status(400).json("Missing Data");
    }
    try {
      const token = email
        ? await emailLogin(email, password)
        : await nameLogin(name, password);
      if (typeof token !== "string" && token.token) {
        return res.status(200).json(token);
      }
      if (token !== "Internal server error") {
        return res.status(400).json(token);
      }
      return res.status(500).json("Internal server error");
    } catch (error) {
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  },
};
