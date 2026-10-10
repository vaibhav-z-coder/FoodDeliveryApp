import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const sendEmail = async ({ to, subject, htmlContent }) => {
    try {
        const hasBrevo = process.env.BREVO_API_KEY && 
                         process.env.BREVO_API_KEY !== "your_brevo_api_key" &&
                         process.env.EMAIL && 
                         process.env.EMAIL !== "your_verified_sender_email@example.com";

        if (!hasBrevo) {
            console.log(`\n========================================`);
            console.log(`📧 [MOCK EMAIL SIMULATION]`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content:\n${htmlContent}`);
            console.log(`========================================\n`);
            return { messageId: "simulated_email_id" };
        }

        if (!to) {
            throw new Error("Recipient email is missing")
        }

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "BiteRush",
                    email: process.env.EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent
            },
            {
                headers: {
                    accept: "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },
                timeout: 15000
            }
        )

        console.log("Brevo email sent:", response.data)

        return response.data
    } catch (error) {
        console.error(
            "BREVO EMAIL ERROR:",
            error.response?.data || error.message
        )

        return { simulated: true, error: error.message };
    }
}

export const sendOtpMail = async (to, otp) => {
    return sendEmail({
        to,
        subject: "BiteRush Password Reset OTP",
        htmlContent: `
            <p>
                Your OTP for password reset is
                <b>${otp}</b>.
            </p>
            <p>This OTP expires in 5 minutes.</p>
        `
    })
}

export const sendDeliveryOtpMail = async (user, otp) => {
    if (!user?.email) {
        throw new Error("User email not found")
    }

    return sendEmail({
        to: user.email,
        subject: "BiteRush Delivery OTP",
        htmlContent: `
            <h2>BiteRush Delivery Verification</h2>
            <p>
                Your OTP for delivery is
                <b>${otp}</b>.
            </p>
            <p>This OTP expires in 5 minutes.</p>
        `
    })
}
