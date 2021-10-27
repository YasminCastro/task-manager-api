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

test("Should fetch tasks for UserOne ", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);
});

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
