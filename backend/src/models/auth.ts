import { client } from "../database";
import { AuthModel } from "../types";

export const authModel: AuthModel = {
    async creteUser(user) {
        const { name, email, password } = user
        try {
            const { rows } = await client.query('INSERT INTO users (name, email, password)', [name, password, email])
            return rows[0]
        } catch (error) {
            return error
        }
    }
}