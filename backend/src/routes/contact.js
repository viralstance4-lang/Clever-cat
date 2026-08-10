const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { sendResendEmail } = require('../services/resendMailer');
const Enquiry = require('../models/Enquiry');

// GET /api/contact — admin only, list all enquiries
router.get('/', protect, adminOnly, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json({ success: true, enquiries });
});

// PUT /api/contact/:id/read — admin only, toggle read state
router.put('/:id/read', protect, adminOnly, async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  enquiry.isRead = req.body.isRead !== undefined ? Boolean(req.body.isRead) : !enquiry.isRead;
  await enquiry.save();
  res.json({ success: true, enquiry });
});

// DELETE /api/contact/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  await enquiry.deleteOne();
  res.json({ success: true, message: 'Enquiry deleted' });
});

// POST /api/contact — public, no auth required
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  // Always persist the enquiry so the admin can see it, regardless of whether
  // email sending is configured.
  await Enquiry.create({ name: name.trim(), email: email.trim(), phone: phone?.trim(), subject: subject?.trim(), message: message.trim() });

  if (!process.env.RESEND_API_KEY) {
    console.warn('[Contact] RESEND_API_KEY not configured — enquiry saved, email skipped');
    return res.json({ success: true, message: 'Message received. We will get back to you shortly.' });
  }

  const businessEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await sendResendEmail({
    to: businessEmail,
    replyTo: email,
    fromName: 'Clever Cat Contact',
    fromEmail,
    subject: `[Contact Form] ${subject?.trim() || 'New Message'} — from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#2C1050;color:#fff;padding:32px;border-radius:12px;">
        <h2 style="color:#EC1380;margin-bottom:24px;">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:100px;">Name</td><td style="padding:8px 0;color:#fff;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#EC1380;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">Phone</td><td style="padding:8px 0;color:#fff;">${phone?.trim() || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">Subject</td><td style="padding:8px 0;color:#fff;">${subject || '—'}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;background:#3D1868;border-radius:8px;border-left:3px solid #EC1380;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="color:#fff;line-height:1.6;margin:0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="margin-top:24px;color:rgba(255,255,255,0.3);font-size:12px;">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `,
  });

  // Auto-reply to the sender
  await sendResendEmail({
    to: email,
    fromName: 'Clever Cat',
    fromEmail,
    subject: 'We received your message — Clever Cat',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#2C1050;color:#fff;padding:32px;border-radius:12px;">
        <h2 style="color:#EC1380;">Thank you, ${name}! 📚</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
          We've received your message and will get back to you within 24 hours.
        </p>
        <div style="margin:20px 0;padding:16px;background:#3D1868;border-radius:8px;border-left:3px solid #EC1380;">
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 8px;">Your message:</p>
          <p style="color:rgba(255,255,255,0.8);margin:0;line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">
          © ${new Date().getFullYear()} Clever Cat. All rights reserved.
        </p>
      </div>
    `,
  });

  res.json({ success: true, message: "Message sent! We'll reply within 24 hours. ✨" });
});

module.exports = router;
