const express = require("express");
const createError = require("http-errors");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");

const { Contact } = require("../../model");
const { findByIdAndRemove } = require("../../model/contact");

const joiShema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt"
    );
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw new createError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiShema.validate(req.body);
    if (error) {
      throw new createError(400, "missing required name field");
    }
    const { _id } = req.user;
    // const newContact = await contactsOperations.addContact(req.body);
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await findByIdAndRemove(contactId);
    if (!deleteContact) {
      throw new createError(404, "Not found");
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    // const { error } = joiShema.validate(req.body);
    // if (error) {
    //   throw new createError(400, "missing fields");
    // }

    const { contactId } = req.params;
    const updateContact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!updateContact) {
      throw new createError(404, "Not found");
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    // const { error } = joiShema.validate(req.body);
    // if (error) {
    //   throw new createError(400, "missing fields");
    // }

    const { contactId } = req.params;
    const { favorite } = req.body;
    const updateContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );
    if (!updateContact) {
      throw new createError(404, "Not found");
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
