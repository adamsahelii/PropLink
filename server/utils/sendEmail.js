const nodemailer = require('nodemailer')

// One reusable transporter, authenticated with the PropLink Gmail + App Password.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Sends one email. `replyTo` lets the recipient reply straight to the visitor.
async function sendEmail({ subject, html, replyTo }) {
  return transporter.sendMail({
    from: `"PropLink" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject,
    html,
    replyTo,
  })
}

module.exports = sendEmail