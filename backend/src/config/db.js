import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();
export const mongoConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "cuilsoft",
    });
  console.log(chalk.bgGreen.bold("MongoDB connected successfully"));
  } catch (error) {
  // console.log(
      // error.message
      //   ? `MongoDB connection failed: ${error.message}`
      //   : `MongoDB connection failed`
  }
};