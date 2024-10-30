import supertest from "supertest";
import { app, server } from "../src";
import { client } from "../src/database";
import { testingAuth } from "./auth";
import { queries } from "../src/database/queries";
// import { testingAppointments } from "./appointments";

export const api = supertest(app);

describe("Testing api", () => {
  beforeAll(async () => {
    await queries();
  });

  testingAuth();

  afterAll(async () => {
    await client.query("DELETE FROM users");
    await client.end();
    console.log("Deleted data and ended connection");
    server.close();
  });
});
