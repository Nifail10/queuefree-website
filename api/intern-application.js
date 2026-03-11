/**
 * Vercel Serverless Function — POST /api/intern-application
 *
 * Required environment variables (already set in Vercel dashboard):
 *   EMAIL_USER — sending email address
 *   EMAIL_PASS — email password or app password
 *
 * These are the same credentials used by /api/contact.js.
 * Do NOT use dotenv. Vercel injects variables automatically.
 */

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  // Guard against missing body — happens when Content-Type header is absent
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid or missing request body.' });
  }

  const {
    name,
    email,
    phone,
    city,
    college,
    degree,
    yearOfStudy,
    role,
    availability,
    duration,
    linkedIn,
    github,
    statement,
  } = body;

  // Required field validation
  const requiredFields = { name, email, phone, city, college, degree, yearOfStudy, role, availability, statement };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || String(value).trim() === '') {
      return res.status(400).json({ success: false, error: `Missing required field: ${field}` });
    }
  }

  // Email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  // LinkedIn normalisation — optional field
  let linkedInFinal = '';
  if (linkedIn && String(linkedIn).trim() !== '') {
    linkedInFinal = String(linkedIn).trim();
    if (!/^https?:\/\//i.test(linkedInFinal)) {
      linkedInFinal = 'https://' + linkedInFinal;
    }
    if (!linkedInFinal.includes('linkedin.com/in/')) {
      return res.status(400).json({ success: false, error: 'Invalid LinkedIn profile URL.' });
    }
  }

  // Email body
  const emailBody = `
INTERNSHIP APPLICATION — QUEUEFREE
=====================================

BASIC INFORMATION
Name:     ${name}
Email:    ${email}
Phone:    ${phone}
City:     ${city}

EDUCATION
College / University: ${college}
Degree / Programme:   ${degree}
Year of Study:        ${yearOfStudy}

INTERNSHIP DETAILS
Role Applied For:  ${role}
Availability:      ${availability}
Duration:          ${duration || 'Not specified'}

PROFESSIONAL LINKS
LinkedIn:         ${linkedInFinal || 'Not provided'}
GitHub/Portfolio: ${github || 'Not provided'}

SHORT STATEMENT
${statement}
  `.trim();

  // Nodemailer transporter
  // IMPORTANT: mirror the exact config from /api/contact.js
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"QueueFree Careers" <${process.env.EMAIL_USER}>`,
      to: 'contact@queuefreehealth.com',
      subject: `[Intern Application] ${role} — ${name}`,
      text: emailBody,
    });

    console.log(`[intern-application] Sent successfully: ${name} — ${role}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[intern-application] Nodemailer error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send application. Please try again later.' });
  }
};
