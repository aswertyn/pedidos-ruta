import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function enviarCorreo(
  destinatario: string,
  codigo: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: destinatario,
    subject: "Código de verificación",
    text: `Tu código de verificación es: ${codigo}.

Este código expira en 5 minutos.`,
  });
}