import express from 'express'
import { databaseConnection } from './database'

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())

export const server = app.listen(PORT, () => {
    databaseConnection()
    console.log(`Running on http://localhost:${PORT}`)
})