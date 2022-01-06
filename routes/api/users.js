const express = require("express");

const { User } = require("../../model");
const { joiSchema } = require("../../model/user");
const { BadRequest, Conflict } = require("http-errors");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }
    const { password, email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw new Conflict("User already exist");
    }
    const newUser = await User.create(req.body);
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
