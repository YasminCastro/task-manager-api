const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

//route to create a new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//fetching all tasks
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();

    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send();
  }
});

//fetching task by id
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    if (_id.length != 24) {
      res.status(404).send();
    }

    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

//updating task by id
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowUpdate = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowUpdate.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  //condição para dar erro se o id estiver errado (com tamanho errado), sem ela cai no erro 500 e deve ser erro 404
  if (_id.length != 24) {
    res.status(404).send();
  }

  try {
    const task = await Task.findOne({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

//deleting tasks by id
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  if (_id.length != 24) {
    res.status(404).send();
  }

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
