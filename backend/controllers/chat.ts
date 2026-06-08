import { Request, Response } from "express";
import { uploadToCloudinary } from "../services/cloudinary";
import Chat from "../models/chat";
import Room from "../models/room";
import { isValidObjectId } from "mongoose";
import { Expo } from "expo-server-sdk";

export const sendChat = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const { roomId } = req.params;
        const sender = req.user?._id;
        const image = req.file;

        if (!text && !image) {
            return res.status(400).json({ message: "message can't be sent empty" });
        }

        let room;
        if (isValidObjectId(roomId)) {
            room = await Room.findById(roomId);
        } else {
            room = await Room.findOne({ roomId: roomId });
        }

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        let imageUrl: string | undefined;
        if (image) {
            imageUrl = await uploadToCloudinary(image);
        }

        // save to database
        const chatMessage = await Chat.create({
            sender,
            text,
            room: room._id,
            imageURL: imageUrl,
        })
        const populatedMessage = await chatMessage.populate("sender", "name email");
        const io = req.app.get("io");
        if (io) {
            io.to(roomId).emit("receive_message", populatedMessage);
        } else {
            console.warn("Socket.io instance not found in request app");
        }

        // Send Push Notifications (only to offline users)
        try {
            const roomDoc = await Room.findById(room._id).populate("members", "expoPushToken");
            const senderName = (req.user as any)?.name || "Someone";

            if (roomDoc && io) {
                // Get list of connected socket IDs in this room
                const socketsInRoom = await io.in(roomId).fetchSockets();
                const connectedUserIds = new Set<string>();

                // Extract user IDs from connected sockets
                socketsInRoom.forEach((socket: any) => {
                    if (socket.userId) {
                        connectedUserIds.add(socket.userId.toString());
                    }
                });

                const pushTokens: string[] = [];
                roomDoc.members.forEach((member: any) => {
                    const memberId = member._id.toString();
                    // Only send to users who are NOT the sender AND NOT currently connected
                    if (memberId !== sender && !connectedUserIds.has(memberId) && member.expoPushToken) {
                        pushTokens.push(member.expoPushToken);
                    }
                });

                if (pushTokens.length > 0) {
                    const expo = new Expo();
                    const messages = pushTokens
                        .filter(token => Expo.isExpoPushToken(token))
                        .map(token => ({
                            to: token,
                            sound: 'default',
                            title: `New message in #${roomDoc.title}`,
                            body: `${senderName}: ${text || 'Sent an image'}`,
                            data: { roomId: roomId, roomTitle: roomDoc.title },
                        }));

                    const chunks = expo.chunkPushNotifications(messages as any);
                    for (const chunk of chunks) {
                        try {
                            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        } catch (error) {
                        }
                    }
                }
            }
        } catch (notifError) {
            console.error("Error processing notifications:", notifError);
        }

        return res.status(200).json(populatedMessage);
    } catch (error) {
        console.error(`Error in sending the message:`, error);
        return res.status(500).json({ message: "Error sending message", error: String(error) });
    }
}


export const getChatHistory = async (req: Request, res: Response) => {
    const { roomId } = req.params;

    if (!isValidObjectId(roomId)) {
        return res.status(400).json({ message: "Invalid Room ID" });
    }

    const limit = 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    try {
        const messages = await Chat.find({ room: roomId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "name email");

        return res.status(200).json(messages.reverse());
    } catch (error) {
        console.log(`Error in getChatHistory: ${error}`);
        return res.status(500).json({ message: "Error fetching chat history" });
    }
}

export const askSenpai = async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: "message cannot be empty" });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not configured on the backend");
            return res.status(500).json({ message: "Gemini API key is not configured" });
        }

        const prompt = message;
        const systemInstruction = 
            "You are 'Senpai', a friendly, enthusiastic, and knowledgeable senior member of the Anime Club NITH (NIT Hamirpur Anime Club). " +
            "You love talking about anime, manga, and watch parties at the campus OAT (Open Air Theatre). " +
            "Keep your replies friendly, conversational, and use anime-style expressions/emojis (like 🌸, Sugoi!, Nani?, etc.). " +
            "Keep your responses concise (1-3 sentences) and engaging. Speak as a real student club senior.";

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    systemInstruction: {
                        parts: [
                            {
                                text: systemInstruction
                            }
                        ]
                    }
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            console.error("Gemini API error:", errData);
            return res.status(400).json({ message: "Error from AI assistant API" });
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
            "Sorry, I got a bit distracted thinking about my favorite anime. What did you say? 🌸";

        return res.status(200).json({ reply: replyText });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};