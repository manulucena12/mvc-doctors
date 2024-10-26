import { client } from "../database";
import { AuthModel } from "../types";

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
      return error;
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
      return error;
    }
  },
};
