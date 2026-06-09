import { Request, Response } from "express";
import Room from "../models/room";

export const handleCreateRoom = async (req: Request, res: Response) => {
  const { roomId, title, description } = req.body;
  if (!roomId || !title || !description) {
    return res.status(400).json({ message: "All the fields are required" });
  }
  try {
    const room = new Room({
      roomId,
      title,
      description,
    });
    await room.save();
    return res.status(200).json({ message: "Room created successfully" });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleRoomInfo = async (req: Request, res: Response) => {
  const Id = req.params.roomId;
  try {
    const room = await Room.find({ roomId: Id }).populate(
      "members",
      "name email"
    );
    return res.status(200).json({ room });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleJoining = async (req: Request, res: Response) => {
  const room_Id = req.params.roomId;
  const userId = req.user?._id;
  try {
    let room = await Room.findOne({ roomId: room_Id });
    if (!room) {
      const defaultRooms: Record<string, { title: string, description: string }> = {
        "general-anime": {
          title: "General Anime",
          description: "General chat about all things anime, seasonal releases, and recommendations."
        },
        "shounen-zone": {
          title: "Shounen Zone",
          description: "Discussions about action, adventure, and shounen series like Jujutsu Kaisen, Demon Slayer, Naruto."
        },
        "slice-of-life": {
          title: "Slice of Life / Shojo",
          description: "Heartwarming slice of life, romance, shojo, and drama series."
        },
        "manga-novels": {
          title: "Manga & Light Novels",
          description: "Discussing raw chapters, spoilers, art styles, and light novels."
        },
        "cosplay-art": {
          title: "Cosplay & Fan Art",
          description: "Share your amazing cosplay photos, digital artwork, and creative builds."
        },
        "movies-ghibli": {
          title: "Movies & Ghibli",
          description: "Special film screenings, Studio Ghibli, watch parties, and movie reviews."
        },
        "gaming-music": {
          title: "Gaming & Music",
          description: "Anime games, J-RPG, visual novels, and Japanese music/OSTs."
        }
      };

      if (defaultRooms[room_Id]) {
        room = new Room({
          roomId: room_Id,
          title: defaultRooms[room_Id].title,
          description: defaultRooms[room_Id].description
        });
        await room.save();
      } else {
        return res.status(400).json({ message: "Invalid room id" });
      }
    }
    await room.updateOne({ $addToSet: { members: userId } });
    return res.status(200).json({ message: `Joined room: ${room.roomId}` });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleJoinedRooms = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(400).json({ message: "Login first" });
  }
  try {
    const rooms = await Room.find({ members: userId }).select(
      "roomId title description"
    );
    return res.status(200).json({ rooms });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const handleGetAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find({}).select("roomId title description");
    return res.status(200).json({ rooms });
  } catch (error) {
    console.log(`${error}`);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

