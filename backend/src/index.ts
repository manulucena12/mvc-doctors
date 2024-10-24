import express from 'express'
import 'dotenv/config'
import { databaseConnection } from './database'
import authRouter from './routes/auth'

export const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use('/auth', authRouter)

export const server = app.listen(PORT, () => {
    databaseConnection()
    console.log(`Running on http://localhost:${PORT}`)
})