import "dotenv/config"; // Ensure SMTP and email credentials are loaded from .env

import express from "express";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS (fallback without extra dependencies)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// Nodemailer transport configuration using SMTP_* environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("[Nodemailer] SMTP connection failed:", error.message);
  } else {
    console.log("[Nodemailer] SMTP connection verified successfully.");
  }
});

// Preserve existing POST /api/contact behaviour for the contact form
app.post("/api/contact", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, org, subject, message } = req.body || {};

    const safeName = name || "No name provided";
    const safeEmail = email || "No email provided";
    const safeOrg = org || "Not specified";
    const safeMessage = message || "No message provided";

    const contactTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await contactTransporter.sendMail({
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
    statement,
    linkedIn,
    duration,
    github,
  } = req.body || {};

  const nameVal = typeof name === "string" ? name.trim() : "";
  const emailVal = typeof email === "string" ? email.trim() : "";
  const phoneVal = typeof phone === "string" ? phone.trim() : "";
  const cityVal = typeof city === "string" ? city.trim() : "";
  const collegeVal = typeof college === "string" ? college.trim() : "";
  const degreeVal = typeof degree === "string" ? degree.trim() : "";
  const yearOfStudyVal = typeof yearOfStudy === "string" ? yearOfStudy.trim() : "";
  const roleVal = typeof role === "string" ? role.trim() : "";
  const availabilityVal = typeof availability === "string" ? availability.trim() : "";
  const statementVal = typeof statement === "string" ? statement.trim() : "";

  if (
    !nameVal ||
    !emailVal ||
    !phoneVal ||
    !cityVal ||
    !collegeVal ||
    !degreeVal ||
    !yearOfStudyVal ||
    !roleVal ||
    !availabilityVal ||
    !statementVal
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailVal)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // LinkedIn: optional; normalize and validate only if non-empty
  let normalizedLinkedIn = typeof linkedIn === "string" ? linkedIn.trim() : "";
  if (normalizedLinkedIn) {
    if (!/^https?:\/\//i.test(normalizedLinkedIn)) {
      normalizedLinkedIn = "https://" + normalizedLinkedIn;
    }
    if (normalizedLinkedIn.indexOf("linkedin.com/in/") === -1) {
      return res.status(400).json({ error: "Invalid LinkedIn URL." });
    }
  }

  const textBody = [
    "New Intern Application - QueueFree",
    "",
    "Basic Information",
    `- Name: ${nameVal}`,
    `- Email: ${emailVal}`,
    `- Phone: ${phoneVal}`,
    `- City: ${cityVal}`,
    "",
    "Education",
    `- College / University: ${collegeVal}`,
    `- Degree / Programme: ${degreeVal}`,
    `- Year of Study: ${yearOfStudyVal}`,
    "",
    "Internship Details",
    `- Role Applying For: ${roleVal}`,
    `- Availability: ${availabilityVal}`,
    `- Expected Duration: ${duration || "Not specified"}`,
    "",
    "Links",
    `- LinkedIn: ${normalizedLinkedIn || "Not provided"}`,
    `- GitHub / Portfolio: ${github || "Not provided"}`,
    "",
    "Statement",
    statementVal,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "contact@queuefreehealth.com",
      subject: `[Intern Application] ${roleVal} — ${nameVal}`,
      text: textBody,
    });

    console.log("[intern-application] Application sent for:", nameVal);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[intern-application] Nodemailer error:", err);
    return res.status(500).json({ error: "Failed to send application." });
  }
});

app.listen(PORT, () => {
  console.log(`QueueFree server running on port ${PORT}`);
});
