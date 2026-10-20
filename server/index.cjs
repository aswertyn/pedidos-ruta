const express = require('express')
const { sql, poolPromise } = require('./database.cjs')
const session = require('express-session')
const { consultarEsperaOTP } = require('./otpDatabase.cjs')
const { solicitarCodigoOTP,
    validarCodigoOTP, } = require('./otpManager.cjs')
const SqlSessionStore = require('./sqlSessionStore.cjs')

require('dotenv').config({
    path: require('node:path').join(__dirname, '..', '.env'),
})


const app = express()
const PORT = 3001

app.use(express.json())

if (!process.env.SESSION_SECRET) {
    throw new Error('Falta SESSION_SECRET en el archivo .env')
}

app.use(
    session({
        name: 'pedidos.sid',
        secret: process.env.SESSION_SECRET,
        store: new SqlSessionStore(poolPromise),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 8,
        },
    })
)

// const dbConfig = {

//     server: process.env.DB_SERVER,
//     database: process.env.DB_DATABASE,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,

//     options: {
//         encrypt: false,
//         trustServerCertificate: true,
//     },
// }

// const poolPromise = new sql.ConnectionPool(dbConfig).connect()

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
    })
})

app.post('/api/auth/login', async (req, res) => {
    const { usuario, contraseña } = req.body

    if (!usuario || !contraseña) {
        return res.status(400).json({
            message: 'Usuario y contraseña son requeridos',
        })
    }

    try {
        //const pool = await sql.connect(dbConfig)
        const pool = await poolPromise

        const result = await pool
            .request()
            .input('usuario', sql.NVarChar(100), usuario)
            .input('contraseña', sql.NVarChar(100), contraseña)
            .execute('sp_login')

        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: 'Usuario o contraseña incorrectos',
            })
        }

        const user = result.recordset[0]

        const requires2FA =
            user.autorizacion2Pasos === true ||
            user.autorizacion2Pasos === 1 ||
            user.autorizacion2Pasos === '1'

        const safeUser = {
            usuario: user.usuario,
            nombre: user.nombre,
            paterno: user.paterno,
            materno: user.materno,
            rol: user.rol,
            autorizacion2Pasos: user.autorizacion2Pasos,
            correo: user.correo,
        }


        if (requires2FA) {
            if (!safeUser.correo) {
                return res.status(400).json({
                    message: 'El usuario no tiene un correo registrado para la verificación',
                })
            }

            // Comprobar el tiempo de espera ANTES de modificar la sesión.
            const segundosRestantes = await consultarEsperaOTP(
                pool,
                safeUser.usuario
            )

            if (segundosRestantes > 0) {
                res.set('Retry-After', String(segundosRestantes))

                return res.status(429).json({
                    message: `Debes esperar ${segundosRestantes} segundos antes de solicitar otro código`,
                    retryAfter: segundosRestantes,
                })
            }

            req.session.regenerate(async (error) => {
                if (error) {
                    console.error('Error al preparar sesión OTP:', error)

                    return res.status(500).json({
                        message: 'No fue posible preparar la verificación',
                    })
                }

                try {
                    const resultadoOTP = await solicitarCodigoOTP(
                        pool,
                        safeUser.usuario,
                        safeUser.correo
                    )

                    req.session.pending2FA = {
                        user: safeUser,
                        idCodigo: resultadoOTP.idCodigo,
                    }

                    req.session.save((error) => {
                        if (error) {
                            console.error('Error al guardar verificación pendiente:', error)

                            return res.status(500).json({
                                message: 'No fue posible guardar la verificación',
                            })
                        }

                        return res.status(202).json({
                            message: 'Se envió un código de verificación al correo registrado',
                            requires2FA: true,
                        })
                    })
                } catch (error) {
                    if (error.code === 'OTP_RATE_LIMIT') {
                        res.set('Retry-After', String(error.retryAfter))

                        return res.status(429).json({
                            message: `Debes esperar ${error.retryAfter} segundos antes de solicitar otro código`,
                            retryAfter: error.retryAfter,
                        })
                    }

                    console.error('Error al solicitar OTP:', error)

                    return res.status(500).json({
                        message: 'No fue posible enviar el código de verificación',
                    })
                }
            })

            return
        }


        req.session.regenerate((error) => {
            if (error) {
                console.error('Error al crear sesión:', error)
                return res.status(500).json({
                    message: 'No fue posible iniciar sesión',
                })
            }

            req.session.user = safeUser

            req.session.save((error) => {
                if (error) {
                    console.error('Error al guardar sesión:', error)
                    return res.status(500).json({
                        message: 'No fue posible guardar la sesión',
                    })
                }

                return res.json({
                    message: 'Login correcto',
                    user: safeUser,
                })
            })
        })
    } catch (error) {
        console.error('Error en sp_login:', error)

        return res.status(500).json({
            message: 'Error al consultar la base de datos',
        })
    }
})


