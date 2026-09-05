import mongoose from "mongoose";
import dns from "dns";

// Only configure custom DNS in non-production local environments if needed
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch (error) {
        console.log("DNS setServers warning:", error.message);
    }
}

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        mongoose.connection.on("connected", () => {
            console.log("Database Connected");
        });

        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
        console.log("MongoDB Connection Error:", error);
    }
};