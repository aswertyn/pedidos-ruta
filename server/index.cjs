const express = require('express')
const path = require('node:path')
const { sql, poolPromise } = require('./database.cjs')
const session = require('express-session')
const { consultarEsperaOTP } = require('./otpDatabase.cjs')
const { solicitarCodigoOTP,
    validarCodigoOTP, } = require('./otpManager.cjs')
const SqlSessionStore = require('./sqlSessionStore.cjs')
const { iniciarLimpiezaSesiones } = require('./sessionCleanup.cjs')
const multer = require('multer')
const { adaptarPedido } = require('./excel/adaptarPedido.cjs')
const { generarPedido } = require('./excel/generarPedido.cjs')

require('dotenv').config({
    path: require('node:path').join(__dirname, '..', '.env'),
})


const app = express()
const PORT = Number(process.env.PORT || 3001)
const DIST_PATH = path.join(__dirname, '..', 'dist')
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
}
const uploadFoto = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (req, file, callback) => {
        const tiposPermitidos = ['image/jpeg', 'image/png']

        if (!tiposPermitidos.includes(file.mimetype)) {
            return callback(new Error('Solo se permiten imágenes JPG o PNG'))
        }

        callback(null, true)
    },
})

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
            secure: process.env.NODE_ENV === 'production',
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


app.post('/api/hojas-ruta', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: 'Debes iniciar sesión para subir fotografías',
        })
    }

    uploadFoto.single('foto')(req, res, async (error) => {
        if (error) {
            return res.status(
                error instanceof multer.MulterError ? 413 : 400
            ).json({
                message: error.message,
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Debes seleccionar una fotografía',
            })
        }

        const usuario = Number(req.session.user.usuario)

        if (!Number.isSafeInteger(usuario) || usuario <= 0) {
            return res.status(400).json({
                message: 'El identificador del usuario no es válido',
            })
        }

        const foto = req.file.buffer

        const esJPEG =
            foto.length >= 3 &&
            foto[0] === 0xff &&
            foto[1] === 0xd8 &&
            foto[2] === 0xff

        const esPNG =
            foto.length >= 8 &&
            foto.subarray(0, 8).equals(
                Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
            )

        const tipoValido =
            (req.file.mimetype === 'image/jpeg' && esJPEG) ||
            (req.file.mimetype === 'image/png' && esPNG)

        if (!tipoValido) {
            return res.status(400).json({
                message: 'El contenido de la fotografía no es válido',
            })
        }

        try {
            const pool = await poolPromise

            await pool.request()
                .input('foto', sql.VarBinary(sql.MAX), foto)
                .input('usuario', sql.Int, usuario)
                .execute('sp_guardar_hoja_ruta')

            return res.status(201).json({
                message: 'Fotografía guardada correctamente',
            })

        } catch (error) {
            console.error('Error al guardar fotografía:', error)

            return res.status(500).json({
                message: 'No fue posible guardar la fotografía',
            })
        }
    })
})


app.get('/api/hojas-ruta', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: 'No autorizado'
        })
    }

    try {
        const pool = await poolPromise

        const resultado = await pool.request()
            .input('usuario', sql.Int, req.session.user.usuario)
            .query(`
                SELECT
                    id,
                    fecha,
                    usuario,
                    DATALENGTH(foto) AS tamano_bytes
                FROM dbo.hoja_ruta
                WHERE usuario = @usuario
                ORDER BY fecha DESC, id DESC
            `)

        return res.json(resultado.recordset)

    } catch (error) {
        console.error('Error al consultar fotografías:', error)

        return res.status(500).json({
            message: 'Error al consultar fotografías'
        })
    }
})

app.get('/api/hojas-ruta/:id/foto', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: 'No autorizado'
        })
    }

    try {
        const id = Number(req.params.id)
        const usuario = Number(req.session.user.usuario)

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: 'ID de fotografía inválido'
            })
        }

        if (!Number.isSafeInteger(usuario)) {
            return res.status(401).json({
                message: 'Usuario inválido'
            })
        }

        const pool = await poolPromise

        const resultado = await pool.request()
            .input('id', sql.Int, id)
            .input('usuario', sql.Int, usuario)
            .query(`
                SELECT foto
                FROM dbo.hoja_ruta
                WHERE id = @id
                  AND usuario = @usuario
            `)

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                message: 'Fotografía no encontrada'
            })
        }

        const foto = resultado.recordset[0].foto

        if (!foto || foto.length === 0) {
            return res.status(404).json({
                message: 'El registro no contiene una fotografía'
            })
        }

        let tipo

        if (
            foto.length >= 3 &&
            foto[0] === 0xff &&
            foto[1] === 0xd8 &&
            foto[2] === 0xff
        ) {
            tipo = 'image/jpeg'
        } else if (
            foto.length >= 8 &&
            foto.subarray(0, 8).equals(
                Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
            )
        ) {
            tipo = 'image/png'
        } else {
            return res.status(415).json({
                message: 'Formato de imagen no reconocido'
            })
        }

        res.setHeader('Content-Type', tipo)
        res.setHeader('Cache-Control', 'private, no-store')
        res.setHeader('X-Content-Type-Options', 'nosniff')

        return res.send(foto)

    } catch (error) {
        console.error('Error al recuperar fotografía:', error)

        return res.status(500).json({
            message: 'Error al recuperar fotografía'
        })
    }
})


app.post('/api/pedidos/exportar-excel', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: 'Debes iniciar sesión para generar el Excel',
        })
    }

    try {
        const { order, customer, consignee } = req.body ?? {}

        if (!order || !customer) {
            return res.status(400).json({
                message: 'Faltan datos del pedido o del cliente',
            })
        }

        if (
            order.manualConsignee === null &&
            !consignee
        ) {
            return res.status(400).json({
                message: 'Faltan los datos del consignado',
            })
        }

        if (typeof order.folio !== 'string' || !/^\d{1,10}$/.test(order.folio)) {
            return res.status(400).json({
                message: 'El folio debe contener entre 1 y 10 dígitos, sin signos ni decimales',
            })
        }

        if (typeof order.purchaseOrder !== 'string' || !/^\d{0,10}$/.test(order.purchaseOrder)) {
            return res.status(400).json({
                message: 'La orden de compra debe contener hasta 10 dígitos, sin signos ni decimales',
            })
        }

        if (typeof order.consigneeName !== 'string' ||
            !/^[\p{L}][\p{L} ]*$/u.test(order.consigneeName.trim()) ||
            order.consigneeName.trim().length < 2 || order.consigneeName.length > 100) {
            return res.status(400).json({
                message: 'El nombre del consignado debe tener entre 2 y 100 caracteres y contener solo letras y espacios',
            })
        }

        const pedidoAdaptado = adaptarPedido(
            order,
            customer,
            consignee
        )

        const archivo = await generarPedido(pedidoAdaptado)

        const nombreArchivo = `pedido_${String(order.folio).replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${nombreArchivo}"`
        )

        res.setHeader('Cache-Control', 'private, no-store')
        res.setHeader('X-Content-Type-Options', 'nosniff')

        return res.send(Buffer.from(archivo))

    } catch (error) {
        console.error('Error al generar Excel:', error)

        return res.status(500).json({
            message: 'No fue posible generar el archivo Excel',
        })
    }
})

// Servir React compilado
app.use(express.static(DIST_PATH))

// Evitar que las rutas desconocidas de API devuelvan HTML
app.use('/api', (req, res) => {
    res.status(404).json({
        message: 'Ruta de API no encontrada',
    })
})

// Permitir navegación del frontend
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'))
})

app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`)

    iniciarLimpiezaSesiones()
})
