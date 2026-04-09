import mongoose from "mongoose";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log("database is connected");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    process.exit(1);
  }
}