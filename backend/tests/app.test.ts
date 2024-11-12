import supertest from "supertest";
import { app, io, server } from "../src";
import { client } from "../src/database";
import { testingAuth } from "./auth";
import { queries } from "../src/database/queries";
import { testingAppointments } from "./appointments";
import { testingReports } from "./reports";
import { testingChats } from "./chats";
import { testingProofs } from "./proofs";

export const api = supertest(app);

describe("Testing api", () => {
  beforeAll(async () => {
    await queries();
  });

  testingAuth();
  testingAppointments();
  testingReports();
  testingChats();
  testingProofs();

  afterAll(async () => {
    await client.query("DELETE FROM appointments");
    await client.query("DELETE FROM proofs");
    await client.query("DELETE FROM messages");
    await client.query("DELETE FROM chats");
    await client.query("DELETE FROM reports");
    await client.query("DELETE FROM users");
    await client.end();
    console.log("Deleted data and ended connection");
    io.close();
    server.close();
  });
});
