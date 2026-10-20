
const session = require('express-session');
const { sql } = require('./database.cjs');

class SqlSessionStore extends session.Store {
    constructor(poolPromise) {
        super();
        this.poolPromise = poolPromise;
    }

    async get(sid, callback) {
        try {
            const pool = await this.poolPromise;

            const result = await pool.request()
                .input('IdSesion', sql.NVarChar(255), sid)
                .query(`
                    SELECT DatosSesion
                    FROM dbo.SesionesExpress
                    WHERE IdSesion = @IdSesion
                      AND FechaExpiracion > SYSUTCDATETIME()
                `);

            if (result.recordset.length === 0) {
                return callback(null, null);
            }

            const datos = JSON.parse(result.recordset[0].DatosSesion);

            callback(null, datos);
        } catch (error) {
            callback(error);
        }
    }

async set(sid, datosSesion, callback) {
    try {
        const pool = await this.poolPromise;

        const datos = JSON.stringify(datosSesion);

        const expiracion = datosSesion.cookie?.expires
            ? new Date(datosSesion.cookie.expires)
            : new Date(Date.now() + 1000 * 60 * 60 * 8);

        await pool.request()
            .input('IdSesion', sql.NVarChar(255), sid)
            .input('DatosSesion', sql.NVarChar(sql.MAX), datos)
            .input('FechaExpiracion', sql.DateTime2(3), expiracion)
            .query(`
                SET XACT_ABORT ON;

                BEGIN TRANSACTION;

                IF EXISTS (
                    SELECT 1
                    FROM dbo.SesionesExpress WITH (UPDLOCK, HOLDLOCK)
                    WHERE IdSesion = @IdSesion
                )
                BEGIN
                    UPDATE dbo.SesionesExpress
                    SET DatosSesion = @DatosSesion
                    WHERE IdSesion = @IdSesion
                      AND FechaExpiracion > SYSUTCDATETIME();
                END
                ELSE
                BEGIN
                    IF @FechaExpiracion > SYSUTCDATETIME()
                    BEGIN
                        INSERT INTO dbo.SesionesExpress (
                            IdSesion,
                            DatosSesion,
                            FechaExpiracion
                        )
                        VALUES (
                            @IdSesion,
                            @DatosSesion,
                            @FechaExpiracion
                        );
                    END
                END

                COMMIT TRANSACTION;
            `);

        callback(null);
    } catch (error) {
        callback(error);
    }
}


    async destroy(sid, callback) {
        try {
            const pool = await this.poolPromise;

            await pool.request()
                .input('IdSesion', sql.NVarChar(255), sid)
                .query(`
                    DELETE FROM dbo.SesionesExpress
                    WHERE IdSesion = @IdSesion
                `);

            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async touch(sid, datosSesion, callback) {

        callback(null);
    }
}

module.exports = SqlSessionStore;
