import express from "express";
import { sendChat, getChatHistory, askSenpai, pinMessage, unpinMessage, getPinnedMessages, deleteMessage } from "../controllers/chat";
import multer from "multer";

export const chatRoute = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

chatRoute.post('/ask-senpai', askSenpai);
chatRoute.post('/:roomId', upload.single("image"), sendChat);
chatRoute.get('/chat-history/:roomId', getChatHistory);
chatRoute.put('/pin/:messageId', pinMessage);
chatRoute.put('/unpin/:messageId', unpinMessage);
chatRoute.get('/pinned/:roomId', getPinnedMessages);
chatRoute.delete('/:messageId', deleteMessage);

