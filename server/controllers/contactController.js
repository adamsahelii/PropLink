const { ContactMessage } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const AppError = require('../utils/AppError')
const sendEmail = require('../utils/sendEmail')
// ── POST /api/contact ─────────────────────────────────────────────────────────
// Public. Anyone (logged in or not) can send a message to the PropLink team.
// If a token is present, req.user links the sender; otherwise it stays null.

exports.createContactMessage = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return next(new AppError('Please fill in all required fields.', 400))
  }

  const contactMessage = await ContactMessage.create({
    name:    name.trim(),
    email:   email.trim(),
    phone:   phone?.trim() || undefined,
    subject: subject.trim(),
    message: message.trim(),
    userId:  req.user?._id || null,
  })
    // Email the PropLink inbox — don't let a mail failure break the save
  try {
    await sendEmail({
      subject: `New contact message: ${contactMessage.subject}`,
      replyTo: contactMessage.email,
      html: `
        <h2>New message from PropLink contact form</h2>
        <p><strong>Name:</strong> ${contactMessage.name}</p>
        <p><strong>Email:</strong> ${contactMessage.email}</p>
        <p><strong>Phone:</strong> ${contactMessage.phone || '—'}</p>
        <p><strong>Subject:</strong> ${contactMessage.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contactMessage.message}</p>
      `,
    })
  } catch (err) {
    console.error('Contact email failed:', err.message)
  }

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We\u2019ll be in touch soon.',
    contactMessage,
  })
})