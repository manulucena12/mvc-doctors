import bcrypt from 'bcryptjs'
import { api } from './app.test'

export const testingAuth = () => {
    describe('Testing auth endpoint', () => {
        it('Creating a user works properly', async () => {
            const password = await bcrypt.hash('testing-user-password-1', 10)
            await api
            .post('/auth/signup')
            .send({name: 'firstPatient', password, email: 'firstpatient@gmail.com'})
            .expect(201)
        })  
    })
}