import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailConfig = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
};

export const isMailConfigured =
    Boolean(mailConfig.host) &&
    Number.isInteger(mailConfig.port) &&
    Boolean(mailConfig.user) &&
    Boolean(mailConfig.pass);

export const transporter = isMailConfigured
    ? nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: false,
        auth: { user: mailConfig.user, pass: mailConfig.pass }
    })
    : null;

export const sendMail = async (options) => {
    if (!transporter) {
        return { sent: false, reason: 'mail-not-configured' };
    }

    await transporter.sendMail(options);
    return { sent: true };
};
