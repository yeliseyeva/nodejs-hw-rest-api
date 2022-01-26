const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

// const data = {
//     to: "nik29121997@gmail.com",
//     from:"yelisieievasvitlana@gmail.com",
//     subject: "Заявка",
//     html: "<p>Подтвердить<p>"
// }

const sendEmail = async (data) => {
  try {
    const email = { ...data, from: "yelisieievasvitlana@gmail.com" };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

// sgMail.send(email)
//     .then(() => console.log("Email send success"))
//     .catch(error => console.log(error.message))

module.exports = sendEmail;
