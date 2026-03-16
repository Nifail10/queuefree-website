/**
 * Vercel Serverless Function — POST /api/doctor-survey
 *
 * Required environment variables (already set in Vercel dashboard):
 *   EMAIL_USER — sending email address
 *   EMAIL_PASS — email password or app password
 *
 * Do NOT use dotenv. Vercel injects variables automatically.
 */

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid or missing request body.' });
  }

  const {
    specialty,
    patientsPerDay,
    consultationTime,
    queueMethod,
    patientsAsk,
    crowdingAffects,
    transparencyHelps,
    openToTesting,
    hospital,
    contactEmail,
    practiceType,
    appointmentType,
    delayReason,
    missedTurn,
    interruptionHelp,
    usefulFeature,
    additionalComments,
  } = body;

  // Required field validation
  const requiredFields = {
    specialty,
    patientsPerDay,
    consultationTime,
    queueMethod,
    patientsAsk,
    crowdingAffects,
    transparencyHelps,
    openToTesting,
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || String(value).trim() === '') {
      return res.status(400).json({ success: false, error: `Missing required field: ${field}` });
    }
  }

  // Optional contact email format check
  if (contactEmail && String(contactEmail).trim() !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid contact email address.' });
    }
  }

  const emailBody = `
DOCTOR SURVEY RESPONSE — QUEUEFREE
=====================================

PRACTICE DETAILS
Specialty:                        ${specialty}
Type of Practice:                 ${practiceType || 'Not answered'}
Appointment Type:                 ${appointmentType || 'Not answered'}
Average Patients Per Day:         ${patientsPerDay}
Average Consultation Time:        ${consultationTime}

CURRENT QUEUE SETUP
Queue Management Method:          ${queueMethod}
Patients Ask About Their Turn:    ${patientsAsk}
Crowding Affects Workflow:        ${crowdingAffects}
Most Common Delay Reason:         ${delayReason || 'Not answered'}
If Patient Misses Turn:           ${missedTurn || 'Not answered'}

QUEUEFREE RELEVANCE
Real-Time Transparency Would Help: ${transparencyHelps}
Open To Testing QueueFree:        ${openToTesting}
Interruptions Would Reduce:       ${interruptionHelp || 'Not answered'}
Most Useful Feature:              ${usefulFeature || 'Not answered'}

OPTIONAL CONTACT
Hospital / Clinic:  ${hospital || 'Not provided'}
Additional Comments:              ${additionalComments || 'Not provided'}
Contact Email:      ${contactEmail || 'Not provided'}
  `.trim();

  // Mirror the exact transporter config from /api/intern-application.js
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"QueueFree Survey" <${process.env.EMAIL_USER}>`,
      to: 'contact@queuefreehealth.com',
      subject: `[Doctor Survey] ${specialty} — ${hospital || 'Anonymous'}`,
      text: emailBody,
    });

    console.log(`[doctor-survey] Response received: ${specialty} — ${hospital || 'anonymous'}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[doctor-survey] Nodemailer error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send survey. Please try again later.' });
  }
};

