/**
 * Required Vercel Environment Variables:
 * SMTP_HOST  — SMTP server host
 * SMTP_PORT  — SMTP server port (587 or 465)
 * SMTP_USER  — Sender email address
 * SMTP_PASS  — SMTP password or app password
 *
 * Set these in: Vercel Dashboard → Project → Settings → Environment Variables
 * Do NOT add a .env file or dotenv — Vercel injects these automatically.
 */

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
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
    } = req.body;

    // Required field validation
    const required = {
      name,
      email,
      phone,
      city,
      college,
      degree,
      yearOfStudy,
      role,
      availability,
      statement,
    };

    for (const [field, value] of Object.entries(required)) {
      if (!value || String(value).trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    // LinkedIn normalisation — optional field
    let linkedInFinal = '';
    if (linkedIn && String(linkedIn).trim() !== '') {
      linkedInFinal = String(linkedIn).trim();
      if (!/^https?:\/\//i.test(linkedInFinal)) {
        linkedInFinal = 'https://' + linkedInFinal;
      }
      if (!linkedInFinal.includes('linkedin.com/in/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid LinkedIn profile URL.',
        });
      }
    }

    // Build plain-text email body
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

    // Nodemailer transporter — reads from Vercel environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"QueueFree Careers" <${process.env.SMTP_USER}>`,
      to: 'contact@queuefreehealth.com',
      subject: `[Intern Application] ${role} — ${name}`,
      text: emailBody,
    });

    console.log(`[intern-application] Sent: ${name} — ${role}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[intern-application] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Email failed to send. Please try again later.',
    });
  }
};
