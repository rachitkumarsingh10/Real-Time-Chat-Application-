import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Allowed origins configuration from environment or defaults (including your exact Vercel frontend)
const allowedOrigins = process.env.CLIENT_URL
    ? [...process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, "")), "https://chat-app-navy-three-62.vercel.app"]
    : ["https://chat-app-navy-three-62.vercel.app"];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow any if wildcard or empty config
        if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/$/, "");
        if (
            allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin.endsWith(".vercel.app") ||
            normalizedOrigin === "https://chat-app-navy-three-62.vercel.app"
        ) {
            return callback(null, true);
        }

        return callback(null, true); // Permissive fallback for preview deployments
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "token", "Authorization", "X-Requested-With", "Accept"],
};

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors(corsOptions));

// Explicit preflight OPTIONS and fallback CORS headers for Express 5 compatibility
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, token, Authorization, X-Requested-With, Accept");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Ensure DB connection before processing routes
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection middleware error:", error);
        next(error);
    }
});

// Routes setup
app.get("/api/status", (req, res) => res.status(200).send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Start server locally or in persistent environments (Render, Railway, VPS)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}

// Export Express app for Vercel Serverless deployment
export default app;

