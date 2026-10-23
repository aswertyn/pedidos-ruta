const ExcelJS = require('exceljs')
const path = require('node:path')

const PLANTILLA = path.join(__dirname, 'formato_pedido.xlsx')

const COLUMNAS = {
    izquierda: {
        individual: ['C', 'D'],
        matrimonial: ['E', 'F'],
        queen: ['G', 'H'],
        king: ['I', 'J'],
    },
    derecha: {
        individual: ['N', 'O'],
        matrimonial: ['P', 'Q'],
        queen: ['R', 'S'],
        king: ['T', 'U'],
    },
}

const FILAS_TIPO = {
    colchon: 0,
    box: 1,
    tarima: 2,
}

// Correspondencias iniciales de los modelos.
// Las posiciones restantes se incorporarán cuando tengamos
// el catálogo definitivo.
const MODELOS_CATALOGO = {
    rock: { bloque: 'izquierda', fila: 25 },
    viena: { bloque: 'izquierda', fila: 31 },
    diamond: { bloque: 'derecha', fila: 19 },
}

// Espacios reservados para modelos manuales.
// Cada modelo ocupa tres filas.
const MODELOS_MANUALES = [
    { bloque: 'izquierda', fila: 37 },
    { bloque: 'izquierda', fila: 40 },
    { bloque: 'izquierda', fila: 43 },
    { bloque: 'derecha', fila: 22 },
    { bloque: 'derecha', fila: 25 },
    { bloque: 'derecha', fila: 28 },
    { bloque: 'derecha', fila: 31 },
    { bloque: 'derecha', fila: 34 },
    { bloque: 'derecha', fila: 37 },
]

const FILAS_BOLSAS = {
    'PCEM-I': 11,
    'PCEM-M': 12,
    'PCEM-Q': 13,
    'PCEM-K': 14,
}

function normalizar(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
}

function escribir(hoja, celda, valor) {
    if (valor !== undefined && valor !== null) {
        hoja.getCell(celda).value = valor
    }
}

function obtenerFilaProducto(producto, manualesAsignados) {
    const modelo = normalizar(producto.modelo)

    if (!producto.manual) {
        const ubicacion = MODELOS_CATALOGO[modelo]

        if (!ubicacion) {
            throw new Error(`Modelo del catálogo no configurado: ${producto.modelo}`)
        }

        return ubicacion
    }

    if (manualesAsignados.has(modelo)) {
        return manualesAsignados.get(modelo)
    }

    const posicion = MODELOS_MANUALES[manualesAsignados.size]

    if (!posicion) {
        throw new Error('No hay espacios disponibles para más modelos manuales')
    }

    manualesAsignados.set(modelo, posicion)

    return posicion
}

async function generarPedido(pedido) {
    const libro = new ExcelJS.Workbook()

    await libro.xlsx.readFile(PLANTILLA)

    const hoja = libro.worksheets[0]

    if (!hoja) {
        throw new Error('La plantilla no contiene ninguna hoja')
    }

    // 1. Encabezado
    escribir(hoja, 'T5', pedido.folio)
    escribir(hoja, 'T3', pedido.numeroOrden)
    escribir(hoja, 'S5', pedido.agente)
    escribir(hoja, 'O5', pedido.cliente?.clave)
    escribir(hoja, 'I5', pedido.observaciones)

    // 2. Datos del cliente
    escribir(hoja, 'B9', pedido.cliente?.nombre)
    escribir(hoja, 'C11', pedido.cliente?.direccion)
    escribir(hoja, 'C13', pedido.cliente?.poblacion)
    escribir(hoja, 'C14', pedido.cliente?.telefono)
    escribir(hoja, 'C15', pedido.cliente?.condiciones)

    // 3. Consignado / lugar de entrega
    escribir(hoja, 'K9', pedido.consignado?.nombre)
    escribir(hoja, 'K11', pedido.consignado?.direccion)
    escribir(hoja, 'K13', pedido.consignado?.poblacion)
    escribir(hoja, 'K14', pedido.consignado?.telefono)
    escribir(hoja, 'K15', pedido.fechaPedido)
    escribir(hoja, 'O15', pedido.consignado?.horario)

    // 4. Productos
    const manualesAsignados = new Map()
    const celdasProductos = new Set()

    for (const producto of pedido.productos ?? []) {
        const ubicacion = obtenerFilaProducto(producto, manualesAsignados)

        const tipo = normalizar(producto.tipo)
        const tamaño = normalizar(producto.tamaño)

        const desplazamiento = FILAS_TIPO[tipo]
        const columnas = COLUMNAS[ubicacion.bloque]?.[tamaño]

        if (desplazamiento === undefined || !columnas) {
            throw new Error(`Tipo o tamaño de producto no válido: ${producto.modelo}`)
        }

        const fila = ubicacion.fila + desplazamiento
        const [colCantidad, colPrecio] = columnas

        const celdaCantidad = `${colCantidad}${fila}`
        const celdaPrecio = `${colPrecio}${fila}`

        if (celdasProductos.has(celdaCantidad)) {
            throw new Error(
                `Hay dos productos asignados a la misma celda: ${celdaCantidad}`
            )
        }

        celdasProductos.add(celdaCantidad)

        if (producto.manual) {
            const columnaModelo = ubicacion.bloque === 'izquierda' ? 'A' : 'L'

            escribir(
                hoja,
                `${columnaModelo}${ubicacion.fila}`,
                producto.modelo
            )
        }

        escribir(hoja, celdaCantidad, Number(producto.cantidad))
        escribir(hoja, celdaPrecio, Number(producto.precio))
    }

    // 5. Bolsas de polietileno
    const bolsasProcesadas = new Set()

    for (const bolsa of pedido.bolsas ?? []) {
        const clave = String(bolsa.clave ?? '').trim().toUpperCase()
        const fila = FILAS_BOLSAS[clave]

        if (!fila) {
            throw new Error(`Clave de bolsa no reconocida: ${bolsa.clave}`)
        }

        if (bolsasProcesadas.has(clave)) {
            throw new Error(`Bolsa duplicada: ${clave}`)
        }

        bolsasProcesadas.add(clave)

        // La clave de la columna R permanece fija.
        escribir(hoja, `S${fila}`, Number(bolsa.cantidad))
        escribir(hoja, `T${fila}`, Number(bolsa.precio))
    }

    // Totales de bolsas
    hoja.getCell('S15').value = {
        formula: 'SUM(S11:S14)',
    }

    hoja.getCell('T15').value = {
        formula: 'SUMPRODUCT(S11:S14,T11:T14)',
    }

    // Los totales generales de productos quedan pendientes.

    return libro.xlsx.writeBuffer()
}

module.exports = { generarPedido }