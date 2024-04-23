import { configDotenv } from 'dotenv';
import nodemailer from 'nodemailer';

configDotenv();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendMail = ({to, subject, text}) => {
    const mailOptions = {
        from: process.env.GMAIL_ID || "",
        to: to,
        subject: subject,
        text: text
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          throw error;
        }
    });
}

export default sendMail;