const TIPOS_PRODUCTO = {
    mattress: 'Colchón',
    box: 'Box',
    platform: 'Tarima',
}

const TAMAÑOS = {
    ind: 'Individual',
    mat: 'Matrimonial',
    'Q.S.': 'Queen',
    'K.S.': 'King',
}

function adaptarPedido(order, datosCliente, datosConsignado) {
    if (!order || !datosCliente) {
        throw new Error('Faltan datos del pedido o del cliente')
    }

    const esEntregaManual = order.manualConsignee !== null

    if (!esEntregaManual && !datosConsignado) {
        throw new Error('Faltan los datos del consignado')
    }

    let direccion
    let poblacion
    let horario

    if (esEntregaManual) {
        const manual = order.manualConsignee

        direccion = manual.address
        poblacion = manual.city

        horario = `${manual.receivingStartTime} A ${manual.receivingEndTime}`
    } else {
        direccion = datosConsignado.address
        poblacion = datosConsignado.city
        horario = datosConsignado.receivingHours
    }

    return {
        folio: order.folio,
        numeroOrden: order.purchaseOrder,
        agente: order.agentNumber,
        observaciones: order.observations,

        cliente: {
            clave: order.customerNumber,
            nombre: datosCliente.name,
            direccion: datosCliente.address,
            poblacion: datosCliente.city,
            telefono: order.customerPhone,
            condiciones: order.conditions,
        },

        consignado: {
            nombre: order.consigneeName,
            direccion,
            poblacion,
            telefono: order.consigneePhone,
            horario,
        },

        fechaPedido: order.orderDate,

        productos: order.items.map((item) => {
            const tipo = TIPOS_PRODUCTO[item.productType]
            const tamaño = TAMAÑOS[item.bedSize]

            if (!tipo || !tamaño) {
                throw new Error(
                    `Tipo o tamaño no reconocido: ${item.model}`
                )
            }

            return {
                modelo: item.model,
                tipo,
                tamaño,
                cantidad: item.quantity,
                precio: item.price,
                manual: item.isManual,
            }
        }),

        bolsas: order.polyethyleneBag.map((bag) => ({
            clave: bag.key,
            cantidad: bag.quantity,
            precio: bag.price,
        })),
    }
}

module.exports = { adaptarPedido }