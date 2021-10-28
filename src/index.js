const app = require("./app");
const cookieParser = require("cookie-parser");
const express = require("express");

const port = process.env.PORT;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.listen(port);
