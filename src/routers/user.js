const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const router = new express.Router();

//route to create a new user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();

    //sending welcome email
    sendWelcomeEmail(user.email, user.name);

    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//user login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//user logout by token
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Logout of all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//allowing user to get their profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//fetch users by id
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  if (_id.length != 24) {
    res.status(404).send();
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

//route to update user infos by id
router.patch("/users/me", auth, async (req, res) => {
  //Se o usuario tentar alterar alguma informação que não existe ele irá receber um erro
  const updates = Object.keys(req.body);
  const allowUpdate = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowUpdate.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates." });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//deleting users
router.delete("/users/me", auth, async (req, res) => {
  const user = new User(req.user);

  try {
    await req.user.deleteOne({ _id: req.user._id });
    sendCancelationEmail(user.email, user.name);

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//path to the image
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/gm)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

//avatar upload
//multer is processing the data -> passing through the function -> storing the file data to the avatar field
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    //function set up to caught errors
    res.status(400).send({ error: error.message });
  }
);

//deleting a avatar
router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//fetching a avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
