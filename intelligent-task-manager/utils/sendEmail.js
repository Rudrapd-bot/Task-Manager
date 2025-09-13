const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,   // your Gmail
      pass: process.env.EMAIL_PASS    // app password if 2FA enabled
    }
  });

  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

module.exports = sendEmail;
