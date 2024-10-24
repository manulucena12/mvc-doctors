import supertest from 'supertest'   
import { app, server } from '../src'
import { client } from '../src/database'
import { testingAuth } from './auth'

export const api = supertest(app)

describe('Testing api', () => {

    testingAuth()

    afterAll(async () => {

        server.close()
        await client.end()
        
    })

})