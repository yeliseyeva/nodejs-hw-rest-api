const Joi = require("joi");
const { Schema, model } = require("mongoose");

const emailRegexp =
  /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;

const contactSchema = Schema(
  {
    name: {
      type: String,
      minlength: 2,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      match: emailRegexp,
      require: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model("contact", contactSchema);

const joiShemaContact = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().pattern(emailRegexp).required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

module.exports = {
  Contact,
  joiShemaContact,
};
