
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

async function enviarCorreo(destinatario, codigo) {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: destinatario,
        subject: 'Código de verificación',
        text: `Tu código de verificación es: ${codigo}.

Este código expira en 5 minutos.`,
    })
}

module.exports = {
    enviarCorreo,
}
