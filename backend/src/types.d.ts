import { Response, Request } from "express-serve-static-core";

export interface User {
  name: string;
  password: string;
  email: string;
  doctor?: boolean;
  role?: "admin" | "user";
}

export interface AuthController {
  signup(
    req: Request<NonNullable<unknown>, NonNullable<unknown>, User>,
    res: Response,
  ): Promise<Response>;
}

export interface AuthModel {
  createUser(user: User): Promise<User | string>;
  createDoctor(user: User): Promise<User | string>;
}
