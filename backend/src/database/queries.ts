import { client } from ".";

export const queries = async () => {
  try {
    await client.query(`
            DO $$ 
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission') THEN
                        CREATE TYPE permission AS ENUM ('admin', 'user');
                    END IF;
            END$$;
            `);
    await client.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            doctor BOOLEAN NOT NULL DEFAULT false,
            role permission NOT NULL DEFAULT 'user'
            );`);
    await client.query(`
            CREATE TABLE IF NOT EXISTS appointments(
            id SERIAL PRIMARY KEY,
            doctor INT NOT NULL REFERENCES users(id),
            reason TEXT,
            patient INT REFERENCES users(id),
            date TEXT NOT NULL
            );`);
    console.log("Quieries has been executed succesfully");
  } catch (error) {
    console.log("Queries were not exectuted: ", error);
  }
};
