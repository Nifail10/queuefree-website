// .env — required for email sending
require("dotenv").config(); // must be line 1

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("[Nodemailer] SMTP verification failed:", error.message);
    console.error(
      "[Nodemailer] Ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set in .env"
    );
  } else {
    console.log("[Nodemailer] SMTP connection verified. Ready to send.");
  }
});

app.post("/api/intern-application", async (req, res) => {
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
      if (!value || String(value).trim() === "") {
        console.warn(`[intern-application] Missing required field: ${field}`);
        return res
          .status(400)
          .json({ success: false, message: `Missing required field: ${field}` });
      }
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    // LinkedIn normalisation and validation (optional field)
    let linkedInNormalised = "";
    if (linkedIn && String(linkedIn).trim() !== "") {
      linkedInNormalised = String(linkedIn).trim();
      if (!/^https?:\/\//i.test(linkedInNormalised)) {
        linkedInNormalised = "https://" + linkedInNormalised;
      }
      if (!linkedInNormalised.includes("linkedin.com/in/")) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid LinkedIn profile URL." });
      }
    }

    // Build email body
    const emailBody = `
INTERNSHIP APPLICATION — QUEUEFREE
=====================================

BASIC INFORMATION
-----------------
Full Name:     ${name}
Email:         ${email}
Phone:         ${phone}
City:          ${city}

EDUCATION
---------
College/University: ${college}
Degree/Programme:   ${degree}
Year of Study:      ${yearOfStudy}

INTERNSHIP DETAILS
------------------
Role Applied For:  ${role}
Availability:      ${availability}
Expected Duration: ${duration || "Not specified"}

PROFESSIONAL LINKS
------------------
LinkedIn:  ${linkedInNormalised || "Not provided"}
GitHub/Portfolio: ${github || "Not provided"}

SHORT STATEMENT
---------------
${statement}
    `.trim();

    await transporter.sendMail({
      from: `"QueueFree Careers" <${process.env.SMTP_USER}>`,
      to: "contact@queuefreehealth.com",
      subject: `[Intern Application] ${role} — ${name}`,
      text: emailBody,
    });

    console.log(
      `[intern-application] Application sent successfully for: ${name} — ${role}`
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[intern-application] Handler error:", err.message);
    return res.status(500).json({ success: false, message: "Email failed to send." });
  }
});

app.listen(PORT, () => {
  console.log(`QueueFree server running on port ${PORT}`);
});
