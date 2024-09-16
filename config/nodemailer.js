import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'

dotenv.config()
// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER_ADDRESS, 
    pass: process.env.usePassword, 
  },
  tls: {
    port: 465,
    rejectUnauthorized: false, // Disable certificate validation
    timeout: 10000, 
  },
});

  export default transporter