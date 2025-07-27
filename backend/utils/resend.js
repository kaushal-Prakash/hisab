import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "hisab <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

export default sendMail;
