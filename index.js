const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authenticate = require("./Middleware");
const Users = require("./UsersModel");

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect("mongodb+srv://ganesh:ganesh@cluster7337.7exrzd7.mongodb.net/")
  .then(() => console.log("db connected..."));

app.post("/signup", async (req, res) => {
  try {
    const { name, mail, password, confirmPassword } = req.body;

    if (name || mail || password || confirmPassword === "") {
      return res
        .status(400)
        .send(`please provide name, mail, password and confirm password`);
    }

    let existed = await Users.findOne({ mail });
    if (existed) {
      return res.status(400).send(`user already existed with ${mail} gmail`);
    }

    if (password !== confirmPassword) {
      return res.status(400).send("password did not match");
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    let newUser = new Users({
      name,
      mail,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).send("user registered successfully");
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { mail, password } = req.body;

    const existed = await Users.findOne({ mail });

    if (!existed) {
      return res.status(400).send("user not exist");
    } else {
      let passwordMatch = await bcrypt.compare(password, existed.password);
      if (!passwordMatch) {
        return res.status(400).send("incorrect password");
      } else {
        let payload = {
          id: existed.id,
        };
        let token = jwt.sign(payload, "ganesh");
        res.send({ token });
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

app.get("/user-details", authenticate, async (req, res) => {
  let { userId } = req;
  const user = await Users.findById(userId).select("-password");
  try {
    if (!user) {
      return res.status(400).send("user not exist");
    } else {
      res.send(user);
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
