import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { proofController } from "../controllers/proofs";

const proofsRouter = Router();
const { verifyToken, verifyDoctor } = authMiddleware;
const { requestProof, manageRequest, getProof, createProof, deleteProof } =
  proofController;

proofsRouter.post("/requests/:doctorId", verifyToken, requestProof);

proofsRouter.put("/requests/:proofId", verifyDoctor, manageRequest);

proofsRouter.get("/:proofId", verifyToken, getProof);

proofsRouter.post("/", verifyDoctor, createProof);

proofsRouter.delete("/:proofId", verifyDoctor, deleteProof);

export default proofsRouter;
