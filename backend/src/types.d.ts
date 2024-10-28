import { Response, Request, NextFunction } from "express-serve-static-core";

export interface User {
  id?: number;
  name: string;
  password: string;
  email: string;
  doctor?: boolean;
  role?: "admin" | "user";
}

export interface Token {
  id: number;
  token: string;
  name: string;
  doctor: boolean;
}

interface JwtPalyoad {
  id: number;
  role: string;
}

export interface AuthController {
  signup(
    req: Request<NonNullable<unknown>, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
  signin(
    req: Request<NonNullable<unknown>, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
}

export interface AuthModel {
  createUser(user: User): Promise<User | string>;
  createDoctor(user: User): Promise<User | string>;
  emailLogin(email: string, password: string): Promise<Token | string>;
  nameLogin(name: string, password: string): Promise<Token | string>;
}

export interface AuthMiddleware {
  verifyToken(req: Request, res: Response, next: NextFunction): Promise;
  verifyAdmin(req: Request, res: Response, next: NextFunction): Promise;
}
