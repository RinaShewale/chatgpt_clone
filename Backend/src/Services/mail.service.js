import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import dns from "dns";

// ⭐ IMPORTANT: Fix Render IPv6 issue
dns.setDefaultResultOrder("ipv4first");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // ⭐ more stable than 465 on Render
  secure: false, // true only for 465
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify transporter (safe async check)
setTimeout(() => {
  transporter.verify((err, success) => {
    if (err) {
      console.log("❌ Email transporter verification failed:", err);
    } else {
      console.log("✅ Email transporter is ready to send emails");
    }
  });
}, 2000);

// Send Email Function
export async function SendEmail({ to, subject, html, text }) {
  try {
    const mailOption = {
      from: process.env.GOOGLE_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOption);

    console.log("📧 Email sent successfully:");
    console.log(info.response);

    return info;
  } catch (error) {
    console.log("❌ Email send failed:", error);
    throw error;
  }
}