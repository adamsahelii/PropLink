const mongoose = require('mongoose')

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    // If a logged-in user sends it, link them; anonymous senders leave this null.
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isRead:  { type: Boolean, default: false }, // for a future admin inbox
  },
  { timestamps: true }
)

module.exports = mongoose.model('ContactMessage', contactMessageSchema)