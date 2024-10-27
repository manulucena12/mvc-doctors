import { Router } from "express";
import { authController } from "../controllers/auth";

const authRouter = Router();
const { signup, signin } = authController;

authRouter.post("/signup", signup);

authRouter.post("/signin", signin);

export default authRouter;
