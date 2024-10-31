import { Response, Request, NextFunction } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      doctorId?: number;
    }
  }
}

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

export interface Appointment {
  id: number;
  doctor: number;
  patient: number;
  date: string;
  reason: string;
}

export interface JwtPalyoad {
  id: number;
  role: string;
  doctor: boolean;
}

export interface Utils {
  getHours(beggin: string, end: string): [number, string, number, string];
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
  verifyDoctor(req: Request, res: Response, next: NextFunction): Promise;
}

export interface AppointmentController {
  createSchedule(req: Request, res: Response): Promise<Response>;
}

export interface AppointmentModel {
  createSameTime(
    x: number,
    y: number,
    time: string,
    day: string,
    id: number,
  ): Promise<Appointment[] | string>;
  createDifferentTime(
    x: number,
    y: number,
    day: string,
    id: number,
  ): Promise<Appointment[] | string>;
}
