const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

const app = require("../../app");

const { DB_TEST_HOST } = process.env;

describe("test user-login", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  beforeEach((done) => {
    mongoose.connect(DB_TEST_HOST).then(() => done());
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done());
    });
  });

  test("test login route", async () => {
    const loginData = {
      email: "lana@gmail.com",
      password: "123456789",
    };

    await request(app).post("/api/users/signup").send(loginData);

    const response = await request(app)
      .post("/api/users/login")
      .send(loginData);

    // check response
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBeTruthy();
    expect(response.body.user.subscription).toBeTruthy();

    // check to string
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });
});
