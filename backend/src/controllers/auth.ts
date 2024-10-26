import { authModel } from "../models/auth";
import { AuthController } from "../types";

const { createUser, createDoctor } = authModel;

export const authController: AuthController = {
  async signup(req, res) {
    const { email, name, password, doctor } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json("Missing Data");
    }
    try {
      const user = doctor
        ? await createDoctor({ email, name, password })
        : await createUser({ email, name, password });
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
};
