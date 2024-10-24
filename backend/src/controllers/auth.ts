import { AuthController } from '../types';

export const authController: AuthController = {

    async signup(req, res) {
        return res.status(200).end()
    }

} 