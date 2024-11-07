import { client } from "../database";
import { AuthMiddleware, JwtPalyoad } from "../types";
import jwt from "jsonwebtoken";

export const authMiddleware: AuthMiddleware = {
  async verifyToken(req, res, next) {
    const token = req.headers["token"];
    if (!token || typeof token !== "string" || !token.startsWith("ey")) {
      return res.status(403).json("Unauthorized");
    }
    const { SECRET_WORD } = process.env;
    if (!SECRET_WORD) {
      return res.status(500).json("Internal server error");
    }
    const decodedToken = jwt.verify(token, SECRET_WORD) as JwtPalyoad;
    const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json("No user registered");
    }
    req.userId = decodedToken.id;
    return next();
  },
  async verifyAdmin(req, res, next) {
    const token = req.headers["token"];
    if (!token || typeof token !== "string" || !token.startsWith("ey")) {
      return res.status(403).json("Unauthorized");
    }
    const { SECRET_WORD } = process.env;
    if (!SECRET_WORD) {
      return res.status(500).json("Internal server error");
    }
    const decodedToken = jwt.verify(token, SECRET_WORD) as JwtPalyoad;
    const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json("No user registered");
    }
    if (decodedToken.role !== "admin") {
      return res.status(403).json("Only admin can access to this endpoint");
    }
    return next();
  },
  async verifyDoctor(req, res, next) {
    const token = req.headers["token"];
    if (!token || typeof token !== "string" || !token.startsWith("ey")) {
      return res.status(403).json("Unauthorized");
    }
    const { SECRET_WORD } = process.env;
    if (!SECRET_WORD) {
      return res.status(500).json("Internal server error");
    }
    const decodedToken = jwt.verify(token, SECRET_WORD) as JwtPalyoad;
    const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json("No user registered");
    }
    if (!decodedToken.doctor) {
      return res.status(403).json("Only doctors can access to this endpoint");
    }
    req.doctorId = decodedToken.id;
    return next();
  },
};
