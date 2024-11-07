import { client } from "../database";
import { sendEmail } from "../mailer";
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
      const token = jwt.sign(
        { id: rows[0].id, role: rows[0].role, doctor: rows[0].doctor },
        SECRET_WORD,
      );
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
      const token = jwt.sign(
        { id: rows[0].id, role: rows[0].role, doctor: rows[0].doctor },
        SECRET_WORD,
      );
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
  async deleteUser(id) {
    try {
      const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (rows.length === 0) {
        return "You cannot delete a non-existing user";
      }
      if (rows[0].doctor) {
        await client.query("DELETE FROM appointments WHERE doctor = $1", [id]);
      }
      await client.query(
        "UPDATE appointments SET patient = null, reason = null WHERE patient = $1",
        [id],
      );
      const email = rows[0].email;
      const message = rows[0].doctor
        ? `Dr. ${rows[0].name} ,we are sad that you stopped working for us, we hope your time here was great and we desire you the best of luck, thank you`
        : `${rows[0].name}, we are sad that you leave our services, we hope you enjoyed them the time you had them available, if you regret your choice, we will be waiting you to come back, thank you.`;
      sendEmail("Your BetterClinic account has been closed", email, message);
      await client.query("DELETE FROM users WHERE id = $1", [id]);
      return null;
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async checkNames(name) {
    const { rows } = await client.query(
      "SELECT name FROM users WHERE name = $1",
      [name],
    );
    if (rows.length > 1) {
      return true;
    }
    return false;
  },
};
