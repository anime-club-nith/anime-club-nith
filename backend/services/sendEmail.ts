import nodemailer from "nodemailer";
import { generateToken } from "../services/authToken";
import dotenv from "dotenv";

dotenv.config();
export const sendEmail = async (user: any): Promise<boolean> => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER!,
            pass: process.env.MAIL_PASS!,
        }
    })

    const token = generateToken(user);
    const FRONTEND_URL = process.env.FRONTEND_PROD_URL;

    await transporter.sendMail({
        from: `"Anime Club NITH" <${process.env.MAIL_USER!}>`,
        to: `${user.email}`,
        subject: `Reset your Anime Club NITH password`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #F4F4F5;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                    color: #334155;
                }
                .wrapper {
                    width: 100%;
                    background-color: #F4F4F5;
                    padding: 40px 0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #E2E8F0;
                }
                .header {
                    background-color: #E56DB1;
                    padding: 28px 40px;
                    text-align: center;
                }
                .header-title {
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .content {
                    padding: 40px;
                    text-align: center;
                }
                h1 {
                    color: #0f172a;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 16px 0;
                    letter-spacing: -0.5px;
                }
                p {
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                }
                .btn-wrapper {
                    margin: 32px 0;
                }
                .btn {
                    display: inline-block;
                    background-color: #E56DB1;
                    color: #ffffff;
                    padding: 14px 32px;
                    border-radius: 32px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 15px;
                }
                .footer {
                    padding: 24px 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    border-top: 1px solid #F1F5F9;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <p class="header-title">Anime Club NITH</p>
                    </div>
                    <div class="content">
                        <h1>Reset Your Password</h1>
                        <p>We received a request to reset the password for your <strong>Anime Club NITH</strong> account. Click the button below to set a new password.</p>
                        <div class="btn-wrapper">
                            <a href="${FRONTEND_URL}/reset-password?token=${token}" class="btn">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">
                            If you didn't request this, you can safely ignore this email. Your password won't change.
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Anime Club NITH &mdash; NIT Hamirpur<br>
                    <a href="https://instagram.com/animeclub_nith" style="color: #E56DB1; text-decoration: none;">@animeclub_nith</a>
                </div>
            </div>
        </body>
        </html>
          
    `
    });
    return true;
}