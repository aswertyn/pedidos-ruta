
const { poolPromise } = require('./database.cjs');

//const INTERVALO_LIMPIEZA= 30 * 1000; //Valor de prueba
const INTERVALO_LIMPIEZA = 60 * 60 * 1000; // 1 hora

async function limpiarSesionesExpiradas() {
    try {
        const pool = await poolPromise;

        await pool.request()
            .execute('dbo.sp_LimpiarSesionesExpiradas');

        console.log('Limpieza de sesiones expiradas completada.');
    } catch (error) {
        console.error(
            'Error al limpiar sesiones expiradas:',
            error
        );
    }
}

function iniciarLimpiezaSesiones() {
    const intervalo = setInterval(
        limpiarSesionesExpiradas,
        INTERVALO_LIMPIEZA
    );

    intervalo.unref();

    return intervalo;
}

module.exports = {
    limpiarSesionesExpiradas,
    iniciarLimpiezaSesiones
};