app.post('/api/auth/verify-code', async (req, res) => {
    const { codigo } = req.body
    const pendiente = req.session.pending2FA

    if (!pendiente) {
        return res.status(401).json({
            message: 'No hay una verificación pendiente',
        })
    }

    if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
            message: 'El código debe contener seis dígitos',
        })
    }

    try {
        const pool = await poolPromise

        const resultado = await validarCodigoOTP(
            pool,
            pendiente.user.usuario,
            pendiente.idCodigo,
            codigo
        )

        if (!resultado.valido) {
            switch (resultado.motivo) {
                case 'INCORRECTO':
                    return res.status(401).json({
                        message: 'El código es incorrecto. Inténtalo nuevamente.',
                        code: 'OTP_INCORRECTO',
                    })

                case 'EXPIRADO':
                    return res.status(410).json({
                        message: 'El código ha expirado. Solicita uno nuevo.',
                        code: 'OTP_EXPIRADO',
                    })

                case 'BLOQUEADO':
                    return res.status(429).json({
                        message: 'Se agotaron los intentos permitidos. Solicita un nuevo código.',
                        code: 'OTP_BLOQUEADO',
                    })

                case 'INVALIDO':
                default:
                    return res.status(401).json({
                        message: 'Este código ya no es válido. Solicita uno nuevo.',
                        code: 'OTP_INVALIDO',
                    })
            }
        }

        const usuarioVerificado = pendiente.user

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    message: 'No fue posible crear la sesión',
                })
            }

            req.session.user = usuarioVerificado

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        message: 'No fue posible guardar la sesión',
                    })
                }

                return res.json({
                    message: 'Verificación correcta',
                    user: usuarioVerificado,
                })
            })
        })
    } catch (error) {
        console.error('Error al verificar OTP:', error)

        return res.status(500).json({
            message: 'Error al verificar el código',
        })
    }
})


app.post('/api/auth/cancel-verification', (req, res) => {
    const pendiente = req.session.pending2FA

    if (!pendiente) {
        return res.status(401).json({
            message: 'No hay una verificación pendiente',
        })
    }

    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cancelar verificación:', error)

            return res.status(500).json({
                message: 'No fue posible cancelar la verificación',
            })
        }

        res.clearCookie('pedidos.sid')

        return res.json({
            message: 'Verificación cancelada correctamente',
        })
    })
})

app.post('/api/auth/resend-code', async (req, res) => {
    const pendiente = req.session.pending2FA

    if (!pendiente) {
        return res.status(401).json({
            message: 'No hay una verificación pendiente',
        })
    }

    try {
        const pool = await poolPromise

        const resultadoOTP = await solicitarCodigoOTP(
            pool,
            pendiente.user.usuario,
            pendiente.user.correo
        )

        req.session.pending2FA = {
            user: pendiente.user,
            idCodigo: resultadoOTP.idCodigo,
        }

        req.session.save((error) => {
            if (error) {
                console.error('Error al guardar nuevo OTP:', error)

                return res.status(500).json({
                    message: 'No fue posible guardar la verificación',
                })
            }

            return res.json({
                message: 'Se envió un nuevo código de verificación',
            })
        })
    } catch (error) {
        if (error.code === 'OTP_RATE_LIMIT') {
            res.set('Retry-After', String(error.retryAfter))

            return res.status(429).json({
                message: `Debes esperar ${error.retryAfter} segundos antes de solicitar otro código`,
                retryAfter: error.retryAfter,
            })
        }

        console.error('Error al reenviar OTP:', error)

        return res.status(500).json({
            message: 'No fue posible reenviar el código',
        })
    }
})

app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: 'No hay una sesión activa',
        })
    }

    return res.json({
        user: req.session.user,
    })
})

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cerrar sesión:', error)
            return res.status(500).json({
                message: 'No fue posible cerrar la sesión',
            })
        }

        res.clearCookie('pedidos.sid')

        return res.json({
            message: 'Sesión cerrada correctamente',
        })
    })
})

app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`)
})
