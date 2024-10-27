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
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = doctor
        ? await createDoctor({ email, name, password: hashedPassword })
        : await createUser({ email, name, password: hashedPassword });
      if (typeof user !== "string" && user.email) {
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
