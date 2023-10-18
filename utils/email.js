// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

module.exports.sendEmail = async (option) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //activate in gmail "less secure app" option
  });
  // 2) define the email options

  const mailOptions = {
    from: 'Podexus23 <santon23@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  // 3) actually end the email
  await transporter.sendMail(mailOptions);
};
