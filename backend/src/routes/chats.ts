import { Router } from "express";
import { chatsController } from "../controllers/chats";
import { authMiddleware } from "../middlewares/auth";

const chatsRouter = Router();
const { createChat, getChat, createMessage } = chatsController;
const { verifyDoctor, verifyToken } = authMiddleware;

chatsRouter.get("/doctor/:id", verifyDoctor, getChat);

chatsRouter.get("/patient/:id", verifyToken, getChat);

chatsRouter.post("/", verifyDoctor, createChat);

chatsRouter.post("/doctor/messages", verifyDoctor, createMessage);

chatsRouter.post("/patient/messages", verifyToken, createMessage);

export default chatsRouter;
