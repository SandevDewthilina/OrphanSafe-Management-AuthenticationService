import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../server.js";
import { json } from "express";

describe("POST/auth", () => {
  it("correct email and password", async () => {
    const response = await supertest(app).post("/api/users/auth").send({
      email: "thamindu@orphansafe.com",
      password: "admin123",
    }); 
    expect(response.statusCode).toBe(200);
  });

  it("wrong email and password", async () => {
    const response = await supertest(app).post("/api/users/auth").send({
      email: "thamindu@orphansafe.com",
      password: "admi123",
    });
    console.log(response.statusCode);
    expect(response.statusCode).toBe(401);
  });
});
