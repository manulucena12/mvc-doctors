import { Response, Request } from "express-serve-static-core"

export interface User {
    name: string,
    password: string,
    email: string,
    doctor?: boolean,
    role: 'admin' | 'user' 
}

export interface AuthController {
    signup(req: Request, res: Response) : Promise<Response>
}

export interface AuthModel {
    creteUser(user: User) : Promise<User | string>
}