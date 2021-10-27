const { beforeEach, expect, test } = require("@jest/globals");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

afterAll(async () => {
  await mongoose.connection.close();
});

//SINGUP TESTS

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Test",
      email: "test@email.com",
      password: "Venus123!",
    })
    .expect(201);

  //Assert that the database wase changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Test",
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("Venus123!");
});

test("Should not signup user with invalid name/email/password", async () => {
  await request(app)
    .post("/users/login")
    .send({ name: 123, email: "notEmail", password: "1234" })
    .expect(400);
});

//LOGIN TESTS

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  //Validate new tokens is saved
  const user = await User.findById(userOneId);

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "wrongtest@email.com",
      password: "wrongpassword",
    })
    .expect(400);
});

//PROFILE TESTS

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

//DELETE TESTS

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  //validanting if users is removed
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for ununthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

//AVATARS TESTS

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

//UPDATE TESTS

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "test2" })
    .expect(200);

  //checking if data was changed
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("test2");
});

test("Shoud not update invalid user fileds", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ address: "brasil" })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app).patch("/users/me").send({ name: "test2" }).expect(401);
});

test("Should not update user with invalid name/email/password", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "", email: "", password: "" })
    .expect(400);
});
