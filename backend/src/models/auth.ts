import { client } from "../database";
import { AuthModel } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authModel: AuthModel = {
  async createUser(user) {
    const { name, email, password } = user;
    try {
      const { rows: emails } = await client.query(
        "SELECT email FROM users WHERE email = $1",
        [email],
      );
      if (emails.length !== 0) {
        return "Email already taken";
      }
      const { rows } = await client.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password],
      );
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async createDoctor(user) {
    const { name, email, password } = user;
    try {
      const { rows: emails } = await client.query(
        "SELECT email FROM users WHERE email = $1",
        [email],
      );
      if (emails.length !== 0) {
        return "Email already taken";
      }
      const { rows } = await client.query(
        "INSERT INTO users (name, email, password, doctor) VALUES ($1, $2, $3, true) RETURNING *",
        [name, email, password],
      );
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async emailLogin(email, password) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      if (rows.length === 0) {
        return "This email does not exist";
      }
      const hashedPassword: string = rows[0].password;
      const isCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isCorrect) {
        return "Email or password incorrect";
      }
      const { SECRET_WORD } = process.env;
      if (!SECRET_WORD) {
        return "Internal server error";
      }
      const token = jwt.sign({ id: rows[0].id }, SECRET_WORD);
      return {
        token,
        id: rows[0].id,
        doctor: rows[0].doctor,
        name: rows[0].name,
      };
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async nameLogin(name, password) {
    console.log(name);
    try {
      const { rows } = await client.query(
        "SELECT * FROM users WHERE name = $1",
        [name],
      );
      if (rows.length === 0) {
        return "This name does not exist";
      }
      const hashedPassword: string = rows[0].password;
      const isCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isCorrect) {
        return "Email or password incorrect";
      }
      const { SECRET_WORD } = process.env;
      if (!SECRET_WORD) {
        return "Internal server error";
      }
      const token = jwt.sign({ id: rows[0].id }, SECRET_WORD);
      return {
        token,
        id: rows[0].id,
        doctor: rows[0].doctor,
        name: rows[0].name,
      };
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
