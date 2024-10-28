import { Router } from "express";
import { authController } from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth";

const authRouter = Router();
const { signup, signin } = authController;
const { verifyAdmin } = authMiddleware;

authRouter.post("/signup", verifyAdmin, signup);

authRouter.post("/signin", signin);

export default authRouter;
