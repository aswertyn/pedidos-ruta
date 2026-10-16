const crypto = require('node:crypto')

function generarCodigoOTP() {
    return crypto.randomInt(100000, 1000000).toString()
}

function generarHashOTP(usuario, codigo) {
    const secreto = process.env.OTP_SECRET

    if (!secreto) {
        throw new Error('Falta OTP_SECRET')
    }

    return crypto
        .createHmac('sha256', secreto)
        .update(`${usuario}:${codigo}`)
        .digest('hex')
}

module.exports = {
    generarCodigoOTP,
    generarHashOTP,
}