require("dotenv").config(); // Ensure SMTP and email credentials are loaded from .env

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Preserve existing POST /api/contact behaviour for the contact form
app.post("/api/contact", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, org, subject, message } = req.body;

    const safeName = name || "No name provided";
    const safeEmail = email || "No email provided";
    const safeOrg = org || "Not specified";
    const safeMessage = message || "No message provided";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"QueueFree Website Contact" <${process.env.EMAIL_USER}>`,
      to: "contact@queuefreehealth.com",
      replyTo: safeEmail,
      subject: "New QueueFree Website Inquiry",
      headers: {
        "X-Mailer": "QueueFree Website",
        "X-Priority": "3",
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a5c50; border-bottom: 2px solid #2BBF8F; padding-bottom: 10px;">New QueueFree Website Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; color: #333; width: 130px; vertical-align: top;">Name:</td>
              <td style="padding: 10px 12px; color: #555;">${safeName}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #333; vertical-align: top;">Email:</td>
              <td style="padding: 10px 12px; color: #555;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; color: #333; vertical-align: top;">Organization:</td>
              <td style="padding: 10px 12px; color: #555;">${safeOrg}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #333; vertical-align: top;">Subject:</td>
              <td style="padding: 10px 12px; color: #555;">${subject || "General Enquiry"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
              <td style="padding: 10px 12px; color: #555; white-space: pre-wrap;">${safeMessage}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">This message was sent from the QueueFree website contact form.</p>
        </div>
      `,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// New endpoint: POST /api/intern-application
app.post("/api/intern-application", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
  } = req.body || {};

  // Basic validation
  if (
    !name ||
    !email ||
    !phone ||
    !city ||
    !college ||
    !degree ||
    !yearOfStudy ||
    !role ||
    !availability ||
    !statement
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // LinkedIn: optional; normalize and validate only if non-empty
  let normalizedLinkedIn = (linkedIn || "").trim();
  if (normalizedLinkedIn) {
    if (!/^https?:\/\//i.test(normalizedLinkedIn)) {
      normalizedLinkedIn = "https://" + normalizedLinkedIn;
    }
    if (normalizedLinkedIn.indexOf("linkedin.com/in/") === -1) {
      return res.status(400).json({ error: "Invalid LinkedIn profile URL." });
    }
  } else {
    normalizedLinkedIn = null;
  }

  // Nodemailer transport configuration using SMTP_* environment variables
  // These must be set in a .env file for the server to send emails.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const textBody = [
    "New Intern Application - QueueFree",
    "",
    "Basic Information",
    `- Name: ${name}`,
    `- Email: ${email}`,
    `- Phone: ${phone}`,
    `- City: ${city}`,
    "",
    "Education",
    `- College / University: ${college}`,
    `- Degree / Programme: ${degree}`,
    `- Year of Study: ${yearOfStudy}`,
    "",
    "Internship Details",
    `- Role Applying For: ${role}`,
    `- Availability: ${availability}`,
    `- Expected Duration: ${duration || "Not specified"}`,
    "",
    "Links",
    `- LinkedIn: ${normalizedLinkedIn || "Not provided"}`,
    `- GitHub / Portfolio: ${github || "Not provided"}`,
    "",
    "Statement",
    statement,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "contact@queuefreehealth.com",
      subject: `[Intern Application] ${role} — ${name}`,
      text: textBody,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Intern application error:", err);
    return res.status(500).json({ error: "Failed to send application." });
  }
});

app.listen(PORT, () => {
  console.log(`QueueFree server running on port ${PORT}`);
});

