import express from "express"
import 'dotenv/config'
import { connectDB } from "./config/db"
import projectRoutes from "./routes/projectRoutes"
import authRoutes from "./routes/authRoutes"
import cors from "cors"
import { corsOptions } from "./config/cors"
import morgan from "morgan"

connectDB()

const app = express()

app.use(cors(corsOptions))

// logging
app.use(morgan('dev'))

// middleware to parse json
app.use(express.json())

// routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app