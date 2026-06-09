import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();

// functions
import { connectToMongo } from "./services/connection"
import { socketSetup } from "./services/socket";

// routes
import { chatRoute } from "./routes/chat"
import { authRoute } from "./routes/auth";
import { roomRoute } from "./routes/room";
import { featureRoute } from "./routes/feature";
import { blogRoute } from "./routes/blog";
import { projectRoute } from "./routes/project";
import { profileRoute } from "./routes/profile";

// middlewares
import { allowOnlyAuthenticatedUser } from "./middlewares/auth";

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://anime-club-nith.vercel.app",
  "https://anime-club-backend.onrender.com",
];

// Support both FRONTEND_URL and FRONTEND_PROD_URL env variable names
const frontendUrls = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PROD_URL,
].filter(Boolean) as string[];

for (const url of frontendUrls) {
  const formatted = url.replace(/\/$/, "");
  if (!allowedOrigins.includes(formatted)) allowedOrigins.push(formatted);
  if (!allowedOrigins.includes(url)) allowedOrigins.push(url);
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if( !origin ) return callback(null, true); // for mobile app as they have no origin

      if( allowedOrigins.includes(origin) ) { 
        callback(null, true);
      } else {
        console.log("Socket blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.set("io", io);
socketSetup(io);

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error(`MONGO_URI is not present in the environment variables`);
}

connectToMongo(mongoUri)
  .then(async () => {
    console.log(`Connected to MongoDB`);
    try {
      const Room = (await import("./models/room")).default;
      const defaultRooms = [
        {
          roomId: "general-anime",
          title: "General Anime",
          description: "General chat about all things anime, seasonal releases, and recommendations."
        },
        {
          roomId: "shounen-zone",
          title: "Shounen Zone",
          description: "Discussions about action, adventure, and shounen series like Jujutsu Kaisen, Demon Slayer, Naruto."
        },
        {
          roomId: "slice-of-life",
          title: "Slice of Life / Shojo",
          description: "Heartwarming slice of life, romance, shojo, and drama series."
        },
        {
          roomId: "manga-novels",
          title: "Manga & Light Novels",
          description: "Discussing raw chapters, spoilers, art styles, and light novels."
        },
        {
          roomId: "cosplay-art",
          title: "Cosplay & Fan Art",
          description: "Share your amazing cosplay photos, digital artwork, and creative builds."
        },
        {
          roomId: "movies-ghibli",
          title: "Movies & Ghibli",
          description: "Special film screenings, Studio Ghibli, watch parties, and movie reviews."
        },
        {
          roomId: "gaming-music",
          title: "Gaming & Music",
          description: "Anime games, J-RPG, visual novels, and Japanese music/OSTs."
        }
      ];

      for (const r of defaultRooms) {
        const exists = await Room.findOne({ roomId: r.roomId });
        if (!exists) {
          await Room.create(r);
          console.log(`Seeded default room: ${r.title}`);
        }
      }
    } catch (seedErr) {
      console.error("Error seeding default rooms:", seedErr);
    }
  })
  .catch((e: string) =>
    console.log(`Error while connecting to database: ${e}`)
  );

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // for mobile app as they have no origin

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("API blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", allowOnlyAuthenticatedUser, (req, res) => {
  return res
    .status(200)
    .json({ message: "Hey welcome to the Anime Club NITH server" });
});

// Diagnostic health endpoint (no auth required)
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  return res.status(200).json({
    status: "ok",
    nodeEnv: process.env.NODE_ENV,
    dbState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwt: !!process.env.JWT_ENCRYP_KEY,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    mongoUriStart: process.env.MONGO_URI?.substring(0, 30) + "...",
  });
});

app.use('/api/chat', allowOnlyAuthenticatedUser, chatRoute);
app.use('/api/auth', authRoute);
app.use('/api/room', allowOnlyAuthenticatedUser, roomRoute);
app.use('/api/features', featureRoute);
app.use('/api/blog', blogRoute);
app.use('/api/project', projectRoute);
app.use('/api/profile', profileRoute);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server started on - http://localhost:${PORT}`));
