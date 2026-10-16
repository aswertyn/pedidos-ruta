const {
    generarCodigoOTP,
    generarHashOTP,
} = require('./otpService.cjs')

const {
    guardarCodigoOTP,
    verificarCodigoOTP,
} = require('./otpDatabase.cjs')

const {
    enviarCorreo,
} = require('./emailService.cjs')

async function solicitarCodigoOTP(pool, usuario, correo) {
    const codigo = generarCodigoOTP()

    const codigoHash = generarHashOTP(usuario, codigo)

    const idCodigo = await guardarCodigoOTP(
        pool,
        usuario,
        codigoHash
    )

    try {
        await enviarCorreo(correo, codigo)
    } catch (error) {
        // Invalidar el código si falla el envío.
        await pool.request()
            .input('idCodigo', idCodigo)
            .query(`
                UPDATE dbo.CodigosVerificacion
                SET Utilizado = 1
                WHERE IdCodigo = @idCodigo
            `)

        throw error
    }

    return {
        idCodigo,
        enviado: true,
    }
}


async function validarCodigoOTP(pool, usuario, idCodigo, codigo) {
    if (!/^\d{6}$/.test(codigo)) {
        return {
            valido: false,
            motivo: 'FORMATO_INVALIDO',
        }
    }

    const codigoHash = generarHashOTP(usuario, codigo)

    return await verificarCodigoOTP(
        pool,
        usuario,
        idCodigo,
        codigoHash
    )
}


module.exports = {
    solicitarCodigoOTP,
    validarCodigoOTP,
}