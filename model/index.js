const fs = require("fs/promises");
const { v4 } = require("uuid");

const path = require("path");
const req = require("express/lib/request");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.find((item) => item.id === contactId);

  return result;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contact = await getContactById(contactId);

  if (!contact) {
    return null;
  }
  const newContacts = contacts.filter((item) => item.id !== contactId);
  await fs.writeFile(contactsPath, JSON.stringify(newContacts, null, 2));
  return contact;
};

const addContact = async (body) => {
  const contacts = await listContacts();

  const newContact = { id: v4(), ...body };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex((item) => item.id === contactId);
  if (idx === -1) {
    return null;
  }
  contacts[idx] = { id: contactId, ...body };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[idx];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
