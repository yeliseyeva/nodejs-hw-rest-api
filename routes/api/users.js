const express = require("express");

const { User } = require("../../model");
const { joiRegisterSchema, joiLoginSchema } = require("../../model/user");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");

const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw new Conflict("Email in use");
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ email, password: hashPassword });
    res.status(201).json({
      user: {
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // const { error } = joiLoginSchema.validate(req.body);
    // console.log(error);
    // if (error) {
    //   throw new BadRequest(error.message);
    // }
    const { email, password } = req.body;
    // console.log(email);
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      throw new Unauthorized("Email not found");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized("Password is wrong");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
