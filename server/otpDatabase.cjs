const sql = require('mssql')


async function guardarCodigoOTP(pool, usuario, codigoHash) {
    const transaction = new sql.Transaction(pool)

    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE)

    try {
        // para que no entre mas de una solicitud
        await new sql.Request(transaction)
            .input('usuario', sql.NVarChar(10), usuario)
            .query(`
                SELECT usuario
                FROM dbo.usuarios WITH (UPDLOCK, HOLDLOCK)
                WHERE usuario = @usuario
            `)

        // Comprobar si se hizo el código en los últimos 60 segundos.
        const espera = await new sql.Request(transaction)
            .input('usuario', sql.NVarChar(10), usuario)
            .query(`
        SELECT TOP 1
            DATEDIFF(SECOND, FechaCreacion, SYSUTCDATETIME()) AS SegundosTranscurridos
        FROM dbo.CodigosVerificacion
        WHERE usuario = @usuario
        ORDER BY FechaCreacion DESC, IdCodigo DESC
    `)

        if (espera.recordset.length > 0) {
            const segundos = espera.recordset[0].SegundosTranscurridos

            if (segundos < 60) {
                const error = new Error('Debes esperar antes de solicitar otro código')
                error.code = 'OTP_RATE_LIMIT'
                error.retryAfter = 60 - Math.max(0, segundos)
                throw error
            }
        }

        // solo para usar 1 codigo
        await new sql.Request(transaction)
            .input('usuario', sql.NVarChar(10), usuario)
            .query(`
                UPDATE dbo.CodigosVerificacion
                SET Utilizado = 1
                WHERE usuario = @usuario
                  AND Utilizado = 0
            `)

        // Registrar el nuevo código.
        const resultado = await new sql.Request(transaction)
            .input('usuario', sql.NVarChar(10), usuario)
            .input('codigoHash', sql.VarChar(64), codigoHash)
            .query(`
                INSERT INTO dbo.CodigosVerificacion
                (
                    usuario,
                    CodigoHash,
                    FechaCreacion,
                    FechaExpiracion,
                    Intentos,
                    Utilizado
                )
                OUTPUT INSERTED.IdCodigo
                VALUES
                (
                    @usuario,
                    @codigoHash,
                    SYSUTCDATETIME(),
                    DATEADD(MINUTE, 5, SYSUTCDATETIME()),
                    0,
                    0
                )
            `)

        await transaction.commit()

        return resultado.recordset[0].IdCodigo

    } catch (error) {
        await transaction.rollback()
        throw error
    }
}



async function consultarEsperaOTP(pool, usuario) {
    const resultado = await pool.request()
        .input('usuario', sql.NVarChar(10), usuario)
        .query(`
            SELECT TOP 1
                CASE
                    WHEN FechaCreacion > SYSUTCDATETIME()
                    THEN 60
                    WHEN DATEDIFF(SECOND, FechaCreacion, SYSUTCDATETIME()) < 60
                    THEN 60 - DATEDIFF(SECOND, FechaCreacion, SYSUTCDATETIME())
                    ELSE 0
                END AS SegundosRestantes
            FROM dbo.CodigosVerificacion
            WHERE usuario = @usuario
            ORDER BY FechaCreacion DESC, IdCodigo DESC
        `)

    return resultado.recordset[0]?.SegundosRestantes ?? 0
}

async function verificarCodigoOTP(pool, usuario, idCodigo, codigoHash) {
    const transaction = new sql.Transaction(pool)

    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE)

    try {
        const resultado = await new sql.Request(transaction)
            .input('usuario', sql.NVarChar(10), usuario)
            .input('idCodigo', sql.Int, idCodigo)
            .query(`
        SELECT
            CodigoHash,
            Intentos,
            Utilizado,
            CASE
                WHEN FechaExpiracion <= SYSUTCDATETIME()
                THEN 1
                ELSE 0
            END AS Expirado
        FROM dbo.CodigosVerificacion WITH (UPDLOCK, HOLDLOCK)
        WHERE IdCodigo = @idCodigo
          AND usuario = @usuario
    `)

        const registro = resultado.recordset[0]

        if (!registro || registro.Utilizado) {
            await transaction.commit()
            return { valido: false, motivo: 'INVALIDO' }
        }

        if (registro.Intentos >= 5) {
            await transaction.commit()
            return { valido: false, motivo: 'BLOQUEADO' }
        }

        //const expirado = new Date(registro.FechaExpiracion).getTime() <= Date.now()

        if (registro.Expirado === 1) {
            await transaction.commit()
            return { valido: false, motivo: 'EXPIRADO' }
        }

        const correcto = registro.CodigoHash === codigoHash

        await new sql.Request(transaction)
            .input('idCodigo', sql.Int, idCodigo)
            .input('utilizado', sql.Bit, correcto)
            .query(`
                UPDATE dbo.CodigosVerificacion
                SET Intentos = Intentos + 1,
                    Utilizado = @utilizado
                WHERE IdCodigo = @idCodigo
            `)

        await transaction.commit()

        return {
            valido: correcto,
            motivo: correcto ? 'CORRECTO' : 'INCORRECTO',
        }
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}


module.exports = {
    guardarCodigoOTP,
    verificarCodigoOTP,
    consultarEsperaOTP,
}
