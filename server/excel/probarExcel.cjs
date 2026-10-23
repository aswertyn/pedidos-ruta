const fs = require('node:fs/promises')
const path = require('node:path')
const { generarPedido } = require('./generarPedido.cjs')

async function probar() {
    const pedido = {
        folio: '202475',
        numeroOrden: '138111',
        agente: '90042',
        observaciones: 'Prueba de generación automática',

        cliente: {
            clave: '10025',
            nombre: 'CLIENTE DE PRUEBA',
            direccion: 'AV. PRINCIPAL 123',
            poblacion: 'GUADALAJARA',
            telefono: '3312345678',
            condiciones: 'CONTADO',
        },

        consignado: {
            nombre: 'CONSIGNADO DE PRUEBA',
            direccion: 'CALLE SECUNDARIA 456',
            poblacion: 'GUADALAJARA',
            telefono: '3398765432',
            horario: '09:00 A 18:00',
        },

        fechaPedido: '23/10/2026',

        productos: [
            {
                modelo: 'ROCK',
                tipo: 'Colchón',
                tamaño: 'Individual',
                cantidad: 2,
                precio: 3500,
                manual: false,
            },
            {
                modelo: 'VIENA',
                tipo: 'Tarima',
                tamaño: 'King',
                cantidad: 1,
                precio: 1250,
                manual: false,
            },
            {
                modelo: 'COLCHÓN ESPECIAL',
                tipo: 'Colchón',
                tamaño: 'Queen',
                cantidad: 2,
                precio: 4500,
                manual: true,
            },
        ],

        bolsas: [
            { clave: 'PCEM-I', cantidad: 2, precio: 15.50 },
            { clave: 'PCEM-M', cantidad: 5, precio: 20 },
            { clave: 'PCEM-Q', cantidad: 1, precio: 12 },
            { clave: 'PCEM-K', cantidad: 3, precio: 25 },
        ],
    }

    const archivo = await generarPedido(pedido)

    const destino = path.join(__dirname, 'pedido_generado.xlsx')

    await fs.writeFile(destino, archivo)

    console.log('Excel generado correctamente:', destino)
}

probar().catch((error) => {
    console.error('Error al generar Excel:', error)
    process.exitCode = 1
})