import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()

const url = process.env.MONGOOSE_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("connected to DB...");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default connectDB;