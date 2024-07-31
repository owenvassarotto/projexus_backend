import mongoose from "mongoose"
import colors from "colors"
import { exit } from 'node:process'

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.bgYellow.bold(`MongoDB connected at: ${url}`))
    } catch (error) {
        console.log(colors.red.bold(`MongoDB connection error: ${error.message}`))
        exit(1)
    }
}