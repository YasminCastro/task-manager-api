const request = require("supertest");
const Task = require("../src/models/task");
const app = require("../src/app");
const {
  userOneId,
  userOne,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase);

//CREATE TASK TESTS

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From test",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  //checking if task exists
  expect(task).not.toBeNull();
  //checking if task is created with the completed default
  expect(task.completed).toEqual(false);
});

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "", completed: "sim" })
    .expect(400);
});

//UPDATE TASKS TESTS

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "", completed: "sim" })
    .expect(500);
});

test("Should not update other users task", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorizarion", `Bearer ${userTwo.tokens[0].token}`)
    .send({ description: "wash hair", completed: true })
    .expect(401);
});

//GET TASKST TESTS

test("Should fetch tasks for UserOne ", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);
});

//FETCHING FILTERED TASKS TESTS

test("Should fetch user task by id", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app).get(`/tasks/${taskOne._id}`).send().expect(401);
});

test("Should not fetch other users task by id", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test("Should fetch only completed tasks", async () => {
  await request(app)
    .get(`/tasks?completed=true`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should fetch only incomplete tasks", async () => {
  await request(app)
    .get(`/tasks?completed=false`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should sort tasks by description", async () => {
  await request(app)
    .get(`/tasks?sortBy=description:desc`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should sort tasks by completed", async () => {
  await request(app)
    .get(`/tasks?sortBy=completed:desc`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should sort tasks by createdAt", async () => {
  await request(app)
    .get(`/tasks?sortBy=createdAt:desc`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should sort tasks by updatedAt", async () => {
  await request(app)
    .get(`/tasks?sortBy=updatedAt:desc`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should fetch page of tasks", async () => {
  await request(app)
    .get(`/tasks?sortBy=createdAt:desc&limit=1&skip=1`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

//DELETE TASKS TESTS

test("Should not let user two delete users one task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  //assert the task still in the database
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should delete user task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not delete task if unauthenticated", async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).send().expect(401);
});
