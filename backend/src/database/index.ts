import { Client } from 'pg'

const { DB_PROD, DB_TEST, DB_DEV, MODE } = process.env

if((!DB_DEV && !DB_PROD && !DB_TEST) || !MODE){
    throw new Error('Missing env variables')
}

const connectionString = MODE === 'dev' ? DB_DEV : MODE === 'test' ? DB_TEST : DB_PROD

export const client = new Client({
    connectionString
})

export const databaseConnection = async () => {
    try {
        await client.connect()
        console.log(`Database running on mode ${MODE}`)
    } catch (error) {
        console.log('Database connection error', error)
    }
}