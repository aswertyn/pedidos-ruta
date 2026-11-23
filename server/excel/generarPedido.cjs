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

const FILAS_TIPO = { colchon: 0, box: 1, tarima: 2 }

// Nueve grupos a la izquierda y siete a la derecha.
// No utilizar L40 en adelante: la plantilla contiene otras secciones.
const POSICIONES_PRODUCTOS = [
  ...[19, 22, 25, 28, 31, 34, 37, 40, 43].map(fila => ({ bloque: 'izquierda', fila })),
  ...[19, 22, 25, 28, 31, 34, 37].map(fila => ({ bloque: 'derecha', fila })),
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

function obtenerIdentificador(producto) {
  const codigo = normalizar(producto.codigo)
  const modelo = normalizar(producto.modelo)
  if (!modelo) throw new Error('Un producto no tiene descripción o modelo')
  // La identidad de catálogo depende del código, no de la descripción.
  return codigo ? `codigo:${codigo}` : `manual:${modelo}`
}

function obtenerUbicacion(producto, posicionesAsignadas) {
  const identificador = obtenerIdentificador(producto)
  if (posicionesAsignadas.has(identificador)) {
    return posicionesAsignadas.get(identificador)
  }

  const posicion = POSICIONES_PRODUCTOS[posicionesAsignadas.size]
  if (!posicion) {
    throw new Error(
      `La plantilla admite un máximo de ${POSICIONES_PRODUCTOS.length} productos distintos por pedido.`
    )
  }

  posicionesAsignadas.set(identificador, posicion)
  return posicion
}

async function generarPedido(pedido) {
  const libro = new ExcelJS.Workbook()
  await libro.xlsx.readFile(PLANTILLA)
  const hoja = libro.worksheets[0]
  if (!hoja) throw new Error('La plantilla no contiene ninguna hoja')

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

  // 4. Productos: limpiar los nombres preimpresos de la plantilla.
  // Solo se limpian las celdas de modelo; no se borran títulos ni fórmulas.
  for (const posicion of POSICIONES_PRODUCTOS) {
    const columnaModelo = posicion.bloque === 'izquierda' ? 'A' : 'L'
    hoja.getCell(`${columnaModelo}${posicion.fila}`).value = null
  }

  const posicionesAsignadas = new Map()
  const celdasProductos = new Set()

  for (const producto of pedido.productos ?? []) {
    const tipo = normalizar(producto.tipo)
    const tamano = normalizar(producto.tamaño)
    const desplazamiento = FILAS_TIPO[tipo]

    if (desplazamiento === undefined || !['individual', 'matrimonial', 'queen', 'king'].includes(tamano)) {
      throw new Error(`Tipo o tamaño de producto no válido: ${producto.modelo}`)
    }

    const ubicacion = obtenerUbicacion(producto, posicionesAsignadas)
    const columnas = COLUMNAS[ubicacion.bloque][tamano]
    const fila = ubicacion.fila + desplazamiento
    const [colCantidad, colPrecio] = columnas
    const celdaCantidad = `${colCantidad}${fila}`
    const celdaPrecio = `${colPrecio}${fila}`

    if (celdasProductos.has(celdaCantidad)) {
      throw new Error(`Hay dos productos asignados a la misma celda: ${celdaCantidad}`)
    }
    celdasProductos.add(celdaCantidad)

    const columnaModelo = ubicacion.bloque === 'izquierda' ? 'A' : 'L'
    // La descripción completa se conserva; el código no se escribe en una
    // celda adicional porque la plantilla no tiene un campo específico.
    escribir(hoja, `${columnaModelo}${ubicacion.fila}`, producto.modelo)
    escribir(hoja, celdaCantidad, Number(producto.cantidad))
    escribir(hoja, celdaPrecio, Number(producto.precio))
  }

  // 5. Bolsas de polietileno
  const bolsasProcesadas = new Set()
  for (const bolsa of pedido.bolsas ?? []) {
    const clave = String(bolsa.clave ?? '').trim().toUpperCase()
    const fila = FILAS_BOLSAS[clave]
    if (!fila) throw new Error(`Clave de bolsa no reconocida: ${bolsa.clave}`)
    if (bolsasProcesadas.has(clave)) throw new Error(`Bolsa duplicada: ${clave}`)
    bolsasProcesadas.add(clave)
    escribir(hoja, `S${fila}`, Number(bolsa.cantidad))
    escribir(hoja, `T${fila}`, Number(bolsa.precio))
  }

  hoja.getCell('S15').value = { formula: 'SUM(S11:S14)' }
  hoja.getCell('T15').value = { formula: 'SUMPRODUCT(S11:S14,T11:T14)' }

  return libro.xlsx.writeBuffer()
}

module.exports = { generarPedido }
