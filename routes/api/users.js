const express = require("express");

const { User } = require("../../model");
const { joiSchema } = require("../../model/user");
const { BadRequest, Conflict } = require("http-errors");

const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

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

module.exports = router;
