const express = require("express");
const createError = require("http-errors");
const router = express.Router();
const Joi = require("joi");

const contactsOperations = require("../../model/index");

const joiShema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (error) {
    // res.status(500).json({
    //   message: "Server error",
    // });
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await contactsOperations.getContactById(contactId);

    if (!contact) {
      throw new createError(404, "Not found");
      // const error = new Error("Not found");
      // error.status = 404;
      // throw error;
      //
      // return res.status(404).json({
      //   message: "Not found",
      // });
    }
    res.json(contact);
  } catch (error) {
    // res.status(500).json({
    //   message: "Server error",
    // });
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = joiShema.validate(req.body);
    if (error) {
      throw new createError(400, "missing required name field");
    }
    const newContact = await contactsOperations.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await contactsOperations.removeContact(contactId);
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
    const { error } = joiShema.validate(req.body);
    if (error) {
      throw new createError(400, "missing fields");
    }

    const { contactId } = req.params;
    const updateContact = await contactsOperations.updateContact(
      contactId,
      req.body
    );
    if (!updateContact) {
      throw new createError(404, "Not found");
    }
    res.json(updateContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
