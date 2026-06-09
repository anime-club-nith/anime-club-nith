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

        // Parse @mentions from text
        let mentionedIds: any[] = [];
        let mentionsEveryone = false;

        if (text) {
            if (/@everyone/.test(text)) {
                mentionsEveryone = true;
            } else {
                // Look up members by display name or name
                const mentionMatches = text.match(/@([\w\s]+?)(?=\s|$|[^\w\s])/g) || [];
                if (mentionMatches.length > 0) {
                    const mentionNames = mentionMatches.map((m: string) => m.slice(1).trim());
                    const roomMembers = await (Room as any).findOne({ roomId: room.roomId }).populate('members', 'name displayName email');
                    if (roomMembers?.members) {
                        mentionedIds = roomMembers.members
                            .filter((m: any) => mentionNames.some((n: string) =>
                                m.name?.toLowerCase() === n.toLowerCase() ||
                                m.displayName?.toLowerCase() === n.toLowerCase()
                            ))
                            .map((m: any) => m._id);
                    }
                }
            }
        }

        // save to database
        const chatMessage = await Chat.create({
            sender,
            text,
            room: room._id,
            imageURL: imageUrl,
            mentions: mentionedIds,
            mentionsEveryone,
        })
        const populatedMessage = await chatMessage.populate([
            { path: 'sender', select: 'name email displayName avatarUrl status' },
            { path: 'mentions', select: 'name displayName email' },
        ]);
        const io = req.app.get("io");
        if (io) {
            io.to(roomId).emit("receive_message", populatedMessage);

            // Emit personal mention notifications
            if (mentionsEveryone) {
                io.to(roomId).emit("mention_notification", { roomId, message: populatedMessage });
            } else if (mentionedIds.length > 0) {
                mentionedIds.forEach((uid: any) => {
                    io.to(`user:${uid.toString()}`).emit("mention_notification", { roomId, message: populatedMessage });
                });
            }
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
        const messages = await Chat.find({ room: roomId, isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
                { path: 'sender', select: 'name email displayName avatarUrl status' },
                { path: 'mentions', select: 'name displayName email' },
                { path: 'pinnedBy', select: 'name displayName' },
            ]);

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
            "You are 'Senpai', the official professional AI assistant of Anime Club NITH — the anime appreciation society at NIT Hamirpur, Himachal Pradesh, India. " +
            "You represent the club as an intelligent, helpful, and highly professional student coordinator. " +
            "Your language must be clean, polite, articulate, and completely free of any anime clichés, Japanese honorifics, or slang. " +
            "Never use words or phrases like 'sugoi', 'kawaii', 'nani', 'konnichiwa', 'senpai' (except as your name), 'desu', 'kun', 'chan', 'san', 'ara ara', or similar tropes. " +
            "Do not use excessive emojis or childish expressions. Communicate in fluent, natural English. " +
            "Keep responses informative yet concise (2-4 sentences), assisting users with anime recommendations, club details, and screening schedules at the Open Air Theatre (OAT). " +
            "If asked about ongoing or upcoming events, invite the user to check the announcements channel in the community chat rooms.";

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
            "I'm having a bit of trouble connecting right now. Please try again in a moment, or explore our community chat rooms for discussions!";

        return res.status(200).json({ reply: replyText });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * PUT /api/chat/pin/:messageId
 * Pin a message. Any authenticated room member can pin.
 */
export const pinMessage = async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
        const message = await Chat.findByIdAndUpdate(
            messageId,
            { isPinned: true, pinnedBy: userId, pinnedAt: new Date() },
            { new: true }
        ).populate([
            { path: 'sender', select: 'name email displayName avatarUrl' },
            { path: 'pinnedBy', select: 'name displayName' },
        ]);

        if (!message) return res.status(404).json({ message: "Message not found" });

        // Emit to the room so all clients update in real-time
        const io = req.app.get("io");
        if (io) {
            const roomId = (message.room as any).toString();
            io.to(roomId).emit("message_pinned", message);
        }

        return res.status(200).json({ message: "Message pinned", chat: message });
    } catch (error) {
        console.error("pinMessage error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * PUT /api/chat/unpin/:messageId
 * Unpin a message.
 */
export const unpinMessage = async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
        const message = await Chat.findByIdAndUpdate(
            messageId,
            { isPinned: false, pinnedBy: null, pinnedAt: null },
            { new: true }
        );

        if (!message) return res.status(404).json({ message: "Message not found" });

        const io = req.app.get("io");
        if (io) {
            const roomId = (message.room as any).toString();
            io.to(roomId).emit("message_unpinned", { messageId });
        }

        return res.status(200).json({ message: "Message unpinned" });
    } catch (error) {
        console.error("unpinMessage error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * GET /api/chat/pinned/:roomId
 * Returns all pinned messages for a room, sorted by pin date.
 */
export const getPinnedMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;

    try {
        let room;
        if (isValidObjectId(roomId)) {
            room = await Room.findById(roomId);
        } else {
            room = await Room.findOne({ roomId });
        }

        if (!room) return res.status(404).json({ message: "Room not found" });

        const pinned = await Chat.find({ room: room._id, isPinned: true, isDeleted: { $ne: true } })
            .sort({ pinnedAt: -1 })
            .populate([
                { path: 'sender', select: 'name email displayName avatarUrl' },
                { path: 'pinnedBy', select: 'name displayName' },
            ]);

        return res.status(200).json({ messages: pinned });
    } catch (error) {
        console.error("getPinnedMessages error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};

/**
 * DELETE /api/chat/:messageId
 * Soft-deletes a message. Only the original sender can delete their own message.
 */
export const deleteMessage = async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
        const message = await Chat.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        await Chat.findByIdAndUpdate(messageId, { isDeleted: true });

        // Emit to the room so all clients remove the message in real-time
        const io = req.app.get("io");
        if (io) {
            const roomId = (message.room as any).toString();
            io.to(roomId).emit("message_deleted", { messageId });
        }

        return res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        console.error("deleteMessage error:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};
