import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { proofController } from "../controllers/proofs";

const proofsRouter = Router();
const { verifyToken } = authMiddleware;
const { requestProof } = proofController;

proofsRouter.post("/requests/:doctorId", verifyToken, requestProof);

export default proofsRouter;
