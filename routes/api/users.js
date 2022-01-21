const express = require("express");

const fs = require("fs/promises");

const { User } = require("../../model");
const { joiRegisterSchema, joiLoginSchema } = require("../../model/user");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");

const jwt = require("jsonwebtoken");

const gravatar = require("gravatar");

const path = require("path");

const { authenticate, upload } = require("../../middlewares");

const jimp = require("../../helpers/jimp");

const bcrypt = require("bcryptjs");
const router = express.Router();

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password, subscription } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw new Conflict("Email in use");
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      email,
      subscription,
      password: hashPassword,
      avatarURL,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Unauthorized("Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized("Email or password is wrong");
    }

    const { subscription, _id } = user;

    const payload = {
      id: _id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.get("/current", authenticate, async (req, res, next) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    const { path: tempUpload, filename } = req.file;
    await jimp(tempUpload);
    const [extension] = filename.split(".").reverse();
    const newFileName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFileName);

    await fs.rename(tempUpload, fileUpload);

    const avatarURL = path.join("avatars", newFileName);

    await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });

    res.json({ avatarURL });
  }
);

module.exports = router;
