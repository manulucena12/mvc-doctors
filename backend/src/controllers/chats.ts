import { io } from "..";
import { sendEmail } from "../mailer";
import { chatsModel } from "../models/chats";
import { ChatsController } from "../types";
import { utils } from "../utils";

const { newChat, getChat, newMessage } = chatsModel;
const { getUserById } = utils;

export const chatsController: ChatsController = {
  async createChat(req, res) {
    const { patient } = req.body;
    if (!patient || typeof patient !== "number") {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!req.doctorId) {
      return res.status(403).json("Unauthorized");
    }
    const fullPatient = await getUserById(patient);
    const doctor = await getUserById(req.doctorId);
    if (!doctor || !fullPatient) {
      return res.status(400).json("Patient or doctor not found");
    }
    const response = await newChat(patient, req.doctorId);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response == "string") {
      return res.status(400).json(response);
    }
    sendEmail(
      `New chat with Dr. ${doctor.name}`,
      fullPatient.email,
      `Hi ${fullPatient.name}, we communicate you that Dr. ${doctor.name} has recently created a chat to keep in contact with you, to see it, go to -> 'My Chats' -> 'Chat with Dr. ${doctor.name}'`,
    );
    return res.status(201).json(response);
  },
  async getChat(req, res) {
    const { id } = req.params;
    const { doctorId, userId } = req;
    if (!doctorId && !userId) {
      return res.status(403).json("Unauthorized");
    }
    if (!id || isNaN(Number(id))) {
      return res.status(400).json("Missing data or invalid type");
    }
    const requesterId = doctorId ? doctorId : userId ? userId : 0;
    const response = await getChat(Number(id), requesterId);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response == "string") {
      const status = response === "You cannot access this chat" ? 403 : 400;
      return res.status(status).json(response);
    }
    io.emit("Chat", response);
    return res.status(200).json(response);
  },
  async createMessage(req, res) {
    const { doctorId, userId } = req;
    const { chat, content } = req.body;
    if (
      !chat ||
      !content ||
      typeof chat !== "number" ||
      typeof content !== "string"
    ) {
      return res.status(400).json("Missing data or invalid type");
    }
    if (!doctorId && !userId) {
      return res.status(403).json("Unauthorized");
    }
    const senderId = doctorId ? doctorId : userId ? userId : 0;
    const response = await newMessage(senderId, chat, content);
    if (response === "Internal server error") {
      return res.status(500).json("Internal server error");
    }
    if (typeof response == "string") {
      const status = response === "You cannot access this chat" ? 403 : 400;
      return res.status(status).json(response);
    }
    io.emit("New-Message", response);
    return res.status(201).json(response);
  },
};
