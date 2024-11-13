import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { proofController } from "../controllers/proofs";

const proofsRouter = Router();
const { verifyToken, verifyDoctor } = authMiddleware;
const { requestProof, manageRequest } = proofController;

proofsRouter.post("/requests/:doctorId", verifyToken, requestProof);

proofsRouter.put("/requests/:proofId", verifyDoctor, manageRequest);

export default proofsRouter;
