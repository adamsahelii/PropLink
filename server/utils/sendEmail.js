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
// `to` is optional: defaults to the PropLink inbox (contact form),
// or pass a user's address (password reset).
async function sendEmail({ to, subject, html, replyTo }) {
  return transporter.sendMail({
    from: `"PropLink" <${process.env.EMAIL_USER}>`,
    to: to || process.env.EMAIL_TO,
    subject,
    html,
    replyTo,
  })
}

module.exports = sendEmail