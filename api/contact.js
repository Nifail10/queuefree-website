import nodemailer from "nodemailer";

export default async function handler(req, res) {
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
}
