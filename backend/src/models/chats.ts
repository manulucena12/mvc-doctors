import { client } from "../database";
import { ChatsModel } from "../types";

export const chatsModel: ChatsModel = {
  async newChat(patientId, doctorId) {
    try {
      const { rows } = await client.query(
        "SELECT * FROM chats WHERE patient = $1 AND doctor = $2",
        [patientId, doctorId],
      );
      if (rows.length !== 0) {
        return "You already have a chat with this patient";
      }
      const { rows: chat } = await client.query(
        "INSERT INTO chats (patient, doctor) VALUES ($1, $2) RETURNING *",
        [patientId, doctorId],
      );
      return {
        id: chat[0].id,
        patient: chat[0].patient,
        doctor: chat[0].doctor,
        messages: [],
      };
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async getChat(chatId, userId) {
    try {
      const { rows: chat } = await client.query(
        "SELECT * FROM chats WHERE id = $1",
        [chatId],
      );
      if (chat.length === 0) {
        return "Chat not found";
      }
      if (chat[0].doctor !== userId && chat[0].patient !== userId) {
        return "You cannot access this chat";
      }
      const { rows: messages } = await client.query(
        "SELECT * FROM messages WHERE chat = $1",
        [chat[0].id],
      );
      return {
        id: chatId,
        doctor: chat[0].doctor,
        patient: chat[0].patient,
        messages,
      };
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
  async newMessage(senderId, chatId, content) {
    try {
      const { rows: chat } = await client.query(
        "SELECT doctor, patient FROM chats WHERE id = $1",
        [chatId],
      );
      if (chat.length === 0) {
        return "You cannot create a message in a chat that does not exist";
      }
      if (chat[0].doctor !== senderId && chat[0].patient !== senderId) {
        return "You cannot access this chat";
      }
      const { rows } = await client.query(
        "INSERT INTO messages (content, sender, chat) VALUES ($1, $2, $3) RETURNING *",
        [content, senderId, chatId],
      );
      return rows[0];
    } catch (error) {
      console.log(error);
      return "Internal server error";
    }
  },
};
